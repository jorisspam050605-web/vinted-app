import type { Condition } from "@prisma/client";
import { computeDeal, estimateFromMultiplier, type Fees } from "./profitability";

/**
 * Ordre de "qualite" des etats, du meilleur au moins bon, pour pouvoir
 * comparer une annonce entrante a l'etat minimum accepte par une niche.
 */
const CONDITION_RANK: Record<Condition, number> = {
  NEUF_AVEC_ETIQUETTE: 5,
  NEUF_SANS_ETIQUETTE: 4,
  TRES_BON_ETAT: 3,
  BON_ETAT: 2,
  SATISFAISANT: 1,
};

export type IncomingListing = {
  title: string;
  brand?: string | null;
  price: number;
  size?: string | null;
  condition?: Condition | null;
  keywords?: string[]; // mots-cles detectes dans le titre/la description
};

export type NicheLike = {
  brands: string; // CSV
  category: string;
  keywords: string; // CSV
  size: string;
  minCondition: Condition;
  pricingMode: "MULTIPLIER" | "FIXED";
  maxBuyPrice: number;
  targetResalePrice?: number | null;
  targetMultiplier?: number | null;
};

function csvToList(csv: string): string[] {
  return csv
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Verifie si une annonce entrante correspond aux criteres d'une niche. */
export function matchesNiche(listing: IncomingListing, niche: NicheLike): boolean {
  if (listing.price > niche.maxBuyPrice) return false;

  const brands = csvToList(niche.brands);
  if (brands.length > 0) {
    const brandOk =
      listing.brand && brands.includes(listing.brand.trim().toLowerCase());
    const titleMatch = brands.some((b) => listing.title.toLowerCase().includes(b));
    if (!brandOk && !titleMatch) return false;
  }

  if (niche.size !== "Toutes" && listing.size) {
    if (listing.size.trim().toLowerCase() !== niche.size.trim().toLowerCase()) {
      return false;
    }
  }

  if (listing.condition) {
    if (CONDITION_RANK[listing.condition] < CONDITION_RANK[niche.minCondition]) {
      return false;
    }
  }

  const keywords = csvToList(niche.keywords);
  if (keywords.length > 0) {
    const haystack = listing.title.toLowerCase();
    const anyKeyword = keywords.some((k) => haystack.includes(k));
    if (!anyKeyword) return false;
  }

  return true;
}

/** Calcule la revente cible et la marge estimee pour une annonce/niche donnee. */
export function estimateForNiche(
  buyPrice: number,
  niche: NicheLike,
  fees: Fees
) {
  const targetResale =
    niche.pricingMode === "FIXED"
      ? niche.targetResalePrice ?? 0
      : estimateFromMultiplier(buyPrice, niche.targetMultiplier ?? 1);

  const deal = computeDeal(buyPrice, targetResale, fees);
  return {
    estimatedResale: targetResale,
    estimatedMargin: deal.profit,
    estimatedMultiplier: deal.multiplier,
  };
}
