export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full px-4 md:px-56 py-10 flex flex-col gap-8">
      {children}
    </div>
  );
}
