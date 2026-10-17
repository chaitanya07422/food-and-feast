import { formatInr, type MenuItem } from "@/lib/api";

export function DishCard({ item }: { item: MenuItem }) {
  const veg =
    item.foodType === "vegetarian"
      ? "Veg"
      : item.foodType === "non_vegetarian"
        ? "Non-veg"
        : null;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-soft)] transition duration-300 hover:-translate-y-0.5 hover:border-burgundy/25">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-ivory-deep">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={
              item.imageAlt?.toLowerCase().includes("temporary")
                ? item.name
                : item.imageAlt || item.name
            }
            className="absolute inset-0 h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[linear-gradient(145deg,#ebe2d4,#f6f0e6)] px-4 text-center">
            <p className="text-[0.65rem] tracking-[0.18em] text-muted uppercase">
              Photo coming soon
            </p>
          </div>
        )}
        {!item.isAvailable ? (
          <span className="absolute top-3 left-3 rounded bg-charcoal/80 px-2 py-1 text-[0.65rem] text-ivory">
            Unavailable
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 px-4 pt-4 pb-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-[1.35rem] leading-snug text-charcoal">
            {item.name}
          </h3>
          <p className="shrink-0 pt-1 text-sm font-semibold tracking-wide text-burgundy">
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
