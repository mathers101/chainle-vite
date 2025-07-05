import { X } from "lucide-react";

export default function NumberIncorrect({ num }: { num: number }) {
  return (
    <div className="flex flex-row items-center w-8">
      {num > 0 && <X className="text-red-500" strokeWidth={3} />}
      {num > 0 && <span className="text-red-500 text-lg font-semibold -translate-y-px">{num}</span>}
    </div>
  );
}
