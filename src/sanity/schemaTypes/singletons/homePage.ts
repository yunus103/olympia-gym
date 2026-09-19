import { defineField, defineType } from "sanity";
import { GALLERY_CATEGORIES } from "@/lib/galleryCategories";

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

    // Gallery
    defineField({ name: "galleryTitle", title: "Başlık", type: "string", group: "gallery", initialValue: "Salon" }),
    defineField({ name: "gallerySubtitle", title: "Alt Başlık", type: "text", rows: 2, group: "gallery", initialValue: "Ekipman ve salonumuzdan kareler." }),
    defineField({
      name: "galleryItems",
      title: "Fotoğraflar",
      type: "array",
      group: "gallery",
      description: "Birden fazla fotoğrafı sürükleyip bırakarak toplu yükleyebilirsiniz. Başlık ve kategori her fotoğrafa tıklanarak girilir.",
      // Plain `image` items (not objects) so Studio supports drag-and-drop bulk upload; metadata lives in the image's own fields.
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({ name: "title", title: "Başlık", type: "string", description: "Örn: Functional trainer" }),
            defineField({
              name: "category",
              title: "Kategori",
              type: "string",
              options: { list: GALLERY_CATEGORIES, layout: "radio" },
              initialValue: "general",
            }),
            defineField({ name: "alt", title: "Alt Metni", type: "string" }),
          ],
          preview: {
            select: { title: "title", category: "category", media: "asset" },
            prepare: ({ title, category, media }) => ({
              title: title || "Başlıksız",
              subtitle: GALLERY_CATEGORIES.find((c) => c.value === category)?.title,
              media,
            }),
          },
        },
      ],
    }),

    // Pricing
    defineField({ name: "pricingTitle", title: "Başlık", type: "string", group: "pricing", initialValue: "Üyelik Fiyatları" }),
    defineField({ name: "pricingSubtitle", title: "Alt Başlık", type: "text", rows: 2, group: "pricing", initialValue: "Paket yok, sürpriz yok. Süreyi seç, başla." }),
    defineField({ name: "pricingPtTitle", title: "Özel Ders — Başlık", type: "string", group: "pricing", initialValue: "Birebir Özel Ders" }),
    defineField({
      name: "pricingPtText",
      title: "Özel Ders — Açıklama",
      type: "text",
      rows: 2,
      group: "pricing",
      initialValue: "Kendine özel program, tam motivasyon ve %100 ilgi ile hedefine çok daha hızlı ulaş.",
    }),
    defineField({
      name: "pricingPtItems",
      title: "Özel Ders — Avantajlar",
      type: "array",
      group: "pricing",
      of: [
        {
          type: "object",
          name: "ptItem",
          fields: [
            defineField({ name: "title", title: "Başlık", type: "string", validation: (Rule) => Rule.required() }),
            defineField({ name: "text", title: "Açıklama", type: "string" }),
          ],
          preview: { select: { title: "title", subtitle: "text" } },
        },
      ],
      initialValue: [
        { _type: "ptItem", title: "Kişiye özel program", text: "Hedeflerine uygun antrenman ve beslenme planı" },
        { _type: "ptItem", title: "Daha hızlı sonuç", text: "Doğru teknik ve program ile maksimum verim" },
        { _type: "ptItem", title: "Motivasyon ve destek", text: "Antrenörün her adımda yanında" },
        { _type: "ptItem", title: "Doğru teknik, güvenli antrenman", text: "Sakatlık riskini azaltır, performansı artırır" },
        { _type: "ptItem", title: "Zamanını verimli kullan", text: "Kısa sürede daha etkili antrenman" },
        { _type: "ptItem", title: "Her seviyeye uygun", text: "Yeni başlayandan ileri seviyeye, program sana göre kurulur" },
      ],
    }),
    defineField({
      name: "pricingPtCtaLabel",
      title: "Özel Ders — Link Metni",
      type: "string",
      group: "pricing",
      initialValue: "Fiyat ve program için iletişime geç",
    }),

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
    defineField({
      name: "reviews",
      title: "Yorumlar",
      type: "array",
      group: "reviews",
      description: "Google'dan elle seçilen 3 veya 6 yorum. Sürükleyerek sıralayın.",
      of: [
        {
          type: "object",
          name: "review",
          fields: [
            defineField({ name: "author", title: "Yazar", type: "string", validation: (Rule) => Rule.required() }),
            defineField({ name: "rating", title: "Puan", type: "number", initialValue: 5, validation: (Rule) => Rule.required().min(1).max(5).integer() }),
            defineField({ name: "text", title: "Yorum", type: "text", rows: 4, validation: (Rule) => Rule.required() }),
            defineField({ name: "date", title: "Tarih", type: "date" }),
          ],
          preview: { select: { title: "author", subtitle: "text" } },
        },
      ],
    }),

    // FAQ
    defineField({ name: "faqTitle", title: "Başlık", type: "string", group: "faq", initialValue: "Sık Sorulan Sorular" }),
    defineField({ name: "faqSubtitle", title: "Alt Başlık", type: "text", rows: 2, group: "faq" }),
    defineField({
      name: "faqs",
      title: "Sorular",
      type: "array",
      group: "faq",
      of: [
        {
          type: "object",
          name: "faq",
          fields: [
            defineField({ name: "question", title: "Soru", type: "string", validation: (Rule) => Rule.required() }),
            defineField({ name: "answer", title: "Cevap", type: "text", rows: 4, validation: (Rule) => Rule.required() }),
          ],
          preview: { select: { title: "question" } },
        },
      ],
      initialValue: [
        { _type: "faq", question: "Üyelik için ne gerekiyor?", answer: "Kimlik ve ilk ay ücreti yeterli. Kayıt salonda birkaç dakika sürer." },
        { _type: "faq", question: "Deneme antrenmanı yapabilir miyim?", answer: "Evet. Gelmeden önce WhatsApp'tan haber verirseniz uygun bir saat ayarlarız." },
        { _type: "faq", question: "Üyeliği dondurabilir miyim?", answer: "Sağlık veya seyahat gibi durumlarda üyeliğinizi belirli bir süre dondurabilirsiniz; detaylar için bize ulaşın." },
        { _type: "faq", question: "Otopark var mı?", answer: "Plazanın önünde ücretsiz park alanı bulunuyor." },
      ],
    }),

    // Location
    defineField({ name: "locationTitle", title: "Başlık", type: "string", group: "location", initialValue: "Bizi Bul" }),
    defineField({ name: "locationSubtitle", title: "Alt Başlık", type: "text", rows: 2, group: "location" }),
    defineField({ name: "locationCtaLabel", title: "Yol Tarifi Buton Metni", type: "string", group: "location", initialValue: "Yol Tarifi Al" }),

    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Ana Sayfa" }) },
});
