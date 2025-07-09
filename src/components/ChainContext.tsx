import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type PropsWithChildren } from "react";
import { saveToLocalStorage } from "../lib/localStorage";

export const MAX_GUESSES = 5;

type Status = "initial" | "guessing" | "selecting" | "winner" | "loser";
export type Guess = string[];

interface ChainContextData {
  userGuesses: Guess[];
  correctChain: string[];
  currentChain: string[];
  currentGuess: string[];
  solvedByIndex: boolean[];
  status: Status;
  guessesRemaining: number;
  hints: number[];
}

interface ChainContextApi {
  setGuess: (index: number, guess: string) => void;
  confirmGuess: () => void;
  resetGame: () => void;
  selectHintIndex: (index: number) => void;
  resetGuess: () => void;
}

export interface ChainState {
  userGuesses: Guess[];
  currentSuffixes: string[];
  hints: number[];
  status: Status;
}

interface ChainAction {
  type: string;
  payload?: any;
}

export type SaveData = {
  userGuesses: Guess[];
  hints: number[];
};

const ChainDataContext = createContext<ChainContextData | null>(null);
const ChainApiContext = createContext<ChainContextApi | null>(null);

interface ChainProviderProps {
  correctChain: string[];
  savedData: SaveData | null;
}

export function ChainProvider({ children, correctChain, savedData }: PropsWithChildren<ChainProviderProps>) {
  const defaultInitialState: ChainState = {
    userGuesses: [],
    currentSuffixes: correctChain.map(() => ""),
    hints: [],
    status: "guessing",
  };

  const numSavedGuesses = savedData?.userGuesses.length ?? 0;
  const numSavedHints = savedData?.hints?.length ?? 0;
  const startingFromSaved = numSavedGuesses > 0;
  const initialStatus = (
    startingFromSaved ? (numSavedGuesses > numSavedHints ? "selecting" : "guessing") : "initial"
  ) as Status;
  const initialState = {
    ...defaultInitialState,
    userGuesses: savedData?.userGuesses ?? [],
    hintsByIndex: savedData?.hints ?? defaultInitialState.hints,
    status: initialStatus,
  };
  function reducer(state: ChainState, action: ChainAction): ChainState {
    switch (action.type) {
      case "setGuess": {
        const { index, guess, currentChain } = action.payload;
        const currentlyRevealed = currentChain[index] ?? "";
        // if the guess is longer than the currently revealed word, we need to trim it
        return {
          ...state,
          currentSuffixes: state.currentSuffixes.map((current, i) =>
            i === index ? guess.slice(currentlyRevealed.length) : current
          ),
        };
      }
      case "confirmGuess": {
        const { currentGuess } = action.payload;
        const guess = currentGuess.map((word: string) => word.trim().toLowerCase());
        console.log("confirming guess", guess);
        return {
          ...state,
          // currentSuffixes: defaultInitialState.currentSuffixes,
          userGuesses: [...state.userGuesses, guess],
          status: "selecting",
        };
      }
      case "selectHintIndex": {
        const { index } = action.payload;
        return {
          ...state,
          hints: [...state.hints, index],
          status: "guessing",
        };
      }
      case "resetGuess": {
        return {
          ...state,
          currentSuffixes: [],
        };
      }
      case "setWinner": {
        return {
          ...state,
          status: "winner",
        };
      }
      case "setLoser": {
        return {
          ...state,
          status: "loser",
        };
      }
      case "resetGame": {
        return defaultInitialState;
      }
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  const [{ userGuesses, currentSuffixes, hints, status }, dispatch] = useReducer(reducer, defaultInitialState);

  const hintsByIndex: number[] = correctChain.map(() => 0);
  for (let hintIndex of hints) {
    hintsByIndex[hintIndex] += 1;
  }

  console.log("hints", hints);
  console.log("hintsByIndex", hintsByIndex);

  const solvedByIndex: boolean[] = correctChain.map((_, index) => index === 0 || index === correctChain.length - 1);

  userGuesses.forEach((guess) => {
    for (let i = 1; i < correctChain.length - 1; i++) {
      if (guess[i] === correctChain[i]) {
        solvedByIndex[i] = true;
      }
    }
  });

  const currentChain = correctChain.map((correctWord, index) =>
    solvedByIndex[index] ? correctWord : correctWord.slice(0, hintsByIndex[index] + 1)
  );

  const currentGuess = currentChain.map((word, index) => word + currentSuffixes[index]);

  const numGuesses = userGuesses.length;

  const guessesRemaining = MAX_GUESSES - numGuesses;

  useEffect(() => {
    saveToLocalStorage({ userGuesses, hints });

    if (solvedByIndex.every((solved) => solved)) {
      dispatch({ type: "setWinner" });
      return;
    }
    if (guessesRemaining === 0) {
      dispatch({ type: "setLoser" });
    }
  }, [userGuesses, hints]);

  const confirmGuess = useCallback(() => {
    dispatch({ type: "confirmGuess", payload: { currentGuess } });
  }, [currentGuess]);

  const setGuess = useCallback(
    (index: number, guess: string) => {
      dispatch({ type: "setGuess", payload: { index, guess, currentChain } });
    },
    [currentChain]
  );

  const selectHintIndex = useCallback((index: number) => {
    dispatch({ type: "selectHintIndex", payload: { index } });
  }, []);

  const resetGame = useCallback(() => dispatch({ type: "resetGame" }), []);

  const data = useMemo(
    () => ({
      correctChain,
      currentChain,
      currentGuess,
      solvedByIndex,
      status,
      userGuesses,
      guessesRemaining,
      hints,
    }),
    [correctChain, status, currentChain, userGuesses, currentGuess, guessesRemaining, hints, solvedByIndex]
  );

  const api = useMemo(
    () => ({
      setGuess,
      confirmGuess,
      resetGame,
      selectHintIndex,
    }),
    [setGuess, confirmGuess, resetGame, selectHintIndex]
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
