"use client";

type SearchFieldProps = {
  value: string;
  onChange: (next: string) => void;
};

// free text search across business name, owner and products
export function SearchField({ value, onChange }: SearchFieldProps) {
  return (
    <div>
      <label htmlFor="umkm-search" className="text-xs font-semibold">
        Cari usaha
      </label>
      <input
        id="umkm-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Nama usaha, pemilik, atau produk"
        className="mt-1.5 w-full rounded-(--panel-radius) border border-border bg-surface-muted px-3 py-2 text-xs outline-none"
      />
    </div>
  );
}
