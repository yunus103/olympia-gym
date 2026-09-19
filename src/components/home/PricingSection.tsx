import { SectionHeading } from "@/components/ui/SectionHeading";
import { HomePage, PricingPlan } from "@/types";

interface PricingSectionProps {
  data: HomePage | null;
  plans: PricingPlan[] | null;
  whatsappNumber?: string;
}

const formatPrice = (n: number) => `${n.toLocaleString("tr-TR")} ₺`;

export function PricingSection({ data, plans, whatsappNumber }: PricingSectionProps) {
  const list = plans ?? [];
  const ptItems = data?.pricingPtItems ?? [];
  const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}` : undefined;
  const showPt = Boolean(data?.pricingPtTitle || ptItems.length > 0);

  if (list.length === 0 && !showPt) return null;

  return (
    <section id="fiyatlar" className="relative scroll-mt-16 bg-background md:scroll-mt-18">
      <div aria-hidden className="led-divider" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-honeycomb" />

      <div className="container relative mx-auto px-4 py-16 md:py-24">
        {data?.pricingTitle && <SectionHeading title={data.pricingTitle} subtitle={data.pricingSubtitle} />}

        {list.length > 0 && (
          <ul className="mt-10 grid grid-cols-2 gap-3 md:mt-14 md:grid-cols-4 md:gap-4">
            {list.map((plan) => (
              <li key={plan._id} className="chamfer flex flex-col border border-border bg-card px-5 py-6 md:px-6 md:py-8">
                <p className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">{plan.duration}</p>
                <p className="mt-3 font-display text-4xl font-black leading-none tracking-tight text-primary tabular-nums md:text-5xl">
                  {formatPrice(plan.price)}
                </p>
                {plan.oldPrice != null && plan.oldPrice > plan.price && (
                  <p className="mt-2 font-display text-lg font-bold text-muted-foreground line-through tabular-nums">{formatPrice(plan.oldPrice)}</p>
                )}
                {plan.note && <p className="mt-3 text-sm text-muted-foreground">{plan.note}</p>}
              </li>
            ))}
          </ul>
        )}

        {showPt && (
          <div className="chamfer mt-4 grid gap-8 border border-border bg-card px-5 py-8 md:mt-6 md:grid-cols-[1fr_1.4fr] md:gap-12 md:px-10 md:py-12">
            <div>
              {data?.pricingPtTitle && (
                <h3 className="font-display text-3xl font-extrabold uppercase leading-[0.9] tracking-tight text-foreground md:text-4xl">
                  {data.pricingPtTitle}
                </h3>
              )}
              {data?.pricingPtText && <p className="mt-4 text-base text-muted-foreground md:text-lg">{data.pricingPtText}</p>}
              {data?.pricingPtCtaLabel && whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-block font-display text-sm font-bold uppercase tracking-wide text-primary underline-offset-4 hover:underline"
                >
                  {data.pricingPtCtaLabel} &rarr;
                </a>
              )}
            </div>

            {ptItems.length > 0 && (
              <ul className="grid gap-5 sm:grid-cols-2">
                {ptItems.map((item) => (
                  <li key={item._key} className="border-l border-primary pl-4">
                    <p className="font-display text-base font-bold uppercase tracking-wide text-foreground">{item.title}</p>
                    {item.text && <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
