import { HTMLAttributes } from "react";
import clsx from "clsx";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "bg-panel border border-line rounded-tag p-5 tag-corner",
        className
      )}
      {...props}
    />
  );
}
