@AGENTS.md

# NutriWeek — Documentation complète pour agent IA

> **Optimisation du plan** : quand l'utilisateur demande d'améliorer/optimiser sa semaine de repas,
> lire et appliquer **[PLAN_OPTIMIZATION.md](PLAN_OPTIMIZATION.md)** (rubrique de notation : équilibre,
> calories/jour, simplicité, régularité + contraintes). À suivre systématiquement.

> **Réflexe fin de session** : à chaque fin de session (quand l'utilisateur dit que c'est terminé, ou
> que le travail en cours est bouclé), consigner ce qui a été appris/décidé dans le dossier
> **[knowledge/](knowledge/)**. Au début d'une session, le consulter aussi pour ne pas reposer de
> questions déjà tranchées. Règles :
> - Un fichier Markdown par thème (ex : `petit-dejeuner.md`, `bilan-contraintes.md`).
> - Compléter/mettre à jour le fichier existant plutôt que d'en créer un doublon ; corriger ce qui est devenu faux.
> - Y mettre les **décisions, raisonnements et contraintes** non déductibles du code (préférences, justifications nutritionnelles, arbitrages). Pas le détail du code ni l'historique git.
> - Maintenir **[knowledge/README.md](knowledge/README.md)** comme index (une ligne par fichier).

## Contexte du projet

Application web personnelle (un seul utilisateur : Nicolas) de **planification nutritionnelle hebdomadaire**.

Objectif principal : définir une semaine type idéale de repas **une seule fois**, et que l'app analyse automatiquement si cette semaine couvre **tous les besoins nutritionnels** du corps — pas juste calories/macros, mais aussi acides aminés, vitamines, minéraux, acides gras, créatine, précurseurs du collagène, etc.

Contexte de vie : Nicolas fait de la marche de compétition (longues distances). Il a constaté des limitations de performance qu'il attribue à des lacunes nutritionnelles (collagène, créatine notamment). L'app doit l'aider à avoir une alimentation parfaitement optimisée pour la performance et la prise de masse.

**Ce que l'app n'est PAS** : un journal alimentaire quotidien, un tracker de calories au jour le jour. C'est un outil de planification et d'analyse de la semaine type. Pas de notion d'écart, de streak, ou de comptage quotidien.

Inspirée de Cronometer (pour la richesse nutritionnelle) mais bien plus simple (sans marketing, sans tracking quotidien).

---

## Stack technique

| Technologie | Choix |
|---|---|
| Framework | **Next.js 16** (App Router) + TypeScript |
| Base de données | **PostgreSQL via Neon** (neon.tech) — hébergement gratuit serverless |
| ORM | **Prisma 7** — breaking changes importants vs versions antérieures (voir ci-dessous) |
| API Nutrition | **USDA FoodData Central** — gratuite, illimitée, la plus complète |
| UI | **Tailwind CSS** + **shadcn/ui** |
| Déploiement | **Vercel** (free tier) |
| Adapter DB | **@prisma/adapter-neon** + **@neondatabase/serverless** |

---

## Prisma 7 — Breaking changes critiques

Prisma 7 est radicalement différent des versions antérieures. À lire avant toute modification :

1. **Pas d'`url` dans `schema.prisma`** — la connexion DB se configure dans `prisma.config.ts` uniquement
2. **Provider `prisma-client`** (pas `prisma-client-js`) dans le generator
3. **Output du client** : `../lib/generated/prisma` — importer depuis `@/lib/generated/prisma/client`
4. **Adapter obligatoire** : `PrismaClient` nécessite un adapter explicite (ex: `PrismaNeon`)
5. **`prisma.config.ts`** à la racine gère l'URL de connexion via `dotenv/config`

Le client Prisma est instancié dans [lib/prisma.ts](lib/prisma.ts) avec l'adapter Neon.

---

## Next.js 16 — Breaking changes critiques

