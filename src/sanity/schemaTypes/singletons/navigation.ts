import { defineField, defineType } from "sanity";

const navItemFields = [
  defineField({ name: "label", title: "Etiket", type: "string", validation: (Rule) => Rule.required() }),
  defineField({
    name: "href",
    title: "Link / Path",
    type: "string",
    description: "Bölüm için: #galeri, #fiyatlar gibi. Dış link için: https://google.com",
    validation: (Rule) => Rule.required(),
  }),
  defineField({ name: "openInNewTab", title: "Yeni Sekmede Aç", type: "boolean", initialValue: false }),
  defineField({
    name: "subLinks",
    title: "Alt Linkler",
    type: "array",
    of: [{
      type: "object",
      fields: [
        defineField({ name: "label", title: "Etiket", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "href", title: "Link / Path", type: "string", description: "Örn: /blog/ilk-yazi" }),
        defineField({ name: "openInNewTab", title: "Yeni Sekmede Aç", type: "boolean", initialValue: false }),
      ],
    }],
  }),
];

export const navigationType = defineType({
  name: "navigation",
  title: "Navigasyon",
  type: "document",
  fields: [
    defineField({
      name: "headerLinks",
      title: "Header Menü Linkleri",
      type: "array",
      of: [{ type: "object", name: "navItem", fields: navItemFields, preview: { select: { title: "label", subtitle: "href" } } }],
      initialValue: [
        { _type: "navItem", label: "Galeri", href: "#galeri" },
        { _type: "navItem", label: "Fiyatlar", href: "#fiyatlar" },
        { _type: "navItem", label: "Hakkında", href: "#hakkinda" },
        { _type: "navItem", label: "Yorumlar", href: "#yorumlar" },
        { _type: "navItem", label: "SSS", href: "#sss" },
        { _type: "navItem", label: "Konum", href: "#konum" },
      ],
    }),
    defineField({
      name: "footerLinks",
      title: "Footer Menü Linkleri",
      type: "array",
      of: [{ type: "object", name: "navItem", fields: navItemFields, preview: { select: { title: "label", subtitle: "href" } } }],
      initialValue: [
        { _type: "navItem", label: "Galeri", href: "#galeri" },
        { _type: "navItem", label: "Fiyatlar", href: "#fiyatlar" },
        { _type: "navItem", label: "Hakkında", href: "#hakkinda" },
        { _type: "navItem", label: "Yorumlar", href: "#yorumlar" },
        { _type: "navItem", label: "SSS", href: "#sss" },
        { _type: "navItem", label: "Konum", href: "#konum" },
      ],
    }),
  ],
});
