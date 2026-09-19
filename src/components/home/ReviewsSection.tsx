import { Star } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HomePage, SiteSettings } from "@/types";

interface ReviewsSectionProps {
  data: HomePage | null;
  settings?: SiteSettings;
}

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div aria-label={`${rating} / 5`} className={className}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} aria-hidden className={i < Math.round(rating) ? "fill-primary text-primary" : "text-border"} />
      ))}
    </div>
  );
}

const formatDate = (iso: string) => new Date(iso).toLocaleDateString("tr-TR", { month: "long", year: "numeric" });

export function ReviewsSection({ data, settings }: ReviewsSectionProps) {
  const list = data?.reviews ?? [];
  const rating = settings?.googleRating;
  const count = settings?.googleReviewCount;
  const mapsUrl = settings?.contactInfo?.mapsUrl;
  const showSummary = rating != null;

  if (list.length === 0 && !showSummary) return null;

  const summary = (
    <>
      <span className="font-display text-5xl font-black leading-none tracking-tight text-primary tabular-nums md:text-6xl">
        {rating?.toLocaleString("tr-TR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
      </span>
      <div className="flex flex-col gap-1">
        {rating != null && <Stars rating={rating} className="flex gap-0.5 [&_svg]:size-5" />}
        {count != null && (
          <span className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">Google&apos;da {count} yorum</span>
        )}
      </div>
    </>
  );

  return (
    <section id="yorumlar" className="relative scroll-mt-16 bg-background md:scroll-mt-18">
      <div aria-hidden className="led-divider" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-honeycomb" />

      <div className="container relative mx-auto px-4 py-16 md:py-24">
        {data?.reviewsTitle && <SectionHeading title={data.reviewsTitle} subtitle={data.reviewsSubtitle} />}

        {showSummary &&
          (mapsUrl ? (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mx-auto mt-8 flex w-fit items-center gap-4 transition-opacity hover:opacity-80 md:mt-12"
            >
              {summary}
            </a>
          ) : (
            <div className="mx-auto mt-8 flex w-fit items-center gap-4 md:mt-12">{summary}</div>
          ))}

        {list.length > 0 && (
          <ul className="mt-10 grid gap-3 md:mt-14 md:grid-cols-3 md:gap-4">
            {list.map((review) => (
              <li key={review._key} className="chamfer flex flex-col border border-border bg-card px-5 py-6 md:px-6 md:py-8">
                <Stars rating={review.rating} className="flex gap-0.5 [&_svg]:size-4" />
                <p className="mt-4 flex-1 text-base text-foreground">{review.text}</p>
                <footer className="mt-6 flex items-baseline justify-between gap-4">
                  <span className="font-display text-sm font-bold uppercase tracking-wide text-foreground">{review.author}</span>
                  {review.date && <span className="text-xs text-muted-foreground">{formatDate(review.date)}</span>}
                </footer>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
