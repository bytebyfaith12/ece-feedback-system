import { CheckCircle2 } from "lucide-react";

export function ThankYouScreen() {
  return (
    <div className="grid min-h-80 place-items-center text-center">
      <div>
        <CheckCircle2 className="mx-auto size-20 text-brand-green" />
        <h2 className="mt-5 font-display text-3xl font-extrabold text-brand-navy">Thank you for your feedback!</h2>
        <p className="mt-2 text-slate-500">Your response helps ECE improve workplace experience.</p>
      </div>
    </div>
  );
}
