import { useEffect, useRef } from "react";
import { cn } from "../lib/utils";
import { useChainData, useChainApi } from "./ChainContext";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";

interface ChainInputProps {
  index: number;
}

export default function ChainInput({ index }: ChainInputProps) {
  const { currentChain, currentGuess, selectedIndex, status, topIndex, bottomIndex } = useChainData();
  const { setGuess, setSelectedIndex, confirmGuess } = useChainApi();

  const isInitialWord = index === 0 || index === currentChain.length - 1;
  const isSolved = (!isInitialWord && (index < topIndex || index > bottomIndex)) || status === "winner";
  const currentlyRevealed = currentChain[index] || "";

  // const word = currentChain[index] || "";
  // const alreadyGuessed = index < topGuessIndex || index > bottomGuessIndex;
  // const currentlyTopGuess = index === topGuessIndex;
  // const currentlyBottomGuess = index === bottomGuessIndex;
  // let currentlyRevealed: string;
  // if (alreadyGuessed) {
  //   currentlyRevealed = word;
  // } else if (currentlyTopGuess) {
  //   currentlyRevealed = word.slice(0, topWordIndex);
  // } else if (currentlyBottomGuess) {
  //   currentlyRevealed = word.slice(0, bottomWordIndex);
  // } else {
  //   currentlyRevealed = "";
  // }

  const currentlyTopIndex = topIndex === index;
  const currentlyBottomIndex = bottomIndex === index;

  const isSelecting = ["correct", "incorrect", "initial"].includes(status);

  const currentlySelectable = isSelecting && (currentlyTopIndex || currentlyBottomIndex);
  const currentlySelected = status === "guessing" && selectedIndex === index;

  const currentlyDisplayed = currentlySelected
    ? currentlyRevealed + currentGuess.slice(currentlyRevealed.length)
    : currentlyRevealed;

  const currentlySelectedRef = useRef<any>(null);

  const disabled = !(currentlySelectable || currentlySelected);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (currentlySelectable && e.key === "Enter") {
      setSelectedIndex(index); // select on enter when tabbed in
      e.preventDefault();
    }
    if (currentlySelected && e.key === "Enter") {
      if (currentGuess.length <= currentlyRevealed.length) return;
      confirmGuess();
      if (currentlySelectedRef.current) {
        currentlySelectedRef.current.blur();
      }
    }
  };

  const onChange = (value: string) => {
    const filtered = value.replace(/[^A-Za-z]/g, "");
    if (currentlySelected && filtered.length >= currentlyRevealed.length) {
      setGuess(filtered);
    }
  };

  // const guessIndex = currentlyTopGuess ? topGuessIndex : currentlyBottomGuess ? bottomGuessIndex : null;

  useEffect(() => {
    if (currentlySelectedRef.current) {
      currentlySelectedRef.current.focus();
    }
  });

  return (
    <InputOTP
      pattern="[A-Za-z]*"
      inputMode="text"
      maxLength={10}
      value={currentlyDisplayed}
      onClick={currentlySelectable ? () => setSelectedIndex(index) : undefined}
      tabIndex={currentlySelectable || currentlySelected ? 0 : -1}
      disabled={disabled}
      className={cn(currentlySelectable ? "cursor-pointer" : "")}
      onKeyDown={onKeyDown}
      onChange={onChange}
      ref={currentlySelected ? currentlySelectedRef : null}
      spellCheck={false}
    >
      <InputOTPGroup className="uppercase">
        {Array.from({ length: 10 }, (_, index) => (
          <InputOTPSlot
            inputMode="text"
            key={index}
            index={index}
            className={cn(
              "border-gray-700",
              isInitialWord ? "bg-yellow-400" : isSolved ? "bg-green-400" : disabled ? "bg-gray-300" : ""
            )}
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
