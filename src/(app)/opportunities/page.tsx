"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, SelectField, TextField } from "@/components/ui/Input";
import { StatusBadge } from "@/components/StatusBadge";
import { CONDITION_LABELS, OPPORTUNITY_STATUS_LABELS } from "@/types";

type Niche = { id: string; name: string };
type Opportunity = {
  id: string;
  title: string;
  brand: string | null;
  price: number;
  size: string | null;
  condition: string | null;
  listingUrl: string;
  estimatedResale: number;
  estimatedMargin: number;
  estimatedMultiplier: number;
  status: string;
  source: string;
  detectedAt: string;
  niche: { name: string };
  nicheId: string;
};

export default function OpportunitiesPage() {
  const [niches, setNiches] = useState<Niche[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filterNiche, setFilterNiche] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    setLoading(true);
    const [nRes, oRes] = await Promise.all([
      fetch("/api/niches").then((r) => r.json()),
      fetch(
        `/api/opportunities?${filterNiche ? `nicheId=${filterNiche}&` : ""}${
          filterStatus ? `status=${filterStatus}` : ""
        }`
      ).then((r) => r.json()),
    ]);
    setNiches(nRes);
    setOpportunities(oRes);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterNiche, filterStatus]);

  async function updateStatus(id: string, status: string) {
    let realSalePrice: number | undefined;
    if (status === "REVENDUE") {
      const input = prompt("Prix de vente reel (€) :");
      if (!input) return;
      realSalePrice = parseFloat(input);
    }
    await fetch(`/api/opportunities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, realSalePrice }),
    });
    loadAll();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl font-semibold text-paper">Historique</h1>
        <Button onClick={() => setShowAddForm((s) => !s)}>
          {showAddForm ? "Fermer" : "+ Ajouter une annonce trouvee"}
        </Button>
      </div>

      {showAddForm && (
        <ManualAddForm
          niches={niches}
          onDone={() => {
            setShowAddForm(false);
            loadAll();
          }}
        />
      )}

      <div className="flex gap-3 mb-4 flex-wrap">
        <SelectField
          value={filterNiche}
          onChange={(e) => setFilterNiche(e.target.value)}
          className="w-48"
        >
          <option value="">Toutes les niches</option>
          {niches.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </SelectField>
        <SelectField
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-48"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(OPPORTUNITY_STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </SelectField>
      </div>

      {loading ? (
        <p className="text-mute">Chargement...</p>
      ) : opportunities.length === 0 ? (
        <p className="text-mute">Aucune opportunite pour ces filtres.</p>
      ) : (
        <div className="space-y-3">
          {opportunities.map((o) => (
            <Card key={o.id} className="flex items-center justify-between flex-wrap gap-4">
              <div className="min-w-[200px]">
                <p className="text-paper font-medium">
                  {o.brand ? `${o.brand} — ` : ""}
                  {o.title}
                </p>
                <p className="text-mute text-sm">
                  {o.niche.name}
                  {o.size ? ` · Taille ${o.size}` : ""}
                  {o.condition
                    ? ` · ${CONDITION_LABELS[o.condition as keyof typeof CONDITION_LABELS] ?? o.condition}`
                    : ""}
                  {" · "}
                  {new Date(o.detectedAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div className="flex items-center gap-6 tabular">
                <Metric label="Prix" value={`${o.price.toFixed(2)} €`} />
                <Metric label="Revente" value={`${o.estimatedResale.toFixed(2)} €`} />
                <Metric label="Marge" value={`${o.estimatedMargin.toFixed(2)} €`} accent />
                <Metric label="x" value={`x${o.estimatedMultiplier.toFixed(2)}`} />
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={o.status} />
                <a
                  href={o.listingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber text-sm hover:underline"
                >
                  Voir l'annonce
                </a>
                <SelectField
                  value={o.status}
                  onChange={(e) => updateStatus(o.id, e.target.value)}
                  className="w-40"
                >
                  {Object.entries(OPPORTUNITY_STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </SelectField>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="text-center">
      <p className="text-mute text-xs">{label}</p>
      <p className={accent ? "text-sage font-medium" : "text-paper font-medium"}>{value}</p>
    </div>
  );
}

function ManualAddForm({ niches, onDone }: { niches: Niche[]; onDone: () => void }) {
  const [nicheId, setNicheId] = useState("");
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [size, setSize] = useState("");
  const [condition, setCondition] = useState("");
  const [listingUrl, setListingUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setResult(null);
    const res = await fetch("/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nicheId: nicheId || undefined,
        title,
        brand: brand || undefined,
        price: parseFloat(price),
        size: size || undefined,
        condition: condition || undefined,
        listingUrl,
      }),
    });
    setSaving(false);
    const body = await res.json();
    if (!res.ok) {
      setError("Verifie les champs.");
      return;
    }
    if (body.created?.length > 0) {
      setResult(`Ajoutee a ${body.created.length} niche(s) correspondante(s).`);
      onDone();
    } else {
      setResult(body.message ?? "Aucune niche active ne correspond a cette annonce.");
    }
  }

  return (
    <Card className="mb-6">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Niche (optionnel — sinon comparee a toutes les niches actives)</Label>
          <SelectField value={nicheId} onChange={(e) => setNicheId(e.target.value)}>
            <option value="">Detection automatique</option>
            {niches.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </SelectField>
        </div>
        <div>
          <Label>Titre de l'annonce</Label>
          <TextField required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <Label>Marque</Label>
          <TextField value={brand} onChange={(e) => setBrand(e.target.value)} />
        </div>
        <div>
          <Label>Prix (€)</Label>
          <TextField
            type="number"
            step="0.5"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div>
          <Label>Taille</Label>
          <TextField value={size} onChange={(e) => setSize(e.target.value)} />
        </div>
        <div>
          <Label>Etat</Label>
          <SelectField value={condition} onChange={(e) => setCondition(e.target.value)}>
            <option value="">Non precise</option>
            {Object.entries(CONDITION_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="md:col-span-2">
          <Label>Lien vers l'annonce Vinted</Label>
          <TextField
            required
            placeholder="https://www.vinted.fr/items/..."
            value={listingUrl}
            onChange={(e) => setListingUrl(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Ajout..." : "Ajouter"}
          </Button>
        </div>
        {error && <p className="text-clay text-sm md:col-span-3">{error}</p>}
        {result && <p className="text-sage text-sm md:col-span-3">{result}</p>}
      </form>
    </Card>
  );
}
