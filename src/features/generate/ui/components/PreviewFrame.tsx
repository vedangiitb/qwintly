import { Sun } from "lucide-react";

export default function PreviewFrame() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border/50 rounded-xl bg-background/50 backdrop-blur-sm m-2">
      <div className="text-center p-8 flex flex-col items-center">
        <div className="bg-muted w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-sm transform -rotate-3 transition-transform hover:rotate-0">
          <Sun size={26} className="text-muted-foreground" />
        </div>
        <h4 className="font-semibold text-foreground tracking-tight mb-2">No Preview Available</h4>
        <p className="text-sm max-w-[260px] text-muted-foreground/80 leading-relaxed text-balance">
          Website preview will appear here once the generation is complete.
        </p>
      </div>
    </div>
  );
}
