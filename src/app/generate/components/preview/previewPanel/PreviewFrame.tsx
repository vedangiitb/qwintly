import { Sun } from "lucide-react";

export default function PreviewFrame() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border border-border rounded-lg bg-accent">
      <div className="text-center p-6">
        <div className="mx-auto bg-accent/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <Sun size={24} className="text-accent-foreground" />
        </div>
        <h4 className="font-medium mb-1">No Preview Available</h4>
        <p className="text-sm max-w-xs">
          Website preview will appear here after a website is generated.
        </p>
      </div>
    </div>
  );
}
