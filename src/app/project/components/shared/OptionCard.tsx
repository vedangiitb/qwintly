export function OptionCard({
  selected,
  onClick,
  title,
  description,
  children,
}: {
  selected?: boolean;
  onClick: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      className={`
        border rounded-xl p-6 cursor-pointer transition hover:bg-muted/60
        relative bg-background
        ${selected ? "border-primary" : "border-muted"}
      `}
    >
      {selected && (
        <div className="absolute top-3 font-extrabold right-3 bg-muted text-muted-foreground p-2 rounded-full  text-xs">
          ✓
        </div>
      )}

      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}

      {children}
    </div>
  );
}
