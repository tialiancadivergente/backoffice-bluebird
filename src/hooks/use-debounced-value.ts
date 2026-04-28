import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delayMs = 500) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timeoutId = globalThis.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      globalThis.clearTimeout(timeoutId);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
