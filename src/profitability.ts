/**
 * Calculs de rentabilite centralises. Utilises a la fois par le formulaire de
 * niche, le moteur de matching des annonces entrantes, et la calculatrice
 * manuelle.
 */

export type Fees = {
  packagingFee: number; // cout fixe d'emballage
  platformFeePercent: number; // % preleve par Vinted / frais de protection acheteur repercutes
  miscFee: number; // frais divers (deplacement, materiel, etc.)
};

export const ZERO_FEES: Fees = { packagingFee: 0, platformFeePercent: 0, miscFee: 0 };

export function totalCost(buyPrice: number, fees: Fees = ZERO_FEES): number {
  return buyPrice + fees.packagingFee + fees.miscFee;
}

export function netResale(resalePrice: number, fees: Fees = ZERO_FEES): number {
  return resalePrice - resalePrice * (fees.platformFeePercent / 100);
}

export function estimateFromMultiplier(buyPrice: number, multiplier: number) {
  return round2(buyPrice * multiplier);
}

export function computeDeal(buyPrice: number, resalePrice: number, fees: Fees = ZERO_FEES) {
  const cost = totalCost(buyPrice, fees);
  const netSale = netResale(resalePrice, fees);
  const profit = round2(netSale - cost);
  const marginPercent = netSale > 0 ? round2((profit / netSale) * 100) : 0;
  const roiPercent = cost > 0 ? round2((profit / cost) * 100) : 0;
  const multiplier = buyPrice > 0 ? round2(resalePrice / buyPrice) : 0;
  return {
    cost: round2(cost),
    netSale: round2(netSale),
    profit,
    marginPercent,
    roiPercent,
    multiplier,
  };
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
