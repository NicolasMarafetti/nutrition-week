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

## 5. Répartition des calories par repas

**Idée** : en plus du total journalier, calculer/afficher une cible de calories **par repas** (petit-déj / déjeuner / en-cas / dîner), avec une répartition recommandée — typiquement manger plus le midi que le soir.

**À faire** :
- Définir une répartition cible par repas (ex. petit-déj 25%, déjeuner 35%, en-cas 10%, dîner 30% — à affiner).
- Afficher pour chaque repas de la semaine : calories actuelles vs cible du repas, et un indicateur (trop / dans la cible / pas assez).
- Idéalement directement sur la grille "Ma Semaine" ou dans le détail d'un repas.

## 6. CRON journalier : optimiseur de plan hebdomadaire

**Idée** : un cron quotidien qui cherche un *meilleur* plan de repas pour la semaine type et le propose. Optimisation multi-critères, chaque plan candidat reçoit un score combinant :

- **Équilibre** : à quel point le bilan couvre les besoins (proche de 100% sur tous les nutriments). C'est le critère principal.
- **Simplicité** : moins il y a d'aliments différents par repas, mieux c'est (repas faciles à préparer). Pénaliser les repas avec trop d'ingrédients.
- **Complexité / régularité** : pénaliser une trop grande variation d'un jour à l'autre (l'objectif est une semaine type cohérente, simple à faire les courses et à cuisiner). Récompenser la répétition raisonnable entre jours.

**À détailler / décisions ouvertes** :
- Pondération des 3 critères (équilibre vs simplicité vs régularité) — réglable ?
- Espace de recherche : parmi quels aliments ? (aliments déjà utilisés par l'utilisateur, une liste blanche, ou tout l'USDA ?) Garder les suppléments fixes (créatine, collagène).
- Algorithme : recherche locale / recuit simulé / génétique — partir du plan actuel et l'améliorer par petites modifications.
- Résultat : **proposer** le plan (ne pas écraser automatiquement) — l'utilisateur valide. Stocker la proposition + son score + le détail des gains vs plan actuel.
- Respecter les contraintes : structure 4 repas/jour, cible calorique.
- Coût : éviter de marteler l'API USDA (réutiliser le cache d'aliments).

## 7. (Plus tard) Détails mineurs

- Qualité de traduction MyMemory parfois mauvaise (ex : noms USDA avec mentions de programme USDA).
- Plusieurs RDA micronutriments sont des valeurs fixes, non ajustées à l'âge/sexe (la signature `rdaFn` le permet pourtant).
- Aucun test automatisé.
- `next build` de production à valider (longtemps tourné en dev uniquement).
