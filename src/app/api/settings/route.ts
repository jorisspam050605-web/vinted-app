import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const settingsSchema = z.object({
  packagingFee: z.number().min(0).optional(),
  platformFeePercent: z.number().min(0).max(100).optional(),
  miscFee: z.number().min(0).optional(),
  notifyApp: z.boolean().optional(),
  notifyEmail: z.boolean().optional(),
  notifyTelegram: z.boolean().optional(),
  notifyDiscord: z.boolean().optional(),
  notifyEmailTo: z.string().email().optional().or(z.literal("")),
  telegramChatId: z.string().optional().or(z.literal("")),
  discordWebhookUrl: z.string().url().optional().or(z.literal("")),
});

async function getUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.id as string | undefined;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const settings = await prisma.settings.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { webhookToken: true, email: true } });

  return NextResponse.json({ ...settings, webhookToken: user?.webhookToken, email: user?.email });
}

export async function PATCH(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const body = await req.json();
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const settings = await prisma.settings.upsert({
    where: { userId },
    update: parsed.data,
    create: { userId, ...parsed.data },
  });
  return NextResponse.json(settings);
}
