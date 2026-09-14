# Niches — gestionnaire d'achat-revente Vinted

Application de gestion de niches d'achat-revente : tu definis tes criteres
(marque, categorie, taille, etat, prix d'achat max, prix de revente cible),
l'app calcule automatiquement la rentabilite, garde un historique des
opportunites, des statistiques, et une calculatrice. Un module IA (optionnel)
t'aide a evaluer une niche avant de la creer.

## Ce que l'app fait, et ce qu'elle ne fait pas

**Ce qu'elle fait** : tout le gestionnaire de niches (creation/modif/
suppression, calcul de marge/ROI/multiplicateur en temps reel, historique
filtrable, statistiques, statuts ignoree/achetee/revendue/non rentable,
notifications app/email/Telegram/Discord, analyse IA d'une niche avec
recherche web et interdiction formelle d'inventer des chiffres).

**Ce qu'elle ne fait pas** : elle n'interroge jamais Vinted elle-meme pour
surveiller des annonces. **Vinted n'a pas d'API publique ouverte aux
developpeurs tiers** (leur "API Pro" est reservee a des entreprises
partenaires sur liste blanche, pour gerer leur propre inventaire — pas pour
surveiller le marche). Les CGU Vinted interdisent explicitement le scraping
et l'automatisation excessive de leur site, avec des limites de debit
strictes et un risque reel de suspension de compte.

Plutot que de contourner ca, l'app expose un **point d'entree ouvert** pour
faire arriver des annonces, quelle qu'en soit la source, choisie et geree
sous ta seule responsabilite :

1. **Ajout manuel** (page Historique) : tu colles une annonce trouvee en
   naviguant normalement sur Vinted. L'app calcule immediatement si elle
   matche une niche et la marge realisable.
2. **Bookmarklet** (`public/bookmarklet.js`) : un clic pendant que tu es sur
   une fiche annonce, dans ton navigateur, connecte a ton compte. Aucune
   requete automatique, aucun arriere-plan — juste un raccourci pour l'ajout
   manuel ci-dessus.
3. **Webhook** (`POST /api/webhooks/watcher`, proteges par une cle secrete) :
   si tu veux automatiser la collecte, c'est a toi de choisir et d'operer
   l'outil qui alimente ce webhook (par exemple un outil open source de
   surveillance Vinted que tu heberges toi-meme). Ce depot n'en fournit pas,
   car ce type d'outil s'appuie sur les endpoints internes de Vinted, ce qui
   est en zone grise vis-a-vis de leurs CGU — a toi d'evaluer ce risque en
   connaissance de cause. Vinted propose deja des "recherches enregistrees"
   avec notification native (moins reactive, mais 100% dans les clous).

Le format attendu par le webhook :
```json
{ "title": "Polo Robin Ruth Amsterdam", "brand": "Robin Ruth", "price": 5,
  "size": "M", "listingUrl": "https://www.vinted.fr/items/..." }
```
ou un lot : `{ "listings": [ {...}, {...} ] }`, avec le header
`x-watcher-secret: <WATCHER_WEBHOOK_SECRET>`.

## Stack

Next.js 14 (App Router, TypeScript) · Prisma + SQLite · Tailwind CSS ·
NextAuth (mono-utilisateur, credentials) · Anthropic SDK (module IA,
avec recherche web integree) · Nodemailer / Telegram / Discord pour les
notifications.

## Installation locale

```bash
npm install
cp .env.example .env
# Edite .env : NEXTAUTH_SECRET, APP_ADMIN_EMAIL, APP_ADMIN_PASSWORD_HASH...

# Genere le hash de ton mot de passe admin :
node scripts/hash-password.js "tonmotdepasse"
# colle le resultat dans APP_ADMIN_PASSWORD_HASH

npx prisma db push   # cree la base SQLite locale (dev.db)
npm run dev
```

Ouvre http://localhost:3000, connecte-toi avec `APP_ADMIN_EMAIL` et le mot
de passe que tu as hash.

## Variables d'environnement

Voir `.env.example` pour la liste complete. Resume :

| Variable | Obligatoire | Role |
|---|---|---|
| `DATABASE_URL` | oui | chemin de la base SQLite |
| `NEXTAUTH_SECRET`, `NEXTAUTH_URL` | oui | session NextAuth |
| `APP_ADMIN_EMAIL`, `APP_ADMIN_PASSWORD_HASH` | oui | ton compte |
| `WATCHER_WEBHOOK_SECRET` | oui si tu utilises le webhook | securise `/api/webhooks/watcher` |
| `ANTHROPIC_API_KEY` | optionnel | active la page Analyse IA |
| `SMTP_*`, `NOTIFY_EMAIL_TO` | optionnel | notifications par email |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | optionnel | notifications Telegram |
| `DISCORD_WEBHOOK_URL` | optionnel | notifications Discord |

## Deploiement

**Self-host (Docker)** : voir `Dockerfile` et `docker-compose.yml`. La base
SQLite vit dans un volume monte (`./data`), donc elle survit aux redeploiements.

```bash
docker compose up -d --build
```

**Plateforme managee (Vercel, Railway, etc.)** : SQLite ne convient pas bien
au serverless (systeme de fichiers ephemere). Remplace `DATABASE_URL` par une
base Postgres (Neon, Supabase, Railway...) et change `provider = "sqlite"`
en `provider = "postgresql"` dans `prisma/schema.prisma`, puis
`npx prisma db push`.

## Structure du projet

```
prisma/schema.prisma        modele de donnees (Niche, Opportunity, Settings)
src/lib/profitability.ts    calculs de marge/ROI/multiplicateur (source unique)
src/lib/matching.ts         verifie si une annonce entrante correspond a une niche
src/lib/ingest.ts           logique partagee ajout manuel + webhook (matching + creation + notif)
src/lib/notifications.ts    envoi email / Telegram / Discord
src/app/api/                routes API (niches, opportunites, stats, ia, webhook, settings)
src/app/(app)/              pages authentifiees (dashboard, niches, historique, stats, calculatrice, ia, reglages)
public/bookmarklet.js       raccourci manuel pour l'ajout d'annonces
```

## Note sur le module IA

L'endpoint `/api/ai/analyze` appelle l'API Anthropic avec l'outil de
recherche web active, et une consigne stricte : ne jamais inventer de
donnee de marche. Quand l'IA n'a pas trouve d'information fiable (prix
moyen observe, niveau de concurrence...), elle le signale explicitement
plutot que de proposer un chiffre invente. Traite quand meme ses suggestions
comme un point de depart a verifier, pas comme une verite absolue.
