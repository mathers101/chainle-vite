import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type PropsWithChildren } from "react";
import { saveToLocalStorage } from "../lib/localStorage";

type Status = "loading" | "initial" | "correct" | "incorrect" | "guessing" | "winner" | "loser";

const MAX_INCORRECT_GUESSES = 6;

interface ChainContextData {
  correctChain: string[];
  currentChain: string[];
  status: Status;
  selectedIndex: number | null;
  currentGuess: string;
  topIndex: number;
  bottomIndex: number;
  solvedByIndex: boolean[];
  mistakesByIndex: number[];
  mistakesRemaining: number;
}

interface ChainContextApi {
  setGuess: (guess: string) => void;
  setSelectedIndex: (index: number) => void;
  confirmGuess: () => void;
  resetGame: () => void;
}

export type Guess = {
  index: number;
  word: string;
};

export interface ChainState {
  userGuesses: Guess[];
  status: Status;
  selectedIndex: number | null;
  currentGuess: string;
}

interface ChainAction {
  type: string;
  payload?: any;
}

const ChainDataContext = createContext<ChainContextData | null>(null);
const ChainApiContext = createContext<ChainContextApi | null>(null);

interface ChainProviderProps {
  correctChain: string[];
  savedGuesses: Guess[] | null;
}

const defaultInitialState: ChainState = {
  userGuesses: [],
  status: "initial",
  selectedIndex: null,
  currentGuess: "",
};

export function ChainProvider({ children, correctChain, savedGuesses }: PropsWithChildren<ChainProviderProps>) {
  const latestGuess = savedGuesses?.at(-1);
  const initialState = {
    userGuesses: savedGuesses ?? [],
    status: (latestGuess
      ? latestGuess.word === correctChain[latestGuess.index]
        ? "correct"
        : "incorrect"
      : "initial") as Status,
    selectedIndex: null,
    currentGuess: "",
  };
  function reducer(state: ChainState, action: ChainAction): ChainState {
    switch (action.type) {
      case "setGuess": {
        return { ...state, currentGuess: action.payload };
      }
      case "confirmGuess": {
        const { selectedIndex, currentGuess } = state;
        if (!selectedIndex) {
          throw new Error("No index selected for confirmation");
        }
        const correctAnswer = correctChain[selectedIndex].trim().toLowerCase();
        const guess = currentGuess.trim().toLowerCase();
        const isCorrect = guess === correctAnswer;
        if (isCorrect) {
          return {
            ...state,
            status: "correct",
            userGuesses: [...state.userGuesses, { index: selectedIndex, word: correctAnswer }],
            currentGuess: "",
          };
        } else {
          return {
            ...state,
            status: "incorrect",
            userGuesses: [...state.userGuesses, { index: selectedIndex, word: guess }],
            // incorrectGuesses: incorrectGuesses.map((count, index) => (index === selectedIndex ? count + 1 : count)),
            currentGuess: "",
          };
        }
      }
      case "setSelectedIndex": {
        const { currentChain, index } = action.payload;
        const currentlyRevealed = currentChain[index] || "";
        return {
          ...state,
          selectedIndex: index,
          currentGuess: state.selectedIndex === index ? state.currentGuess : currentlyRevealed,
          status: "guessing",
        };
      }
      case "setWinner": {
        return { ...state, status: "winner" };
      }
      case "setLoser": {
        return { ...state, status: "loser" };
      }
      case "resetGame": {
        return defaultInitialState;
      }
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  const [{ userGuesses, status, selectedIndex, currentGuess }, dispatch] = useReducer(reducer, initialState);

  const guessesByIndex: string[][] = correctChain.map(() => []);
  const mistakesByIndex: number[] = correctChain.map(() => 0);
  const solvedByIndex: boolean[] = correctChain.map((_, index) => index === 0 || index === correctChain.length - 1);

  userGuesses.forEach((guess) => {
    if (guess.index === 0 || guess.index === correctChain.length - 1) {
      solvedByIndex[guess.index] = true;
    }
    guessesByIndex[guess.index].push(guess.word);
    if (guess.word === correctChain[guess.index]) {
      solvedByIndex[guess.index] = true;
    } else {
      mistakesByIndex[guess.index] += 1;
    }
  });

  const currentChain = correctChain.map((correctWord, index) => {
    if (solvedByIndex[index]) {
      return correctWord;
    }
    return correctWord.slice(0, guessesByIndex[index].length + 1);
  });

  // const [{ currentChain, status, selectedIndex, currentGuess, incorrectGuesses }, dispatch] = useReducer(
  //   reducer,
  //   initialState ?? defaultInitialState
  // );
  const chainLength = correctChain.length;

  const numMistakes = mistakesByIndex.reduce((acc, count) => acc + count, 0);
  const mistakesRemaining = MAX_INCORRECT_GUESSES - numMistakes;

  useEffect(() => {
    // save progress to local state
    saveToLocalStorage(userGuesses);

    // if out of guesses, set the player as a loser
    if (mistakesRemaining === 0) {
      dispatch({ type: "setLoser" });
      return;
    }
    // topIndex === -1 is our sign that the player has won, it means that currentChain and correctChain are identical
    if (solvedByIndex.every((solved) => solved)) {
      dispatch({ type: "setWinner" });
      return;
    }
  }, [userGuesses.length]);

  const topIndex = solvedByIndex.findIndex((val) => !val);
  const bottomIndex = solvedByIndex.lastIndexOf(false);
  chainLength - currentChain.findIndex((_, i) => currentChain[chainLength - i] !== correctChain[chainLength - i]);

  const confirmGuess = useCallback(() => {
    dispatch({ type: "confirmGuess" });
  }, []);

  const setGuess = useCallback((guess: string) => {
    dispatch({ type: "setGuess", payload: guess });
  }, []);

  const setSelectedIndex = useCallback(
    (index: number) => {
      dispatch({ type: "setSelectedIndex", payload: { currentChain, index } });
    },
    [currentChain]
  );

  const resetGame = useCallback(() => dispatch({ type: "resetGame" }), []);

  const data = useMemo(
    () => ({
      correctChain,
      currentChain,
      currentGuess,
      status,
      selectedIndex,
      topIndex,
      solvedByIndex,
      bottomIndex,
      mistakesRemaining,
      mistakesByIndex,
    }),
    [
      correctChain,
      currentChain,
      currentGuess,
      status,
      selectedIndex,
      topIndex,
      bottomIndex,
      mistakesRemaining,
      mistakesByIndex,
      solvedByIndex,
    ]
  );

  const api = useMemo(
    () => ({
      setGuess,
      setSelectedIndex,
      confirmGuess,
      resetGame,
    }),
    [setGuess, setSelectedIndex, confirmGuess, resetGame]
  );

  return (
    <ChainDataContext.Provider value={data}>
      <ChainApiContext.Provider value={api}>{children}</ChainApiContext.Provider>
    </ChainDataContext.Provider>
  );
}

export function useChainData() {
  const context = useContext(ChainDataContext);
  if (!context) {
    throw new Error("Unknown context");
  }
  return context;
}

export function useChainApi() {
  const context = useContext(ChainApiContext);
  if (!context) {
    throw new Error("Unknown context");
  }
  return context;
}
