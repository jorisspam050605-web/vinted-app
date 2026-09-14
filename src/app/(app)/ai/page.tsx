"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, TextField } from "@/components/ui/Input";

type Analysis = {
  whyInteresting: string;
  observedPriceRange: string | null;
  resalePotential: string;
  competitionLevel: string;
  fakeDealRisk: string;
  alternativeKeywords: string[];
  similarBrands: string[];
  interestingModels: string[];
  suggestedBuyRange: string;
  suggestedResaleRange: string;
  dataConfidence: string;
  caveats: string;
};

export default function AiAnalysisPage() {
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [maxBuyPrice, setMaxBuyPrice] = useState("7");
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAnalysis(null);
    const res = await fetch("/api/ai/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brand,
        category,
        maxBuyPrice: parseFloat(maxBuyPrice),
        keywords,
      }),
    });
    setLoading(false);
    const body = await res.json();
    if (!res.ok) {
      setError(body?.error ?? "Erreur lors de l'analyse.");
      return;
    }
    setAnalysis(body);
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-semibold text-paper mb-2">Analyse IA d'une niche</h1>
      <p className="text-mute text-sm mb-6">
        L'IA cherche des informations reelles sur le web quand c'est possible. Si elle n'a pas
        de donnee fiable, elle le dit au lieu d'inventer un chiffre.
      </p>

      <Card className="mb-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <Label>Marque</Label>
            <TextField required value={brand} onChange={(e) => setBrand(e.target.value)} />
          </div>
          <div>
            <Label>Article</Label>
            <TextField required value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div>
            <Label>Prix d'achat maximum (€)</Label>
            <TextField
              type="number"
              step="0.5"
              value={maxBuyPrice}
              onChange={(e) => setMaxBuyPrice(e.target.value)}
            />
          </div>
          <div>
            <Label>Mots-cles deja envisages (optionnel)</Label>
            <TextField value={keywords} onChange={(e) => setKeywords(e.target.value)} />
          </div>
          <div className="col-span-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Analyse en cours..." : "Analyser cette niche"}
            </Button>
          </div>
        </form>
      </Card>

      {error && (
        <Card className="mb-6 border-clay/40">
          <p className="text-clay text-sm">{error}</p>
        </Card>
      )}

      {analysis && (
        <div className="space-y-4">
          <Card>
            <h2 className="font-display text-base font-semibold text-paper mb-2">
              Pourquoi cette niche peut etre interessante
            </h2>
            <p className="text-paper text-sm">{analysis.whyInteresting}</p>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <h3 className="text-mute text-xs mb-1">Prix moyen observe</h3>
              <p className="text-paper text-sm">
                {analysis.observedPriceRange ?? "Aucune donnee fiable trouvee."}
              </p>
            </Card>
            <Card>
              <h3 className="text-mute text-xs mb-1">Niveau de concurrence</h3>
              <p className="text-paper text-sm">{analysis.competitionLevel}</p>
            </Card>
            <Card>
              <h3 className="text-mute text-xs mb-1">Potentiel de revente</h3>
              <p className="text-paper text-sm">{analysis.resalePotential}</p>
            </Card>
            <Card>
              <h3 className="text-mute text-xs mb-1">Risque de fausse bonne affaire</h3>
              <p className="text-paper text-sm">{analysis.fakeDealRisk}</p>
            </Card>
            <Card>
              <h3 className="text-mute text-xs mb-1">Fourchette d'achat conseillee</h3>
              <p className="text-amber text-sm font-medium">{analysis.suggestedBuyRange}</p>
            </Card>
            <Card>
              <h3 className="text-mute text-xs mb-1">Fourchette de revente conseillee</h3>
              <p className="text-sage text-sm font-medium">{analysis.suggestedResaleRange}</p>
            </Card>
          </div>

          <Card>
            <h3 className="text-mute text-xs mb-2">Mots-cles alternatifs</h3>
            <p className="text-paper text-sm mb-3">{analysis.alternativeKeywords.join(", ")}</p>
            <h3 className="text-mute text-xs mb-2">Marques similaires</h3>
            <p className="text-paper text-sm mb-3">{analysis.similarBrands.join(", ")}</p>
            <h3 className="text-mute text-xs mb-2">Modeles / references interessants</h3>
            <p className="text-paper text-sm">{analysis.interestingModels.join(", ")}</p>
          </Card>

          <Card className="border-line">
            <p className="text-mute text-xs mb-1">
              Fiabilite des donnees : {analysis.dataConfidence}
            </p>
            <p className="text-mute text-xs">{analysis.caveats}</p>
          </Card>
        </div>
      )}
    </div>
  );
}
