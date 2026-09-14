"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Label, SelectField, TextField } from "./ui/Input";
import { CATEGORY_OPTIONS, CONDITION_LABELS, SIZE_OPTIONS } from "@/types";
import { computeDeal } from "@/lib/profitability";

export type NicheFormValues = {
  name: string;
  brands: string;
  category: string;
  keywords: string;
  size: string;
  minCondition: keyof typeof CONDITION_LABELS;
  pricingMode: "MULTIPLIER" | "FIXED";
  maxBuyPrice: number;
  targetResalePrice: number | null;
  targetMultiplier: number | null;
};

const DEFAULTS: NicheFormValues = {
  name: "",
  brands: "",
  category: CATEGORY_OPTIONS[0],
  keywords: "",
  size: "Toutes",
  minCondition: "BON_ETAT",
  pricingMode: "MULTIPLIER",
  maxBuyPrice: 7,
  targetResalePrice: 18,
  targetMultiplier: 2.5,
};

export function NicheForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Partial<NicheFormValues>;
  submitLabel: string;
  onSubmit: (values: NicheFormValues) => Promise<void>;
}) {
  const [values, setValues] = useState<NicheFormValues>({ ...DEFAULTS, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const resalePrice =
    values.pricingMode === "FIXED"
      ? values.targetResalePrice ?? 0
      : values.maxBuyPrice * (values.targetMultiplier ?? 0);

  const deal = useMemo(
    () => computeDeal(values.maxBuyPrice, resalePrice),
    [values.maxBuyPrice, resalePrice]
  );

  function set<K extends keyof NicheFormValues>(key: K, value: NicheFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit(values);
    } catch (err: any) {
      setError(err?.message ?? "Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <h2 className="font-display text-base font-semibold text-paper mb-4">
            Informations produit
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Nom de la niche</Label>
              <TextField
                required
                placeholder="Ex : Robin Ruth polos"
                value={values.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Label>Marque(s) — separees par des virgules</Label>
              <TextField
                required
                placeholder="Robin Ruth, Robin Ruth Amsterdam"
                value={values.brands}
                onChange={(e) => set("brands", e.target.value)}
              />
            </div>
            <div>
              <Label>Categorie</Label>
              <SelectField
                value={values.category}
                onChange={(e) => set("category", e.target.value)}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </SelectField>
            </div>
            <div>
              <Label>Taille</Label>
              <SelectField value={values.size} onChange={(e) => set("size", e.target.value)}>
                {SIZE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </SelectField>
            </div>
            <div className="col-span-2">
              <Label>Mots-cles — separes par des virgules (optionnel)</Label>
              <TextField
                placeholder="polo, amsterdam, souvenir"
                value={values.keywords}
                onChange={(e) => set("keywords", e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Label>Etat minimum</Label>
              <SelectField
                value={values.minCondition}
                onChange={(e) => set("minCondition", e.target.value as any)}
              >
                {Object.entries(CONDITION_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </SelectField>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-base font-semibold text-paper mb-4">Prix</h2>
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => set("pricingMode", "MULTIPLIER")}
              className={`flex-1 py-2 rounded-tag text-sm border ${
                values.pricingMode === "MULTIPLIER"
                  ? "border-amber text-amber bg-amber-soft"
                  : "border-line text-mute"
              }`}
            >
              Mode multiplicateur
            </button>
            <button
              type="button"
              onClick={() => set("pricingMode", "FIXED")}
              className={`flex-1 py-2 rounded-tag text-sm border ${
                values.pricingMode === "FIXED"
                  ? "border-amber text-amber bg-amber-soft"
                  : "border-line text-mute"
              }`}
            >
              Mode prix fixe
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Prix d'achat maximum (€)</Label>
              <TextField
                type="number"
                step="0.5"
                min="0"
                required
                value={values.maxBuyPrice}
                onChange={(e) => set("maxBuyPrice", parseFloat(e.target.value) || 0)}
              />
            </div>
            {values.pricingMode === "FIXED" ? (
              <div>
                <Label>Prix de revente cible (€)</Label>
                <TextField
                  type="number"
                  step="0.5"
                  min="0"
                  required
                  value={values.targetResalePrice ?? 0}
                  onChange={(e) => set("targetResalePrice", parseFloat(e.target.value) || 0)}
                />
              </div>
            ) : (
              <div>
                <Label>Multiplicateur cible</Label>
                <TextField
                  type="number"
                  step="0.1"
                  min="1"
                  required
                  value={values.targetMultiplier ?? 0}
                  onChange={(e) => set("targetMultiplier", parseFloat(e.target.value) || 0)}
                />
              </div>
            )}
          </div>
        </Card>

        {error && <p className="text-clay text-sm">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Enregistrement..." : submitLabel}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.push("/dashboard")}>
            Annuler
          </Button>
        </div>
      </div>

      <div>
        <Card className="sticky top-6">
          <h2 className="font-display text-base font-semibold text-paper mb-4">
            Rentabilite estimee
          </h2>
          <dl className="space-y-3 tabular">
            <Row label="Achat" value={`${values.maxBuyPrice.toFixed(2)} €`} />
            <Row label="Revente" value={`${resalePrice.toFixed(2)} €`} />
            <Row
              label="Multiplicateur"
              value={`x${deal.multiplier.toFixed(2)}`}
              accent="amber"
            />
            <Row label="Marge brute" value={`${deal.profit.toFixed(2)} €`} accent="sage" />
            <Row label="ROI" value={`${deal.roiPercent.toFixed(0)} %`} />
          </dl>
          <p className="text-mute text-xs mt-4">
            Les frais (emballage, commission, divers) definis dans les reglages sont appliques
            au moment ou une annonce reelle est detectee.
          </p>
        </Card>
      </div>
    </form>
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
