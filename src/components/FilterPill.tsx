import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 rounded-full border-2 px-6 py-2 font-bold shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg",
        active ? "border-primary bg-primary text-primary-foreground" : "border-secondary bg-secondary/50 text-foreground hover:bg-secondary",
      )}
    >
      {children}
    </button>
  );
}
