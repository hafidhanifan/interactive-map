"use client";

import type { UmkmFeature } from "@/types/umkm";
import { DetailRow } from "./DetailRow";
import { PhotoStrip } from "./PhotoStrip";

type UmkmDetailPanelProps = {
  feature: UmkmFeature;
  onClose: () => void;
};

/**
 * Full detail for one business, anchored to the bottom of the screen.
 *
 * Solid background on purpose: a blurred backdrop is expensive to
 * composite and would be repainted while the map moves behind it.
 */
export function UmkmDetailPanel({ feature, onClose }: UmkmDetailPanelProps) {
  const { properties } = feature;

  const address = `Padukuhan ${properties.padukuhan}, RT ${properties.rt} RW ${properties.rw}`;
  const phoneLink = `tel:${properties.phone ?? ""}`;
  const halalText = properties.halalNumber
    ? `Halal (${properties.halalNumber})`
    : "Halal";

  return (
    <section
      className="mx-3 mb-3 max-h-[60dvh] overflow-y-auto rounded-[var(--panel-radius)] border border-border bg-surface p-4"
      style={{ boxShadow: "var(--panel-shadow)" }}
      aria-label="Detail usaha"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold leading-tight">
            {properties.name}
          </h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            {properties.categoryLabel}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup detail"
          className="shrink-0 rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-ink-muted"
        >
          Tutup
        </button>
      </div>

      {properties.photos.length > 0 ? (
        <div className="mt-3">
          <PhotoStrip photos={properties.photos} alt={properties.name} />
        </div>
      ) : null}

      <div className="mt-3 divide-y divide-border">
        <DetailRow label="Alamat">{address}</DetailRow>

        {properties.ownerName ? (
          <DetailRow label="Pemilik">{properties.ownerName}</DetailRow>
        ) : null}

        {properties.products.length > 0 ? (
          <DetailRow label="Produk">{properties.products.join(", ")}</DetailRow>
        ) : null}

        {properties.detail ? (
          <DetailRow label="Keterangan">{properties.detail}</DetailRow>
        ) : null}

        {properties.phone ? (
          <DetailRow label="Telepon">
            <a href={phoneLink} className="font-medium text-brand underline">
              {properties.phone}
            </a>
          </DetailRow>
        ) : null}

        {properties.halalCertified ? (
          <DetailRow label="Sertifikat">{halalText}</DetailRow>
        ) : null}

        {properties.pirtNumber ? (
          <DetailRow label="PIRT">{properties.pirtNumber}</DetailRow>
        ) : null}
      </div>
    </section>
  );
}
