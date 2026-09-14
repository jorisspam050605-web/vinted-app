import nodemailer from "nodemailer";
import { prisma } from "./prisma";

export type OpportunityForNotif = {
  id: string;
  title: string;
  brand?: string | null;
  price: number;
  size?: string | null;
  condition?: string | null;
  listingUrl: string;
  estimatedResale: number;
  estimatedMargin: number;
  estimatedMultiplier: number;
  nicheName: string;
};

function formatMessage(o: OpportunityForNotif): string {
  return [
    `Nouvelle opportunite - ${o.nicheName}`,
    `${o.brand ? o.brand + " - " : ""}${o.title}`,
    `Prix : ${o.price.toFixed(2)} EUR`,
    o.size ? `Taille : ${o.size}` : null,
    `Revente estimee : ${o.estimatedResale.toFixed(2)} EUR`,
    `Multiplicateur : x${o.estimatedMultiplier.toFixed(2)}`,
    `Marge estimee : ${o.estimatedMargin.toFixed(2)} EUR`,
    `Annonce : ${o.listingUrl}`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function sendEmail(to: string, text: string) {
  if (!process.env.SMTP_HOST || !to) return;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to,
    subject: "Nouvelle opportunite Vinted",
    text,
  });
}

async function sendTelegram(chatId: string, text: string) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !chatId) return;
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

async function sendDiscord(webhookUrl: string, text: string) {
  if (!webhookUrl) return;
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: text }),
  });
}

/**
 * Envoie les notifications actives (definies dans les reglages de CET
 * utilisateur) pour une opportunite lui appartenant. Chaque canal echoue
 * independamment: un canal mal configure ou en erreur ne bloque pas les
 * autres.
 */
export async function notifyOpportunity(userId: string, o: OpportunityForNotif) {
  const settings = await prisma.settings.findUnique({ where: { userId } });
  if (!settings) return;
  const text = formatMessage(o);

  const jobs: Promise<void>[] = [];
  if (settings.notifyEmail && settings.notifyEmailTo) {
    jobs.push(sendEmail(settings.notifyEmailTo, text).catch(() => {}));
  }
  if (settings.notifyTelegram && settings.telegramChatId) {
    jobs.push(sendTelegram(settings.telegramChatId, text).catch(() => {}));
  }
  if (settings.notifyDiscord && settings.discordWebhookUrl) {
    jobs.push(sendDiscord(settings.discordWebhookUrl, text).catch(() => {}));
  }

  await Promise.all(jobs);
}
