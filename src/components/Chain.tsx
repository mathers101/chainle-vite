import { useChainApi, useChainData } from "./ChainContext";
import ChainInput from "./ChainInput";
import NumberIncorrect from "./NumberIncorrect";

export default function Chain() {
  const { currentChain, status, topIndex, bottomIndex, selectedIndex, currentGuess, incorrectGuesses } = useChainData();
  const { confirmGuess } = useChainApi();
  return (
    <div className="flex flex-col gap-4">
      <h1>status: {status}</h1>
      <h2>Top index: {topIndex}</h2>
      <h2>Bottom index: {bottomIndex}</h2>
      <h2>Selected index: {selectedIndex}</h2>
      <h2>Current guess: {currentGuess}</h2>
      <div className="flex flex-col gap-3">
        {currentChain.map((_, index) => (
          <div className="flex flex-row items-center gap-2" key={index}>
            <ChainInput index={index} />
            <NumberIncorrect num={incorrectGuesses[index]} />
          </div>
        ))}
      </div>
      <button onClick={confirmGuess} disabled={status !== "guessing"} className="mt-4 px-4 py-2 text-black rounded">
        Confirm guess
      </button>
    </div>
  );
}
