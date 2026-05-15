import { Search } from "lucide-react";
import { mockSites } from "@/data/mockLocations";
import { CustomSelect } from "@/components/ui/CustomSelect";

export function FilterBar({ showSearch = true }: { showSearch?: boolean }) {
  return (
    <div className="mb-6 rounded-2xl border border-cyan-300/15 bg-white/[0.04] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur">
      <div className="grid gap-3 md:grid-cols-5">
        {showSearch ? (
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-cyan-100/45" />
            <input className="h-11 w-full rounded-xl border border-cyan-300/15 bg-white/[0.04] pl-10 pr-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300/45 focus:ring-2 focus:ring-cyan-300/20" placeholder="Search location, ticket, alert..." />
          </div>
        ) : null}
        <CustomSelect value="All Sites" onChange={() => undefined} options={["All Sites", ...mockSites.map((site) => site.name)]} />
        <CustomSelect value="All Categories" onChange={() => undefined} options={["All Categories", "Facilities", "IT", "HR", "Security"]} />
        <CustomSelect value="Last 30 days" onChange={() => undefined} options={["Last 30 days", "Today", "This week", "Last 90 days"]} />
      </div>
    </div>
  );
}
