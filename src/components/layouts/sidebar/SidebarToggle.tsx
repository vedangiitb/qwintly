"use client";
import { Sidebar as SidebarIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function SidebarToggle({
  isExpanded,
  onToggle,
}: {
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`relative flex items-center justify-between ${
        isExpanded ? "p-2" : "p-0"
      }`}
    >
      {isExpanded ? (
        <span className="font-extrabold text-lg tracking-wider text-transparent bg-gradient-to-tr dark:from-teal-200 dark:via-purple-300 dark:to-pink-400 from-teal-600 via-purple-600 to-pink-600 bg-clip-text drop-shadow select-none ml-2 transition">
          Qwintly
        </span>
      ) : null}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onToggle}
            className={`
              flex justify-center items-center p-2 rounded-xl shadow hover:shadow-xl border
              hover:bg-muted
              transition-colors duration-150
              ${isExpanded ? "" : "w-full"}
            `}
            aria-label={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
            tabIndex={0}
          >
            <SidebarIcon className="w-5 h-5 text-chart-2 cursor-pointer" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          {isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
