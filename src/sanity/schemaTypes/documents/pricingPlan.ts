import { defineField, defineType } from "sanity";

export const pricingPlanType = defineType({
  name: "pricingPlan",
  title: "Fiyat Planı",
  type: "document",
  fields: [
    defineField({ name: "duration", title: "Süre", type: "string", description: "Örn: 1 Ay, 3 Ay, Yıllık", validation: (Rule) => Rule.required() }),
    defineField({ name: "price", title: "Fiyat (₺)", type: "number", validation: (Rule) => Rule.required().min(0) }),
    defineField({
      name: "oldPrice",
      title: "Eski Fiyat (₺)",
      type: "number",
      description: "Opsiyonel. Kampanya döneminde üstü çizili gösterilir; kampanya bitince boş bırakın.",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({ name: "note", title: "Not", type: "string", description: "Opsiyonel. Örn: Peşin ödeme" }),
    defineField({ name: "order", title: "Sıra", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "Sıra", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "duration", price: "price" },
    prepare: ({ title, price }) => ({ title, subtitle: price != null ? `${price} ₺` : "" }),
  },
});
