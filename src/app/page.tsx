import { DISTRICT_NAME, VILLAGE_NAME } from "@/lib/map-config";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-6 px-5 py-10">
      <div>
        <p className="text-sm font-medium text-brand">
          Kalurahan {VILLAGE_NAME}, Kapanewon {DISTRICT_NAME}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          Peta Digital Kalurahan {VILLAGE_NAME}
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Kerangka proyek berhasil dibuat. Peta akan dipasang pada langkah
          berikutnya.
        </p>
      </div>

      <ul className="flex flex-col gap-2 rounded-(--panel-radius) border border-border bg-surface-muted p-4 text-sm">
        <li>Next.js App Router aktif</li>
        <li>Font Plus Jakarta Sans termuat</li>
        <li>Warna dibaca dari CSS variable</li>
        <li>Alias impor @/ berfungsi</li>
      </ul>

      {/*
        These swatches read the category variables directly.
        If one of them renders gray or black, a variable name in
        globals.css is misspelled.
      */}
      <div className="flex flex-wrap gap-2">
        <span
          className="h-8 w-8 rounded-full"
          style={{ backgroundColor: "var(--category-umkm)" }}
        />
        <span
          className="h-8 w-8 rounded-full"
          style={{ backgroundColor: "var(--category-public-facility)" }}
        />
        <span
          className="h-8 w-8 rounded-full"
          style={{ backgroundColor: "var(--category-plantation)" }}
        />
        <span
          className="h-8 w-8 rounded-full"
          style={{ backgroundColor: "var(--category-livestock)" }}
        />
        <span
          className="h-8 w-8 rounded-full"
          style={{ backgroundColor: "var(--condition-rusak-berat)" }}
        />
      </div>
    </main>
  );
}
