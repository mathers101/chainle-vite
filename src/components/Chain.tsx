import { useEffect, useState } from "react";
import { useChainApi, useChainData } from "./ChainContext";
import { Button } from "./ui/button";
import WordDisplay from "./WordDisplay";
import WordInput from "./WordInput";

export default function Chain() {
  const { solvedByIndex, currentChain, status, currentGuessValid } = useChainData();
  const { setStatus } = useChainApi();

  const initialRevealedIndexes =
    status === "guessing"
      ? currentChain.map((_, idx) => idx).filter((idx) => solvedByIndex[idx] === true)
      : currentChain.map((_, idx) => idx);
  const [revealedIndexes, setRevealedIndexes] = useState<number[]>(initialRevealedIndexes);
  const { confirmGuess, resetGame } = useChainApi();
  const isWinner = status === "winner";
  const isLoser = status === "loser";
  const gameOver = isWinner || isLoser;

  const showDisplayInput = (index: number) => {
    if (status !== "guessing") return true;
    return solvedByIndex[index] ?? true;
  };

  const handleConfirmGuess = async () => {
    if (status !== "guessing") return;
    // Find which indexes need to animate
    const indexesToReveal = currentChain.map((_, idx) => idx).filter((idx) => solvedByIndex[idx] === false);

    confirmGuess();
    for (let i = 0; i < indexesToReveal.length; i++) {
      const idx = indexesToReveal[i];
      setRevealedIndexes((prev) => [...prev, idx]);
      await new Promise((resolve) => setTimeout(resolve, 500)); // stagger
    }
    setTimeout(() => setStatus("selecting"), 700);
  };

  useEffect(() => {
    if (status === "guessing") {
      setRevealedIndexes(currentChain.map((_, idx) => idx).filter((idx) => solvedByIndex[idx] === true));
    } else if (status === "revealing") {
      return;
    } else {
      setRevealedIndexes(Array.from({ length: currentChain.length }, (_, idx) => idx));
    }
  }, [status]);

  return (
    <div className="flex flex-col justify-start items-center gap-4">
      <div className="relative flex flex-col gap-3">
        {currentChain.map((_, index) => (
          <div className="flex flex-row items-center" key={index}>
            {showDisplayInput(index) && revealedIndexes.includes(index) ? (
              <WordDisplay index={index} revealed={revealedIndexes.includes(index)} />
            ) : (
              <WordInput index={index} />
            )}
          </div>
        ))}
        {gameOver ? (
          <Button variant="destructive" onClick={resetGame} className="w-full">
            Reset game
          </Button>
        ) : (
          <Button
            variant="outline"
            disabled={status !== "guessing" || !currentGuessValid}
            className="w-full bg-blue-400 hover:bg-blue-300"
            onClick={handleConfirmGuess}
          >
            Confirm guess
          </Button>
        )}
      </div>
    </div>
  );
}
