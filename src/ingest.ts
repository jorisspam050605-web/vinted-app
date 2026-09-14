import { prisma } from "./prisma";
import { estimateForNiche, matchesNiche } from "./matching";
import { notifyOpportunity } from "./notifications";
import type { Condition } from "@prisma/client";

export type IncomingListingInput = {
  nicheId?: string;
  title: string;
  brand?: string;
  price: number;
  size?: string;
  condition?: Condition;
  photoUrl?: string;
  listingUrl: string;
  publishedAt?: string;
  source: string;
};

/**
 * Logique partagee entre l'ajout manuel (/api/opportunities) et l'ingestion
 * webhook (/api/webhooks/watcher): compare une annonce entrante aux niches
 * actives d'UN utilisateur donne (ou a une niche precise de cet utilisateur),
 * cree les opportunites correspondantes et declenche ses notifications.
 */
export async function ingestListing(userId: string, data: IncomingListingInput) {
  const settings = await prisma.settings.findUnique({ where: { userId } });
  const fees = {
    packagingFee: settings?.packagingFee ?? 0,
    platformFeePercent: settings?.platformFeePercent ?? 0,
    miscFee: settings?.miscFee ?? 0,
  };

  const targetNiches = data.nicheId
    ? await prisma.niche.findMany({ where: { id: data.nicheId, userId } })
    : await prisma.niche.findMany({ where: { userId, status: "ACTIVE" } });

  const created = [];
  for (const niche of targetNiches) {
    const isDirectAssign = Boolean(data.nicheId);
    const matches =
      isDirectAssign ||
      matchesNiche(
        {
          title: data.title,
          brand: data.brand,
          price: data.price,
          size: data.size,
          condition: data.condition,
        },
        niche
      );
    if (!matches) continue;

    const estimate = estimateForNiche(data.price, niche, fees);

    const opportunity = await prisma.opportunity.create({
      data: {
        userId,
        nicheId: niche.id,
        title: data.title,
        brand: data.brand,
        price: data.price,
        size: data.size,
        condition: data.condition,
        photoUrl: data.photoUrl || undefined,
        listingUrl: data.listingUrl,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
        source: data.source,
        estimatedResale: estimate.estimatedResale,
        estimatedMargin: estimate.estimatedMargin,
        estimatedMultiplier: estimate.estimatedMultiplier,
      },
    });
    created.push(opportunity);

    notifyOpportunity(userId, {
      id: opportunity.id,
      title: opportunity.title,
      brand: opportunity.brand,
      price: opportunity.price,
      size: opportunity.size,
      condition: opportunity.condition,
      listingUrl: opportunity.listingUrl,
      estimatedResale: opportunity.estimatedResale,
      estimatedMargin: opportunity.estimatedMargin,
      estimatedMultiplier: opportunity.estimatedMultiplier,
      nicheName: niche.name,
    }).catch(() => {});
  }

  return created;
}
