import { useEffect, useState } from "react";
import { readStorage, writeStorage } from "../lib/storage";

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [stored, setStored] = useState<T>(() => readStorage(key, initialValue));

  useEffect(() => {
    writeStorage(key, stored);
  }, [key, stored]);

  return [stored, setStored];
}
