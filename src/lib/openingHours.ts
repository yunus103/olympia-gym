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

const DAY_ABBR: Record<OpeningHour["day"], string> = {
  monday: "Pzt",
  tuesday: "Sal",
  wednesday: "Çar",
  thursday: "Per",
  friday: "Cum",
  saturday: "Cmt",
  sunday: "Paz",
};

/** Merges consecutive days with identical hours into ranges ("Pzt – Cum"). Fits the info strip where seven rows won't. */
export function groupOpeningHours(hours?: OpeningHour[]): OpeningHoursLine[] {
  if (!hours || hours.length === 0) return [];

  const first = formatRange(hours[0]);
  if (hours.length === 7 && hours.every((h) => formatRange(h) === first)) return [{ label: "Her gün", value: first }];

  const groups: { from: OpeningHour["day"]; to: OpeningHour["day"]; value: string }[] = [];
  for (const h of hours) {
    const value = formatRange(h);
    const last = groups[groups.length - 1];
    if (last && last.value === value) last.to = h.day;
    else groups.push({ from: h.day, to: h.day, value });
  }

  return groups.map((g) => ({
    label: g.from === g.to ? DAY_ABBR[g.from] : `${DAY_ABBR[g.from]} – ${DAY_ABBR[g.to]}`,
    value: g.value,
  }));
}
