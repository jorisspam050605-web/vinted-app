import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type OpportunityRow = Awaited<ReturnType<typeof prisma.opportunity.findMany>>[number] & {
  niche: { name: string; id: string };
};

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const [activeNiches, allOpportunitiesRaw] = await Promise.all([
    prisma.niche.count({ where: { userId, status: "ACTIVE" } }),
    prisma.opportunity.findMany({
      where: { userId },
      include: { niche: { select: { name: true, id: true } } },
    }),
  ]);
  const allOpportunities = allOpportunitiesRaw as OpportunityRow[];

  const opportunitiesDetected = allOpportunities.length;
  const bought = allOpportunities.filter(
    (o: OpportunityRow) => o.status === "ACHETEE" || o.status === "REVENDUE"
  );
  const sold = allOpportunities.filter((o: OpportunityRow) => o.status === "REVENDUE");

  const revenue = sold.reduce((sum: number, o: OpportunityRow) => sum + (o.realSalePrice ?? 0), 0);
  const realProfit = sold.reduce(
    (sum: number, o: OpportunityRow) => sum + ((o.realSalePrice ?? 0) - o.price),
    0
  );
  const estimatedProfit = bought.reduce(
    (sum: number, o: OpportunityRow) => sum + o.estimatedMargin,
    0
  );

  const roiValues = sold
    .filter((o: OpportunityRow) => o.price > 0 && o.realSalePrice)
    .map((o: OpportunityRow) => ((o.realSalePrice! - o.price) / o.price) * 100);
  const avgRoi = roiValues.length
    ? roiValues.reduce((a: number, b: number) => a + b, 0) / roiValues.length
    : 0;

  const byNiche = new Map<string, { name: string; profit: number; count: number }>();
  for (const o of sold) {
    const key = o.nicheId;
    const entry = byNiche.get(key) ?? { name: o.niche.name, profit: 0, count: 0 };
    entry.profit += (o.realSalePrice ?? 0) - o.price;
    entry.count += 1;
    byNiche.set(key, entry);
  }
  const nicheStats = Array.from(byNiche.values()).sort((a, b) => b.profit - a.profit);

  return NextResponse.json({
    activeNiches,
    opportunitiesDetected,
    boughtCount: bought.length,
    soldCount: sold.length,
    revenue: round2(revenue),
    estimatedProfit: round2(estimatedProfit),
    realProfit: round2(realProfit),
    avgRoiPercent: round2(avgRoi),
    bestNiche: nicheStats[0] ?? null,
    worstNiche: nicheStats.length > 1 ? nicheStats[nicheStats.length - 1] : null,
    byStatus: {
      NOUVELLE: allOpportunities.filter((o: OpportunityRow) => o.status === "NOUVELLE").length,
      IGNOREE: allOpportunities.filter((o: OpportunityRow) => o.status === "IGNOREE").length,
      ACHETEE: allOpportunities.filter((o: OpportunityRow) => o.status === "ACHETEE").length,
      REVENDUE: sold.length,
      NON_RENTABLE: allOpportunities.filter((o: OpportunityRow) => o.status === "NON_RENTABLE")
        .length,
    },
  });
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
