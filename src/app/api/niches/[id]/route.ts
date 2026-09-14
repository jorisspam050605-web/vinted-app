import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  brands: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  keywords: z.string().optional(),
  size: z.string().min(1).optional(),
  minCondition: z
    .enum([
      "NEUF_AVEC_ETIQUETTE",
      "NEUF_SANS_ETIQUETTE",
      "TRES_BON_ETAT",
      "BON_ETAT",
      "SATISFAISANT",
    ])
    .optional(),
  pricingMode: z.enum(["MULTIPLIER", "FIXED"]).optional(),
  maxBuyPrice: z.number().positive().optional(),
  targetResalePrice: z.number().positive().nullable().optional(),
  targetMultiplier: z.number().positive().nullable().optional(),
  status: z.enum(["ACTIVE", "PAUSED"]).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const niche = await prisma.niche.findUnique({ where: { id: params.id } });
  if (!niche) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(niche);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const niche = await prisma.niche.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(niche);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  await prisma.niche.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
