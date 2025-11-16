interface HeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: HeaderProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
