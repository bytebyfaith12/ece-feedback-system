import { useEffect } from "react";
import { useFeedbackStore } from "@/store/useFeedbackStore";

export function useRealTimeData(enabled = true) {
  const addGeneratedFeedback = useFeedbackStore((state) => state.addGeneratedFeedback);

  useEffect(() => {
    if (!enabled) return undefined;
    const schedule = () => 4000 + Math.floor(Math.random() * 4000);
    let timer: number;
    const tick = () => {
      addGeneratedFeedback();
      timer = window.setTimeout(tick, schedule());
    };
    timer = window.setTimeout(tick, schedule());
    return () => window.clearTimeout(timer);
  }, [addGeneratedFeedback, enabled]);
}
