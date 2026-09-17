import { BottomPanel } from "@/components/layout/BottomPanel";
import { MapPlaceholder } from "@/components/layout/MapPlaceholder";
import { MapShell } from "@/components/layout/MapShell";

export default function HomePage() {
  return (
    <MapShell
      overlay={
        <BottomPanel title="Panel filter">
          Daftar kategori akan tampil di sini setelah data tersedia.
        </BottomPanel>
      }
    >
      <MapPlaceholder />
    </MapShell>
  );
}
