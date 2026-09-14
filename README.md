# Niches — gestionnaire d'achat-revente Vinted

Application multi-utilisateurs de gestion de niches d'achat-revente sur
Vinted : chaque personne cree son compte, definit ses criteres (marque,
categorie, taille, etat, prix d'achat max, prix de revente cible), l'app
calcule la rentabilite, garde un historique, des statistiques, et propose
une analyse IA optionnelle. Donnees stockees en base Postgres, persistantes.

## Ce que l'app fait, et ce qu'elle ne fait pas

**Ce qu'elle fait** : comptes utilisateurs reels (inscription/connexion,
donnees strictement isolees par compte), gestion complete des niches, calcul
de marge/ROI/multiplicateur en temps reel, historique filtrable, statuts
ignoree/achetee/revendue/non rentable, notifications app/email/Telegram/
Discord (destinataire configure par chaque utilisateur), analyse IA d'une
niche avec recherche web et interdiction formelle d'inventer des chiffres,
page de partage avec QR code genere depuis l'URL reelle de l'app.

**Ce qu'elle ne fait pas** : elle n'interroge jamais Vinted elle-meme pour
surveiller des annonces automatiquement. Vinted n'a pas d'API publique
ouverte aux developpeurs tiers, et ses CGU interdisent le scraping /
l'automatisation excessive de son site (limites de debit strictes, risque de
suspension de compte). Plutot que de contourner ca, l'app expose un point
d'entree ouvert :

1. **Ajout manuel** (page Historique) : colle une annonce trouvee en
   naviguant normalement sur Vinted.
2. **Bookmarklet** (`public/bookmarklet.js`) : raccourci manuel, un clic par
   annonce, aucune automatisation en arriere-plan.
3. **Webhook personnel** (`POST /api/webhooks/watcher`, header
   `x-watcher-token` = jeton visible dans Reglages) : si tu veux automatiser
   la collecte, c'est a toi de choisir et d'operer l'outil qui l'alimente
   (par exemple un outil open source de surveillance Vinted que tu heberges
   toi-meme) — a evaluer en connaissance du risque CGU. Vinted propose deja
   des "recherches enregistrees" avec notification native, 100% dans les
   clous mais moins reactif.

## Stack

Next.js 14 (App Router, TypeScript) · Prisma + **PostgreSQL** · Tailwind CSS
· NextAuth (comptes multi-utilisateurs, credentials + bcrypt) · Anthropic
SDK (module IA, recherche web integree) · Nodemailer / Telegram / Discord
pour les notifications · `qrcode` pour le QR code de partage.

---

## 🚀 Deploiement en production sur Render (recommande, gratuit pour demarrer)

Render peut heberger a la fois l'application et la base Postgres, avec un
fichier `render.yaml` deja pret dans ce depot qui automatise toute la
creation.

### Etape 1 — Mets le code sur GitHub

```bash
cd vinted-niche-tracker
git init
git add .
git commit -m "Version initiale"
```
Cree un depot vide sur https://github.com/new (public ou prive), puis :
```bash
git remote add origin https://github.com/TON-COMPTE/vinted-niche-tracker.git
git branch -M main
git push -u origin main
```

### Etape 2 — Deploie sur Render en un clic

1. Va sur https://dashboard.render.com/, connecte-toi (ou cree un compte
   gratuit).
2. Clique **New +** → **Blueprint**.
3. Choisis ton depot GitHub `vinted-niche-tracker`. Render detecte le
   fichier `render.yaml` et propose de creer automatiquement :
   - le service web `niches-app` (le site) ;
   - la base `niches-db` (Postgres) ;
   - `DATABASE_URL` et `NEXTAUTH_SECRET` sont remplis automatiquement.
4. Clique **Apply**. Le premier deploiement prend quelques minutes (build
   Next.js + creation des tables).

### Etape 3 — Renseigne l'URL publique reelle

Une fois le premier deploiement termine, Render t'attribue une URL du type
`https://niches-app.onrender.com` (visible en haut du dashboard du service).

1. Dans le service `niches-app` → **Environment**, ajoute/edite :
   - `NEXTAUTH_URL` = `https://niches-app.onrender.com` (ton URL exacte)
   - `NEXT_PUBLIC_APP_URL` = la meme URL
2. Sauvegarde → Render redeploie automatiquement (1-2 minutes).

C'est fait : le site est en ligne, persistant, accessible depuis n'importe
quel appareil, base de donnees incluse.

### Etape 4 — Cree ton compte et recupere le QR code

