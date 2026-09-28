// import { BottomPanel } from "@/components/layout/BottomPanel";
import { MapShell } from "@/components/layout/MapShell";
import { MapLoader } from "@/components/map/MapLoader";

export default function HomePage() {
  return (
    <MapShell>
      <MapLoader />
    </MapShell>
  );
}
