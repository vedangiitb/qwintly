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
  setWidth: (mode: "phone" | "tab" | "pc") => void;
}) {
  const isPhone = width === "600px";
  const isTablet = width === "100%";

  return (
    <div>
      {isTablet ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Tablet
              className="cursor-pointer w-5 h-5 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setWidth("tab")}
              aria-label="Switch to Tablet View"
              role="button"
              tabIndex={0}
            />
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs text-muted-foreground">
            Switch to Tablet View
          </TooltipContent>
        </Tooltip>
      ) : isPhone ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Smartphone
              className="cursor-pointer w-5 h-5 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setWidth("phone")}
              aria-label="Switch to Phone View"
              role="button"
              tabIndex={0}
            />
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs text-muted-foreground">
            Switch to Phone View
          </TooltipContent>
        </Tooltip>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Monitor
              className="cursor-pointer w-5 h-5 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setWidth("pc")}
              aria-label="Switch to PC View"
              role="button"
              tabIndex={0}
            />
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs text-muted-foreground">
            Switch to PC View
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
