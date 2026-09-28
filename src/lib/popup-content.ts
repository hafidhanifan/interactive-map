import type { UmkmProperties } from "@/types/umkm";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildUmkmPopup(properties: UmkmProperties): string {
  const lines: string[] = [
    `<p class="popup-title">${escapeHtml(properties.name)}</p>`,
    `<p class="popup-meta">${escapeHtml(properties.categoryLabel)}</p>`,
    `<p class="popup-meta">Padukuhan ${escapeHtml(properties.padukuhan)}, RT ${escapeHtml(properties.rt)} RW ${escapeHtml(properties.rw)}</p>`,
  ];

  if (properties.products.length > 0) {
    lines.push(
      `<p class="popup-meta">${escapeHtml(properties.products.join(", "))}</p>`,
    );
  }

  return `<div class="popup-body">${lines.join("")}</div>`;
}
