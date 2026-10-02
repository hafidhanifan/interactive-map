import type { DatasetId } from "../../src/types/dataset.ts";
import type { FieldSpec } from "./field.mts";

/** Marks a choice whose real text comes from a free text column. */
const OTHER = "__other__";

export type DatasetConfig = {
  id: DatasetId;
  /** Also used as the point name where a dataset publishes no name. */
  label: string;
  folder: string;
  photoFields: readonly string[];
  nameColumn?: string;
  ownerColumn?: string;
  /** False for datasets that must not publish RT and RW. */
  includeAddress: boolean;
  subtitle?: FieldSpec;
  facet?: FieldSpec;
  phone?: { column: string; consentColumn: string };
  details: readonly FieldSpec[];
};

const CONDITION_LABELS: Record<string, string> = {
  baik: "Baik",
  rusak_ringan: "Rusak ringan",
  rusak_sedang: "Rusak sedang",
  rusak_berat: "Rusak berat",
  rusak: "Rusak",
  cubluk: "Cubluk",
};

const SALES_CHANNELS: Record<string, string> = {
  pengepul: "Lewat pengepul",
  sendiri_kebun: "Dijual sendiri di kebun",
  sendiri_lokasi: "Dijual sendiri di lokasi",
  sendiri_lain: "Dijual sendiri di tempat lain",
  konsumsi: "Dikonsumsi sendiri",
};

const UMKM_CATEGORIES: Record<string, string> = {
  toko_kelontong: "Toko Kelontong",
  kuliner: "Kuliner",
  rumah_produksi: "Rumah Produksi",
  jasa: "Jasa",
  pengepul: "Pengepul / Penjual Hasil Kebun",
  bengkel: "Bengkel",
  konter: "Konter",
  lainnya: OTHER,
};

const UMKM_PRODUCTS: Record<string, string> = {
  gebleg: "Gebleg",
  slondok: "Slondok",
  gula_jawa: "Gula Jawa",
  gula_kristal: "Gula Kristal",
  jenang: "Jenang",
  kripik: "Kripik",
  tempe_tahu: "Tempe / Tahu",
  wajik: "Wajik",
  cokelat: "Cokelat / Kakao Olahan",
  // anyaman and ukiran are leftovers from an earlier version of the form
  anyaman_bambu: "Anyaman Bambu",
  anyaman: "Anyaman Bambu",
  ukiran_kayu: "Ukiran Kayu",
  ukiran: "Ukiran Kayu",
  batik: "Batik",
  gerabah: "Gerabah",
  durian: "Durian",
  kakao: "Kakao",
  kelapa: "Kelapa",
  lainnya: OTHER,
};

const FASUM_CATEGORIES: Record<string, string> = {
  poskamling: "Poskamling",
  makam: "Makam",
  masjid: "Masjid",
  mushola: "Mushola",
  kapel: "Kapel",
  gereja: "Gereja",
  sekolah: "Sekolah",
  tpa: "TPA / TPQ",
  lapangan: "Lapangan",
  posyandu: "Posyandu",
  pustu: "Puskesmas Pembantu",
  pasar: "Pasar",
  balai: "Balai",
  balai_desa: "Balai Desa",
  balai_padukuhan: "Balai Padukuhan",
  jembatan: "Jembatan",
  lainnya: OTHER,
};

const KEBUN_COMMODITIES: Record<string, string> = {
  durian: "Durian",
  kakao: "Kakao",
  kelapa: "Kelapa",
  lainnya: OTHER,
};

/*
  Facet tables differ from the display tables above in one way: the
  "lainnya" choice keeps its own label instead of being replaced by what
  the surveyor typed.

  Filters need groups that are large and stable. Free text is neither:
  every typed answer becomes its own chip holding a single point, and
  the same answer typed in different letter cases splits into two. The
  typed text is still published in the subtitle and stays searchable, so
  nothing is lost by collapsing it here.
*/
const UMKM_FACET_CATEGORIES: Record<string, string> = {
  ...UMKM_CATEGORIES,
  lainnya: "Lainnya",
};

const FASUM_FACET_CATEGORIES: Record<string, string> = {
  ...FASUM_CATEGORIES,
  lainnya: "Lainnya",
};

const KEBUN_FACET_COMMODITIES: Record<string, string> = {
  ...KEBUN_COMMODITIES,
  lainnya: "Lainnya",
};

const DURIAN_TYPES: Record<string, string> = {
  unggulan: "Unggulan",
  biasa: "Biasa",
};

const FARM_KINDS: Record<string, string> = {
  peternakan: "Peternakan",
  perikanan: "Perikanan",
};

const LIVESTOCK: Record<string, string> = {
  kambing: "Kambing",
  sapi: "Sapi",
  ayam: "Ayam",
  bebek: "Bebek",
  lainnya: OTHER,
};

const FISH: Record<string, string> = {
  lele: "Lele",
  nila: "Nila",
  gurame: "Gurame",
  lainnya: OTHER,
};

/**
 * Range codes from the first version of the plantation and livestock
 * forms, before the kalurahan asked for exact counts.
 *
 * Both spellings are listed because Excel reads "10_25" as the number
 * 1025 and drops the underscore before the converter ever sees it.
 */
const LEGACY_RANGE_LABELS: Record<string, string> = {
  lt10: "Kurang dari 10",
  "10_25": "10 sampai 25",
  "1025": "10 sampai 25",
  "26_50": "26 sampai 50",
  "2650": "26 sampai 50",
  "51_100": "51 sampai 100",
  "51100": "51 sampai 100",
  gt100: "Lebih dari 100",
};

