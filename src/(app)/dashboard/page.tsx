import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { NicheCard } from "@/components/NicheCard";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const niches = await prisma.niche.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { opportunities: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-paper">Mes niches</h1>
          <p className="text-mute text-sm mt-1">
            {niches.length} niche{niches.length !== 1 ? "s" : ""} ·{" "}
            {niches.filter((n: { status: string }) => n.status === "ACTIVE").length} active
            {niches.filter((n: { status: string }) => n.status === "ACTIVE").length !== 1
              ? "s"
              : ""}
          </p>
        </div>
        <Link href="/niches/new">
          <Button>+ Ajouter une niche</Button>
        </Link>
      </div>

      {niches.length === 0 ? (
        <div className="border border-dashed border-line rounded-tag p-12 text-center">
          <p className="text-paper font-medium mb-1">Aucune niche pour l'instant</p>
          <p className="text-mute text-sm mb-4">
            Cree ta premiere niche pour commencer a surveiller des opportunites.
          </p>
          <Link href="/niches/new">
            <Button>+ Ajouter une niche</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {niches.map((n: (typeof niches)[number]) => (
            <NicheCard
              key={n.id}
              niche={{
                id: n.id,
                name: n.name,
                brands: n.brands,
                category: n.category,
                maxBuyPrice: n.maxBuyPrice,
                pricingMode: n.pricingMode as "MULTIPLIER" | "FIXED",
                targetResalePrice: n.targetResalePrice,
                targetMultiplier: n.targetMultiplier,
                status: n.status as "ACTIVE" | "PAUSED",
                opportunityCount: n._count.opportunities,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
