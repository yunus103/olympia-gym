"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Html, OrbitControls, useAnimations, useGLTF, useProgress } from "@react-three/drei";
import {
  AnimationAction,
  Color,
  Group,
  LoopOnce,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
} from "three";
import { cn } from "@/lib/utils";

const CHARACTER_MODEL_PATH = "/assets/gym_hero_character.glb";
const ENV_MODEL_PATH = "/assets/olympia-gym-hero.glb";
const CHARACTER_SCALE = 10.85;

const COLOR_REST = new Color(1, 1, 1);
const COLOR_ACTIVE_BASE = new Color("#c8102e"); // Deep anatomical crimson preserving shadow crevices
const COLOR_ACTIVE_PEAK = new Color("#ff1a40"); // Luminous neon glow at peak muscle squeeze
const EMISSIVE_COLOR = new Color("#ff0a2e");
const ROUGHNESS_REST = 0.5;
const ROUGHNESS_ACTIVE = 0.4; // Preserves athletic specular sheen defining 3D muscle curvature
const scratchColor = new Color();

type ExerciseKey = "bicep" | "frontraise" | "squat";

const EXERCISES: {
  key: ExerciseKey;
  label: string;
  muscleLabel: string;
  actionName: string;
  highlightName: string;
}[] = [
  {
    key: "bicep",
    label: "Bicep Curl",
    muscleLabel: "BICEPS BRACHII",
    actionName: "BicepCurl",
    highlightName: "Bicep_Highlight",
  },
  {
    key: "frontraise",
    label: "Front Raise",
    muscleLabel: "ANTERIOR DELTOID",
    actionName: "FrontRaise",
    highlightName: "FrontRaise_Highlight",
  },
  {
    key: "squat",
    label: "Squat",
    muscleLabel: "QUADRICEPS & GLUTEUS",
    actionName: "Squat",
    highlightName: "Squat_Highlight",
  },
];

interface GymCharacterModelProps {
  activeExercise: ExerciseKey | null;
  onRepComplete: () => void;
}

function GymCharacterModel({ activeExercise, onRepComplete }: GymCharacterModelProps) {
  const groupRef = useRef<Group>(null);
  const { scene, animations } = useGLTF(CHARACTER_MODEL_PATH);

  const { actions, mixer } = useAnimations(animations, groupRef);

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
    // Align rest-pose Hips translation with initial animated frame coordinates
    const hips = scene.getObjectByName("mixamorig:Hips");
    if (hips) {
      hips.position.set(0.002947, -0.008119, -10.158342);
    }

    scene.traverse((obj) => {
      if ((obj as Mesh).isMesh) {
        obj.castShadow = true;
      }
    });
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
    actions.Idle?.reset().play();
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

  const currentConfig = EXERCISES.find((e) => e.key === activeExercise);

  return (
    <group ref={groupRef} scale={CHARACTER_SCALE} position={[0, 0, 0]}>
      <primitive object={scene} />
      <Html position={[0, 0.188, 0]} center distanceFactor={2.6} className="pointer-events-none select-none">
        {activeExercise && currentConfig ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/90 border border-red-500/60 backdrop-blur-md text-[10px] font-mono tracking-widest text-red-400 whitespace-nowrap shadow-[0_0_15px_rgba(239,68,68,0.4)]">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {currentConfig.muscleLabel}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/70 border border-white/10 backdrop-blur-md text-[9px] font-mono tracking-widest text-white/40 whitespace-nowrap">
            <span className="w-1 h-1 rounded-full bg-white/30" />
            OLYMPIA ATHLETE
          </div>
        )}
      </Html>
    </group>
  );
}

function GymEnvironment() {
  const { scene } = useGLTF(ENV_MODEL_PATH);

  useEffect(() => {
    scene.traverse((obj) => {
      if ((obj as Mesh).isMesh) {
        const mesh = obj as Mesh;
        mesh.receiveShadow = true;
        const name = (mesh.name || "").toLowerCase();
        if (
          name.includes("rack") ||
          name.includes("bench") ||
          name.includes("plate") ||
          name.includes("bar") ||
          name.includes("tree") ||
          name.includes("clip")
        ) {
          mesh.castShadow = true;
        }
      }
    });
  }, [scene]);

  return <primitive object={scene} />;
}

