"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, useAnimations, useGLTF, useProgress } from "@react-three/drei";
import { Color, Group, LoopRepeat, MathUtils, Mesh, MeshStandardMaterial, SpotLight, Vector3 } from "three";
import { cn } from "@/lib/utils";
import { EXERCISES, ExerciseKey } from "@/components/home/heroExercises";

const CHARACTER_MODEL_PATH = "/assets/gym_hero_character.glb";
const ENV_MODEL_PATH = "/assets/olympia-gym-hero.glb";
const CHARACTER_SCALE = 10.85;
// World-space x offset of the character; camera targets and character lights follow it.
// Mobile trucks character + camera left together so the mural behind stays in the narrow frame.
const CHARACTER_X = 0.3;
const CHARACTER_X_MOBILE = -0.6;

// Camera rig — tuned by trial on device, see docs/design-language.md §5.
const CAMERA = {
  distance: 4.2,
  distanceMobile: 5.0,
  basePitch: MathUtils.degToRad(4),
  fovDesktop: 40,
  fovMobile: 40,
  // Negative x shifts the framing so the character sits in the right column on desktop.
  targetDesktop: new Vector3(CHARACTER_X - 1.2, 0.9, 0),
  targetMobile: new Vector3(CHARACTER_X_MOBILE, 1.0, 0),
  yawLimit: MathUtils.degToRad(25),
  pitchMin: MathUtils.degToRad(-5),
  pitchMax: MathUtils.degToRad(10),
  parallax: MathUtils.degToRad(4),
  dragSensitivity: 0.004,
  dampDrag: 12,
  dampRelease: 3, // ~1.5 s settle after release
};

// Muscle glow: the body GLB carries a per-vertex mask in COLOR_0 (R = biceps, G = front raise, B = squat,
// soft 5 cm falloff baked in Blender). One skin material; the shader adds red emissive = mask · weights.
const HIGHLIGHT_COLOR = new Color("#c00018");
const SKIN_MATERIAL = "_Body_Low_SP_blinn1SG1";
const scratchVec = new Vector3();

function patchSkinMaterial(mat: MeshStandardMaterial, weights: Vector3) {
  // GLTFLoader enables vertexColors whenever COLOR_0 exists; the mask must not tint the diffuse.
  mat.vertexColors = false;
  mat.needsUpdate = true;
  mat.customProgramCacheKey = () => "olympia-muscle-highlight";
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uHighlightWeights = { value: weights };
    shader.uniforms.uHighlightColor = { value: HIGHLIGHT_COLOR };
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute vec3 color;\nvarying vec3 vHighlightMask;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvHighlightMask = color;");
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform vec3 uHighlightWeights;\nuniform vec3 uHighlightColor;\nvarying vec3 vHighlightMask;"
      )
      // Darken the skin under the glow so the red reads saturated instead of salmon (red on top of tan).
      .replace(
        "#include <color_fragment>",
        "#include <color_fragment>\nfloat highlightAmount = dot(vHighlightMask, uHighlightWeights);\ndiffuseColor.rgb *= 1.0 - 0.35 * clamp(highlightAmount, 0.0, 1.0);"
      )
      .replace(
        "#include <emissivemap_fragment>",
        "#include <emissivemap_fragment>\ntotalEmissiveRadiance += uHighlightColor * highlightAmount;"
      );
  };
}

interface PointerState {
  dragging: boolean;
  yaw: number;
  pitch: number;
  parallaxX: number;
  parallaxY: number;
  lastX: number;
  lastY: number;
}

interface SceneProps {
  activeExercise: ExerciseKey | null;
  onRepComplete: () => void;
  onLoaded: () => void;
  isMobile: boolean;
  paused: boolean;
}

