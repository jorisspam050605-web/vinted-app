import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ingestListing } from "@/lib/ingest";

const manualAddSchema = z.object({
  nicheId: z.string().optional(),
  title: z.string().min(1),
  brand: z.string().optional(),
  price: z.number().positive(),
  size: z.string().optional(),
  condition: z
    .enum([
      "NEUF_AVEC_ETIQUETTE",
      "NEUF_SANS_ETIQUETTE",
      "TRES_BON_ETAT",
      "BON_ETAT",
      "SATISFAISANT",
    ])
    .optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
  listingUrl: z.string().min(1),
  publishedAt: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const nicheId = searchParams.get("nicheId") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const brand = searchParams.get("brand") ?? undefined;

  const opportunities = await prisma.opportunity.findMany({
    where: {
      nicheId: nicheId || undefined,
      status: (status as any) || undefined,
      brand: brand ? { contains: brand } : undefined,
    },
    include: { niche: { select: { name: true } } },
    orderBy: { detectedAt: "desc" },
    take: 300,
  });

  return NextResponse.json(opportunities);
}

/**
 * Ajout manuel d'une opportunite (colle une annonce trouvee sur Vinted).
 * Si aucun nicheId n'est fourni, l'annonce est comparee a toutes les niches
 * actives et une opportunite est creee pour chaque niche qui matche.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const body = await req.json();
  const parsed = manualAddSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const created = await ingestListing({ ...parsed.data, source: "manuel" });

  if (created.length === 0) {
    return NextResponse.json(
      { message: "Aucune niche active ne correspond a cette annonce.", created: [] },
      { status: 200 }
    );
  }
  return NextResponse.json({ created }, { status: 201 });
}
