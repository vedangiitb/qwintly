import ReactMarkdown from "react-markdown";

export default function RenderAIResponse({ data }: { data: string }) {
  return (
    <div className="flex items-start gap-2 px-1 my-4">
      <div className="hidden sm:flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-br from-blue-300/50 via-indigo-300/70 to-teal-400/60 shadow-md border border-white/10 mt-2 ring-2 ring-teal-200/40 animate-in fade-in zoom-in-0">
        <span className="text-xl">⚡</span>
      </div>
      <div
        className="aibubble relative max-w-[85%] px-4 py-2 sm:py-2 rounded-2xl sm:rounded-3xl shadow-lg border-2 backdrop-blur-md animate-in fade-in slide-in-from-left-6 prose prose-invert prose-sm sm:prose-base"
        tabIndex={0}
      >
        <ReactMarkdown
          components={{
            code({ node, className, children, ...props }) {
              return (
                <code
                  className={`rounded px-1.5 py-0.5 text-sm font-mono bg-black/25 text-blue-100 ${
                    className || ""
                  }`}
                  {...props}
                >
                  {children}
                </code>
              );
            },
            pre({ node, children, ...props }) {
              return (
                <pre
                  className="rounded-xl p-3 overflow-x-auto my-3 !bg-zinc-900/80 !text-blue-200 shadow-inner border border-white/5"
                  {...props}
                >
                  {children}
                </pre>
              );
            },
          }}
        >
          {data}
        </ReactMarkdown>
        <span className="absolute -left-2 bottom-5 w-4 h-4 rounded-full bg-gradient-to-tr from-blue-300/60 via-purple-200 to-teal-100 blur-lg opacity-30 animate-pulse"></span>
      </div>
    </div>
  );
}
