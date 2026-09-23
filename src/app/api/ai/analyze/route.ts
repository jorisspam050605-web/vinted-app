import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { authOptions } from "@/lib/auth";

const inputSchema = z.object({
  brand: z.string().min(1),
  category: z.string().min(1),
  maxBuyPrice: z.number().positive(),
  keywords: z.string().optional(),
});

const SYSTEM_PROMPT = `Tu es un analyste specialise dans l'achat-revente de vetements sur Vinted.
On te donne une niche (marque, categorie, prix d'achat maximum vise).
Utilise la recherche web pour verifier les prix reels observes quand c'est possible.

Regle absolue : n'invente JAMAIS de donnee de marche. Si tu n'as pas de donnee fiable
(prix moyen observe, niveau de concurrence, etc.), dis-le explicitement au lieu de
proposer un chiffre invente.

Reponds UNIQUEMENT avec un objet JSON valide (pas de markdown, pas de texte autour),
avec exactement ces cles :
{
  "whyInteresting": string,
  "observedPriceRange": string | null,
  "resalePotential": string,
  "competitionLevel": string,
  "fakeDealRisk": string,
  "alternativeKeywords": string[],
  "similarBrands": string[],
  "interestingModels": string[],
  "suggestedBuyRange": string,
  "suggestedResaleRange": string,
  "dataConfidence": "faible" | "moyenne" | "haute",
  "caveats": string
}`;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY n'est pas configuree sur le serveur." },
      { status: 400 }
    );
  }

  const body = await req.json();
  const parsed = inputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { brand, category, maxBuyPrice, keywords } = parsed.data;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const response = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      tools: [{ type: "web_search_20250305", name: "web_search" } as any],
      messages: [
        {
          role: "user",
          content: `Marque : ${brand}\nCategorie : ${category}\nPrix d'achat maximum vise : ${maxBuyPrice} EUR\nMots-cles deja envisages : ${keywords || "aucun"}`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const raw = textBlock && "text" in textBlock ? textBlock.text : "{}";
    const cleaned = raw.replace(/```json|```/g, "").trim();

    let analysis;
    try {
      analysis = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Reponse IA illisible, reessaie.", raw: cleaned },
        { status: 502 }
      );
    }

    return NextResponse.json(analysis);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Erreur lors de l'appel a l'IA" },
      { status: 500 }
    );
  }
}
