import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const nicheSchema = z.object({
  name: z.string().min(1),
  brands: z.string().min(1),
  category: z.string().min(1),
  keywords: z.string().default(""),
  size: z.string().min(1),
  minCondition: z.enum([
    "NEUF_AVEC_ETIQUETTE",
    "NEUF_SANS_ETIQUETTE",
    "TRES_BON_ETAT",
    "BON_ETAT",
    "SATISFAISANT",
  ]),
  pricingMode: z.enum(["MULTIPLIER", "FIXED"]),
  maxBuyPrice: z.number().positive(),
  targetResalePrice: z.number().positive().nullable().optional(),
  targetMultiplier: z.number().positive().nullable().optional(),
  status: z.enum(["ACTIVE", "PAUSED"]).default("ACTIVE"),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const niches = await prisma.niche.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { opportunities: true } } },
  });
  return NextResponse.json(niches);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const body = await req.json();
  const parsed = nicheSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const niche = await prisma.niche.create({ data: { ...parsed.data, userId } });
  return NextResponse.json(niche, { status: 201 });
}
