"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, useAnimations, useGLTF, useProgress } from "@react-three/drei";
import { Color, Group, LoopRepeat, MathUtils, Mesh, MeshStandardMaterial, SpotLight, Vector3 } from "three";
import { cn } from "@/lib/utils";
import { EXERCISES, ExerciseKey } from "@/components/home/heroExercises";

const CHARACTER_MODEL_PATH = "/assets/gym_hero_character.glb";
const ENV_MODEL_PATH = "/assets/olympia-gym-hero.glb";
const CHARACTER_SCALE = 10.85;
// World-space x offset of the character; camera targets and character lights follow it.
const CHARACTER_X = 0.3;

// Camera rig — tuned by trial on device, see docs/design-language.md §5.
const CAMERA = {
  distance: 4.2,
  basePitch: MathUtils.degToRad(4),
  fovDesktop: 40,
  fovMobile: 34,
  // Negative x shifts the framing so the character sits in the right column on desktop.
  targetDesktop: new Vector3(CHARACTER_X - 1.2, 0.9, 0),
  targetMobile: new Vector3(CHARACTER_X, 0.9, 0),
  yawLimit: MathUtils.degToRad(25),
  pitchMin: MathUtils.degToRad(-5),
  pitchMax: MathUtils.degToRad(10),
  parallax: MathUtils.degToRad(4),
  dragSensitivity: 0.004,
  dampDrag: 12,
  dampRelease: 3, // ~1.5 s settle after release
};

const COLOR_REST = new Color(1, 1, 1);
// Skin color is never tinted; the "burning muscle" look comes from emissive only so it reads as glow under skin.
const EMISSIVE_COLOR = new Color("#ff0a2e");
const ROUGHNESS_REST = 0.5;
const ROUGHNESS_ACTIVE = 0.4;
const scratchVec = new Vector3();

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
}: Pick<SceneProps, "activeExercise" | "onRepComplete"> & { pulseRef: React.MutableRefObject<number> }) {
  const groupRef = useRef<Group>(null);
  const { scene, animations } = useGLTF(CHARACTER_MODEL_PATH);
  const { actions, mixer } = useAnimations(animations, groupRef);

  const highlightMaterials = useMemo(() => {
    const map: Partial<Record<string, MeshStandardMaterial>> = {};
    const names = EXERCISES.map((e) => e.highlightName);
    scene.traverse((obj) => {
      const mesh = obj as Mesh;
      if (!mesh.isMesh) return;
      // Skinned bounding spheres come from the rest pose; culling drops limbs at frame edges.
      mesh.frustumCulled = false;
      mesh.castShadow = true;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      (mats as MeshStandardMaterial[]).forEach((m) => {
        if (m?.name && names.includes(m.name)) map[m.name] = m;
      });
    });
    return map;
  }, [scene]);

  useEffect(() => {
    // Align rest-pose Hips translation with the animated frame so feet touch the floor.
    scene.getObjectByName("mixamorig:Hips")?.position.set(0.002947, -0.008119, -10.158342);
    Object.values(highlightMaterials).forEach((m) => {
      if (!m) return;
      m.color.copy(COLOR_REST);
      m.emissive.copy(EMISSIVE_COLOR);
      m.emissiveIntensity = 0;
      m.roughness = ROUGHNESS_REST;
    });
  }, [scene, highlightMaterials]);

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
    EXERCISES.forEach((ex) => {
      const mat = highlightMaterials[ex.highlightName];
      if (!mat) return;
      if (ex.key === activeExercise) {
        mat.roughness = MathUtils.lerp(mat.roughness, ROUGHNESS_ACTIVE, t);
        mat.emissiveIntensity = MathUtils.lerp(mat.emissiveIntensity, 0.6 + 1.2 * Math.pow(contraction, 1.2), t);
      } else {
        mat.roughness = MathUtils.lerp(mat.roughness, ROUGHNESS_REST, t);
        mat.emissiveIntensity = MathUtils.lerp(mat.emissiveIntensity, 0, t);
      }
    });
  });

  return (
    <group ref={groupRef} scale={CHARACTER_SCALE} position={[CHARACTER_X, 0, 0]}>
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

function CharacterSpot({ pulseRef }: { pulseRef: React.MutableRefObject<number> }) {
  const ref = useRef<SpotLight>(null);
  useEffect(() => {
    // Light target is not part of the scene graph; update its matrix once by hand.
    ref.current?.target.position.set(CHARACTER_X, 0.9, 0);
    ref.current?.target.updateMatrixWorld();
  }, []);
  useFrame((_, delta) => {
    if (!ref.current) return;
    pulseRef.current = MathUtils.damp(pulseRef.current, 0, 4, delta);
    ref.current.intensity = 18 + pulseRef.current * 22;
  });
  return (
    <spotLight
      ref={ref}
      position={[CHARACTER_X + 0.6, 3.2, 2.2]}
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
    camera.position.copy(target).addScaledVector(scratchVec, CAMERA.distance);
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
        <pointLight position={[CHARACTER_X - 0.6, 2.2, -1.0]} intensity={25} distance={3.5} decay={2} color="#f2a93b" />
        <CharacterSpot pulseRef={pulseRef} />
        <CameraRig pointer={pointer} isMobile={isMobile} />
        <Suspense fallback={null}>
          <GymEnvironment />
          <GymCharacter activeExercise={activeExercise} onRepComplete={onRepComplete} pulseRef={pulseRef} />
          {!isMobile && <ContactShadows position={[CHARACTER_X, 0.002, 0]} opacity={0.65} scale={5} blur={1.6} far={1.5} />}
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(CHARACTER_MODEL_PATH);
useGLTF.preload(ENV_MODEL_PATH);
