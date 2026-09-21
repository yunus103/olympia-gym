import { Instagram } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SanityImage } from "@/components/ui/SanityImage";
import { HomePage } from "@/types";

export function TeamSection({ data }: { data: HomePage | null }) {
  const members = data?.teamMembers ?? [];
  if (members.length === 0) return null;

  // 3 people is the expected case; a 4th would orphan on a 3-col grid, so widen instead.
  const cols = members.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";

  return (
    <section id="ekip" className="scroll-mt-16 bg-background md:scroll-mt-18">
      <div aria-hidden className="led-divider" />

      <div className="container mx-auto px-4 py-16 md:py-24">
        {data?.teamTitle && <SectionHeading title={data.teamTitle} subtitle={data.teamSubtitle} />}

        <ul className={`mt-10 grid gap-3 sm:grid-cols-2 md:mt-14 md:gap-4 ${cols}`}>
          {members.map((member) => (
            <li key={member._key} className="chamfer group flex flex-col border border-border bg-card transition-colors hover:border-[#3A3A3A]">
              <div className="relative aspect-[4/5] overflow-hidden bg-background">
                {member.photo && (
                  <SanityImage
                    image={member.photo}
                    alt={member.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover grayscale transition-[filter] duration-500 group-hover:grayscale-0"
                  />
                )}
                <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-card to-transparent" />
              </div>

              <div className="flex items-end justify-between gap-4 px-5 py-5 md:px-6">
                <div>
                  <h3 className="font-display text-2xl font-extrabold uppercase leading-none tracking-tight text-foreground">{member.name}</h3>
                  <p className="mt-2 font-display text-sm font-bold uppercase tracking-wide text-primary">{member.role}</p>
                </div>
                {member.instagram && (
                  <a
                    href={member.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} Instagram`}
                    className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Instagram className="size-5" />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
