"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { EXERCISES, ExerciseKey } from "@/components/home/heroExercises";

const HeroScene = dynamic(() => import("@/components/home/HeroScene").then((m) => m.HeroScene), { ssr: false });

interface HeroInteractiveProps {
  title: ReactNode;
  cta: ReactNode;
}

export function HeroInteractive({ title, cta }: HeroInteractiveProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeExercise, setActiveExercise] = useState<ExerciseKey | null>(null);
  const [repCount, setRepCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [inView, setInView] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [dragged, setDragged] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Stop rendering when the hero is scrolled out of view.
  useEffect(() => {
    if (!sectionRef.current) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0 });
    io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const id = setTimeout(() => setActiveExercise((cur) => cur ?? EXERCISES[0].key), 1000);
    return () => clearTimeout(id);
  }, [loaded]);

  const handleLoaded = useCallback(() => setLoaded(true), []);
  const handleRepComplete = useCallback(() => setRepCount((c) => c + 1), []);
  const handleDrag = useCallback(() => setDragged(true), []);

  const selectExercise = (key: ExerciseKey) => {
    if (key === activeExercise) return;
    setRepCount(0);
    setActiveExercise(key);
  };

  return (
    <div ref={sectionRef} className="relative h-full w-full">
      <HeroScene
        activeExercise={activeExercise}
        onRepComplete={handleRepComplete}
        onLoaded={handleLoaded}
        onDrag={handleDrag}
        isMobile={isMobile}
        paused={!inView}
      />

      {/* Legibility gradients: light at the top under the header, heavy at the bottom behind the controls. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-background via-background/85 to-transparent md:h-[20%] md:from-background/70 md:via-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-background via-background/60 to-transparent md:h-[35%] md:via-background/30" />

      <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-7xl flex-col justify-between px-4 pt-24 pb-20 md:grid md:grid-cols-2 md:items-center md:pt-18 md:pb-0">
        <div className="flex flex-col gap-8">
          {title}
          <div className="pointer-events-auto hidden md:block">{cta}</div>
        </div>

        <div className="flex flex-col items-center gap-3 md:h-full md:justify-end md:pb-10">
          {/* Drag hint: hardcoded by design (hero scene exception), fades out after the first drag but stays in the DOM. */}
          <p
            aria-hidden
            className={cn(
              "text-xs uppercase tracking-wider text-muted-foreground transition-opacity duration-500",
              loaded && !dragged ? "opacity-100" : "opacity-0"
            )}
          >
            &harr; Sürükleyerek döndür
          </p>
          <div className="pointer-events-auto flex items-stretch gap-2">
            <div role="radiogroup" aria-label="Egzersiz" className="chamfer flex bg-card p-1">
              {EXERCISES.map((ex) => {
                const active = ex.key === activeExercise;
                return (
                  <button
                    key={ex.key}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => selectExercise(ex.key)}
                    className={cn(
                      "font-display px-4 py-2.5 text-sm font-bold uppercase tracking-wide transition-colors",
                      active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {ex.label}
                  </button>
                );
              })}
            </div>
            <div
              aria-label="Tekrar sayısı"
              className="chamfer flex min-w-16 items-center justify-center bg-card px-3 font-display text-3xl font-black tabular-nums leading-none text-primary [text-shadow:0_0_12px_color-mix(in_srgb,var(--primary)_60%,transparent)]"
            >
              {String(repCount).padStart(2, "0")}
            </div>
          </div>
          <div className="pointer-events-auto w-full md:hidden">{cta}</div>
        </div>
      </div>
    </div>
  );
}
