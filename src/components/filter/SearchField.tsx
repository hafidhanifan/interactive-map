"use client";

type SearchFieldProps = {
  value: string;
  onChange: (next: string) => void;
};

/** Free text search across name, category, padukuhan and details. */
export function SearchField({ value, onChange }: SearchFieldProps) {
  return (
    <div>
      <label htmlFor="point-search" className="text-xs font-semibold">
        Cari
      </label>
      <input
        id="point-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Nama, pemilik, komoditas"
        className="mt-1.5 w-full rounded-(--panel-radius) border border-border bg-surface-muted px-3 py-2 text-xs outline-none"
      />
    </div>
  );
}
