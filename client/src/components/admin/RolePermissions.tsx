import { mockUsers } from "@/data/mockUsers";

export function RolePermissions() {
  const roles = Array.from(new Set(mockUsers.map((user) => user.role)));
  const permissions = ["view dashboards", "manage users", "manage devices", "export reports", "configure surveys", "audit logs"];
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-card">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Role</th>{permissions.map((permission) => <th key={permission} className="px-4 py-3">{permission}</th>)}</tr></thead>
        <tbody className="divide-y divide-gray-100">{roles.map((role, row) => <tr key={role}><td className="px-4 py-3 font-semibold text-brand-navy">{role}</td>{permissions.map((permission, col) => <td key={permission} className="px-4 py-3"><input type="checkbox" className="accent-brand-green" defaultChecked={row < 2 || col < 2} /></td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
