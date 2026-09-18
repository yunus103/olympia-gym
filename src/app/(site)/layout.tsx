import { getLayoutData } from "@/lib/seo";
import { cachedFetch } from "@/sanity/lib/client";
import { announcementsQuery } from "@/sanity/lib/queries";
import { formatOpeningHours } from "@/lib/openingHours";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Announcement } from "@/types";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [data, announcements] = await Promise.all([
    getLayoutData(),
    cachedFetch<Announcement[]>(announcementsQuery, {}, { next: { tags: ["layout"] } }),
  ]);
  const settings = data?.settings;
  const contact = settings?.contactInfo;
  const hours = formatOpeningHours(settings?.openingHours);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40">
        <Header
          siteName={settings?.siteName}
          logo={settings?.logo}
          links={data?.navigation?.headerLinks}
          whatsappNumber={contact?.whatsappNumber}
          phone={contact?.phone}
          hoursLine={hours.length === 1 ? `${hours[0].label} ${hours[0].value}` : undefined}
        />
      </div>
      <main>{children}</main>
      <AnnouncementBar items={announcements ?? []} />
      {settings && <Footer settings={settings} navigation={data.navigation} />}
      {contact?.whatsappNumber && <WhatsAppButton number={contact.whatsappNumber} />}
    </>
  );
}
