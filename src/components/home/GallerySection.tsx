"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SanityImage } from "@/components/ui/SanityImage";
import { Button } from "@/components/ui/button";
import { Lightbox, prefetchLightboxImage } from "@/components/ui/Lightbox";
import { GALLERY_CATEGORIES } from "@/lib/galleryCategories";
import { cn } from "@/lib/utils";
import { GalleryCategory, GalleryItem } from "@/types";

// Keeps the single-page layout short; the rest is one click away and fully browsable inside the lightbox.
const PAGE_SIZE = 6;

type Filter = GalleryCategory | "all";

interface GallerySectionProps {
  title?: string;
  subtitle?: string;
  /** Used for the alt fallback when neither alt nor title is set. */
  siteName?: string;
  /** GROQ returns null (not undefined) for an empty array, so a default param alone isn't enough. */
  items?: GalleryItem[] | null;
}

export function GallerySection({ title, subtitle, siteName, items: rawItems }: GallerySectionProps) {
  const items = rawItems ?? [];
  const [category, setCategory] = useState<Filter>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (items.length === 0) return null;

  const categories = GALLERY_CATEGORIES.filter((c) => items.some((i) => i.category === c.value));
  const filtered = category === "all" ? items : items.filter((i) => i.category === category);
  const visible = filtered.slice(0, visibleCount);
  const remaining = filtered.length - visible.length;

  const selectCategory = (value: Filter) => {
    setCategory(value);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <section id="galeri" className="scroll-mt-16 bg-background py-16 md:scroll-mt-18 md:py-24">
      <div className="container mx-auto px-4">
        {title && <SectionHeading title={title} subtitle={subtitle} />}

        {categories.length > 1 && (
          <div className="mt-8 flex justify-center md:mt-12">
            <div role="radiogroup" aria-label="Kategori" className="chamfer flex max-w-full overflow-x-auto bg-card p-1">
              {[{ title: "Tümü", value: "all" as const }, ...categories].map((c) => {
                const active = c.value === category;
                return (
                  <button
                    key={c.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => selectCategory(c.value)}
                    className={cn(
                      "shrink-0 font-display px-4 py-2.5 text-sm font-bold uppercase tracking-wide transition-colors",
                      active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {c.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-2 gap-3 md:mt-12 md:grid-cols-3 md:gap-4">
          {visible.map((item, i) => (
            <button
              key={item._key}
              type="button"
              aria-label={item.title ? `${item.title} — büyüt` : "Fotoğrafı büyüt"}
              onClick={() => setOpenIndex(i)}
              onMouseEnter={() => prefetchLightboxImage(item)}
              onPointerDown={() => prefetchLightboxImage(item)}
              className="group relative aspect-[4/3] overflow-hidden rounded-[var(--radius)] bg-card text-left outline-none focus-visible:inset-ring-2 focus-visible:inset-ring-primary"
            >
              <SanityImage
                image={item}
                alt={item.title || `${siteName ?? ""} galeri`.trim()}
                width={800}
                height={600}
                sizes="(max-width: 768px) 50vw, 33vw"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {item.title && (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent px-3 pb-2.5 pt-8 font-display text-xs font-bold uppercase tracking-wide text-foreground md:text-sm">
                  {item.title}
                </span>
              )}
            </button>
          ))}
        </div>

        {remaining > 0 && (
          <div className="mt-8 flex justify-center md:mt-10">
            <Button variant="outline" onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}>
              Daha Fazla Göster ({remaining})
            </Button>
          </div>
        )}
      </div>

      <Lightbox
        images={filtered.map((i) => ({ image: i, title: i.title, alt: i.title || `${siteName ?? ""} galeri`.trim() }))}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onNavigate={setOpenIndex}
      />
    </section>
  );
}
