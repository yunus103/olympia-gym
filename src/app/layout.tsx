import type { Metadata } from "next";
import { Archivo, Big_Shoulders } from "next/font/google";
import "./globals.css";
import { buildMetadata, getLayoutData } from "@/lib/seo";

import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/components/seo/JsonLd";
import NextTopLoader from "nextjs-toploader";

const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
});

const bigShoulders = Big_Shoulders({
  axes: ["opsz"],
  // next/font has no metric table for this family yet; disable to silence the build warning
  adjustFontFallback: false,
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
});

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata();
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { settings } = await getLayoutData();

  return (
    <html lang="tr" className={`${archivo.variable} ${bigShoulders.variable}`} suppressHydrationWarning>
      <body>
        <noscript>
          <style>{`[data-fade-in]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        {/* Sayfa geçişlerinde üstte ince ilerleme çubuğu — marka rengi kullanır */}
        <NextTopLoader
          color="var(--primary)"
          height={3}
          showSpinner={false}
          shadow={false}
          speed={200}
          crawlSpeed={200}
        />
        {settings?.gtmId && <GoogleTagManager gtmId={settings.gtmId} />}
        {settings?.gaId && <GoogleAnalytics gaId={settings.gaId} />}
        <JsonLd data={organizationJsonLd(settings)} />
        <JsonLd data={websiteJsonLd(settings)} />
        {children}
      </body>
    </html>
  );
}