function GymCharacter({
  activeExercise,
  onRepComplete,
  pulseRef,
  characterX,
}: Pick<SceneProps, "activeExercise" | "onRepComplete"> & { pulseRef: React.MutableRefObject<number>; characterX: number }) {
  const groupRef = useRef<Group>(null);
  const { scene, animations } = useGLTF(CHARACTER_MODEL_PATH);
  const { actions, mixer } = useAnimations(animations, groupRef);

  // Per-exercise glow weights (x = biceps, y = front raise, z = squat), read by the patched skin shader.
  const highlightWeights = useRef(new Vector3());

  useEffect(() => {
    // Align rest-pose Hips translation with the animated frame so feet touch the floor.
    scene.getObjectByName("mixamorig:Hips")?.position.set(0.002947, -0.008119, -10.158342);

    // GLTFLoader splits the body into 4 meshes (skin + 3 highlight groups); collapse them onto one patched skin material.
    const bodyMeshes: Mesh[] = [];
    let skin: MeshStandardMaterial | undefined;
    scene.traverse((obj) => {
      const mesh = obj as Mesh;
      if (!mesh.isMesh) return;
      // Skinned bounding spheres come from the rest pose; culling drops limbs at frame edges.
      mesh.frustumCulled = false;
      mesh.castShadow = true;
      const mat = mesh.material as MeshStandardMaterial;
      if (mat.name === SKIN_MATERIAL) skin = mat;
      if (mat.name === SKIN_MATERIAL || mat.name.endsWith("_Highlight")) bodyMeshes.push(mesh);
    });
    if (!skin) return;
    patchSkinMaterial(skin, highlightWeights.current);
    bodyMeshes.forEach((mesh) => {
      mesh.material = skin as MeshStandardMaterial;
    });
  }, [scene, highlightWeights]);

  useEffect(() => {
    actions.Idle?.reset().play();
  }, [actions]);

  useEffect(() => {
    const config = EXERCISES.find((e) => e.key === activeExercise);
    const action = config ? actions[config.actionName] : undefined;
    const idle = actions.Idle;
    if (!action) {
      idle?.reset().fadeIn(0.3).play();
      return;
    }

    idle?.fadeOut(0.3);
    action.reset().setLoop(LoopRepeat, Infinity).fadeIn(0.3).play();
    pulseRef.current = 1;

    const handleLoop = (e: { action: unknown }) => {
      if (e.action === action) onRepComplete();
    };
    mixer.addEventListener("loop", handleLoop);
    return () => {
      mixer.removeEventListener("loop", handleLoop);
      action.fadeOut(0.3);
    };
  }, [activeExercise, actions, mixer, onRepComplete, pulseRef]);

  useFrame((_, delta) => {
    const config = EXERCISES.find((e) => e.key === activeExercise);
    const action = config ? actions[config.actionName] : undefined;
    let contraction = 0;
    if (action?.isRunning()) {
      const duration = action.getClip().duration || 1;
      // 0 at rep start → 1 at peak squeeze → 0 at rep end
      contraction = Math.sin(((action.time % duration) / duration) * Math.PI);
    }

    const t = delta * 6;
    const active = 0.6 + 1.2 * Math.pow(contraction, 1.2);
    const w = highlightWeights.current;
    w.x = MathUtils.lerp(w.x, activeExercise === "bicep" ? active : 0, t);
    w.y = MathUtils.lerp(w.y, activeExercise === "frontraise" ? active : 0, t);
    w.z = MathUtils.lerp(w.z, activeExercise === "squat" ? active : 0, t);
  });

  return (
    <group ref={groupRef} scale={CHARACTER_SCALE} position={[characterX, 0, 0]}>
      <primitive object={scene} />
    </group>
  );
}

function GymEnvironment() {
  const { scene } = useGLTF(ENV_MODEL_PATH);

  useEffect(() => {
    scene.traverse((obj) => {
      const mesh = obj as Mesh;
      if (!mesh.isMesh) return;
      mesh.receiveShadow = true;
      mesh.castShadow = /rack|bench|plate|bar|tree|clip/i.test(mesh.name);
    });
  }, [scene]);

  return <primitive object={scene} />;
}

function CharacterSpot({ pulseRef, characterX }: { pulseRef: React.MutableRefObject<number>; characterX: number }) {
  const ref = useRef<SpotLight>(null);
  useEffect(() => {
    // Light target is not part of the scene graph; update its matrix once by hand.
    ref.current?.target.position.set(characterX, 0.9, 0);
    ref.current?.target.updateMatrixWorld();
  }, [characterX]);
  useFrame((_, delta) => {
    if (!ref.current) return;
    pulseRef.current = MathUtils.damp(pulseRef.current, 0, 4, delta);
    ref.current.intensity = 18 + pulseRef.current * 22;
  });
  return (
    <spotLight
      ref={ref}
      position={[characterX + 0.6, 3.2, 2.2]}
      angle={0.5}
      penumbra={0.7}
      color="#ffd9a3"
      castShadow
      shadow-bias={-0.0004}
      shadow-mapSize={[1024, 1024]}
    />
  );
}

function CameraRig({ pointer, isMobile }: { pointer: React.MutableRefObject<PointerState>; isMobile: boolean }) {
  const current = useRef({ yaw: 0, pitch: 0 });

  useFrame(({ camera }, delta) => {
    const fov = isMobile ? CAMERA.fovMobile : CAMERA.fovDesktop;
    if ("fov" in camera && camera.fov !== fov) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    const p = pointer.current;
    const targetYaw = p.dragging ? p.yaw : p.parallaxX;
    const targetPitch = p.dragging ? p.pitch : p.parallaxY;
    const lambda = p.dragging ? CAMERA.dampDrag : CAMERA.dampRelease;
    current.current.yaw = MathUtils.damp(current.current.yaw, targetYaw, lambda, delta);
    current.current.pitch = MathUtils.damp(current.current.pitch, targetPitch, lambda, delta);

    const target = isMobile ? CAMERA.targetMobile : CAMERA.targetDesktop;
    const yaw = current.current.yaw;
    const pitch = CAMERA.basePitch + current.current.pitch;
    scratchVec.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camera.position.copy(target).addScaledVector(scratchVec, isMobile ? CAMERA.distanceMobile : CAMERA.distance);
    camera.lookAt(target);
  });

  return null;
}

