import type { ChainState } from "../components/ChainContext";
import { getTodaysDate } from "./time";

export const saveToLocalStorage = (chainState: ChainState) => {
  const today = getTodaysDate();
  localStorage.setItem(`chain-${today}`, JSON.stringify(chainState));
};

export const fetchFromLocalStorage = (): ChainState | null => {
  const today = getTodaysDate();
  const data = localStorage.getItem(`chain-${today}`);
  if (!data) return null;
  return JSON.parse(data);
};
