"use client";

import { useState } from "react";

type PhotoStripProps = {
  photos: readonly string[];
  alt: string;
};

/**
 * Horizontal strip of photos for one location.
 *
 * Photos are laid out in a scrolling row rather than a fixed grid so
 * portrait and landscape shots can sit side by side without either being
 * cropped. Anything that fails to load is dropped rather than left as a
 * broken image icon, because the geojson lists a path for every photo
 * the form recorded, whether or not the file has been generated yet.
 */
export function PhotoStrip({ photos, alt }: PhotoStripProps) {
  const [broken, setBroken] = useState<readonly string[]>([]);
  const usable = photos.filter((photo) => !broken.includes(photo));

  if (usable.length === 0) {
    return null;
  }

  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {usable.map((photo, index) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={photo}
          src={photo}
          alt={`${alt}, foto ${index + 1}`}
          loading="lazy"
          decoding="async"
          onError={() => setBroken((current) => [...current, photo])}
          className="h-40 w-auto shrink-0 rounded-(--panel-radius) border border-border object-contain"
          style={{ backgroundColor: "var(--surface-muted)" }}
        />
      ))}
    </div>
  );
}
