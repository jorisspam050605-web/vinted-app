import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  status: z.enum(["NOUVELLE", "IGNOREE", "ACHETEE", "REVENDUE", "NON_RENTABLE"]),
  realSalePrice: z.number().positive().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const opportunity = await prisma.opportunity.update({
    where: { id: params.id },
    data: {
      status: parsed.data.status,
      realSalePrice: parsed.data.realSalePrice,
    },
  });
  return NextResponse.json(opportunity);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  await prisma.opportunity.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
