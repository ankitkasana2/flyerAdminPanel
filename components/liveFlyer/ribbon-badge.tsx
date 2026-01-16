import { cn } from "@/lib/utils";

interface RibbonBadgeProps {
  text: string;
  color: "gold" | "red";
  size?: "sm" | "md";
}

export function RibbonBadge({ text, color, size = "md" }: RibbonBadgeProps) {
  const colorClasses = {
    gold: "bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 shadow-lg",
    red: "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg",
  };

  const sizeClasses = {
    sm: "text-[9px] px-2 py-0.5 font-bold",
    md: "text-[11px] px-2.5 py-1 font-bold",
  };

  return (
    <div
      className={cn(
        "font-bold rounded-md shadow-lg w-fit transform -rotate-12 border border-white/20",
        colorClasses[color],
        sizeClasses[size]
      )}
    >
      {text}
    </div>
  );
}
