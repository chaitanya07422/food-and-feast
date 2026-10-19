import { formatInr, type MenuItem } from "@/lib/api";

export function DishCard({ item }: { item: MenuItem }) {
  const veg =
    item.foodType === "vegetarian"
      ? "Veg"
      : item.foodType === "non_vegetarian"
        ? "Non-veg"
        : null;

  const photo = item.imageUrl || undefined;
  const alt = item.imageAlt || item.name;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-soft)] transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-burgundy/25 hover:shadow-[var(--shadow-card-hover)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-ivory-deep">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={alt}
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            loading="lazy"
          />
        ) : (
          <div
            className="flex h-full flex-col items-center justify-center gap-2 bg-[linear-gradient(155deg,#ebe2d4_0%,#f6f0e6_48%,#e8dcc8_100%)] px-4 text-center"
            aria-hidden={!item.name}
          >
            <span className="font-display text-2xl text-burgundy/35">
              {item.name.charAt(0)}
            </span>
            <p className="text-[0.65rem] tracking-[0.16em] text-muted uppercase">
              Photo coming soon
            </p>
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-0 bg-burgundy-deep/0 transition-colors duration-300 group-hover:bg-burgundy-deep/15 motion-reduce:transition-none"
          aria-hidden
        />
        {!item.isAvailable ? (
          <span className="absolute top-3 left-3 z-[1] rounded bg-charcoal/80 px-2 py-1 text-[0.65rem] text-ivory">
            Unavailable
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 px-4 pt-4 pb-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-[1.3rem] leading-snug text-charcoal sm:text-[1.35rem]">
            {item.name}
          </h3>
          <p className="shrink-0 pt-1 text-sm font-semibold tracking-wide text-burgundy tabular-nums">
            {formatInr(item.price)}
          </p>
        </div>
        {item.description ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted">
            {item.description}
          </p>
        ) : null}
        {veg ? (
          <p className="mt-auto pt-1 text-[0.65rem] tracking-[0.16em] text-muted uppercase">
            {veg}
          </p>
        ) : null}
      </div>
    </article>
  );
}
