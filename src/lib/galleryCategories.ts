import { GalleryCategory } from "@/types";

// Shared by the Sanity schema and the gallery filter; kept dependency-free so the client bundle never pulls in `sanity`.
export const GALLERY_CATEGORIES: { title: string; value: GalleryCategory }[] = [
  { title: "Serbest Ağırlık", value: "freeWeights" },
  { title: "Makineler", value: "machines" },
  { title: "Kardiyo", value: "cardio" },
  { title: "Genel", value: "general" },
];
