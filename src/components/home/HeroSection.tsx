import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroInteractive } from "@/components/home/HeroInteractive";
import { HomePage } from "@/types";

interface HeroSectionProps {
  data: Pick<HomePage, "heroTitle" | "heroPrimaryCta"> | null;
}

export function HeroSection({ data }: HeroSectionProps) {
  const cta = data?.heroPrimaryCta;

  return (
    <section className="relative h-svh min-h-[560px] w-full overflow-hidden bg-background md:h-dvh">
      <HeroInteractive
        title={
          <h1 className="pointer-events-auto text-balance text-[34px] leading-[0.9] tracking-tight uppercase md:max-w-[12ch] md:text-7xl lg:text-8xl">
            {data?.heroTitle}
          </h1>
        }
        cta={
          cta?.label && cta.href ? (
            <Button size="lg" className="w-full md:w-auto" render={<Link href={cta.href} />}>
              {cta.label}
            </Button>
          ) : null
        }
      />
    </section>
  );
}
