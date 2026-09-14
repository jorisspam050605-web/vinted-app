"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Label, TextField } from "@/components/ui/Input";
import { computeDeal } from "@/lib/profitability";

export default function CalculatorPage() {
  const [buyPrice, setBuyPrice] = useState(7);
  const [resalePrice, setResalePrice] = useState(18);
  const [packagingFee, setPackagingFee] = useState(0);
  const [platformFeePercent, setPlatformFeePercent] = useState(0);
  const [miscFee, setMiscFee] = useState(0);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s) => {
        setPackagingFee(s.packagingFee ?? 0);
        setPlatformFeePercent(s.platformFeePercent ?? 0);
        setMiscFee(s.miscFee ?? 0);
      });
  }, []);

  const deal = useMemo(
    () =>
      computeDeal(buyPrice, resalePrice, {
        packagingFee,
        platformFeePercent,
        miscFee,
      }),
    [buyPrice, resalePrice, packagingFee, platformFeePercent, miscFee]
  );

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-paper mb-6">
        Calculatrice de rentabilite
      </h1>

      <Card className="mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Prix d'achat (€)</Label>
            <TextField
              type="number"
              step="0.5"
              value={buyPrice}
              onChange={(e) => setBuyPrice(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label>Prix de revente (€)</Label>
            <TextField
              type="number"
              step="0.5"
              value={resalePrice}
              onChange={(e) => setResalePrice(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <p className="text-mute text-xs mb-2">
          Frais (pre-remplis depuis les reglages, modifiables ici pour ce calcul ponctuel)
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Emballage (€)</Label>
            <TextField
              type="number"
              step="0.1"
              value={packagingFee}
              onChange={(e) => setPackagingFee(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label>Commission / frais (%)</Label>
            <TextField
              type="number"
              step="1"
              value={platformFeePercent}
              onChange={(e) => setPlatformFeePercent(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label>Frais divers (€)</Label>
            <TextField
              type="number"
              step="0.1"
              value={miscFee}
              onChange={(e) => setMiscFee(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      </Card>

      <Card>
        <dl className="space-y-3 tabular">
          <Row label="Cout total (achat + frais)" value={`${deal.cost.toFixed(2)} €`} />
          <Row label="Revente nette (apres commission)" value={`${deal.netSale.toFixed(2)} €`} />
          <Row label="Benefice estime" value={`${deal.profit.toFixed(2)} €`} accent="sage" />
          <Row label="Marge (%)" value={`${deal.marginPercent.toFixed(1)} %`} />
          <Row label="ROI (%)" value={`${deal.roiPercent.toFixed(1)} %`} />
          <Row label="Multiplicateur" value={`x${deal.multiplier.toFixed(2)}`} accent="amber" />
        </dl>
      </Card>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: "amber" | "sage" }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-mute text-sm">{label}</dt>
      <dd
        className={`font-medium ${
          accent === "amber" ? "text-amber" : accent === "sage" ? "text-sage" : "text-paper"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
