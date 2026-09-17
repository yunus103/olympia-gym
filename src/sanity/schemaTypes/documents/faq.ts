import { defineField, defineType } from "sanity";

export const faqType = defineType({
  name: "faq",
  title: "Sık Sorulan Soru",
  type: "document",
  fields: [
    defineField({ name: "question", title: "Soru", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "answer", title: "Cevap", type: "text", rows: 4, validation: (Rule) => Rule.required() }),
    defineField({ name: "order", title: "Sıra", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "Sıra", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "question" } },
});
