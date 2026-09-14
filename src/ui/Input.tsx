import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import clsx from "clsx";

const fieldClass =
  "w-full bg-ink border border-line rounded-tag px-3 py-2 text-paper outline-none focus:border-amber text-sm";

export function TextField({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx(fieldClass, className)} {...props} />;
}

export function SelectField({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={clsx(fieldClass, className)} {...props}>
      {children}
    </select>
  );
}

export function TextAreaField({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={clsx(fieldClass, className)} {...props} />;
}

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm text-mute mb-1">{children}</label>;
}
