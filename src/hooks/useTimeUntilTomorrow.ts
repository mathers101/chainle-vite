import { useEffect, useState } from "react";
import dayjs from "dayjs";

function getTimeUntilTomorrow() {
  const now = dayjs();
  const tomorrow = now.add(1, "day").startOf("day");
  const diff = tomorrow.diff(now);

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
}

export function useTimeUntilTomorrow() {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilTomorrow());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilTomorrow());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}
