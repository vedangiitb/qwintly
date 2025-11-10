export default function GenerateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-1 w-full overflow-hidden text-foreground">
      {children}
    </div>
  );
}
