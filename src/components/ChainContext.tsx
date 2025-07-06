import { createContext, useContext, useEffect, useReducer, type PropsWithChildren } from "react";
import { chain } from "../assets/chains";

type Status = "loading" | "initial" | "correct" | "incorrect" | "guessing" | "winner" | "loser";

const MAX_INCORRECT_GUESSES = 6;

interface ChainContextData {
  currentChain: string[];
  status: Status;
  selectedIndex: number | null;
  currentGuess: string;
  incorrectGuesses: number[];
  topIndex: number;
  bottomIndex: number;
  guessesRemaining: number;
}

interface ChainContextApi {
  setGuess: (guess: string) => void;
  setSelectedIndex: (index: number) => void;
  confirmGuess: () => void;
}

export interface ChainState {
  currentChain: string[];
  correctChain: string[];
  status: Status;
  selectedIndex: number | null;
  currentGuess: string;
  incorrectGuesses: number[];
}

interface ChainAction {
  type: string;
  payload?: any;
}

const initialState = {
  currentChain: chain.map((word, index) => (index === 0 || index === chain.length - 1 ? word : word.slice(0, 1))),
  correctChain: chain,
  status: "initial" as Status,
  selectedIndex: 1,
  currentGuess: "",
  incorrectGuesses: chain.map(() => 0),
};

const ChainDataContext = createContext<ChainContextData | null>(null);
const ChainApiContext = createContext<ChainContextApi | null>(null);

interface ChainProviderProps {
  correctChain: string[];
}

export function ChainProvider({ children, correctChain }: PropsWithChildren<ChainProviderProps>) {
  function reducer(state: ChainState, action: ChainAction): ChainState {
    switch (action.type) {
      case "setGuess": {
        return { ...state, currentGuess: action.payload };
      }
      case "confirmGuess": {
        const { selectedIndex, currentChain, currentGuess, incorrectGuesses } = state;
        if (!selectedIndex) {
          throw new Error("No index selected for confirmation");
        }
        const correctAnswer = correctChain[selectedIndex].trim().toLowerCase();
        const guess = currentGuess.trim().toLowerCase();
        if (guess.length === currentChain[selectedIndex].length) return state;
        const isCorrect = guess === correctAnswer;
        if (isCorrect) {
          return {
            ...state,
            status: "correct",
            currentChain: currentChain.map((word, index) => (index === selectedIndex ? correctAnswer : word)),
            currentGuess: "",
          };
        } else {
          return {
            ...state,
            status: "incorrect",
            currentChain: currentChain.map((word, index) =>
              index === selectedIndex ? correctAnswer.slice(0, word.length + 1) : word
            ),
            incorrectGuesses: incorrectGuesses.map((count, index) => (index === selectedIndex ? count + 1 : count)),
            currentGuess: "",
          };
        }
      }
      case "setSelectedIndex": {
        const { currentChain } = state;
        const currentlyRevealed = currentChain[action.payload] || "";
        return {
          ...state,
          selectedIndex: action.payload,
          currentGuess: currentlyRevealed,
          status: "guessing",
        };
      }
      case "setWinner": {
        return { ...state, status: "winner" };
      }
      case "setLoser": {
        return { ...state, status: "loser" };
      }
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  const [{ currentChain, status, selectedIndex, currentGuess, incorrectGuesses }, dispatch] = useReducer(
    reducer,
    initialState
  );
  const chainLength = correctChain.length;

  const numIncorrectGuesses = incorrectGuesses.reduce((acc, count) => acc + count, 0);
  const guessesRemaining = MAX_INCORRECT_GUESSES - numIncorrectGuesses;

  useEffect(() => {
    if (guessesRemaining === 0) {
      dispatch({ type: "setLoser" });
      return;
    }
    // topIndex === -1 is our sign that the player has won, it means that currentChain and correctChain are identical
    if (topIndex === -1) {
      dispatch({ type: "setWinner" });
      return;
    }
  }, [currentChain]);

  const topIndex = currentChain.findIndex((_, i) => currentChain[i] !== correctChain[i]);
  const bottomIndex =
    chainLength - currentChain.findIndex((_, i) => currentChain[chainLength - i] !== correctChain[chainLength - i]);

  const confirmGuess = () => {
    dispatch({ type: "confirmGuess" });
  };
  const setGuess = (guess: string) => {
    dispatch({ type: "setGuess", payload: guess });
  };
  const setSelectedIndex = (index: number) => {
    dispatch({ type: "setSelectedIndex", payload: index });
  };

  return (
    <ChainDataContext.Provider
      value={{
        currentChain,
        currentGuess,
        status,
        selectedIndex,
        topIndex,
        bottomIndex,
        guessesRemaining,
        incorrectGuesses,
      }}
    >
      <ChainApiContext.Provider value={{ setGuess, setSelectedIndex, confirmGuess }}>
        {children}
      </ChainApiContext.Provider>
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