1. **`params` dans les routes sont async** — toujours `await ctx.params`
2. **`RouteContext<'/path/[id]'>`** est un type global généré par `next typegen`
3. **`middleware` renommé en `proxy`** — ne pas créer de fichier `middleware.ts`
4. **Turbopack par défaut** pour `next dev` et `next build`
5. Avant toute modification, lire `node_modules/next/dist/docs/` (docs embarquées)

---

## Setup initial requis (À FAIRE avant de lancer)

### 1. Base de données Neon (OBLIGATOIRE)

1. Créer un compte sur [neon.tech](https://neon.tech)
2. Créer un projet nommé `nutrition-week`
3. Copier la **connection string** (format : `postgresql://user:pass@ep-xxx.region.neon.tech/nutrition-week?sslmode=require`)
4. La coller dans `.env.local` à la place du placeholder
5. Lancer la migration : `npx prisma migrate dev --name init`

### 2. Clé API USDA (recommandé)

1. S'inscrire sur [fdc.nal.usda.gov/api-key-signup](https://fdc.nal.usda.gov/api-key-signup)
2. La clé arrive par email
3. La mettre dans `.env.local` à la place de `DEMO_KEY`
- La `DEMO_KEY` fonctionne mais est limitée à 30 req/heure

### 3. Variables d'environnement

Fichier `.env.local` (déjà créé, ignoré par git) :
```
DATABASE_URL="postgresql://..."
USDA_API_KEY="ta-cle-ici"
```

Pour Vercel : ajouter ces deux variables dans Settings > Environment Variables.

---

## Structure du projet

```
nutrition-week/
├── app/
│   ├── page.tsx              # Page "Ma Semaine" — grille 7j × 5 repas
│   ├── bilan/page.tsx        # Page "Bilan" — analyse nutritionnelle par priorité
│   ├── mesures/page.tsx      # Page "Mesures" — import FeelFit + courbes de composition corporelle
│   ├── profil/page.tsx       # Page "Profil" — données perso + objectifs calculés
│   ├── api/
│   │   ├── profile/route.ts  # GET/PUT profil unique (id=1)
│   │   ├── foods/
│   │   │   ├── search/route.ts  # GET search USDA, POST cache food detail
│   │   │   └── custom/route.ts  # GET/POST aliments custom
│   │   ├── meals/
│   │   │   ├── route.ts         # GET all entries, POST new entry
│   │   │   └── [id]/route.ts    # PATCH grams, DELETE entry
│   │   ├── measurements/
│   │   │   ├── route.ts         # GET pesées, POST une pesée ou un import (upsert sur measuredAt)
│   │   │   └── [id]/route.ts    # DELETE une pesée
│   │   └── bilan/route.ts       # GET analyse complète semaine
│   ├── globals.css
│   └── layout.tsx            # Layout global + Nav
├── components/
│   ├── nav.tsx               # Navigation (Ma Semaine / Cuisiner / Bilan / Mesures / Profil)
│   ├── meal-dialog.tsx       # Dialog édition d'un repas (recherche USDA + liste aliments)
│   ├── measurement-import.tsx # Import d'un export de balance + remappage des colonnes
│   ├── trend-chart.tsx       # Courbe SVG d'une mesure dans le temps (une métrique par graphique)
│   └── ui/                   # Composants shadcn/ui
├── lib/
│   ├── prisma.ts             # Singleton PrismaClient avec adapter Neon
│   ├── nutrients.ts          # Définitions des 32 nutriments trackés + calcul RDA
│   ├── nutrition.ts          # Calcul targets vs actual + tri par déficit
│   ├── body.ts               # Masse grasse / masse maigre, projection vers l'objectif de % MG
│   ├── feelfit.ts            # Lecture d'un export de balance (CSV/TSV) + détection des colonnes
│   ├── apple-health.ts       # Lecture d'un export Apple Santé (export.xml) — voie réellement utilisée
│   ├── usda.ts               # Appels USDA FoodData Central API
│   └── generated/prisma/     # Client Prisma généré (ne pas modifier)
├── types/index.ts            # Types TypeScript partagés
├── prisma/
│   ├── schema.prisma         # Schéma DB (Profile, Food, CustomFood, MealEntry, BodyMeasurement)
│   └── migrations/           # Migrations Prisma (créées après `prisma migrate dev`)
├── prisma.config.ts          # Config Prisma 7 (URL de connexion)
└── .env.local                # Variables d'environnement locales (ignoré git)
```

---

## Modèle de données

### Profile (id fixe = 1, un seul utilisateur)
```
age, weightKg, heightCm, sex (MALE/FEMALE), bodyFatPct?, targetBodyFatPct?
```

### Food (cache USDA)
```
fdcId (int, PK), name, dataType, nutrients (Json — NutrientsMap), cachedAt
```
Les aliments USDA sont mis en cache en DB après le premier appel API pour éviter les appels répétés.

### CustomFood
```
id, name, nutrients (Json — NutrientsMap), createdAt
```
Pour les aliments non trouvés dans l'USDA (suppléments maison, aliments spécifiques).

### MealEntry
```
id, day (MON-SUN), meal (BREAKFAST/MORNING_SNACK/LUNCH/SNACK/DINNER), grams, foodId?, customFoodId?
```
Contrainte unique : `(day, meal, foodId)` et `(day, meal, customFoodId)` — pas de doublon.

`MORNING_SNACK` = la collation de 10h, ajoutée le 2026-07-29. Attention : la valeur a été ajoutée
en fin d'enum PostgreSQL, donc `ORDER BY meal` ne suit pas l'ordre chronologique de la journée.
L'ordre d'affichage vient de la constante `MEALS` (app/page.tsx), pas de la base.

### BodyMeasurement
```
id, measuredAt (unique), weightKg, bmi?, bodyFatPct?, musclePct?, muscleMassKg?, waterPct?,
proteinPct?, boneMassKg?, visceralFat?, bmrKcal?, subcutaneousFatPct?, skeletalMusclePct?,
metabolicAge?, source
```
Une pesée de balance connectée. Tout est optionnel sauf la date et le poids : les colonnes
présentes varient selon la balance et la version de l'export. `measuredAt` est unique, donc
réimporter le même fichier met à jour au lieu de dupliquer.

---

## Nutriments trackés (32 au total)

Définis dans `lib/nutrients.ts` avec leurs IDs USDA et leurs RDA :

| Groupe | Nutriments |
|---|---|
| **Macros** | Calories, Protéines, Glucides, Lipides, Fibres |
| **Performance & Muscle** | Leucine, Isoleucine, Valine (BCAA), Créatine, Glutamine, Arginine |
| **Collagène & Articulations** | Glycine, Proline, Vitamine C |
| **Récupération** | Magnésium, Zinc, Oméga-3 (ALA+EPA+DHA), Vitamine D, Vitamine E |
| **Énergie & Endurance** | Fer, Vitamine B12, Folate (B9), Vitamine B6, Thiamine (B1) |
| **Santé Générale** | Calcium, Potassium, Sodium, Sélénium, Vitamine A, Vitamine K, Oméga-6, Graisses saturées |

### Calcul des objectifs (profil actif, prise de masse)
Source de vérité : `lib/nutrients.ts` et **[MACRO_TARGETS.md](MACRO_TARGETS.md)** pour les justifications.
- **Calories** : Mifflin-St Jeor × 1.55 (actif) + 400 kcal (surplus prise de masse).
  ⚠️ Mifflin est appliqué au **poids visé** (`energyBasisWeightKg`), pas au poids actuel —
  décision 2026-07-29 : c'est l'objectif de masse grasse qui doit piloter les calories.
  Les autres cibles (protéines, eau, graisses saturées) restent sur le **poids actuel**.
  Le poids visé est **projeté depuis l'historique des pesées** ([lib/projection.ts](lib/projection.ts)) :
  régression du poids sur le %MG → « kg par point de %MG » → extrapolation jusqu'à l'objectif.
  Repli sur « masse maigre constante » si l'historique est insuffisant. Calculé côté serveur par
  [lib/profile-projection.ts](lib/profile-projection.ts) et renvoyé par `GET /api/profile`, pour que
  la page Profil et `/api/bilan` partent du même chiffre.
- **Protéines** : 0,83 g × poids (kg) — PRI EFSA
- **Lipides** : 35% de l'AET (ANSES)
- **Glucides** : 50% de l'AET (ANSES/EFSA 45–60%)
- **Eau** : 35ml × poids (kg)
- **Micronutriments** : valeurs RDA/DRI officielles selon sexe/âge

### Répartition des calories par repas
`MEAL_DISTRIBUTION` dans `lib/nutrients.ts` : **25 / 15 / 27 / 13 / 20 %**
(petit-déj / collation 10h / déjeuner / en-cas / dîner), tolérance ±15% par repas.

### Composition corporelle
Le profil porte `bodyFatPct` (mesure actuelle) et `targetBodyFatPct` (objectif, **17,5%** depuis
le 2026-07-29). `lib/body.ts` en dérive masse grasse / masse maigre et le poids correspondant à
l'objectif **à masse maigre constante**. La page Mesures importe l'historique et alimente ces valeurs.

**Il n'y a pas de poids cible** (`targetWeightKg` supprimé le 2026-07-29) : l'objectif de corpulence
est le % de masse grasse, et le poids s'en déduit.

**`weightKg` et `bodyFatPct` ne se saisissent plus.** Ils sont recopiés depuis la dernière pesée par
`syncProfileFromLatest()` ([lib/profile-sync.ts](lib/profile-sync.ts)), appelé après tout import ou
suppression de mesure. `PUT /api/profile` les ignore volontairement (sauf à la création, où aucune
pesée n'existe encore). Une seule source de vérité, donc plus de divergence entre les pages.

**Masse grasse / masse maigre en kg ne sont plus affichées** (demande de Nicolas, 2026-07-29).
`fatMassKg`/`leanMassKg` subsistent dans `lib/body.ts` car `weightAtBodyFat` en dépend, et le détail
du calcul sur la page Profil montre l'étape intermédiaire — mais aucun écran ne les présente comme
une métrique à suivre.

---

## Logique de l'API USDA

1. Recherche via `/foods/search?q=` → retourne une liste (GET `/api/foods/search`)
2. L'utilisateur choisit un aliment + saisit les grammes
3. POST `/api/foods/search` → récupère le détail complet (150+ nutriments) et le cache en DB
4. POST `/api/meals` → crée l'entrée repas avec les grammes

Les appels USDA sont mis en cache côté Next.js (`revalidate: 86400`) et en DB pour éviter de re-fetcher.

Datasets USDA utilisés : Foundation Foods + SR Legacy + Branded Foods (pour les suppléments).

---

## Page Bilan — Logique d'affichage

1. Somme tous les `nutrients` × `grams/100` de tous les `MealEntry` de la semaine
2. Divise par 7 pour obtenir la moyenne journalière
3. Compare à la target RDA de chaque nutriment
4. Trie par déficit : les nutriments < 90% de la cible apparaissent en rouge en haut
5. Les nutriments entre 60-90% sont en orange
6. Les nutriments ≥ 90% sont en vert en bas

---

## Points d'attention pour les prochains développements

- **Aliments custom** : le formulaire de création d'aliment custom (`/components/custom-food-form.tsx`) **n'est pas encore créé**. La route API existe (`/api/foods/custom`), mais pas l'UI.
- **Détail d'un aliment** (style Cronometer) : page `/foods/[fdcId]` à créer pour voir tous les nutriments d'un aliment.
- **Copier un jour sur un autre** : feature utile quand plusieurs jours ont les mêmes repas.
- **Migration Prisma** : à lancer une seule fois après configuration Neon : `npx prisma migrate dev --name init`
- **`next typegen`** : à relancer si on ajoute des routes dynamiques pour regénérer les types `RouteContext`

---

## Commandes utiles

```bash
npm run dev          # Démarrer en local (Turbopack par défaut)
npx prisma generate  # Regénérer le client Prisma
npx prisma migrate dev --name <nom>  # Nouvelle migration
npx prisma studio    # Interface visuelle de la DB
npx next typegen     # Regénérer les types de routes Next.js
```
