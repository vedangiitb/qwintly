import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
export default function EditMode({
  editMode,
  toggleEditMode,
}: {
  editMode?: boolean;
  toggleEditMode?: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Switch
          className={`border-2 h-5 w-8 border-muted-foreground bg-muted-foreground`}
          checked={editMode}
          onCheckedChange={toggleEditMode}
        />
      </TooltipTrigger>
      <TooltipContent side="right" className="text-xs">
        Turn edit Mode {editMode ? "off" : "on"}
      </TooltipContent>
    </Tooltip>
  );
}
