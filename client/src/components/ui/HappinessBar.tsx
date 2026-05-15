import type { HappinessIndex } from "@/types/index";

export function HappinessBar({ index }: { index: HappinessIndex }) {
  const items = [
    { label: "Very Happy", value: index.veryHappyPct, color: "bg-smiley-very-happy" },
    { label: "Happy", value: index.happyPct, color: "bg-smiley-happy" },
    { label: "Neutral", value: index.neutralPct ?? 0, color: "bg-smiley-neutral" },
    { label: "Unhappy", value: index.unhappyPct, color: "bg-smiley-unhappy" },
    { label: "Very Unhappy", value: index.veryUnhappyPct, color: "bg-smiley-very-unhappy" },
  ];
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-white/10">
        {items.map((item) => <div key={item.label} className={item.color} style={{ width: `${item.value}%` }} title={`${item.label}: ${item.value}%`} />)}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400 md:grid-cols-5">
        {items.map((item) => <span key={item.label}><span className={`mr-1 inline-block size-2 rounded-full ${item.color}`} />{item.label} {item.value}%</span>)}
      </div>
    </div>
  );
}

