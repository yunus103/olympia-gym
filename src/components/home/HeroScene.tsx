"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, useAnimations, useGLTF, useProgress } from "@react-three/drei";
import {
  AnimationAction,
  Box3,
  Color,
  Group,
  LoopOnce,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  Vector3,
} from "three";

const MODEL_PATH = "/assets/gym_hero_character.glb";
const TARGET_HEIGHT = 1.9;

const COLOR_REST = new Color(1, 1, 1);
const COLOR_ACTIVE_BASE = new Color("#c8102e"); // Deep anatomical crimson preserving shadow crevices
const COLOR_ACTIVE_PEAK = new Color("#ff1a40"); // Luminous neon glow at peak muscle squeeze
const EMISSIVE_COLOR = new Color("#ff0a2e");
const ROUGHNESS_REST = 0.5;
const ROUGHNESS_ACTIVE = 0.4; // Preserves athletic specular sheen defining 3D muscle curvature
const scratchColor = new Color();

type ExerciseKey = "bicep" | "frontraise" | "squat";

const EXERCISES: { key: ExerciseKey; label: string; actionName: string; highlightName: string }[] = [
  { key: "bicep", label: "Bicep Curl", actionName: "BicepCurl", highlightName: "Bicep_Highlight" },
  { key: "frontraise", label: "Front Raise", actionName: "FrontRaise", highlightName: "FrontRaise_Highlight" },
  { key: "squat", label: "Squat", actionName: "Squat", highlightName: "Squat_Highlight" },
];

interface GymCharacterModelProps {
  activeExercise: ExerciseKey | null;
  onRepComplete: () => void;
}

