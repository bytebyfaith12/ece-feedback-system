import { Fragment } from "react";
import type { FeedbackResponse } from "@/types/index";
import { calculateHappinessIndex } from "@/utils/happinessCalculator";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function HourlyHeatmapChart({ feedback }: { feedback: FeedbackResponse[] }) {
  if (!feedback.length) {
    return <div className="grid min-h-[260px] place-items-center rounded-2xl border border-dashed border-cyan-300/20 bg-white/[0.025] text-center text-sm text-slate-500">No feedback submitted yet</div>;
  }
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[920px]">
        <div className="grid grid-cols-[48px_repeat(24,1fr)] gap-1 text-xs">
          <div />
          {Array.from({ length: 24 }).map((_, hour) => <div key={hour} className="text-center text-slate-500">{hour}</div>)}
          {days.map((day, dayIndex) => (
            <Fragment key={day}>
              <div key={`${day}-label`} className="py-2 font-semibold text-slate-400">{day}</div>
              {Array.from({ length: 24 }).map((_, hour) => {
                const rows = feedback.filter((item) => {
                  const date = new Date(item.submittedAt);
                  return date.getDay() === dayIndex && date.getHours() === hour;
                });
                const score = calculateHappinessIndex(rows).score;
                const color = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-green-200" : score >= 40 ? "bg-amber-300" : "bg-red-300";
                return <div key={`${day}-${hour}`} title={`${day} ${hour}:00 · HI ${score}`} className={`h-8 rounded-lg ${rows.length ? color : "bg-white/5"}`} style={{ opacity: rows.length ? 0.35 + score / 170 : 1 }} />;
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

