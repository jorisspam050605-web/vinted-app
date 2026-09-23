import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ingestListing } from "@/lib/ingest";

const listingSchema = z.object({
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
  photoUrl: z.string().url().optional(),
  listingUrl: z.string().min(1),
  publishedAt: z.string().optional(),
});

const bodySchema = z.union([
  listingSchema,
  z.object({ listings: z.array(listingSchema) }),
]);

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-watcher-token");
  if (!token) {
    return NextResponse.json({ error: "Jeton manquant (header x-watcher-token)" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { webhookToken: token } });
  if (!user) {
    return NextResponse.json({ error: "Jeton invalide" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const listings = "listings" in parsed.data ? parsed.data.listings : [parsed.data];

  let totalCreated = 0;
  for (const listing of listings) {
    const created = await ingestListing(user.id, { ...listing, source: "webhook" });
    totalCreated += created.length;
  }

  return NextResponse.json({ received: listings.length, opportunitiesCreated: totalCreated });
}
