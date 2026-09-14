"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { StatusBadge } from "./StatusBadge";
import clsx from "clsx";

export type NicheCardData = {
  id: string;
  name: string;
  brands: string;
  category: string;
  maxBuyPrice: number;
  pricingMode: "MULTIPLIER" | "FIXED";
  targetResalePrice: number | null;
  targetMultiplier: number | null;
  status: "ACTIVE" | "PAUSED";
  opportunityCount: number;
};

export function NicheCard({ niche }: { niche: NicheCardData }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const multiplier =
    niche.pricingMode === "MULTIPLIER"
      ? niche.targetMultiplier ?? 0
      : niche.maxBuyPrice > 0
      ? (niche.targetResalePrice ?? 0) / niche.maxBuyPrice
      : 0;

  async function toggleStatus() {
    setBusy(true);
    await fetch(`/api/niches/${niche.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: niche.status === "ACTIVE" ? "PAUSED" : "ACTIVE" }),
    });
    setBusy(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Supprimer la niche "${niche.name}" ? Cette action est definitive.`)) return;
    setBusy(true);
    await fetch(`/api/niches/${niche.id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <Card
      className={clsx(
        "border-l-4",
        niche.status === "ACTIVE" ? "border-l-amber" : "border-l-line"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-paper">{niche.name}</h3>
          <p className="text-mute text-sm">
            {niche.brands} · {niche.category}
          </p>
        </div>
        <StatusBadge status={niche.status} />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 tabular">
        <div>
          <p className="text-mute text-xs mb-0.5">Achat max</p>
          <p className="text-paper font-medium">{niche.maxBuyPrice.toFixed(2)} €</p>
        </div>
        <div>
          <p className="text-mute text-xs mb-0.5">Revente cible</p>
          <p className="text-paper font-medium">
            {niche.pricingMode === "FIXED"
              ? `${(niche.targetResalePrice ?? 0).toFixed(2)} €`
              : `x${(niche.targetMultiplier ?? 0).toFixed(2)}`}
          </p>
        </div>
        <div>
          <p className="text-mute text-xs mb-0.5">Multiplicateur</p>
          <p className="text-sage font-medium">x{multiplier.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-mute text-sm">
          {niche.opportunityCount} alerte{niche.opportunityCount !== 1 ? "s" : ""} recue
          {niche.opportunityCount !== 1 ? "s" : ""}
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={toggleStatus} disabled={busy}>
            {niche.status === "ACTIVE" ? "Mettre en pause" : "Activer"}
          </Button>
          <Link href={`/niches/${niche.id}`}>
            <Button variant="ghost">Modifier</Button>
          </Link>
          <Button variant="danger" onClick={handleDelete} disabled={busy}>
            Supprimer
          </Button>
        </div>
      </div>
    </Card>
  );
}
