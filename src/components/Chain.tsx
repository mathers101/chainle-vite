import { useChainApi, useChainData } from "./ChainContext";
import ChainInput from "./ChainInput";
import NumberIncorrect from "./NumberIncorrect";
import { Button } from "./ui/button";

export default function Chain() {
  const {
    currentChain,
    status,
    topIndex,
    bottomIndex,
    selectedIndex,
    currentGuess,
    incorrectGuesses,
    guessesRemaining,
  } = useChainData();
  const { confirmGuess } = useChainApi();
  return (
    <div className="flex flex-col gap-4">
      <h1>status: {status}</h1>
      <h2>Top index: {topIndex}</h2>
      <h2>Bottom index: {bottomIndex}</h2>
      <h2>Selected index: {selectedIndex}</h2>
      <h2>Current guess: {currentGuess}</h2>
      <h2>Guesses remaining: {guessesRemaining}</h2>
      <div className="flex flex-col gap-3">
        {currentChain.map((_, index) => (
          <div className="flex flex-row items-center gap-2" key={index}>
            <ChainInput index={index} />
            <NumberIncorrect num={incorrectGuesses[index]} />
          </div>
        ))}
      </div>
      <Button variant="secondary" className="text-black" onClick={confirmGuess} disabled={status !== "guessing"}>
        Confirm guess
      </Button>
    </div>
  );
}
