import type { UmkmCategory } from "@/types/umkm";

/**
 * Padukuhan codes used by the Kobo form, mapped to display names.
 * The form stores p01 to p19; the map has to show real names.
 */
export const PADUKUHAN_LABELS: Record<string, string> = {
  p01: "Banjaran",
  p02: "Slanden",
  p03: "Pantog Kulon",
  p04: "Pantog Wetan",
  p05: "Klangon",
  p06: "Pranan",
  p07: "Potronalan",
  p08: "Beji",
  p09: "Kempong",
  p10: "Tanjung",
  p11: "Duren Sawit",
  p12: "Plengan",
  p13: "Dlingseng",
  p14: "Semawung",
  p15: "Promasan",
  p16: "Semagung",
  p17: "Kajoran",
  p18: "Tonogoro",
  p19: "Puguh",
};

/** Kobo category codes mapped to the slugs used throughout the app. */
export const KOBO_CATEGORY_TO_SLUG: Record<string, UmkmCategory> = {
  toko_kelontong: "toko-kelontong",
  kuliner: "kuliner",
  rumah_produksi: "rumah-produksi",
  jasa: "jasa",
  pengepul: "pengepul-hasil-kebun",
  bengkel: "bengkel",
  konter: "konter",
  lainnya: "lainnya",
};

/**
 * Product and commodity codes mapped to display labels.
 *
 * anyaman and ukiran are leftovers from an earlier version of the form;
 * both are kept so older submissions still resolve.
 */
export const PRODUCT_LABELS: Record<string, string> = {
  gebleg: "Gebleg",
  slondok: "Slondok",
  gula_jawa: "Gula Jawa",
  gula_kristal: "Gula Kristal",
  jenang: "Jenang",
  kripik: "Kripik",
  tempe_tahu: "Tempe / Tahu",
  wajik: "Wajik",
  cokelat: "Cokelat / Kakao Olahan",
  anyaman_bambu: "Anyaman Bambu",
  anyaman: "Anyaman Bambu",
  batik: "Batik",
  gerabah: "Gerabah",
  ukiran_kayu: "Ukiran Kayu",
  ukiran: "Ukiran Kayu",
  durian: "Durian",
  kakao: "Kakao",
  kelapa: "Kelapa",
  lainnya: "Lainnya",
};
