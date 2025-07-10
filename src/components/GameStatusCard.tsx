import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useChainData } from "./ChainContext";

interface GameStatusCardProps {
  nextGameComponent: React.ReactNode;
}

export default function GameStatusCard({ nextGameComponent }: GameStatusCardProps) {
  const { status } = useChainData();
  const isWinner = status === "winner";
  const isLoser = status === "loser";
  const isSelecting = status === "selecting";

  const bgColor = isWinner ? "bg-green-100" : isLoser ? "bg-red-100" : isSelecting ? "bg-yellow-100" : "bg-blue-100";

  return (
    <Card className={cn("mb-2 transition-colors duration-200", bgColor)}>
      <CardContent className="p-4 flex items-center justify-center text-center min-h-[60px]">
        <StatusMessage
          isWinner={isWinner}
          isLoser={isLoser}
          isSelecting={isSelecting}
          nextGameComponent={nextGameComponent}
        />
      </CardContent>
    </Card>
  );
}

export const StatusMessage = ({
  isWinner,
  isLoser,
  isSelecting,
  nextGameComponent,
}: {
  isWinner: boolean;
  isLoser: boolean;
  isSelecting: boolean;
  nextGameComponent: React.ReactNode;
}) => {
  if (isWinner) return <WinnerMessage nextGameComponent={nextGameComponent} />;
  if (isLoser) return <LoserMessage nextGameComponent={nextGameComponent} />;
  if (isSelecting) return <SelectingMessage />;
  return <DefaultMessage />;
};

const WinnerMessage = ({ nextGameComponent }: { nextGameComponent: React.ReactNode }) => {
  return (
    <div className="flex flex-col items-center gap-2 text-green-800 font-bold text-xl">
      <span>🎉 Congratulations! 🎉</span>
      {nextGameComponent}
    </div>
  );
};

const LoserMessage = ({ nextGameComponent }: { nextGameComponent: React.ReactNode }) => {
  return (
    <div className="flex flex-col items-center gap-2 text-red-800 font-bold text-xl">
      <span>Game over</span>
      {nextGameComponent}
    </div>
  );
};

const SelectingMessage = () => {
  return <span className="text-yellow-800 font-semibold text-lg">Select a word to reveal a letter!</span>;
};

const DefaultMessage = () => {
  return <span className="text-blue-800 font-semibold text-lg">Attempt to guess the entire chain of words!</span>;
};
