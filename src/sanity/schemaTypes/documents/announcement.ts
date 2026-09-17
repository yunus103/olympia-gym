import { defineField, defineType } from "sanity";

export const announcementType = defineType({
  name: "announcement",
  title: "Duyuru",
  type: "document",
  fields: [
    defineField({ name: "text", title: "Metin", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "link", title: "Link", type: "url", description: "Opsiyonel", validation: (Rule) => Rule.uri({ allowRelative: true }) }),
    defineField({ name: "startsAt", title: "Başlangıç", type: "datetime", description: "Boşsa hemen aktif" }),
    defineField({ name: "endsAt", title: "Bitiş", type: "datetime", description: "Boşsa süresiz" }),
  ],
  preview: { select: { title: "text", subtitle: "endsAt" } },
});
