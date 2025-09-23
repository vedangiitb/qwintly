export default function RenderUserMessage({ data }: { data: string }) {
  return (
    <div className="flex justify-end px-1">
      <div
        className="relative max-w-[80%] px-4 sm:py-2 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-teal-500/100 via-fuchsia-600/100 to-purple-800/100 text-white shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-right-6"
        tabIndex={0}
      >
        {data}
        <span className="absolute -right-2 bottom-3 w-4 h-4 rounded-full bg-gradient-to-tr from-teal-300 via-purple-400 to-pink-200 blur-lg opacity-30 animate-pulse"></span>
      </div>
    </div>
  );
}
