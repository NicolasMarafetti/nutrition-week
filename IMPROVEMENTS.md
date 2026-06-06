# NutriWeek — Améliorations à traiter

Suivi des points identifiés. Ordre = priorité décidée avec l'utilisateur.

## 1. Sodium & graisses saturées : plafonds, pas cibles — DÉCIDÉ (pas de système spécifique)

Décision utilisateur : ne pas construire de logique dédiée (type `ceiling`/`range`).
- **Sodium** : cible simplement abaissée à **1500 mg/jour** (apport adéquat adulte). Le sel de cuisson, non tracké, complète. ✅ Fait.
- **Graisses saturées** : laissé tel quel (cible ~20 g via `poids × 0.3`). Les aliments recommandés sont sains, donc non prioritaire. Différé.

Note : un vrai système `target`/`ceiling`/`range` reste l'option propre si on veut un jour distinguer « atteindre » de « rester sous ». Pas demandé pour l'instant.

## 2. Incohérence du calcul des calories — FAIT ✅

Fonctions partagées dans `lib/nutrients.ts` : `bmr()` (Mifflin-St Jeor complet), `tdee()` (× 1.55 actif), `calorieTarget()` (+ 400 prise de masse).
- `rdaFn` reçoit désormais `heightCm` (signature `BodyProfile`).
- Calories et glucides (45% des calories) dérivent de `calorieTarget()`.
- La page Profil et le Bilan utilisent les mêmes fonctions → plus de divergence.
- Résultat : cible calories unifiée à 2940 kcal (profil 68 kg / 179 cm / 33 ans / H), glucides 331 g.

## 3. Sécuriser l'écriture — PARTIELLEMENT FAIT / DÉCISION

Décision utilisateur : ne **pas** verrouiller l'accès (le site reste public, indexé Google). On mitige plutôt la conséquence par des backups (point #4). 

Fait quand même :
- ✅ Routes `/api/admin/*` (clean, reextract, translate) + `/api/backup*`, `/api/export` protégées par `CRON_SECRET`.

Reste ouvert (assumé) :
- Les routes d'écriture normales (`/api/meals`, `/api/profile`) restent publiques : un visiteur peut éditer/supprimer des repas. Couvert par la possibilité de restaurer (point #4). Si un jour ça devient gênant, ajouter un mot de passe simple à l'échelle du site.

## 4. Backup régulier de la base de données (Neon) — FAIT ✅

Mis en place :
- Table `Backup` (snapshots JSON horodatés dans Neon).
- **Cron Vercel mensuel** (`vercel.json`, le 1er du mois à 03:00 UTC) → `GET /api/backup/run`, garde les 14 derniers (~14 mois d'historique).
- Snapshot manuel : `POST /api/backup?key=SECRET`.
- Liste : `GET /api/backup?key=SECRET`.
- Restauration (destructive, atomique) : `POST /api/backup/restore?key=SECRET` body `{ id? }` (dernier par défaut).
- Export JSON hors-ligne téléchargeable : `GET /api/export?key=SECRET`.
- Auth par `CRON_SECRET` (en-tête Bearer auto de Vercel Cron, ou `?key=`).

Limite : les snapshots sont dans le même Neon → protègent contre une suppression via l'app, pas contre une perte totale de l'instance Neon. Pour du hors-site, utiliser l'export JSON régulièrement.

Amélioration possible plus tard : page UI simple pour télécharger/restaurer un backup sans manipuler les URLs.

## 5. (Plus tard) Détails mineurs

- Qualité de traduction MyMemory parfois mauvaise (ex : noms USDA avec mentions de programme USDA).
- Plusieurs RDA micronutriments sont des valeurs fixes, non ajustées à l'âge/sexe (la signature `rdaFn` le permet pourtant).
- Aucun test automatisé.
- `next build` de production à valider (longtemps tourné en dev uniquement).
