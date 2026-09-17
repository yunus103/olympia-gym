import { defineField, defineType } from "sanity";

export const reviewType = defineType({
  name: "review",
  title: "Yorum",
  type: "document",
  fields: [
    defineField({ name: "author", title: "Yazar", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "rating", title: "Puan", type: "number", initialValue: 5, validation: (Rule) => Rule.required().min(1).max(5).integer() }),
    defineField({ name: "text", title: "Yorum", type: "text", rows: 4, validation: (Rule) => Rule.required() }),
    defineField({ name: "date", title: "Tarih", type: "date" }),
    defineField({ name: "order", title: "Sıra", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "Sıra", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "author", subtitle: "text" } },
});
