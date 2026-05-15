import type { Alert } from "@/types/index";
import { mockLocations } from "@/data/mockLocations";

const types: Alert["type"][] = ["low-satisfaction", "consecutive-negative", "device-offline", "sla-breach", "high-volume-complaints", "no-response", "device-battery", "internet-outage", "satisfaction-drop"];
const priorities: Alert["priority"][] = ["critical", "high", "medium", "low"];
const statuses: Alert["status"][] = ["new", "acknowledged", "in-progress", "resolved", "dismissed"];

export const mockAlerts: Alert[] = Array.from({ length: 35 }).map((_, index) => {
  const location = mockLocations[(index * 3) % mockLocations.length];
  const priority = priorities[index % priorities.length];
  return {
    id: `ALT-${String(index + 1).padStart(4, "0")}`,
    type: types[index % types.length],
    priority,
    title: priority === "critical" ? "Consecutive very unhappy responses" : priority === "high" ? "Happiness Index dropped below threshold" : "Operational feedback needs review",
    description: `${location.name} generated a ${priority} feedback signal for ${location.category}.`,
    locationId: location.id,
    locationName: location.name,
    siteId: location.siteId,
    deviceId: `KSK-${String((index % 50) + 1).padStart(3, "0")}`,
    ticketId: index % 2 === 0 ? `TK-${String(index + 1).padStart(4, "0")}` : undefined,
    status: statuses[index % statuses.length],
    triggeredAt: new Date(Date.now() - index * 48 * 60000).toISOString(),
    assignedTo: ["Joshua Apao", "Paul Santos", "Maria Lopez", "Ana Reyes"][index % 4],
    triggerValue: 44 + (index % 25),
    thresholdValue: 60,
    autoCreatedTicket: index % 2 === 0,
  };
});

