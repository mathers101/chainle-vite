import type { Guess } from "../components/ChainContext";
import { getTodaysDate } from "./time";

export const saveToLocalStorage = (userGuesses: Guess[]) => {
  const today = getTodaysDate();
  localStorage.setItem(`chain-${today}`, JSON.stringify(userGuesses));
};

export const fetchFromLocalStorage = (): Guess[] | null => {
  const today = getTodaysDate();
  const data = localStorage.getItem(`chain-${today}`);
  if (!data) return [];
  return JSON.parse(data);
};
