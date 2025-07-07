import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type PropsWithChildren } from "react";
import { saveToLocalStorage } from "../lib/localStorage";

export const MAX_GUESSES = 5;

type Status = "guessing" | "selecting" | "winner" | "loser";
export type Guess = string[];

interface ChainContextData {
  userGuesses: Guess[];
  correctChain: string[];
  currentChain: string[];
  currentGuess: string[];
  solvedByIndex: boolean[];
  status: Status;
  guessesRemaining: number;
}

interface ChainContextApi {
  setGuess: (index: number, guess: string) => void;
  confirmGuess: () => void;
  resetGame: () => void;
  selectHintIndex: (index: number) => void;
}

export interface ChainState {
  userGuesses: Guess[];
  currentSuffixes: string[];
  hintsByIndex: number[];
  status: Status;
}

interface ChainAction {
  type: string;
  payload?: any;
}

export type SaveData = {
  userGuesses: Guess[];
  hintsByIndex: number[];
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
    hintsByIndex: correctChain.map(() => 0),
    status: "guessing",
  };
  const numSavedGuesses = savedData?.userGuesses.length ?? 0;
  const numSavedHints = savedData?.hintsByIndex.reduce((acc, cur) => acc + cur, 0) ?? 0;
  const initialStatus = (numSavedGuesses > numSavedHints ? "selecting" : "guessing") as Status;
  const initialState = {
    ...defaultInitialState,
    userGuesses: savedData?.userGuesses ?? [],
    hintsByIndex: savedData?.hintsByIndex ?? defaultInitialState.hintsByIndex,
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
        return {
          ...state,
          currentSuffixes: defaultInitialState.currentSuffixes,
          userGuesses: [...state.userGuesses, guess],
          status: "selecting",
        };
      }
      case "selectHintIndex": {
        const { index } = action.payload;
        return {
          ...state,
          hintsByIndex: state.hintsByIndex.map((num, i) => (i === index ? num + 1 : num)),
          status: "guessing",
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

  const [{ userGuesses, currentSuffixes, hintsByIndex, status }, dispatch] = useReducer(reducer, initialState);

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
    saveToLocalStorage({ userGuesses, hintsByIndex });

    if (solvedByIndex.every((solved) => solved)) {
      dispatch({ type: "setWinner" });
      return;
    }
    if (guessesRemaining === 0) {
      dispatch({ type: "setLoser" });
    }
  }, [userGuesses, hintsByIndex]);

  const confirmGuess = useCallback(() => {
    dispatch({ type: "confirmGuess", payload: { currentGuess } });
  }, [currentGuess]);

  const setGuess = useCallback(
    (index: number, guess: string) => {
      dispatch({ type: "setGuess", payload: { index, guess, currentChain } });
    },
    [currentChain]
  );

  const selectHintIndex = useCallback(
    (index: number) => {
      dispatch({ type: "selectHintIndex", payload: { index } });
    },
    [hintsByIndex]
  );

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
    }),
    [correctChain, status, currentChain, userGuesses, currentGuess, guessesRemaining, solvedByIndex]
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