function LoadingOverlay({ onLoaded }: { onLoaded: () => void }) {
  const { active, progress } = useProgress();
  const [visible, setVisible] = useState(true);
  const done = !active && progress === 100;

  useEffect(() => {
    if (!done) return;
    onLoaded();
    const id = setTimeout(() => setVisible(false), 500);
    return () => clearTimeout(id);
  }, [done, onLoaded]);

  if (!visible) return null;
  return (
    <div
      className={cn(
        "absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-background bg-honeycomb transition-opacity duration-500",
        done && "opacity-0"
      )}
    >
      <span className="font-display text-5xl font-black tabular-nums text-foreground">{Math.round(progress)}%</span>
      <div className="h-px w-40 bg-border">
        <div className="led-divider transition-[width] duration-200" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

export function HeroScene({ activeExercise, onRepComplete, onLoaded, isMobile, paused }: SceneProps) {
  const pulseRef = useRef(0);
  const characterX = isMobile ? CHARACTER_X_MOBILE : CHARACTER_X;
  const pointer = useRef<PointerState>({
    dragging: false,
    yaw: 0,
    pitch: 0,
    parallaxX: 0,
    parallaxY: 0,
    lastX: 0,
    lastY: 0,
  });

  useEffect(() => {
    if (isMobile) return;
    const onMove = (e: MouseEvent) => {
      const p = pointer.current;
      p.parallaxX = ((e.clientX / window.innerWidth) * 2 - 1) * CAMERA.parallax;
      p.parallaxY = -((e.clientY / window.innerHeight) * 2 - 1) * CAMERA.parallax * 0.5;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [isMobile]);

  const handlePointerDown = (e: React.PointerEvent) => {
    const p = pointer.current;
    p.dragging = true;
    p.yaw = p.parallaxX;
    p.pitch = p.parallaxY;
    p.lastX = e.clientX;
    p.lastY = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const p = pointer.current;
    if (!p.dragging) return;
    p.yaw = MathUtils.clamp(p.yaw + (e.clientX - p.lastX) * CAMERA.dragSensitivity, -CAMERA.yawLimit, CAMERA.yawLimit);
    if (!isMobile) {
      p.pitch = MathUtils.clamp(p.pitch - (e.clientY - p.lastY) * CAMERA.dragSensitivity, CAMERA.pitchMin, CAMERA.pitchMax);
    }
    p.lastX = e.clientX;
    p.lastY = e.clientY;
  };

  const handlePointerUp = () => {
    pointer.current.dragging = false;
  };

  return (
    <div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ touchAction: "pan-y" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <LoadingOverlay onLoaded={onLoaded} />
      <Canvas
        shadows
        dpr={[1, isMobile ? 1.5 : 2]}
        frameloop={paused ? "never" : "always"}
        camera={{ position: [0, 1.2, 4.2], fov: CAMERA.fovDesktop }}
      >
        <ambientLight intensity={0.7} />
        <hemisphereLight color="#4a423a" groundColor="#0b0b0b" intensity={1.2} />
        <directionalLight position={[2.5, 4.5, 2]} intensity={0.9} />
        {/* Wall washes: bring out the equipment along the back wall without touching the character much. */}
        <pointLight position={[-2.2, 2.4, -2.0]} intensity={20} distance={7} decay={2} color="#ffd9a3" />
        <pointLight position={[2.4, 2.4, -2.0]} intensity={20} distance={7} decay={2} color="#ffd9a3" />
        {/* Amber rim just behind the character; distance-limited so walls and floor stay untouched. */}
        <pointLight position={[characterX - 0.6, 2.2, -1.0]} intensity={25} distance={3.5} decay={2} color="#f2a93b" />
        <CharacterSpot pulseRef={pulseRef} characterX={characterX} />
        <CameraRig pointer={pointer} isMobile={isMobile} />
        <Suspense fallback={null}>
          <GymEnvironment />
          <GymCharacter activeExercise={activeExercise} onRepComplete={onRepComplete} pulseRef={pulseRef} characterX={characterX} />
          {!isMobile && <ContactShadows position={[CHARACTER_X, 0.002, 0]} opacity={0.65} scale={5} blur={1.6} far={1.5} />}
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(CHARACTER_MODEL_PATH);
useGLTF.preload(ENV_MODEL_PATH);
