"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";

type Stats = {
  activeNiches: number;
  opportunitiesDetected: number;
  boughtCount: number;
  soldCount: number;
  revenue: number;
  estimatedProfit: number;
  realProfit: number;
  avgRoiPercent: number;
  bestNiche: { name: string; profit: number; count: number } | null;
  worstNiche: { name: string; profit: number; count: number } | null;
  byStatus: Record<string, number>;
};

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) return <p className="text-mute">Chargement...</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-paper mb-6">Statistiques</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Metric label="Niches actives" value={stats.activeNiches} />
        <Metric label="Opportunites detectees" value={stats.opportunitiesDetected} />
        <Metric label="Articles achetes" value={stats.boughtCount} />
        <Metric label="Articles revendus" value={stats.soldCount} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Metric label="Chiffre d'affaires" value={`${stats.revenue.toFixed(2)} €`} accent="amber" />
        <Metric label="Benefice reel" value={`${stats.realProfit.toFixed(2)} €`} accent="sage" />
        <Metric
          label="Benefice estime (en cours)"
          value={`${stats.estimatedProfit.toFixed(2)} €`}
        />
        <Metric label="ROI moyen (ventes reelles)" value={`${stats.avgRoiPercent.toFixed(0)} %`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <h2 className="font-display text-base font-semibold text-paper mb-2">
            Meilleure niche
          </h2>
          {stats.bestNiche ? (
            <p className="text-paper">
              {stats.bestNiche.name} — {stats.bestNiche.profit.toFixed(2)} € sur{" "}
              {stats.bestNiche.count} vente{stats.bestNiche.count !== 1 ? "s" : ""}
            </p>
          ) : (
            <p className="text-mute text-sm">Pas encore de vente enregistree.</p>
          )}
        </Card>
        <Card>
          <h2 className="font-display text-base font-semibold text-paper mb-2">
            Niche la moins rentable
          </h2>
          {stats.worstNiche ? (
            <p className="text-paper">
              {stats.worstNiche.name} — {stats.worstNiche.profit.toFixed(2)} € sur{" "}
              {stats.worstNiche.count} vente{stats.worstNiche.count !== 1 ? "s" : ""}
            </p>
          ) : (
            <p className="text-mute text-sm">Pas assez de donnees.</p>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="font-display text-base font-semibold text-paper mb-4">
          Repartition par statut
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 tabular">
          {Object.entries(stats.byStatus).map(([key, value]) => (
            <div key={key}>
              <p className="text-mute text-xs">{key.replace("_", " ")}</p>
              <p className="text-paper text-lg font-medium">{value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: "amber" | "sage";
}) {
  return (
    <Card>
      <p className="text-mute text-xs mb-1">{label}</p>
      <p
        className={`font-display text-2xl font-semibold tabular ${
          accent === "amber" ? "text-amber" : accent === "sage" ? "text-sage" : "text-paper"
        }`}
      >
        {value}
      </p>
    </Card>
  );
}
