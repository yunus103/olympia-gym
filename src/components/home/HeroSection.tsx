import { HeroScene } from "@/components/home/HeroScene";
import { HomePage } from "@/types";

interface HeroSectionProps {
  data: Pick<HomePage, "heroTitle" | "heroPrimaryCta" | "heroWhatsappLabel"> | null;
}

// TEMP: layout stripped down to isolated 3D model test — headline/CTA restored once the asset is validated.
export function HeroSection(_props: HeroSectionProps) {
  return (
    <section className="relative h-[calc(100dvh-5rem)] min-h-[540px] w-full bg-black overflow-hidden">
      <HeroScene />
    </section>
  );
}
