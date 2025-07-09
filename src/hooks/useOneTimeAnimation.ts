import { useEffect, useState } from "react";

export const useOneTimeAnimation = (trigger: boolean, duration = 600) => {
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    if (trigger) {
      setShouldAnimate(true);
      const timer = setTimeout(() => setShouldAnimate(false), duration);
      return () => clearTimeout(timer);
    }
  }, [trigger, duration]);

  return shouldAnimate;
};
