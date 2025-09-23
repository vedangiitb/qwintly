export default function TypingIndicator({
  generatingsite,
}: {
  generatingsite: boolean;
}) {
  return (
    <div className="flex items-center gap-2 ml-4 my-4 animate-in fade-in slide-in-from-left-2">
      <div className="flex space-x-1 bg-white/10 px-3 py-1 rounded-full shadow border backdrop-blur-sm">
        <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce"></span>
        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-150"></span>
        <span className="w-1.5 h-1.5 bg-pink-300 rounded-full animate-bounce delay-300"></span>
      </div>
      <span className="text-xs text-muted-foreground font-medium tracking-wide ml-2">
        {generatingsite ? "Generating your website..." : "Thinking..."}
      </span>
    </div>
  );
}
