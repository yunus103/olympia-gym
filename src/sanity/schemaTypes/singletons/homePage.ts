import { defineField, defineType } from "sanity";

const GALLERY_CATEGORIES = [
  { title: "Serbest Ağırlık", value: "freeWeights" },
  { title: "Makineler", value: "machines" },
  { title: "Kardiyo", value: "cardio" },
  { title: "Genel", value: "general" },
];

export const homePageType = defineType({
  name: "homePage",
  title: "Ana Sayfa",
  type: "document",
  groups: [
    { name: "hero", title: "Hero" },
    { name: "gallery", title: "Galeri" },
    { name: "pricing", title: "Fiyatlar" },
    { name: "about", title: "Hakkında" },
    { name: "reviews", title: "Yorumlar" },
    { name: "faq", title: "SSS" },
    { name: "location", title: "Konum" },
    { name: "seo", title: "SEO Ayarları" },
  ],
  fields: [
    // Hero — only the text layer lives here; scene, exercise buttons and camera are hardcoded (see docs/design-language.md)
    defineField({
      name: "heroTitle",
      title: "Başlık (H1)",
      type: "string",
      group: "hero",
      initialValue: "Seni en iyi versiyonuna hazırlıyorum",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroPrimaryCta",
      title: "Ana Buton",
      type: "object",
      group: "hero",
      fields: [
        defineField({ name: "label", title: "Metin", type: "string" }),
        defineField({ name: "href", title: "Link", type: "string" }),
      ],
      initialValue: { label: "Fiyatları Gör", href: "#fiyatlar" },
    }),
    defineField({ name: "heroWhatsappLabel", title: "WhatsApp Buton Metni", type: "string", group: "hero", initialValue: "WhatsApp" }),

    // Gallery
    defineField({ name: "galleryTitle", title: "Başlık", type: "string", group: "gallery", initialValue: "Salon" }),
    defineField({ name: "gallerySubtitle", title: "Alt Başlık", type: "text", rows: 2, group: "gallery", initialValue: "Ekipman ve salonumuzdan kareler." }),
    defineField({
      name: "galleryItems",
      title: "Fotoğraflar",
      type: "array",
      group: "gallery",
      of: [
        {
          type: "object",
          name: "galleryItem",
          fields: [
            defineField({
              name: "image",
              title: "Fotoğraf",
              type: "image",
              options: { hotspot: true },
              fields: [defineField({ name: "alt", title: "Alt Metni", type: "string" })],
              validation: (Rule) => Rule.required(),
            }),
            defineField({ name: "title", title: "Başlık", type: "string", description: "Örn: Functional trainer" }),
            defineField({
              name: "category",
              title: "Kategori",
              type: "string",
              options: { list: GALLERY_CATEGORIES, layout: "radio" },
              initialValue: "general",
            }),
          ],
          preview: { select: { title: "title", subtitle: "category", media: "image" } },
        },
      ],
    }),

    // Pricing
    defineField({ name: "pricingTitle", title: "Başlık", type: "string", group: "pricing", initialValue: "Üyelik Fiyatları" }),
    defineField({ name: "pricingSubtitle", title: "Alt Başlık", type: "text", rows: 2, group: "pricing", initialValue: "Paket yok, sürpriz yok. Süreyi seç, başla." }),
    defineField({ name: "pricingCtaLabel", title: "Buton Metni", type: "string", group: "pricing", initialValue: "Kayıt için WhatsApp" }),
    defineField({ name: "pricingPtNote", title: "Özel Ders Notu", type: "string", group: "pricing", initialValue: "Birebir özel ders için iletişime geç" }),

    // About
    defineField({ name: "aboutTitle", title: "Başlık", type: "string", group: "about", initialValue: "Hakkında" }),
    defineField({
      name: "aboutBody",
      title: "Metin",
      type: "array",
      group: "about",
      of: [{ type: "block" }],
      initialValue: [
        {
          _type: "block",
          style: "normal",
          markDefs: [],
          children: [
            {
              _type: "span",
              marks: [],
              text: "Olympia Gym, gösteriş değil antrenman için kurulmuş bir salon. Serbest ağırlık, makineler ve kardiyo alanı; her gün geç saate kadar açık.",
            },
          ],
        },
      ],
    }),
    defineField({
      name: "aboutImage",
      title: "Görsel",
      type: "image",
      group: "about",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt Metni", type: "string" })],
    }),

    // Reviews
    defineField({ name: "reviewsTitle", title: "Başlık", type: "string", group: "reviews", initialValue: "Üyelerimiz Ne Diyor" }),
    defineField({ name: "reviewsSubtitle", title: "Alt Başlık", type: "text", rows: 2, group: "reviews", initialValue: "Google üzerindeki yorumlardan seçmeler." }),

    // FAQ
    defineField({ name: "faqTitle", title: "Başlık", type: "string", group: "faq", initialValue: "Sık Sorulan Sorular" }),
    defineField({ name: "faqSubtitle", title: "Alt Başlık", type: "text", rows: 2, group: "faq" }),

    // Location
    defineField({ name: "locationTitle", title: "Başlık", type: "string", group: "location", initialValue: "Bizi Bul" }),

    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Ana Sayfa" }) },
});
