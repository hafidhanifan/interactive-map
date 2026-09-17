import { BottomPanel } from "@/components/layout/BottomPanel";
import { MapShell } from "@/components/layout/MapShell";
import { MapLoader } from "@/components/map/MapLoader";

export default function HomePage() {
  return (
    <MapShell
      overlay={
        <BottomPanel title="Panel filter">
          Daftar kategori akan tampil di sini setelah data tersedia.
        </BottomPanel>
      }
    >
      <MapLoader />
    </MapShell>
  );
}
