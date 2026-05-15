import { SmileyFeedback } from "@/components/ui/SmileyFeedback";

export function SurveyBuilder() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
        <h3 className="font-display text-xl font-bold text-brand-navy">Survey Builder</h3>
        <input className="mt-5 h-11 w-full rounded-xl border border-gray-200 px-3 outline-none focus:ring-2 focus:ring-brand-green" defaultValue="How was your experience?" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {["English", "Filipino", "Japanese", "Spanish"].map((lang) => <label key={lang} className="rounded-xl border border-gray-200 p-3 text-sm font-semibold text-slate-600"><input type="checkbox" className="mr-2 accent-brand-green" defaultChecked={lang === "English"} />{lang}</label>)}
        </div>
      </div>
      <SmileyFeedback autoReset={false} buttonMode="4button" locationName="Preview" />
    </div>
  );
}
