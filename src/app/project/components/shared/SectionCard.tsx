export function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="border rounded-xl p-6 bg-background shadow-sm">
      {children}
    </div>
  );
}
