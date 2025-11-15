"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Search, SquarePen } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NavItems({ isExpanded }: { isExpanded: boolean }) {
  const router = useRouter();

  const navItems = [
    {
      icon: (
        <SquarePen className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
      ), // slightly smaller icons
      label: "New Chat",
      action: () => router.push("/generate"),
    },
    {
      icon: (
        <Search className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
      ),
      label: "Search",
      action: () => {},
    },
  ];

  return (
    <nav className="flex flex-col gap-2">
      {navItems.map((item, idx) => (
        <Tooltip key={idx}>
          <TooltipTrigger asChild>
            <button
              className={`
                cursor-pointer
    flex items-center justify-center
   h-9 rounded-lg  
     hover:bg-muted
    transition-all duration-200
    ${!isExpanded ? "justify-center w-9" : "justify-start w-full gap-2 px-2"}
  `}
              onClick={item.action}
              tabIndex={0}
            >
              <span className="flex items-center justify-center w-5 h-5 text-muted-foreground group-hover:text-indigo-500 transition-colors">
                {item.icon}
              </span>

              {isExpanded && (
                <span className="truncate group-hover:text-foreground text-sm">
                  {item.label}
                </span>
              )}
            </button>
          </TooltipTrigger>
          {!isExpanded && (
            <TooltipContent side="right" className="text-xs">
              {item.label}
            </TooltipContent>
          )}
        </Tooltip>
      ))}
    </nav>
  );
}
