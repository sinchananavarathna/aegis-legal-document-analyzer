import { useCallback, useRef, useState } from "react";

const COOLDOWN_MS = 10_000;
const MAX_CALLS_PER_MINUTE = 5;

export function useAiCooldown() {
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [rateLimited, setRateLimited] = useState(false);
  const timestamps = useRef<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startCooldown = useCallback(() => {
    const now = Date.now();
    timestamps.current.push(now);
    timestamps.current = timestamps.current.filter((t) => now - t < 60_000);

    if (timestamps.current.length >= MAX_CALLS_PER_MINUTE) {
      setRateLimited(true);
      setTimeout(() => setRateLimited(false), 60_000);
      return;
    }

    setCooldownRemaining(Math.ceil(COOLDOWN_MS / 1000));
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const isDisabled = cooldownRemaining > 0 || rateLimited;

  return { isDisabled, cooldownRemaining, rateLimited, startCooldown };
}
