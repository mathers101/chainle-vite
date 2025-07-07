import { cn } from "../lib/utils";
import { useChainData, useChainApi } from "./ChainContext";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";

interface ChainInputProps {
  index: number;
}

export default function ChainInput({ index }: ChainInputProps) {
  const { status, correctChain, currentChain, currentGuess, solvedByIndex } = useChainData();
  const { setGuess, selectHintIndex } = useChainApi();

  const isWinner = status === "winner";
  const isLoser = status === "loser";
  const isInitialWord = index === 0 || index === currentChain.length - 1;
  const isSolved = solvedByIndex[index] || false;
  // const isSolved = (!isInitialWord && (index < topIndex || index > bottomIndex)) || status === "winner";
  const currentlyRevealed = (isLoser ? correctChain[index] : currentChain[index]) ?? "";

  const isSelectable = status === "selecting" && !isSolved;
  const handleSelect = () => selectHintIndex(index);

  const isGuessing = status === "guessing";

  const gameOver = isWinner || isLoser;
  const disabled = gameOver || isSolved;

  const currentlyDisplayed = isLoser ? correctChain[index] : currentGuess[index];

  const onClick = (e: React.MouseEvent<HTMLInputElement>) => {
    if (isSelectable) {
      handleSelect();
      e.currentTarget.select();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isSelectable && e.key === "Enter") {
      handleSelect();
    }
    // if (e.key === "Enter") {
    //   confirmGuess();
    // }
  };

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
      disabled={disabled}
      onClick={onClick}
      className={cn(!disabled ? "cursor-pointer" : "")}
      onKeyDown={onKeyDown}
      onChange={onChange}
      spellCheck={false}
    >
      <InputOTPGroup className="uppercase">
        {Array.from({ length: 10 }, (_, letterIndex) => {
          return (
            <InputOTPSlot
              inputMode="text"
              key={letterIndex}
              index={letterIndex}
              className={cn(
                "border-gray-700",
                isInitialWord ? "bg-yellow-400" : isSolved ? "bg-green-500" : gameOver ? "bg-gray-300" : ""
              )}
            />
          );
        })}
      </InputOTPGroup>
    </InputOTP>
  );
}
