import { ROAD_CONDITIONS } from "@/lib/road-style";

export function RoadLegend() {
  return (
    <div>
      <p className="text-xs font-semibold">Warna jalan</p>

      <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1.5">
        {ROAD_CONDITIONS.map((condition) => (
          <li key={condition.code} className="flex items-center gap-1.5">
            <svg width="28" height="6" aria-hidden="true">
              <line
                x1="0"
                y1="3"
                x2="28"
                y2="3"
                strokeWidth="5"
                strokeDasharray={condition.dashArray ?? undefined}
                style={{ stroke: `var(${condition.colorVariable})` }}
              />
            </svg>
            <span className="text-[11px] text-ink-muted">
              {condition.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
