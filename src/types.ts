export type ConditionKey =
  | "NEUF_AVEC_ETIQUETTE"
  | "NEUF_SANS_ETIQUETTE"
  | "TRES_BON_ETAT"
  | "BON_ETAT"
  | "SATISFAISANT";

export const CONDITION_LABELS: Record<ConditionKey, string> = {
  NEUF_AVEC_ETIQUETTE: "Neuf avec etiquette",
  NEUF_SANS_ETIQUETTE: "Neuf sans etiquette",
  TRES_BON_ETAT: "Tres bon etat",
  BON_ETAT: "Bon etat",
  SATISFAISANT: "Satisfaisant",
};

export const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "Toutes"];

export const CATEGORY_OPTIONS = [
  "Polo",
  "Chemise",
  "T-shirt",
  "Pull",
  "Sweat",
  "Veste",
  "Pantalon",
  "Jean",
  "Chaussures",
  "Accessoires",
];

export type OpportunityStatusKey =
  | "NOUVELLE"
  | "IGNOREE"
  | "ACHETEE"
  | "REVENDUE"
  | "NON_RENTABLE";

export const OPPORTUNITY_STATUS_LABELS: Record<OpportunityStatusKey, string> = {
  NOUVELLE: "Nouvelle",
  IGNOREE: "Ignoree",
  ACHETEE: "Achetee",
  REVENDUE: "Revendue",
  NON_RENTABLE: "Non rentable",
};
