import type { KioskDevice } from "@/types/index";
import { mockLocations } from "@/data/mockLocations";

const models: KioskDevice["model"][] = ["Smiley Touch", "QR Terminal", "Tablet", "Smiley Digital"];

export const mockDevices: KioskDevice[] = Array.from({ length: 50 }).map((_, index) => {
  const location = mockLocations[index % mockLocations.length];
  const status: KioskDevice["status"] = index < 3 ? "offline" : index < 5 ? "warning" : "online";
  return {
    id: `KSK-${String(index + 1).padStart(3, "0")}`,
    locationId: location.id,
    locationName: location.name,
    siteId: location.siteId,
    floor: location.floor,
    model: models[index % models.length],
    status,
    batteryLevel: index === 3 ? 18 : 62 + ((index * 7) % 38),
    connectivity: index % 9 === 0 ? "ethernet" : index % 11 === 0 ? "cellular" : "wifi",
    signalStrength: status === "offline" ? 0 : 58 + ((index * 9) % 42),
    lastSyncAt: new Date(Date.now() - (index + 1) * 120000).toISOString(),
    lastFeedbackAt: new Date(Date.now() - (index + 2) * 300000).toISOString(),
    touchscreenHealth: 76 + ((index * 5) % 24),
    uptime: 120 + index * 19,
    firmwareVersion: `2.${index % 5}.${index % 9}`,
    assignedAt: "2026-01-14T08:00:00.000Z",
    ipAddress: `10.44.${Math.floor(index / 10)}.${40 + index}`,
    feedbackToday: (index * 13) % 180,
  };
});

