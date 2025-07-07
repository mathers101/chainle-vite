import type { Guess, SaveData } from "../components/ChainContext";
import { getTodaysDate } from "./time";

export const saveToLocalStorage = (userGuesses: SaveData) => {
  const today = getTodaysDate();
  localStorage.setItem(`chain-${today}`, JSON.stringify(userGuesses));
};

export const fetchFromLocalStorage = (): SaveData | null => {
  const today = getTodaysDate();
  const data = localStorage.getItem(`chain-${today}`);
  if (!data) return null;
  return JSON.parse(data);
};
