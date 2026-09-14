import clsx from "clsx";

const STYLES: Record<string, string> = {
  ACTIVE: "bg-sage-soft text-sage border-sage/40",
  PAUSED: "bg-line text-mute border-line",
  NOUVELLE: "bg-amber-soft text-amber border-amber/40",
  IGNOREE: "bg-line text-mute border-line",
  ACHETEE: "bg-sage-soft text-sage border-sage/40",
  REVENDUE: "bg-sage-soft text-sage border-sage/40",
  NON_RENTABLE: "bg-clay-soft text-clay border-clay/40",
};

const LABELS: Record<string, string> = {
  ACTIVE: "Active",
  PAUSED: "Pause",
  NOUVELLE: "Nouvelle",
  IGNOREE: "Ignoree",
  ACHETEE: "Achetee",
  REVENDUE: "Revendue",
  NON_RENTABLE: "Non rentable",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        "inline-block px-2 py-0.5 rounded-tag text-xs border",
        STYLES[status] ?? "bg-line text-mute border-line"
      )}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
