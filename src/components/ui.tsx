import { Loader2 } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-linear-to-b from-gold to-gold-dark text-white shadow-sm hover:brightness-110",
  secondary: "border border-line bg-white text-navy hover:border-navy/40",
  danger: "border border-danger/30 bg-white text-danger hover:bg-danger hover:text-white",
  ghost: "text-body hover:bg-navy/5 hover:text-navy",
};

export function Button({
  variant = "primary",
  loading = false,
  className = "",
  children,
  disabled,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; loading?: boolean }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-sm font-semibold text-navy">{label}</span>
      {children}
      {error ? (
        <span className="text-xs font-medium text-danger">{error}</span>
      ) : (
        hint && <span className="text-xs text-body">{hint}</span>
      )}
    </label>
  );
}

const control =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-body/60 focus:border-gold focus:ring-3 focus:ring-gold/20 aria-invalid:border-danger";

export function Input(props: ComponentProps<"input">) {
  return <input className={control} {...props} />;
}

export function Textarea(props: ComponentProps<"textarea">) {
  return <textarea className={`${control} min-h-24 resize-y`} {...props} />;
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span className="flex flex-col">
        <span className="text-sm font-semibold text-navy">{label}</span>
        {description && <span className="text-xs text-body">{description}</span>}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-line transition peer-checked:bg-success peer-focus-visible:ring-3 peer-focus-visible:ring-gold/40 after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" />
    </label>
  );
}

export function Card({ title, children, className = "", actions }: {
  title?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}) {
  return (
    <section className={`rounded-2xl border border-line bg-white p-5 lg:p-6 ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="font-display text-base font-semibold text-navy">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageHeader({ title, description, actions }: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy lg:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-body">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Badge({ tone, children }: { tone: "success" | "muted" | "gold"; children: ReactNode }) {
  const tones = {
    success: "bg-success/10 text-success",
    muted: "bg-navy/5 text-body",
    gold: "bg-gold/15 text-gold-dark",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Alert({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-medium text-danger">
      {children}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center py-16 text-body">
      <Loader2 className="size-6 animate-spin" />
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
      <p className="font-display font-semibold text-navy">{title}</p>
      <p className="max-w-sm text-sm text-body">{text}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
