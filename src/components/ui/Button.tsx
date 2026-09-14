import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Variant = "primary" | "ghost" | "danger";

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base = "px-4 py-2 rounded-tag text-sm font-medium transition-opacity disabled:opacity-50";
  const styles: Record<Variant, string> = {
    primary: "bg-amber text-ink hover:opacity-90",
    ghost: "bg-transparent border border-line text-paper hover:border-mute",
    danger: "bg-transparent border border-clay text-clay hover:bg-clay/10",
  };
  return <button className={clsx(base, styles[variant], className)} {...props} />;
}
