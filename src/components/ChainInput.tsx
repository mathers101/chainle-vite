import { cn } from "../lib/utils";
import { useChainData, useChainApi } from "./ChainContext";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";

interface ChainInputProps {
  index: number;
}

export default function ChainInput({ index }: ChainInputProps) {
  const { status, correctChain, currentChain, currentGuess, solvedByIndex, hints } = useChainData();
  const { setGuess, selectHintIndex } = useChainApi();

  const isWinner = status === "winner";
  const isLoser = status === "loser";
  const isSolved = solvedByIndex[index] || false;
  // const isSolved = (!isInitialWord && (index < topIndex || index > bottomIndex)) || status === "winner";
  const currentlyRevealed = (isLoser ? correctChain[index] : currentChain[index]) ?? "";

  const isGuessing = status === "guessing";

  const gameOver = isWinner || isLoser;
  const disabled = gameOver || isSolved;

  const currentlyDisplayed = isLoser ? correctChain[index] : currentGuess[index];

  console.log("input at index", index);

  const onChange = (value: string) => {
    if (!isGuessing) {
      return;
    }
    const filtered = value.replace(/[^A-Za-z]/g, "");
    if (filtered.length >= currentlyRevealed.length) {
      setGuess(index, filtered);
    }
  };

  return (
    <InputOTP
      pattern="[A-Za-z]*"
      inputMode="text"
      maxLength={10}
      value={currentlyDisplayed}
      tabIndex={disabled ? -1 : 0}
      className="cursor-pointer"
      onChange={onChange}
      spellCheck={false}
    >
      <InputOTPGroup className="uppercase">
        {Array.from({ length: 10 }, (_, letterIndex) => {
          const isLatestRevealed = index === hints?.at(-1) && letterIndex === currentlyRevealed.length - 1;
          return (
            <InputOTPSlot
              inputMode="text"
              key={letterIndex}
              index={letterIndex}
              innerClassName={isLatestRevealed ? "animate-vflip backface-hidden" : ""}
              className={cn(
                "border-gray-700"
                // isInitialWord ? "bg-yellow-400" : isSolved ? "bg-green-500" : gameOver ? "bg-gray-300" : ""
              )}
            />
          );
        })}
      </InputOTPGroup>
    </InputOTP>
  );
}
