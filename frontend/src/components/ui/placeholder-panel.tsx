type PlaceholderPanelProps = {
  title: string;
  children: React.ReactNode;
};

export function PlaceholderPanel({ title, children }: PlaceholderPanelProps) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-border bg-surface/80 p-6 shadow-[var(--shadow-soft)] sm:p-8">
      <p className="text-xs tracking-[0.2em] text-gold uppercase">Placeholder</p>
      <h2 className="mt-2 font-display text-2xl text-charcoal sm:text-3xl">
        {title}
      </h2>
      <div className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
        {children}
      </div>
    </div>
  );
}
