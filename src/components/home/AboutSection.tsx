import { RichText } from "@/components/ui/RichText";
import { SanityImage } from "@/components/ui/SanityImage";
import { HomePage } from "@/types";

export function AboutSection({ data }: { data: HomePage | null }) {
  if (!data?.aboutTitle && !data?.aboutBody) return null;

  return (
    <section id="hakkinda" className="scroll-mt-16 bg-background md:scroll-mt-18">
      <div aria-hidden className="led-divider" />

      <div className="container mx-auto grid gap-8 px-4 py-16 md:grid-cols-2 md:items-center md:gap-16 md:py-24">
        {data.aboutImage && (
          <div className="chamfer relative aspect-[4/3] overflow-hidden bg-card md:order-2">
            <SanityImage image={data.aboutImage} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
        )}

        <div className="md:order-1">
          {data.aboutTitle && (
            <h2 className="font-display text-4xl font-extrabold uppercase leading-[0.9] tracking-tight text-foreground md:text-6xl">
              {data.aboutTitle}
            </h2>
          )}
          <RichText value={data.aboutBody} className="mt-6 prose-invert prose-p:text-muted-foreground md:mt-8" />
        </div>
      </div>
    </section>
  );
}
