"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SidebarIcon, X } from "lucide-react";

export default function SidebarToggle({
  isExpanded,
  onToggle,
}: {
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`flex items-center`}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onToggle}
            className={`
              cursor-pointer
    flex items-center justify-center
   h-9 rounded-lg
     hover:bg-muted
    transition-all duration-200
    ${!isExpanded ? "justify-center w-9" : "justify-start gap-2 px-2"}
  `}
            aria-label={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isExpanded ? (
              <X className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
            ) : (
              <SidebarIcon className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          {isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
