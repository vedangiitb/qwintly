export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 overflow-y-auto text-foreground  bg-background">
      {children}
    </div>
  );
}
