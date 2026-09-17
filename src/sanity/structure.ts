import { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("İçerik")
    .items([
      S.listItem()
        .title("⚙️ Global Ayarlar")
        .child(
          S.list().title("Global Ayarlar").items([
            S.listItem().title("Site Ayarları").id("siteSettings").schemaType("siteSettings")
              .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
            S.listItem().title("Navigasyon").id("navigation").schemaType("navigation")
              .child(S.document().schemaType("navigation").documentId("navigation")),
          ])
        ),
      S.divider(),
      S.listItem().title("🏠 Ana Sayfa").id("homePage").schemaType("homePage")
        .child(S.document().schemaType("homePage").documentId("homePage")),
      S.divider(),
      S.documentTypeListItem("pricingPlan").title("💰 Fiyat Planları"),
      S.documentTypeListItem("review").title("⭐ Yorumlar"),
      S.documentTypeListItem("faq").title("❓ SSS"),
      S.documentTypeListItem("announcement").title("📢 Duyurular"),
    ]);
