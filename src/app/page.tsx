export default function BerandaPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-6 px-5 py-10">
      <div>
        <p className="text-sm font-medium text-brand">Kalurahan Banjaroyo</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          Peta Digital Kalurahan Banjaroyo
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Kerangka proyek berhasil dibuat. Peta akan dipasang pada langkah
          berikutnya.
        </p>
      </div>

      <ul className="flex flex-col gap-2 rounded-(--radius-panel) border border-border bg-surface-muted p-4 text-sm">
        <li>Next.js App Router aktif</li>
        <li>Font Plus Jakarta Sans termuat</li>
        <li>Warna dibaca dari CSS variable</li>
      </ul>

      {/*
        Kotak warna di bawah membaca variable kategori langsung.
        Kalau salah satu kotak tampil abu abu atau hitam,
        berarti ada nama variable yang salah ketik di globals.css.
      */}
      <div className="flex flex-wrap gap-2">
        <span
          className="h-8 w-8 rounded-full"
          style={{ backgroundColor: "var(--kategori-umkm)" }}
        />
        <span
          className="h-8 w-8 rounded-full"
          style={{ backgroundColor: "var(--kategori-fasilitas-umum)" }}
        />
        <span
          className="h-8 w-8 rounded-full"
          style={{ backgroundColor: "var(--kategori-perkebunan)" }}
        />
        <span
          className="h-8 w-8 rounded-full"
          style={{ backgroundColor: "var(--kategori-peternakan)" }}
        />
        <span
          className="h-8 w-8 rounded-full"
          style={{ backgroundColor: "var(--kondisi-rusak-berat)" }}
        />
      </div>
    </main>
  );
}
