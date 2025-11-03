"use client";
import { useRouter } from "next/navigation";
import { SquarePen, Search } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function NavItems({ isExpanded }: { isExpanded: boolean }) {
  const router = useRouter();

  const navItems = [
    {
      icon: <SquarePen className="w-5 h-5" />,
      label: "New Chat",
      action: () => router.push("/generate"),
    },
    {
      icon: <Search className="w-5 h-5" />,
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
              className={`cursor-pointer flex items-center gap-3 w-full text-base px-2 py-2 rounded-lg
                hover:bg-muted
                border border-white/10 shadow
                transition-all duration-110
                ${!isExpanded ? "justify-center" : ""}
              `}
              onClick={item.action}
              tabIndex={0}
            >
              <span className="">{item.icon}</span>
              {isExpanded && (
                <span className="font-semibold">{item.label}</span>
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
