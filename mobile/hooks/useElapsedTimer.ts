import { useEffect, useState } from 'react';
import { formatSeconds } from '@/lib/time';

export function useElapsedTimer(startTime?: string | null): string {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!startTime) {
      setSeconds(0);
      return;
    }

    const startMs = new Date(startTime).getTime();
    if (Number.isNaN(startMs)) {
      setSeconds(0);
      return;
    }

    const tick = () => setSeconds(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return formatSeconds(seconds);
}
