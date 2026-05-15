import type { Location, SmileyRating } from "@/types/index";
import { SmileyFeedback } from "@/components/ui/SmileyFeedback";

export function QRLandingPage({ location, onSubmit }: { location: Location; onSubmit: (rating: SmileyRating, followUps?: string[], comment?: string) => void }) {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-[420px]">
        <SmileyFeedback autoReset={false} locationName={location.name} buttonMode="4button" onSubmit={onSubmit} showQR={false} />
      </div>
    </main>
  );
}

