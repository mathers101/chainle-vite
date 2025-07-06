import { timeUntilTomorrow } from "../lib/time";
import { cn } from "../lib/utils";
import { useChainApi, useChainData } from "./ChainContext";
import ChainInput from "./ChainInput";
import NumberIncorrect from "./NumberIncorrect";
import { Button } from "./ui/button";

export default function Chain() {
  const { currentChain, status, incorrectGuesses, guessesRemaining } = useChainData();
  const { confirmGuess } = useChainApi();
  const { hours, minutes, seconds } = timeUntilTomorrow();

  const nextGameComponent = (
    <span>{`Next chain available in ${hours} hours, ${minutes} minutes, ${seconds} seconds`}</span>
  );
  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={cn(
          "p-4 mb-2 rounded text-center min-h-[60px] flex items-center justify-center transition-colors duration-200",
          status === "initial"
            ? "bg-blue-100 text-blue-800 font-semibold text-lg"
            : status === "winner"
            ? "bg-green-100 text-green-800 font-bold text-xl animate-bounce"
            : status === "loser"
            ? "bg-red-100 text-red-800 font-bold text-xl"
            : "bg-transparent text-transparent"
        )}
      >
        {status === "initial" && "Welcome! Please select an entry in the chain to start guessing."}
        {status === "winner" && (
          <div className="flex flex-col">
            <span>🎉 Congratulations, you solved the chain! 🎉</span>
            {nextGameComponent}
          </div>
        )}
        {status === "loser" && (
          <div className="flex flex-col">
            <span>Game over</span>
            {nextGameComponent}
          </div>
        )}
      </div>
      <div className="flex items-center justify-center mb-2">
        <span className="px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 font-semibold text-lg shadow">
          Mistakes remaining: <span className="font-bold">{guessesRemaining}</span>
        </span>
      </div>
      <div className="relative flex flex-col gap-3">
        {currentChain.map((_, index) => (
          <div className="flex flex-row items-center" key={index}>
            <ChainInput index={index} />
            <NumberIncorrect num={incorrectGuesses[index]} />
          </div>
        ))}
        <Button
          variant="outline"
          className="text-black w-full bg-blue-200"
          onClick={confirmGuess}
          disabled={status !== "guessing"}
        >
          Confirm guess
        </Button>
      </div>
    </div>
  );
}
