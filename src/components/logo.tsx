import { HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <HeartPulse className="size-5" />
      </span>
      {showText && (
        <span className="text-lg font-semibold tracking-tight">Prevora</span>
      )}
    </span>
  );
}
