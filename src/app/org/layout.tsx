
export default function GenerateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-1 overflow-hidden text-foreground">
      {children}
    </div>
  );
}
