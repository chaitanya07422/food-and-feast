import type { ReactNode } from "react";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[0.65rem] tracking-[0.18em] text-gold uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-3xl text-charcoal sm:text-[2rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export function AdminAlert({
  tone = "info",
  children,
}: {
  tone?: "success" | "error" | "info";
  children: ReactNode;
}) {
  const styles =
    tone === "success"
      ? "border-[color-mix(in_srgb,var(--ff-success)_28%,var(--ff-border))] bg-[color-mix(in_srgb,var(--ff-success)_8%,white)] text-[var(--ff-success)]"
      : tone === "error"
        ? "border-[color-mix(in_srgb,var(--ff-danger)_28%,var(--ff-border))] bg-[color-mix(in_srgb,var(--ff-danger)_8%,white)] text-[var(--ff-danger)]"
        : "border-border bg-surface text-muted";

  return (
    <p
      role={tone === "error" ? "alert" : undefined}
      className={`rounded-[var(--radius-md)] border px-3.5 py-2.5 text-sm ${styles}`}
    >
      {children}
    </p>
  );
}

export function AdminEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="admin-card flex flex-col items-center px-6 py-12 text-center">
      <p className="font-medium text-charcoal">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-md text-sm text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "success" | "warning" | "danger" | "neutral" | "accent";
}) {
  const map = {
    success:
      "bg-[color-mix(in_srgb,var(--ff-success)_12%,white)] text-[var(--ff-success)]",
    warning:
      "bg-[color-mix(in_srgb,var(--ff-gold)_18%,white)] text-[color-mix(in_srgb,var(--ff-gold)_80%,#261e1a)]",
    danger:
      "bg-[color-mix(in_srgb,var(--ff-danger)_10%,white)] text-[var(--ff-danger)]",
    accent:
      "bg-[color-mix(in_srgb,var(--ff-burgundy)_10%,white)] text-burgundy",
    neutral: "bg-ivory-deep text-muted",
  } as const;

  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide uppercase ${map[tone]}`}
    >
      {children}
    </span>
  );
}

export function Field({
  label,
  htmlFor,
  required,
  help,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  help?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="admin-label" htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-burgundy"> *</span> : null}
      </label>
      <div className="mt-1.5">{children}</div>
      {help && !error ? <p className="admin-help">{help}</p> : null}
      {error ? (
        <p className="mt-1 text-xs text-[var(--ff-danger)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function DishThumb({
  src,
  alt = "",
  size = "md",
}: {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dim =
    size === "sm" ? "h-10 w-10" : size === "lg" ? "h-14 w-14" : "h-12 w-12";
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-ivory-deep ${dim}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full items-center justify-center text-[0.55rem] tracking-wide text-muted uppercase">
          —
        </span>
      )}
    </div>
  );
}