1. Ouvre `https://niches-app.onrender.com/register`, cree ton compte.
2. Va dans l'onglet **Partager** : le QR code y est genere automatiquement
   a partir de `NEXT_PUBLIC_APP_URL`, telechargeable en PNG ou SVG.

### Variables optionnelles (a ajouter dans Environment si tu veux les activer)

| Variable | Active |
|---|---|
| `ANTHROPIC_API_KEY` | la page Analyse IA |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | les notifications par email (le destinataire se configure ensuite par chaque utilisateur dans Reglages) |
| `TELEGRAM_BOT_TOKEN` | les notifications Telegram (chaque utilisateur renseigne son `chat_id` dans Reglages) |

Le plan gratuit Render met le service en veille apres 15 minutes
d'inactivite (le premier chargement suivant prend ~30s le temps qu'il se
reveille) et la base gratuite expire apres 90 jours — passe sur un plan
payant (quelques dollars/mois) si tu veux eviter ca sur le long terme.

### Domaine personnalise (optionnel)

Render permet d'attacher un domaine que tu possedes deja, gratuitement :
service → **Settings** → **Custom Domains**. Sans domaine a toi, l'URL
`*.onrender.com` fonctionne tout aussi bien.

---

## Alternative : autres hebergeurs

Le projet est un Next.js standard + Postgres, donc il tourne aussi bien sur
Railway, Fly.io, ou Vercel (front) + Neon/Supabase (base) — adapte juste les
commandes de build/start et les variables d'environnement en consequence.

## Installation locale (developpement)

```bash
npm install --legacy-peer-deps
cp .env.example .env
# Remplis DATABASE_URL avec une base Postgres (locale via docker compose,
# ou un projet gratuit Neon/Supabase), et NEXTAUTH_SECRET.
npx prisma db push
npm run dev
```
Avec Docker (app + Postgres local en un coup) :
```bash
docker compose up -d --build
```

## Variables d'environnement

Voir `.env.example`. Resume :

| Variable | Obligatoire | Role |
|---|---|---|
| `DATABASE_URL` | oui | connexion Postgres |
| `NEXTAUTH_SECRET` | oui | signature des sessions |
| `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL` | oui en production | URL publique reelle du site (jamais `localhost` en prod) |
| `ANTHROPIC_API_KEY` | optionnel | active la page Analyse IA |
| `SMTP_*` | optionnel | notifications par email |
| `TELEGRAM_BOT_TOKEN` | optionnel | notifications Telegram |

## Structure du projet

```
render.yaml                  Blueprint de deploiement Render (app + Postgres)
prisma/schema.prisma          modele de donnees (User, Niche, Opportunity, Settings)
src/lib/auth.ts               authentification multi-utilisateurs (NextAuth + bcrypt)
src/lib/profitability.ts      calculs de marge/ROI/multiplicateur (source unique)
src/lib/matching.ts           verifie si une annonce entrante correspond a une niche
src/lib/ingest.ts             logique partagee ajout manuel + webhook, par utilisateur
src/lib/notifications.ts      envoi email / Telegram / Discord, par utilisateur
src/app/api/                  routes API (auth, niches, opportunites, stats, ia, webhook, settings)
src/app/(app)/                pages authentifiees (dashboard, historique, stats, calculatrice, ia, partage, reglages)
src/app/register, /login      inscription et connexion
public/bookmarklet.js         raccourci manuel pour l'ajout d'annonces
```

## Securite et isolation des donnees

Chaque niche, opportunite et reglage est rattache a un `userId` et toutes
les routes API verifient la session avant de lire/ecrire — un utilisateur ne
peut jamais voir ou modifier les donnees d'un autre compte. Les mots de
passe sont hashes avec bcrypt, jamais stockes en clair. Le jeton webhook est
personnel a chaque compte et regenerable a tout moment depuis Reglages.

## Maintenance

- **Modifier le code** : edite les fichiers, `git commit` puis `git push` —
  Render redeploie automatiquement a chaque push sur `main`.
- **Voir les logs / erreurs** : dashboard Render → service → onglet **Logs**.
- **Modifier le schema de base** : edite `prisma/schema.prisma`, puis relance
  un deploiement (le `startCommand` applique `prisma db push` automatiquement
  a chaque demarrage).
- **Sauvegarder la base** : dashboard Render → base `niches-db` → **Backups**.

## Note sur le module IA

L'endpoint `/api/ai/analyze` appelle l'API Anthropic avec l'outil de
recherche web active, et une consigne stricte : ne jamais inventer de
donnee de marche. Quand l'IA n'a pas trouve d'information fiable, elle le
signale explicitement plutot que de proposer un chiffre invente. A traiter
comme un point de depart a verifier, pas comme une verite absolue.