useGLTF.preload(CHARACTER_MODEL_PATH);
useGLTF.preload(ENV_MODEL_PATH);

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
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[2.5, 4.5, 2]}
          intensity={1.3}
          castShadow
          shadow-bias={-0.0004}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <Suspense fallback={null}>
          <GymEnvironment />
          <GymCharacterModel activeExercise={activeExercise} onRepComplete={handleRepComplete} />
          <ContactShadows
            position={[0, 0.002, 0]}
            opacity={0.65}
            scale={5}
            blur={1.6}
            far={1.5}
          />
          <Environment preset="city" />
        </Suspense>
        <OrbitControls
          enableDamping
          dampingFactor={0.07}
          target={[0, 0.9, 0]}
          minDistance={2}
          maxDistance={7.5}
          maxPolarAngle={Math.PI / 2 - 0.02}
          enablePan={false}
        />
      </Canvas>

      {/* Top Bar Overlay */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4 sm:p-6 md:p-8">
        {/* Brand & Hours */}
        <div className="pointer-events-auto flex flex-col gap-0.5 sm:gap-1">
          <span className="text-xs sm:text-sm font-extrabold font-mono tracking-wider text-white uppercase">
            OLYMPIA GYM
          </span>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-mono tracking-widest text-white/50">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>09:00 — 23:00</span>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
          <Link
            href="/iletisim"
            className="px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-mono uppercase tracking-wider text-white/70 hover:text-white border border-white/15 hover:border-white/40 bg-black/40 backdrop-blur-md rounded-full transition-all duration-200"
          >
            Fiyatlarımız
          </Link>
          <Link
            href="/iletisim"
            className="px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-mono uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/50 backdrop-blur-md rounded-full transition-all duration-200"
          >
            İletişim
          </Link>
        </div>
      </div>

      {/* Floating Bottom Workout Dock */}
      <div className="pointer-events-none absolute bottom-4 sm:bottom-6 inset-x-0 z-20 flex flex-col items-center gap-2 sm:gap-2.5 px-3 sm:px-4">
        <div className="pointer-events-auto flex items-center justify-center gap-1.5 sm:gap-3 p-1.5 sm:p-2 rounded-2xl bg-black/85 border border-white/10 backdrop-blur-xl shadow-2xl max-w-full overflow-x-auto">
          {/* Exercise Pills */}
          <div className="flex items-center gap-1 shrink-0">
            {EXERCISES.map((ex) => {
              const isActive = activeExercise === ex.key;
              return (
                <button
                  key={ex.key}
                  disabled={isPlaying}
                  onClick={() => handleExerciseClick(ex.key)}
                  className={cn(
                    "relative px-2.5 sm:px-4 py-1.5 rounded-xl text-[11px] sm:text-xs font-medium font-mono uppercase tracking-wider transition-all duration-200 shrink-0",
                    isActive
                      ? "bg-red-600/25 text-red-300 border border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                      : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10",
                    isPlaying && !isActive && "opacity-30 cursor-not-allowed"
                  )}
                >
                  {ex.label}
                </button>
              );
            })}
          </div>

          <div className="h-4 sm:h-5 w-px bg-white/10 shrink-0" />

          {/* Rep Counter */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 bg-white/5 rounded-xl border border-white/5 shrink-0">
            <span className="text-base sm:text-lg font-bold font-mono text-white tabular-nums leading-none">
              {String(repCount).padStart(2, "0")}
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-widest text-white/40 leading-none">
              Reps
            </span>
          </div>
        </div>

        {/* Minimal 360 Orbit Hint */}
        <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-white/30 select-none">
          360° DRAG · SCROLL ZOOM
        </div>
      </div>
    </div>
  );
}
