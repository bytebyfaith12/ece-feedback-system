import type { Ticket, TicketStatus } from "@/types/index";
import { mockLocations } from "@/data/mockLocations";

const statuses: TicketStatus[] = ["new", "assigned", "in-progress", "on-hold", "resolved", "closed", "escalated"];
const priorities: Ticket["priority"][] = ["critical", "high", "medium", "low"];

export const mockTickets: Ticket[] = Array.from({ length: 30 }).map((_, index) => {
  const location = mockLocations[(index * 5) % mockLocations.length];
  const status = statuses[index % statuses.length];
  const createdAt = new Date(Date.now() - (index + 1) * 5 * 3600000).toISOString();
  const slaDeadline = new Date(Date.now() + (index - 8) * 3600000).toISOString();
  return {
    id: `TK-${String(index + 1).padStart(4, "0")}`,
    feedbackId: `FB-${String(index + 1).padStart(5, "0")}`,
    alertId: `ALT-${String(index + 1).padStart(4, "0")}`,
    title: `${location.category} action for ${location.name}`,
    description: `Investigate and close the loop for ${location.name}.`,
    category: location.category,
    priority: priorities[index % priorities.length],
    status,
    locationId: location.id,
    locationName: location.name,
    siteId: location.siteId,
    assignedTo: ["Joshua Apao", "Paul Santos", "Liza Ragusta", "Jessa Romero"][index % 4],
    department: location.category,
    createdAt,
    updatedAt: new Date(Date.now() - index * 45 * 60000).toISOString(),
    slaDeadline,
    slaBreached: new Date(slaDeadline).getTime() < Date.now() && !["resolved", "closed"].includes(status),
    resolvedAt: ["resolved", "closed"].includes(status) ? new Date(Date.now() - index * 20 * 60000).toISOString() : undefined,
    closedAt: status === "closed" ? new Date(Date.now() - index * 10 * 60000).toISOString() : undefined,
    timeToResolve: ["resolved", "closed"].includes(status) ? 28 + index * 7 : undefined,
    notes: [
      { id: `note-${index}-1`, author: "System", content: "Ticket created from feedback alert.", createdAt, isInternal: false },
      { id: `note-${index}-2`, author: "Assigned owner", content: "Initial triage completed.", createdAt: new Date(Date.now() - index * 33 * 60000).toISOString(), isInternal: true },
    ],
  };
});

