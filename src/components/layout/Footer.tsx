import Link from "next/link";
import { SanityImage } from "@/components/ui/SanityImage";
import { formatOpeningHours } from "@/lib/openingHours";
import { SiteSettings, Navigation } from "@/types";

const SOCIAL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "X",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  tiktok: "TikTok",
  pinterest: "Pinterest",
  whatsapp: "WhatsApp",
};

export function Footer({ settings, navigation }: { settings: SiteSettings; navigation: Navigation }) {
  const links = navigation?.footerLinks ?? [];
  const socials = (settings?.socialLinks ?? []).filter((s) => s.url);
  const contact = settings?.contactInfo;
  const hours = formatOpeningHours(settings?.openingHours);
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-background">
      <div aria-hidden className="led-divider" />

      <div className="container mx-auto px-4 pt-16 pb-8 md:pt-24">
        {/* Wall-lettering tagline: the footer's identity, low contrast by design */}
        {settings?.siteTagline && (
          <p
            aria-hidden
            className="mb-16 font-display text-5xl font-extrabold uppercase leading-[0.9] tracking-tight text-[#2e2e2e] select-none sm:text-7xl md:mb-24 md:text-8xl"
          >
            {settings.siteTagline}
          </p>
        )}

        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_auto] md:gap-8">
          <div className="space-y-4">
            {settings?.logo ? (
              <Link href="/" prefetch={false} aria-label={settings.siteName} className="inline-block">
                <SanityImage image={settings.logo} width={480} height={128} fit="max" sizes="200px" className="h-10 w-auto object-contain object-left" />
              </Link>
            ) : (
              <p className="font-display text-2xl font-extrabold uppercase tracking-tight">{settings?.siteName}</p>
            )}
            <div className="space-y-1 text-sm text-muted-foreground">
              {contact?.address && <p className="whitespace-pre-line">{contact.address}</p>}
              {contact?.phone && (
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="block tabular-nums hover:text-foreground">
                  {contact.phone}
                </a>
              )}
            </div>
          </div>

          {links.length > 0 && (
            <nav aria-label="Footer menü" className="flex flex-col items-start gap-2">
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  target={item.openInNewTab ? "_blank" : undefined}
                  rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                  className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {hours.length > 0 && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm text-muted-foreground tabular-nums">
              {hours.map((h) => (
                <div key={h.label} className="contents">
                  <dt>{h.label}</dt>
                  <dd className="text-foreground">{h.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {socials.length > 0 && (
            <div className="flex flex-col items-start gap-2">
              {socials.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground hover:text-primary"
                >
                  {SOCIAL_LABELS[s.platform] ?? s.platform} ↗
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>© {year} {settings?.siteName}</p>
          {/* Developer credit: intentionally hardcoded, not client-editable. */}
          <p>
            Tasarım ve Geliştirme:{" "}
            <a href="https://yaytechstudio.com/" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
              Yaytech Studio
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
