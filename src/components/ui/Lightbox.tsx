"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { SanityImage } from "@/components/ui/SanityImage";
import { urlForImage } from "@/sanity/lib/image";
import { SanityImage as SanityImageType } from "@/types";

export type LightboxImage = { image: SanityImageType; title?: string; alt?: string };

const FULL_QUALITY = 85;
// next/image default `deviceSizes`; SanityImage's loader caps at 1920.
const DEVICE_SIZES = [640, 750, 828, 1080, 1200, 1920];

/** Mirrors the width next/image will pick for `sizes="100vw"`, so the prefetched URL is the one actually requested. */
function lightboxWidth() {
  const target = window.innerWidth * window.devicePixelRatio;
  return DEVICE_SIZES.find((w) => w >= target) ?? DEVICE_SIZES[DEVICE_SIZES.length - 1];
}

/** Warms the browser cache with the full-size render so opening/navigating feels instant. */
export function prefetchLightboxImage(image: SanityImageType) {
  if (typeof window === "undefined" || !image?.asset) return;
  try {
    const url = urlForImage(image)?.auto("format").width(lightboxWidth()).fit("max").quality(FULL_QUALITY).url();
    if (!url || document.querySelector(`link[href="${url}"]`)) return;
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.as = "image";
    link.href = url;
    document.head.appendChild(link);
  } catch {
    // Prefetch is best-effort.
  }
}

interface LightboxProps {
  images: LightboxImage[];
  /** Index into `images`, or null when closed. */
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const variants = {
  enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0, scale: 0.95 }),
  center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
  exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 300 : -300, opacity: 0, scale: 0.95 }),
};

export function Lightbox({ images, index, onClose, onNavigate }: LightboxProps) {
  const [direction, setDirection] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = index !== null;
  const count = images.length;

  const paginate = (dir: number) => {
    if (index === null || count < 2) return;
    setDirection(dir);
    onNavigate((index + dir + count) % count);
  };

  // Scroll lock + focus move on open, focus restore on close.
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
      opener?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") paginate(-1);
      if (e.key === "ArrowRight") paginate(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Neighbours are prefetched so arrow navigation doesn't wait on the CDN.
  useEffect(() => {
    if (index === null || count < 2) return;
    prefetchLightboxImage(images[(index + 1) % count].image);
    prefetchLightboxImage(images[(index - 1 + count) % count].image);
  }, [index, count, images]);

  const current = index !== null ? images[index] : null;

  return (
    <AnimatePresence initial={false} custom={direction}>
      {current && index !== null && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={current.title ?? "Galeri"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex flex-col bg-background/95 touch-none"
          onClick={onClose}
        >
          <div className="flex items-center justify-between px-4 py-4 md:px-8" onClick={(e) => e.stopPropagation()}>
            <p className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground tabular-nums">
              {index + 1} <span className="mx-1 text-border">/</span> {count}
            </p>
            <button
              ref={closeRef}
              type="button"
              aria-label="Kapat"
              onClick={onClose}
              className="flex size-10 items-center justify-center text-muted-foreground transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none"
            >
              <X className="size-7" />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 md:px-20">
            {count > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Önceki"
                  onClick={(e) => {
                    e.stopPropagation();
                    paginate(-1);
                  }}
                  className="absolute left-2 top-1/2 z-20 hidden size-14 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-primary md:left-4 md:flex"
                >
                  <ChevronLeft className="size-10" />
                </button>
                <button
                  type="button"
                  aria-label="Sonraki"
                  onClick={(e) => {
                    e.stopPropagation();
                    paginate(1);
                  }}
                  className="absolute right-2 top-1/2 z-20 hidden size-14 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-primary md:right-4 md:flex"
                >
                  <ChevronRight className="size-10" />
                </button>
              </>
            )}

            <motion.div
              key={index}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.25 } }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(_, { offset, velocity }) => {
                if (offset.x > 100 || (offset.x > 20 && velocity.x > 500)) paginate(-1);
                else if (offset.x < -100 || (offset.x < -20 && velocity.x < -500)) paginate(1);
              }}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
            >
              <SanityImage
                image={current.image}
                alt={current.alt}
                fill
                fit="max"
                quality={FULL_QUALITY}
                sizes="100vw"
                objectFit="contain"
                noBlur
                className="pointer-events-none select-none"
              />
            </motion.div>
          </div>

          <div className="px-4 py-4 text-center md:px-8">
            {current.title && (
              <p className="font-display text-base font-bold uppercase tracking-wide text-foreground md:text-lg">{current.title}</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
