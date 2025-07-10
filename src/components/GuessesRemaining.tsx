import { cn } from "@/lib/utils";
import { Card, CardContent } from "./ui/card";

export default function GuessesRemaining({ guessesRemaining }: { guessesRemaining: number }) {
  const { bgColor, textColor } = getGuessesColor(guessesRemaining);

  return (
    <Card className={cn("mb-2 py-0 rounded-lg transition-colors duration-200", bgColor)}>
      <CardContent
        className={cn(
          "p-3 flex items-center rounded-lg justify-center text-center font-semibold text-lg shadow",
          textColor
        )}
      >
        Guesses remaining:&nbsp;
        <span className="font-bold">{guessesRemaining}</span>
      </CardContent>
    </Card>
  );
}

const getGuessesColor = (guessesRemaining: number) => {
  if (guessesRemaining >= 4) {
    return { bgColor: "bg-green-100", textColor: "text-green-800" };
  } else if (guessesRemaining >= 2) {
    return { bgColor: "bg-yellow-100", textColor: "text-yellow-800" };
  } else {
    return { bgColor: "bg-red-100", textColor: "text-red-800" };
  }
};
