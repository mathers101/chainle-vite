import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type PropsWithChildren } from "react";
import { saveToLocalStorage } from "../lib/localStorage";

export const MAX_GUESSES = 5;

interface ChainContextData {
  correctChain: string[];
  currentChain: string[];
  currentGuess: string[];
  isWinner: boolean;
  isLoser: boolean;
  solvedByIndex: boolean[];
  guessesRemaining: number;
}

interface ChainContextApi {
  setGuess: (index: number, guess: string) => void;
  confirmGuess: () => void;
  resetGame: () => void;
}

export type Guess = string[];

export interface ChainState {
  userGuesses: Guess[];
  currentSuffixes: string[];
  // status?: Status;
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

export function ChainProvider({ children, correctChain, savedGuesses }: PropsWithChildren<ChainProviderProps>) {
  const defaultInitialState: ChainState = {
    userGuesses: [],
    currentSuffixes: correctChain.map(() => ""),
  };
  const initialState = {
    ...defaultInitialState,
    userGuesses: savedGuesses ?? [],
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
          currentSuffixes: defaultInitialState.currentSuffixes,
          userGuesses: [...state.userGuesses, guess],
        };
      }
      case "resetGame": {
        return defaultInitialState;
      }
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  const [{ userGuesses, currentSuffixes }, dispatch] = useReducer(reducer, initialState);

  const solvedByIndex: boolean[] = correctChain.map((_, index) => index === 0 || index === correctChain.length - 1);
  const numLettersByIndex = correctChain.map((_, i) => (i === 0 || i === correctChain.length - 1 ? 10 : 1));

  userGuesses.forEach((guess) => {
    // if we have saved guesses, we need to set the current guess to the last one
    for (let i = 1; i < correctChain.length - 1; i++) {
      if (guess[i] === correctChain[i]) {
        numLettersByIndex[i] = 10;
        solvedByIndex[i] = true;
      } else {
        if (guess[i - 1] === correctChain[i - 1]) {
          // if the previous or next word is correct, we can assume the current word is not solved
          numLettersByIndex[i] += 1;
        }
      }
    }
  });

  const currentChain = correctChain.map((correctWord, index) => correctWord.slice(0, numLettersByIndex[index]));

  const currentGuess = currentChain.map((word, index) => word + currentSuffixes[index]);

  const numGuesses = userGuesses.length;

  const guessesRemaining = MAX_GUESSES - numGuesses;

  const isWinner = solvedByIndex.every((solved) => solved);
  const isLoser = !isWinner && guessesRemaining === 0;

  useEffect(() => {
    saveToLocalStorage(userGuesses);
  }, [userGuesses]);

  const confirmGuess = useCallback(() => {
    dispatch({ type: "confirmGuess", payload: { currentGuess } });
  }, [currentGuess]);

  const setGuess = useCallback(
    (index: number, guess: string) => {
      dispatch({ type: "setGuess", payload: { index, guess, currentChain } });
    },
    [currentChain]
  );

  const resetGame = useCallback(() => dispatch({ type: "resetGame" }), []);

  const data = useMemo(
    () => ({
      correctChain,
      currentChain,
      currentGuess,
      isWinner,
      isLoser,
      solvedByIndex,
      guessesRemaining,
    }),
    [correctChain, currentChain, isWinner, isLoser, currentGuess, guessesRemaining, solvedByIndex]
  );

  const api = useMemo(
    () => ({
      setGuess,
      confirmGuess,
      resetGame,
    }),
    [setGuess, confirmGuess, resetGame]
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
