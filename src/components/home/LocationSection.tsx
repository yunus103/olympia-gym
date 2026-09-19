import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { HomePage, SiteSettings } from "@/types";

const LABEL = "font-display text-xs font-bold uppercase tracking-wide text-muted-foreground";
const LINK = "font-display text-xl font-extrabold tracking-tight text-foreground transition-colors hover:text-primary md:text-2xl";

export function LocationSection({ data, settings }: { data: HomePage | null; settings?: SiteSettings }) {
  const contact = settings?.contactInfo;
  const instagram = settings?.socialLinks?.find((s) => s.platform === "instagram" && s.url);
  const whatsapp = contact?.whatsappNumber?.replace(/\D/g, "");

  if (!contact?.address && !contact?.mapIframe) return null;

  return (
    <section id="konum" className="scroll-mt-16 bg-background md:scroll-mt-18">
      <div aria-hidden className="led-divider" />

      <div className="container mx-auto grid gap-10 px-4 py-16 md:grid-cols-[1fr_1.4fr] md:gap-16 md:py-24">
        <div className="flex flex-col">
          {data?.locationTitle && (
            <h2 className="font-display text-4xl font-extrabold uppercase leading-[0.9] tracking-tight text-foreground md:text-6xl">
              {data.locationTitle}
            </h2>
          )}
          {data?.locationSubtitle && <p className="mt-4 text-base text-muted-foreground md:text-lg">{data.locationSubtitle}</p>}

          {contact?.address && (
            <div className="mt-8 md:mt-10">
              <p className={LABEL}>Adres</p>
              <p className="mt-2 whitespace-pre-line text-base text-foreground md:text-lg">{contact.address}</p>
            </div>
          )}

          {(contact?.phone || whatsapp || instagram) && (
            <div className="mt-8">
              <p className={LABEL}>İletişim</p>
              <div className="mt-2 flex flex-col items-start gap-2">
                {contact?.phone && (
                  <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className={`${LINK} tabular-nums`}>
                    {contact.phone}
                  </a>
                )}
                {whatsapp && (
                  <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className={`${LINK} inline-flex items-center gap-2`}>
                    <FaWhatsapp className="size-5" /> WhatsApp
                  </a>
                )}
                {instagram && (
                  <a href={instagram.url} target="_blank" rel="noopener noreferrer" className={`${LINK} inline-flex items-center gap-2`}>
                    <FaInstagram className="size-5" /> Instagram
                  </a>
                )}
              </div>
            </div>
          )}

          {contact?.mapsUrl && data?.locationCtaLabel && (
            <div className="mt-10">
              <Button variant="outline" size="lg" render={<a href={contact.mapsUrl} target="_blank" rel="noopener noreferrer" />}>
                {data.locationCtaLabel}
              </Button>
            </div>
          )}
        </div>

        {contact?.mapIframe && (
          <div
            className="chamfer aspect-[4/3] overflow-hidden bg-card md:aspect-[16/10] [&_iframe]:size-full [&_iframe]:border-0"
            dangerouslySetInnerHTML={{ __html: contact.mapIframe }}
          />
        )}
      </div>
    </section>
  );
}
