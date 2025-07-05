import { X } from "lucide-react";

export default function NumberIncorrect({ num }: { num: number }) {
  return (
    <div className="flex flex-row">
      {Array.from({ length: num }).map((_, i) => (
        <X key={i} className="text-red-500" strokeWidth={3} />
      ))}
    </div>
  );
}
