import { DataTable } from "@/components/ui/DataTable";
import type { Location } from "@/types/index";

export function LocationManager({ locations }: { locations: Location[] }) {
  return <DataTable headers={["Location", "Site", "Floor", "Category", "Status"]} rows={locations.slice(0, 12).map((location) => [location.name, location.siteName, location.floor, location.category, location.isActive ? "Active" : "Disabled"])} />;
}

