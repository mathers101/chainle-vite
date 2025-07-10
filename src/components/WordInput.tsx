import { useRef, useState } from "react";
import { cn } from "../lib/utils";
import { useChainData, useChainApi } from "./ChainContext";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";

interface ChainInputProps {
  index: number;
}

export default function WordInput({ index }: ChainInputProps) {
  const { currentChain, currentHintIndex } = useChainData();
  const { setGuess } = useChainApi();

  const [suffix, setSuffix] = useState("");

  const currentlyRevealed = currentChain[index] ?? "";
  const currentlyRevealedRef = useRef<string>(currentlyRevealed);

  const isCurrentHintIndex = index === currentHintIndex;

  const onChange = (value: string) => {
    const newsuffix = value.replace(/[^A-Za-z]/g, "").slice(currentlyRevealed.length);
    const newWord = currentlyRevealedRef.current + newsuffix;
    if (newWord.length >= currentlyRevealed.length) {
      setSuffix(newsuffix);
      setGuess(index, newWord);
    }
  };

  return (
    <InputOTP
      pattern="[A-Za-z]*"
      inputMode="text"
      maxLength={10}
      value={currentlyRevealedRef.current + suffix}
      className="cursor-pointer"
      autoFocus={isCurrentHintIndex}
      onChange={onChange}
      spellCheck={false}
    >
      <InputOTPGroup className="uppercase">
        {Array.from({ length: 10 }, (_, letterIndex) => {
          const isLatestRevealed = isCurrentHintIndex && letterIndex === currentlyRevealed.length - 1;
          return (
            <InputOTPSlot
              inputMode="text"
              key={letterIndex}
              index={letterIndex}
              innerClassName={isLatestRevealed ? "animate-vflip backface-hidden" : ""}
              className={cn("border-gray-700")}
            />
          );
        })}
      </InputOTPGroup>
    </InputOTP>
  );
}
