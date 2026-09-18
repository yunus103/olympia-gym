import { groupOpeningHours } from "@/lib/openingHours";
import { SiteSettings } from "@/types";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";

const LABEL = "font-display text-xs font-bold uppercase tracking-wide text-muted-foreground";

export function InfoStrip({ settings }: { settings?: SiteSettings }) {
  const contact = settings?.contactInfo;
  const hours = groupOpeningHours(settings?.openingHours);
  const phone = contact?.phone;
  const whatsapp = contact?.whatsappNumber?.replace(/\D/g, "");

  if (hours.length === 0 && !contact?.address && !phone && !whatsapp) return null;

  return (
    <section aria-label="Çalışma saatleri ve iletişim" className="bg-card">
      <div aria-hidden className="led-divider" />

      <div className="container mx-auto grid divide-y divide-border px-4 md:grid-cols-3 md:divide-x md:divide-y-0">
        {hours.length > 0 && (
          <div className="py-6 md:py-8 md:pr-8">
            <p className={LABEL}>Çalışma Saatleri</p>
            <dl className="mt-3 space-y-1">
              {hours.map((line) => (
                <div key={line.label} className="flex items-baseline justify-between gap-4 font-display text-xl font-extrabold uppercase tracking-tight tabular-nums md:text-2xl">
                  <dt className="text-muted-foreground">{line.label}</dt>
                  <dd className="text-foreground">{line.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {contact?.address && (
          <div className="py-6 md:px-8 md:py-8">
            <p className={LABEL}>Adres</p>
            {contact.mapsUrl ? (
              <a
                href={contact.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block whitespace-pre-line text-base text-foreground transition-colors hover:text-primary md:text-lg"
              >
                {contact.address}
              </a>
            ) : (
              <p className="mt-3 whitespace-pre-line text-base text-foreground md:text-lg">{contact.address}</p>
            )}
          </div>
        )}

        {(phone || whatsapp) && (
          <div className="py-6 md:py-8 md:pl-8">
            <p className={LABEL}>İletişim</p>
            <div className="mt-3 flex flex-col items-start gap-4">
              {phone && (
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="font-display text-xl font-extrabold tracking-tight tabular-nums text-foreground transition-colors hover:text-primary md:text-2xl"
                >
                  {phone}
                </a>
              )}
              {whatsapp && (
                <Button variant="outline" size="sm" render={<a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" />}>
                  <FaWhatsapp data-icon="inline-start" />
                  WhatsApp
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <div aria-hidden className="h-px bg-border" />
    </section>
  );
}
