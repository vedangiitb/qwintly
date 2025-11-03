export default function GenerateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="h-screen text-foreground flex w-full">{children}</div>;
}
