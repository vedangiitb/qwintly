import { Settings } from "lucide-react";

export default function OrgSettings({
  isActive,
  isExpanded,
}: {
  isActive: boolean;
  isExpanded: boolean;
}) {
  return (
    <button
      className={`
            cursor-pointer
    flex items-center justify-center
   h-9 rounded-lg
     hover:bg-muted
    transition-all duration-200
    ${isActive ? "bg-muted" : ""}
    ${!isExpanded ? "justify-center w-9" : "justify-start w-full gap-2 px-2"}
        `}
      tabIndex={0}
    >
      <span>
        <Settings className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"></Settings>
      </span>
      {isExpanded ? (
        <span className="text-sm ml-2 select-none">Organization Settings</span>
      ) : null}
      <span
        className={`absolute left-0 right-0 mx-auto w-3 h-3 rounded-full pointer-events-none blur opacity-70 animate-pulse`}
      ></span>
    </button>
  );
}
