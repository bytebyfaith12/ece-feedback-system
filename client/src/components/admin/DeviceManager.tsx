import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { KioskDevice } from "@/types/index";

export function DeviceManager({ devices }: { devices: KioskDevice[] }) {
  return <DataTable headers={["Device", "Location", "Model", "Battery", "Status"]} rows={devices.slice(0, 12).map((device) => [device.id, device.locationName, device.model, `${device.batteryLevel}%`, <StatusBadge value={device.status} />])} />;
}

