"use client";
import { cn } from "@/lib/utils";

interface CookbookMemberBadgeProps { name: string; size?: "sm" | "md"; }

export function CookbookMemberBadge({ name, size = "sm" }: CookbookMemberBadgeProps) {
  const initial = name.charAt(0).toUpperCase();
  const sizeClasses = size === "md" ? "h-9 w-9 text-sm" : "h-7 w-7 text-xs";
  return (
    <div title={name}
      className={cn("flex items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-amber-500/5 ring-1 ring-amber-500/20 font-bold text-amber-400 select-none", sizeClasses)}>
      {initial}
    </div>
  );
}
