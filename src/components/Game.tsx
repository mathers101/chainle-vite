import { useTimeUntilTomorrow } from "@/hooks/useTimeUntilTomorrow";
import { useChainData } from "./ChainContext";
import GuessesRemaining from "./GuessesRemaining";
import GameStatusCard from "./GameStatusCard";
import Share from "./Share";
import Chain from "./Chain";

export default function Game() {
  const { userGuesses, correctChain, guessesRemaining, status } = useChainData();
  const { hours, minutes, seconds } = useTimeUntilTomorrow();
  const isWinner = status === "winner";
  const isLoser = status === "loser";
  const gameOver = isWinner || isLoser;

  const nextGameComponent = (
    <span>{`Next chain available in ${hours} hours, ${minutes} minutes, ${seconds} seconds`}</span>
  );
  return (
    <div className="flex flex-col justify-start items-center gap-4">
      <GameStatusCard nextGameComponent={nextGameComponent} />
      <div className="flex items-center justify-center mb-2">
        {gameOver ? (
          <Share correctChain={correctChain} userGuesses={userGuesses} />
        ) : (
          <GuessesRemaining guessesRemaining={guessesRemaining} />
        )}
      </div>
      <Chain />
    </div>
  );
}
