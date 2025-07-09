import { timeUntilTomorrow } from "../lib/time";
import { cn } from "../lib/utils";
import { useChainApi, useChainData } from "./ChainContext";
import ChainInput from "./ChainInput";
import DisplayChain from "./DisplayChain";
import Share from "./Share";
import { Button } from "./ui/button";

export default function Chain() {
  const { userGuesses, correctChain, currentChain, guessesRemaining, status } = useChainData();
  const { hours, minutes, seconds } = timeUntilTomorrow();
  const isWinner = status === "winner";
  const isLoser = status === "loser";
  const gameOver = isWinner || isLoser;
  const isSelecting = status === "selecting";
  const otherwise = !isSelecting && !gameOver;

  const nextGameComponent = (
    <span>{`Next chain available in ${hours} hours, ${minutes} minutes, ${seconds} seconds`}</span>
  );
  return (
    <div className="flex flex-col justify-start items-center gap-4">
      <div
        className={cn(
          "p-4 mb-2 rounded text-center min-h-[60px] flex items-center justify-center transition-colors duration-200",
          isWinner
            ? "bg-green-100 text-green-800 font-bold text-xl animate-bounce"
            : isLoser
            ? "bg-red-100 text-red-800 font-bold text-xl"
            : isSelecting
            ? "bg-yellow-100 text-yellow-800 font-semibold text-lg"
            : "bg-blue-100 text-blue-800 font-semibold text-lg"
        )}
      >
        {isSelecting && "Select a word to reveal a letter!"}
        {otherwise && "Attempt to guess the entire chain of words!"}
        {isWinner && (
          <div className="flex flex-col">
            <span>🎉 Congratulations! 🎉</span>
            {nextGameComponent}
          </div>
        )}
        {isLoser && (
          <div className="flex flex-col">
            <span>Game over</span>
            {nextGameComponent}
          </div>
        )}
      </div>
      {/* <h2>selectedIndex: {selectedIndex}</h2>*/}
      {/* <h2>currentGuess: {currentGuess}</h2>
      <h2>status: {status}</h2>
      <h2 className="text-lg font-semibold text-gray-700">Current chain: {currentChain}</h2> */}
      <div className="flex items-center justify-center mb-2">
        {gameOver ? (
          <Share correctChain={correctChain} userGuesses={userGuesses} />
        ) : (
          <span
            className={cn(
              "px-4 py-2 rounded-full font-semibold text-lg shadow",
              guessesRemaining >= 4
                ? "bg-green-100 text-green-800"
                : guessesRemaining >= 2
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            )}
          >
            Guesses remaining: <span className="font-bold">{guessesRemaining}</span>
          </span>
        )}
      </div>
      <DisplayChain />
    </div>
  );
}
