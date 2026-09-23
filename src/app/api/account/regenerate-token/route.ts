import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { randomBytes } from "crypto";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const user = await prisma.user.update({
    where: { id: userId },
    data: { webhookToken: randomBytes(24).toString("hex") },
  });
  return NextResponse.json({ webhookToken: user.webhookToken });
}
