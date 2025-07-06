import { X } from "lucide-react";

export default function NumberIncorrect({ num }: { num: number }) {
  return (
    <div className="absolute right-0 flex flex-row translate-x-9 items-center w-8">
      {num > 0 && <X className="text-red-500" strokeWidth={3} />}
      {num > 1 && <span className="text-red-500 text-xl font-semibold -translate-y-px">{num}</span>}
    </div>
  );
}
