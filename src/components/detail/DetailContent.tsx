"use client";

import { getDataset } from "@/lib/datasets";
import type { MapPoint } from "@/types/dataset";
import { DetailRow } from "./DetailRow";
import { PhotoStrip } from "./PhotoStrip";

type DetailContentProps = {
  feature: MapPoint;
  onClose: () => void;
};

/**
 * Everything inside the detail panel, for any category.
 *
 * The rows come from the published data rather than from code here, so a
 * new category needs no component of its own.
 */
export function DetailContent({ feature, onClose }: DetailContentProps) {
  const { properties } = feature;
  const info = getDataset(properties.dataset);
  const phoneLink = `tel:${properties.phone ?? ""}`;

  return (
    <>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <span
            className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{
              backgroundColor: `var(${info.colorVariable})`,
              color: "var(--surface)",
            }}
          >
            {info.shortLabel}
          </span>

          <h2 className="mt-1.5 text-base font-bold leading-tight">
            {properties.name}
          </h2>

          {properties.subtitle ? (
            <p className="mt-0.5 text-xs text-ink-muted">
              {properties.subtitle}
            </p>
          ) : null}
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
        {properties.address ? (
          <DetailRow label="Alamat">{properties.address}</DetailRow>
        ) : properties.padukuhan ? (
          <DetailRow label="Padukuhan">{properties.padukuhan}</DetailRow>
        ) : null}

        {properties.details.map((item) => (
          <DetailRow key={item.label} label={item.label}>
            {item.value}
          </DetailRow>
        ))}

        {properties.phone ? (
          <DetailRow label="Telepon">
            <a href={phoneLink} className="font-medium text-brand underline">
              {properties.phone}
            </a>
          </DetailRow>
        ) : null}
      </div>
    </>
  );
}
