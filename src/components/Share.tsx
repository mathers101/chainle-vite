import { getTodaysDate } from "@/lib/time";
import { MAX_GUESSES, type Guess } from "./ChainContext";
import { Button } from "./ui/button";

interface ShareProps {
  correctChain: string[];
  userGuesses: Guess[];
}

export default function Share({ correctChain, userGuesses }: ShareProps) {
  const [year, month, day] = getTodaysDate()
    .split("-")
    .map((val) => Number(val.slice(-2)));
  const date = `${month}/${day}/${year}`;
  const resultString = userGuesses
    .map((guess) => {
      return guess
        .map((word, idx) => {
          if (idx === 0 || idx === correctChain.length - 1) {
            return "🟨";
          } else if (word === correctChain[idx]) {
            return "🟩";
          } else {
            return "⬜";
          }
        })
        .join("");
    })
    .join("\n");

  const shareString = `Chainle ${date}\n${userGuesses.length}/${MAX_GUESSES} attempts\n\n${resultString}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Chainle Result",
          text: shareString,
          //   url: window.location.href,
        })
        .catch((error) => console.error("Error sharing:", error));
    } else {
      // Fallback for browsers that do not support the Web Share API
      navigator.clipboard.writeText(shareString).then(() => {
        alert("Result copied to clipboard!");
      });
    }
  };

  return (
    <Button variant="default" onClick={handleShare} className="bg-blue-400 hover:bg-blue-300">
      Share your result
    </Button>
  );
}
