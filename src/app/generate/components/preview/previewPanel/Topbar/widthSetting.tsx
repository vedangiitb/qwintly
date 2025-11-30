import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Monitor, Smartphone, Tablet } from "lucide-react";

export default function WidthSetting({
  width,
  setWidth,
}: {
  width: string;
  setWidth: (mode: "phone" | "tablet" | "pc") => void;
}) {
  const isPhone = width === "600px";
  const isTablet = width === "100%";

  return (
    <div>
      {isTablet ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Tablet
              className="cursor-pointer w-5 h-5 text-chart-2 hover:text-chart-2/70 transition-colors"
              onClick={() => setWidth("tablet")}
              aria-label="Switch to Tablet View"
              role="button"
              tabIndex={0}
            />
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            Switch to Tablet View
          </TooltipContent>
        </Tooltip>
      ) : isPhone ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Smartphone
              className="cursor-pointer w-5 h-5 text-chart-2 hover:text-chart-2/70 transition-colors"
              onClick={() => setWidth("phone")}
              aria-label="Switch to Phone View"
              role="button"
              tabIndex={0}
            />
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            Switch to Phone View
          </TooltipContent>
        </Tooltip>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Monitor
              className="cursor-pointer w-5 h-5 text-chart-2 hover:text-chart-2/70 transition-colors"
              onClick={() => setWidth("pc")}
              aria-label="Switch to PC View"
              role="button"
              tabIndex={0}
            />
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            Switch to PC View
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
