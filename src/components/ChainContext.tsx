import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type PropsWithChildren } from "react";
import { saveToLocalStorage } from "../lib/localStorage";

export const MAX_GUESSES = 5;

type Status = "guessing" | "revealing" | "selecting" | "winner" | "loser";
export type Guess = string[];

interface ChainContextData {
  userGuesses: Guess[];
  correctChain: string[];
  currentChain: string[];
  solvedByIndex: boolean[];
  currentHintIndex: number;
  currentGuessValid: boolean;
  status: Status;
  guessesRemaining: number;
}
// status, correctChain, currentChain, solvedByIndex, currentGuessValid, userGuesses, guessesRemaining

interface ChainContextApi {
  setGuess: (index: number, guess: string) => void;
  confirmGuess: () => void;
  resetGame: () => void;
  selectHintIndex: (index: number) => void;
  resetGuess: () => void;
  setStatus: (status: Status) => void;
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
  const initialStatus = (numSavedGuesses > numSavedHints ? "selecting" : "guessing") as Status;
  const initialGuesses = savedData?.userGuesses ?? [];
  const initialHints = savedData?.hints ?? [];
  // const initialSuffixes =
  //   initialStatus === "selecting"
  //     ? initialGuesses?.at(-1)?.map((word, index) => word.slice(initialHints.filter((hint) => hint === index).length))
  //     : defaultInitialState.currentSuffixes;
  const initialState = {
    ...defaultInitialState,
    currentSuffixes: defaultInitialState.currentSuffixes,
    userGuesses: initialGuesses,
    hints: initialHints,
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
          status: "revealing",
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
          currentSuffixes: defaultInitialState.currentSuffixes,
        };
      }
      case "setStatus": {
        return {
          ...state,
          status: action.payload,
        };
      }
      case "resetGame": {
        return defaultInitialState;
      }
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  const [{ userGuesses, currentSuffixes, hints, status }, dispatch] = useReducer(reducer, initialState);

  const hintsByIndex: number[] = correctChain.map(() => 0);
  for (let hintIndex of hints) {
    hintsByIndex[hintIndex] += 1;
  }

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
  const currentGuessValid = currentGuess.some((s, index) => s.length > currentChain[index].length);

  const numGuesses = userGuesses.length;

  const guessesRemaining = MAX_GUESSES - numGuesses;

  const currentHintIndex = hints[userGuesses.length - 1];

  // save game state to local storage, check if winner or loser has been determined
  useEffect(() => {
    saveToLocalStorage({ userGuesses, hints });

    if (solvedByIndex.every((solved) => solved) && status !== "revealing") {
      setStatus("winner");
      return;
    }
    if (guessesRemaining === 0 && status !== "revealing") {
      setStatus("loser");
    }
  }, [userGuesses, hints, status]);

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
  const resetGuess = useCallback(() => dispatch({ type: "resetGuess" }), []);
  const setStatus = useCallback((status: Status) => {
    dispatch({ type: "setStatus", payload: status });
  }, []);

  const data = useMemo(
    () => ({
      correctChain,
      currentChain,
      solvedByIndex,
      currentHintIndex,
      currentGuessValid,
      status,
      userGuesses,
      guessesRemaining,
    }),
    [
      correctChain,
      currentHintIndex,
      status,
      currentChain,
      userGuesses,
      currentGuessValid,
      guessesRemaining,
      solvedByIndex,
    ]
  );

  const api = useMemo(
    () => ({
      setGuess,
      confirmGuess,
      resetGame,
      setStatus,
      selectHintIndex,
      resetGuess,
    }),
    [setGuess, setStatus, confirmGuess, resetGame, resetGuess, selectHintIndex]
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
