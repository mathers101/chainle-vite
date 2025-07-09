import { useEffect, useState } from "react";
import { timeUntilTomorrow } from "../lib/time";
import { cn } from "../lib/utils";
import { useChainApi, useChainData } from "./ChainContext";
import ChainInput from "./ChainInput";
import DisplayInput from "./DisplayInput";
import Share from "./Share";
import { Button } from "./ui/button";

export default function DisplayChain() {
  const [revealedIndexes, setRevealedIndexes] = useState<number[]>([]);

  const { userGuesses, correctChain, solvedByIndex, currentChain, guessesRemaining, status } = useChainData();
  const { confirmGuess, resetGame, resetGuess } = useChainApi();
  const { hours, minutes, seconds } = timeUntilTomorrow();
  const isWinner = status === "winner";
  const isLoser = status === "loser";
  const gameOver = isWinner || isLoser;
  const isSelecting = status === "selecting";
  const otherwise = !isSelecting && !gameOver;

  const nextGameComponent = (
    <span>{`Next chain available in ${hours} hours, ${minutes} minutes, ${seconds} seconds`}</span>
  );

  const showDisplayInput = (index: number) => {
    if (status !== "guessing") return true;
    return solvedByIndex[index] ?? true;
  };
  console.log("display input on 1", showDisplayInput(1));

  //   const handleConfirmGuess = async () => {
  //     // Snapshot the current unsolved indexes BEFORE confirming guess
  //     const indexesToReveal = currentChain.map((_, idx) => idx).filter((idx) => solvedByIndex[idx] === false);

  //     confirmGuess(); // Updates solvedByIndex, status, etc.

  //     for (let i = 0; i < indexesToReveal.length; i++) {
  //       const idx = indexesToReveal[i];
  //       await new Promise((resolve) => setTimeout(resolve, 100)); // Stagger
  //       setRevealedIndexes((prev) => [...prev, idx]);
  //     }
  //   };

  const handleConfirmGuess = async () => {
    // Find which indexes need to animate
    const indexesToReveal = currentChain.map((_, idx) => idx).filter((idx) => solvedByIndex[idx] === false);

    confirmGuess();
    // Animate first (before confirming the guess)
    for (let i = 0; i < indexesToReveal.length; i++) {
      const idx = indexesToReveal[i];
      setRevealedIndexes((prev) => [...prev, idx]);
      await new Promise((resolve) => setTimeout(resolve, 500)); // stagger
    }

    resetGuess();

    // After animation completes, confirm guess (and swap state)
  };

  useEffect(() => {
    if (status === "guessing") {
      setRevealedIndexes(currentChain.map((_, idx) => idx).filter((idx) => solvedByIndex[idx] === true));
    }
  }, [status]);

  console.log(revealedIndexes, "revealedIndexes");

  return (
    <div className="flex flex-col justify-start items-center gap-4">
      <div className="relative flex flex-col gap-3">
        {currentChain.map((_, index) => (
          <div className="flex flex-row items-center" key={index}>
            {showDisplayInput(index) && revealedIndexes.includes(index) ? (
              <DisplayInput index={index} revealed={revealedIndexes.includes(index)} />
            ) : (
              <ChainInput index={index} />
            )}
            {/* <NumberIncorrect num={mistakesByIndex[index]} /> */}
          </div>
        ))}
        {gameOver ? (
          <Button variant="destructive" onClick={resetGame} className="w-full">
            Reset game
          </Button>
        ) : (
          <Button variant="outline" className="w-full bg-blue-200 hover:bg-blue-300" onClick={handleConfirmGuess}>
            Confirm guess
          </Button>
        )}
      </div>
    </div>
  );
}
