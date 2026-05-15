import { useMeta } from "@/hooks/useMeta";
import { Field, SelectInput, TextInput } from "@/components/ui/FormField";

export interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  site: string;
  floor: string;
  account: string;
  category: string;
}

export function FilterBar({ filters, onChange }: { filters: ReportFilters; onChange: (filters: ReportFilters) => void }) {
  const meta = useMeta();
  const site = meta?.sites.find((item) => item.name === filters.site);
  const floors = site?.floors ?? [];
  const floor = floors.find((item) => item.name === filters.floor);
  const accounts = floor?.accounts ?? meta?.accounts ?? [];

  const update = (key: keyof ReportFilters, value: string) => onChange({ ...filters, [key]: value });

  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Field label="From"><TextInput type="date" value={filters.dateFrom} onChange={(e) => update("dateFrom", e.target.value)} /></Field>
        <Field label="To"><TextInput type="date" value={filters.dateTo} onChange={(e) => update("dateTo", e.target.value)} /></Field>
        <Field label="Site">
          <SelectInput value={filters.site} onChange={(e) => onChange({ ...filters, site: e.target.value, floor: "", account: "" })}>
            <option value="">All sites</option>
            {meta?.sites.map((item) => <option key={item.name}>{item.name}</option>)}
          </SelectInput>
        </Field>
        <Field label="Floor">
          <SelectInput value={filters.floor} onChange={(e) => onChange({ ...filters, floor: e.target.value, account: "" })}>
            <option value="">All floors</option>
            {floors.map((item) => <option key={item.name}>{item.name}</option>)}
          </SelectInput>
        </Field>
        <Field label="Account">
          <SelectInput value={filters.account} onChange={(e) => update("account", e.target.value)}>
            <option value="">All accounts</option>
            {accounts.map((item) => <option key={item}>{item}</option>)}
          </SelectInput>
        </Field>
        <Field label="Category">
          <SelectInput value={filters.category} onChange={(e) => update("category", e.target.value)}>
            <option value="">All categories</option>
            {meta?.feedbackCategories.map((item) => <option key={item}>{item}</option>)}
          </SelectInput>
        </Field>
      </div>
    </section>
  );
}
