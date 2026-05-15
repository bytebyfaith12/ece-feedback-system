import { format } from "date-fns";
import type { Location, SmileyRating } from "@/types/index";
import { SmileyFeedback } from "@/components/ui/SmileyFeedback";

export function KioskTerminal({ location, onSubmit }: { location: Location; onSubmit: (rating: SmileyRating, followUps?: string[], comment?: string) => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#020b12] via-[#061018] to-[#0d1c2d] p-6">
      <div className="w-full max-w-6xl rounded-[2rem] border border-cyan-300/20 bg-white/[0.05] p-8 shadow-[0_30px_120px_rgba(0,242,254,0.16)] backdrop-blur-xl">
        <div className="mb-8 text-center">
          <p className="logo-font text-3xl text-cyan-100">ECE ECHO</p>
          <p className="mt-2 text-lg font-semibold text-slate-300">{location.name} · {location.siteName}</p>
        </div>
        <SmileyFeedback locationId={location.id} locationName={`${location.name} · ${location.floor}`} buttonMode="4button" showFollowUp onSubmit={onSubmit} />
        <p className="mt-8 text-center font-mono text-sm text-slate-400">{format(new Date(), "HH:mm:ss  EEE MMM d, yyyy")}</p>
      </div>
    </div>
  );
}

