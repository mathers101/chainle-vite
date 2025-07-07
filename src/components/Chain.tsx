import { timeUntilTomorrow } from "../lib/time";
import { cn } from "../lib/utils";
import { useChainApi, useChainData } from "./ChainContext";
import ChainInput from "./ChainInput";
import { Button } from "./ui/button";

export default function Chain() {
  const { currentChain, guessesRemaining, isWinner, isLoser } = useChainData();
  const { confirmGuess, resetGame } = useChainApi();
  const { hours, minutes, seconds } = timeUntilTomorrow();
  const gameOver = isWinner || isLoser;

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
            : "bg-blue-100 text-blue-800 font-semibold text-lg"
        )}
      >
        {!gameOver && "Attempt to guess the chain of words!"}
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
      {/* <h2>selectedIndex: {selectedIndex}</h2>
      <h2>currentGuess: {currentGuess}</h2> */}
      <div className="flex items-center justify-center mb-2">
        <span className="px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 font-semibold text-lg shadow">
          Guesses remaining: <span className="font-bold">{guessesRemaining}</span>
        </span>
      </div>
      <div className="relative flex flex-col gap-3">
        {currentChain.map((_, index) => (
          <div className="flex flex-row items-center" key={index}>
            <ChainInput index={index} />
            {/* <NumberIncorrect num={mistakesByIndex[index]} /> */}
          </div>
        ))}
        {gameOver ? (
          <Button variant="destructive" onClick={resetGame} className="w-full">
            Reset game
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full bg-blue-200 hover:bg-blue-300"
            onClick={confirmGuess}
            disabled={status !== "guessing"}
          >
            Confirm guess
          </Button>
        )}
      </div>
    </div>
  );
}
