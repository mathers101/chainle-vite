import { createContext, useContext, useEffect, useReducer, type PropsWithChildren } from "react";
import { chain } from "../assets/chains";

type Status = "loading" | "initial" | "correct" | "incorrect" | "guessing" | "winner" | "loser";

interface ChainContextData {
  currentChain: string[];
  status: Status;
  selectedIndex: number | null;
  currentGuess: string;
  incorrectGuesses: number[];
  topIndex: number;
  bottomIndex: number;
}

interface ChainContextApi {
  setGuess: (guess: string) => void;
  setSelectedIndex: (index: number) => void;
  confirmGuess: () => void;
}

interface ChainState {
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
  currentChain: chain.map((word, index) => (index === 0 || index === chain.length - 1 ? word : "")),
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
        return {
          ...state,
          currentChain: isCorrect
            ? currentChain.map((word, index) => (index === selectedIndex ? correctAnswer : word))
            : currentChain,
          status: isCorrect ? "correct" : "incorrect",
          currentGuess: "",
          incorrectGuesses: isCorrect
            ? incorrectGuesses
            : incorrectGuesses.map((count, index) => (index === selectedIndex ? count + 1 : count)),
          // selectedIndex: null,
        };
      }
      case "setSelectedIndex": {
        const { currentChain } = state;
        const currentlyRevealed = currentChain[action.payload] || "";
        const newlyRevealed = correctChain[action.payload].slice(0, currentlyRevealed.length + 1);
        return {
          ...state,
          selectedIndex: action.payload,
          currentGuess: newlyRevealed,
          status: "guessing",
          currentChain: currentChain.map((word, index) =>
            index === action.payload ? correctChain[action.payload].slice(0, word.length + 1) : word
          ),
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

  useEffect(() => {
    const winner = topIndex === -1;
    if (winner) {
      dispatch({ type: "setWinner" });
    }
  }, [currentChain]);

  const topIndex = currentChain.findIndex((_, i) => currentChain[i] !== correctChain[i]);
  const bottomIndex =
    chainLength - currentChain.findIndex((_, i) => currentChain[chainLength - i] !== correctChain[chainLength - i]);
  console.log(bottomIndex);

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
