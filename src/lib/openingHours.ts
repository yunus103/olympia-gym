import { OpeningHour } from "@/types";

const DAY_LABELS: Record<OpeningHour["day"], string> = {
  monday: "Pazartesi",
  tuesday: "Salı",
  wednesday: "Çarşamba",
  thursday: "Perşembe",
  friday: "Cuma",
  saturday: "Cumartesi",
  sunday: "Pazar",
};

export type OpeningHoursLine = { label: string; value: string };

function formatRange(h: OpeningHour) {
  return h.closed ? "Kapalı" : `${h.open ?? ""} – ${h.close ?? ""}`;
}

/** Collapses to a single "Her gün" line when all seven days share the same hours. */
export function formatOpeningHours(hours?: OpeningHour[]): OpeningHoursLine[] {
  if (!hours || hours.length === 0) return [];

  const first = formatRange(hours[0]);
  const uniform = hours.length === 7 && hours.every((h) => formatRange(h) === first);
  if (uniform) return [{ label: "Her gün", value: first }];

  return hours.map((h) => ({ label: DAY_LABELS[h.day] ?? h.day, value: formatRange(h) }));
}