/** Flags a count the surveyor estimated rather than counted. */
const ESTIMATE_PREFIX = {
  column: "sumber_angka",
  equals: "perkiraan",
  prefix: "sekitar ",
} as const;

export const DATASETS: readonly DatasetConfig[] = [
  {
    id: "umkm",
    label: "UMKM",
    folder: "umkm",
    photoFields: ["depan", "samping", "lainnya"],
    nameColumn: "nama_usaha",
    ownerColumn: "nama_pemilik",
    includeAddress: true,
    subtitle: {
      label: "Jenis usaha",
      column: "kategori",
      kind: "choice",
      labels: UMKM_CATEGORIES,
      otherColumn: "kategori_lain",
    },
    facet: {
      label: "Jenis usaha",
      column: "kategori",
      kind: "choice",
      labels: UMKM_FACET_CATEGORIES,
    },
    phone: { column: "no_hp", consentColumn: "hp_tampil" },
    details: [
      {
        label: "Produk",
        column: "produk",
        kind: "multi",
        labels: UMKM_PRODUCTS,
        otherColumn: "produk_lain",
      },
      {
        label: "Komoditas",
        column: "komoditas",
        kind: "multi",
        labels: UMKM_PRODUCTS,
      },
      { label: "Keterangan", column: "detail_usaha" },
      { label: "Nomor PIRT", column: "no_pirt" },
      { label: "Sertifikat halal", column: "no_halal" },
    ],
  },
  {
    id: "fasum",
    label: "Fasilitas Umum",
    folder: "fasum",
    photoFields: ["depan", "samping", "lainnya"],
    nameColumn: "nama_fasilitas",
    includeAddress: true,
    subtitle: {
      label: "Jenis",
      column: "kategori",
      kind: "choice",
      labels: FASUM_CATEGORIES,
      otherColumn: "kategori_lain",
    },
    facet: {
      label: "Jenis",
      column: "kategori",
      kind: "choice",
      labels: FASUM_FACET_CATEGORIES,
    },
    details: [
      {
        label: "Kondisi",
        column: "kondisi",
        kind: "choice",
        labels: CONDITION_LABELS,
      },
      { label: "Keterangan", column: "keterangan" },
    ],
  },
  {
    id: "kebun",
    label: "Perkebunan",
    folder: "kebun",
    photoFields: ["depan", "samping", "lainnya"],
    ownerColumn: "nama_pemilik",
    includeAddress: true,
    subtitle: {
      label: "Komoditas",
      column: "komoditas",
      kind: "multi",
      labels: KEBUN_COMMODITIES,
      otherColumn: "komoditas_lain",
    },
    facet: {
      label: "Komoditas",
      column: "komoditas",
      kind: "multi",
      labels: KEBUN_FACET_COMMODITIES,
    },
    phone: { column: "no_hp", consentColumn: "hp_tampil" },
    details: [
      {
        label: "Jenis durian",
        column: "jenis_durian",
        kind: "multi",
        labels: DURIAN_TYPES,
      },
      /*
        The form switched from ranges to an exact count partway through
        the survey, which renamed the column. Records from before the
        change still carry the old one, so both are read here.
      */
      {
        label: "Jumlah pohon",
        column: "jumlah_pohon_angka",
        suffix: " pohon",
        fallback: {
          column: "jumlah_pohon",
          kind: "choice",
          labels: LEGACY_RANGE_LABELS,
        },
        prefixWhen: ESTIMATE_PREFIX,
      },
      { label: "Hasil panen", column: "hasil_panen" },
      {
        label: "Penjualan",
        column: "penjualan",
        kind: "multi",
        labels: SALES_CHANNELS,
      },
    ],
  },
  {
    id: "ternak",
    label: "Peternakan dan Perikanan",
    folder: "ternak",
    photoFields: ["depan", "samping", "lainnya"],
    ownerColumn: "nama_pemilik",
    includeAddress: true,
    subtitle: {
      label: "Jenis usaha",
      column: "jenis_usaha",
      kind: "choice",
      labels: FARM_KINDS,
    },
    facet: {
      label: "Jenis usaha",
      column: "jenis_usaha",
      kind: "choice",
      labels: FARM_KINDS,
    },
    phone: { column: "no_hp", consentColumn: "hp_tampil" },
    details: [
      {
        label: "Ternak",
        column: "ternak",
        kind: "multi",
        labels: LIVESTOCK,
        otherColumn: "komoditas_lain",
      },
      { label: "Ikan", column: "ikan", kind: "multi", labels: FISH },
      {
        label: "Jumlah",
        column: "jumlah_angka",
        suffix: " ekor",
        fallback: {
          column: "jumlah",
          kind: "choice",
          labels: LEGACY_RANGE_LABELS,
        },
        prefixWhen: ESTIMATE_PREFIX,
      },
      {
        label: "Penjualan",
        column: "penjualan",
        kind: "multi",
        labels: SALES_CHANNELS,
      },
      { label: "Keterangan", column: "keterangan" },
    ],
  },
  /*
    RTLH and jamban publish nothing but location and photos, by decision.
    There is no code here that strips the owner name, phone, condition or
    address: those columns are simply never named, and the engine only
    reads what a config asks for. Forgetting something therefore leaves
    it out rather than letting it through.
  */
  {
    id: "rtlh",
    label: "Rumah Tidak Layak Huni",
    folder: "rtlh",
    photoFields: ["depan", "samping", "lainnya"],
    includeAddress: false,
    details: [],
  },
  {
    id: "jamban",
    label: "Jamban Kurang Memenuhi Standar",
    folder: "jamban",
    photoFields: ["jamban", "lainnya"],
    includeAddress: false,
    details: [],
  },
];
