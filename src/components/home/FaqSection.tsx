import { FAQ } from "@/components/ui/FAQ";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HomePage } from "@/types";

export function FaqSection({ data }: { data: HomePage | null }) {
  const items = data?.faqs ?? [];
  if (items.length === 0) return null;

  return (
    <section id="sss" className="scroll-mt-16 bg-background md:scroll-mt-18">
      <div aria-hidden className="led-divider" />

      <div className="container mx-auto px-4 py-16 md:py-24">
        {data?.faqTitle && <SectionHeading title={data.faqTitle} subtitle={data.faqSubtitle} />}
        <FAQ items={items} className="mx-auto mt-10 max-w-3xl md:mt-14" />
      </div>
    </section>
  );
}
