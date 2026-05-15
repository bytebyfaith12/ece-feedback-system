import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { User } from "@/types/index";

export function UserTable({ users }: { users: User[] }) {
  return <DataTable headers={["Name", "Email", "Role", "Department", "Status"]} rows={users.map((user) => [user.name, user.email, <StatusBadge value={user.role} />, user.department, user.isActive ? "Active" : "Disabled"])} />;
}