function GymCharacterModel({ activeExercise, onRepComplete }: GymCharacterModelProps) {
  const groupRef = useRef<Group>(null);
  const { scene, animations } = useGLTF(MODEL_PATH);

  // The Hips translation track overrides its rest-pose position with values from a
  // completely different coordinate reference, throwing the whole skeleton off (verified
  // by inspecting the GLB directly: rest Hips.translation.z=5.99 vs animated range -0.16..0.02).
  // Drop the position channel entirely so Hips keeps its rest position; only rotation animates.
  const groundedAnimations = useMemo(() => {
    return animations.map((clip) => {
      const newClip = clip.clone();
      newClip.tracks = newClip.tracks.filter(
        (track) => !(track.name.endsWith(".position") && /hips/i.test(track.name)),
      );
      return newClip;
    });
  }, [animations]);

  const { actions, mixer } = useAnimations(groundedAnimations, groupRef);

  const { scale, position } = useMemo(() => {
    // useGLTF caches this scene singleton; reset its transform before measuring
    // so repeated measurements (e.g. across HMR reloads) don't compound.
    scene.position.set(0, 0, 0);
    scene.scale.set(1, 1, 1);
    scene.updateMatrixWorld(true);

    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    const scaleFactor = size.y > 0 ? TARGET_HEIGHT / size.y : 1;
    const center = box.getCenter(new Vector3());
    return {
      scale: scaleFactor,
      position: [-center.x * scaleFactor, -box.min.y * scaleFactor, -center.z * scaleFactor] as [
        number,
        number,
        number,
      ],
    };
  }, [scene]);

  const highlightMaterials = useMemo(() => {
    const map: Partial<Record<string, MeshStandardMaterial>> = {};
    const names = EXERCISES.map((e) => e.highlightName);
    scene.traverse((obj) => {
      if (!(obj as Mesh).isMesh) return;
      const mats = Array.isArray((obj as Mesh).material) ? (obj as Mesh).material : [(obj as Mesh).material];
      (mats as MeshStandardMaterial[]).forEach((m) => {
        if (m?.name && names.includes(m.name)) map[m.name] = m;
      });
    });
    return map;
  }, [scene]);

  useEffect(() => {
    Object.values(highlightMaterials).forEach((m) => {
      if (!m) return;
      m.color.copy(COLOR_REST);
      m.emissive.copy(EMISSIVE_COLOR);
      m.emissiveIntensity = 0;
      m.roughness = ROUGHNESS_REST;
    });
  }, [highlightMaterials]);

  useFrame((_, delta) => {
    // Track dynamic rep progression to pulse the highlight with muscle contraction
    const activeConfig = EXERCISES.find((e) => e.key === activeExercise);
    const activeAction = activeConfig ? actions[activeConfig.actionName] : undefined;
    let contraction = 0;
    if (activeAction && activeAction.isRunning()) {
      const duration = activeAction.getClip().duration || 1;
      const progress = Math.min(Math.max(activeAction.time / duration, 0), 1);
      // Sinusoidal contraction curve: 0 at start -> 1.0 at peak squeeze -> 0 at rep completion
      contraction = Math.sin(progress * Math.PI);
    }

    EXERCISES.forEach((ex) => {
      const mat = highlightMaterials[ex.highlightName];
      if (!mat) return;
      const isActive = ex.key === activeExercise;
      const t = delta * 6;

      if (isActive) {
        scratchColor.lerpColors(COLOR_ACTIVE_BASE, COLOR_ACTIVE_PEAK, contraction);
        mat.color.lerp(scratchColor, t);
        mat.roughness = MathUtils.lerp(mat.roughness, ROUGHNESS_ACTIVE, t);
        // Emissive swells from warm 0.35 baseline up to glowing 0.85 at peak contraction
        const targetEmissive = 0.35 + 0.5 * Math.pow(contraction, 1.2);
        mat.emissiveIntensity = MathUtils.lerp(mat.emissiveIntensity, targetEmissive, t);
      } else {
        mat.color.lerp(COLOR_REST, t);
        mat.roughness = MathUtils.lerp(mat.roughness, ROUGHNESS_REST, t);
        mat.emissiveIntensity = MathUtils.lerp(mat.emissiveIntensity, 0, t);
      }
    });
  });

  useEffect(() => {
    actions.Idle?.reset().fadeIn(0.3).play();
  }, [actions]);

  useEffect(() => {
    if (!activeExercise) return;
    const config = EXERCISES.find((e) => e.key === activeExercise);
    const action = config ? actions[config.actionName] : undefined;
    if (!config || !action) return;

    actions.Idle?.fadeOut(0.25);
    action.reset();
    action.setLoop(LoopOnce, 1);
    action.clampWhenFinished = true;
    action.fadeIn(0.25).play();

    const handleFinished = (e: { action: AnimationAction }) => {
      if (e.action !== action) return;
      mixer.removeEventListener("finished", handleFinished);
      action.fadeOut(0.3);
      actions.Idle?.reset().fadeIn(0.3).play();
      onRepComplete();
    };
    mixer.addEventListener("finished", handleFinished);

    return () => {
      mixer.removeEventListener("finished", handleFinished);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeExercise]);

  return <primitive ref={groupRef} object={scene} scale={scale} position={position} />;
}

useGLTF.preload(MODEL_PATH);

function LoadingOverlay() {
  const { active, progress } = useProgress();
  if (!active) return null;
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black text-white">
      <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">Loading</div>
      <div className="h-[2px] w-44 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-orange-500 transition-[width] duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function HeroScene() {
  const [activeExercise, setActiveExercise] = useState<ExerciseKey | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [repCount, setRepCount] = useState(0);

  const handleRepComplete = useCallback(() => {
    setIsPlaying(false);
    setActiveExercise(null);
    setRepCount((c) => c + 1);
  }, []);

  const handleExerciseClick = (key: ExerciseKey) => {
    if (isPlaying) return;
    setIsPlaying(true);
    setActiveExercise(key);
  };

  const activeLabel = EXERCISES.find((e) => e.key === activeExercise)?.label ?? "—";

  return (
    <div className="relative h-full w-full">
      <LoadingOverlay />
      <Canvas camera={{ position: [0, 1.2, 4.2], fov: 40 }} shadows>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 2]} intensity={1.2} castShadow />
        <Suspense fallback={null}>
          <GymCharacterModel activeExercise={activeExercise} onRepComplete={handleRepComplete} />
          <Environment preset="city" />
        </Suspense>
        <OrbitControls
          enableDamping
          dampingFactor={0.07}
          target={[0, 0.9, 0]}
          minDistance={2}
          maxDistance={8}
          enablePan={false}
        />
      </Canvas>

      <div className="absolute left-8 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2">
        {EXERCISES.map((ex) => (
          <button
            key={ex.key}
            disabled={isPlaying}
            onClick={() => handleExerciseClick(ex.key)}
            className="w-fit min-w-[190px] rounded-full border border-white/10 bg-white/5 px-4 py-2 text-left text-xs font-medium text-white/70 transition disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:border-orange-500/40 enabled:hover:bg-orange-500/10 enabled:hover:text-white"
          >
            {ex.label}
          </button>
        ))}

        <div className="mt-4">
          <div className="mb-1 text-[10px] uppercase tracking-[0.18em] text-orange-500">{activeLabel}</div>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-extrabold tabular-nums text-white">{repCount}</span>
            <span className="mb-2 text-xs uppercase tracking-wide text-white/40">reps</span>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-[10px] uppercase tracking-[0.15em] text-white/30">
        Drag to orbit · Scroll to zoom
      </div>
    </div>
  );
}
