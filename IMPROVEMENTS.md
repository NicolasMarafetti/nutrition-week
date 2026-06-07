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

## 5. Répartition des calories par repas — FAIT ✅

Cible de calories **par repas**, dérivée du total journalier `calorieTarget()`.

**Répartition fixe (codée en dur)** — front-loading décroissant, appuyé par la littérature (Jakubowicz 2013 *Obesity* ; AJCN déjeuner>dîner ; Diabetologia 2015 ; cadre AHA *Circulation* 2017) :
- Petit-déjeuner **30%**, Déjeuner **35%**, En-cas **10%**, Dîner **25%**.

**Calcul** : pour chaque créneau (jour × repas), somme des calories réelles des aliments vs cible du créneau (= % × calorieTarget). Données déjà disponibles.

**Tolérance** : ±15% autour de la cible du repas → "dans la cible". En dehors : trop léger (en dessous) / trop lourd (au dessus).

**Affichage (les deux)** :
- Grille "Ma Semaine" : pastille/indicateur couleur par cellule (vert dans la cible, orange/rouge hors cible).
- Dialog du repas : cible chiffrée + écart (ex. "Cible 1030 kcal · actuel 820 · -210").

**Hors périmètre phase 1** : macros par repas (calories seulement), répartition configurable (fixe pour l'instant).

**Reste à coder (phase 2)** : helper `mealCalorieTargets(profile)` dans `lib/nutrients.ts`, calcul des calories réelles par créneau sur la grille, indicateurs couleur, affichage dans le dialog.

## 6. CRON journalier : optimiseur de plan via agent Claude — SPEC VALIDÉE (brainstorming OK)

**Concept** : un cron quotidien où **Claude (agent IA) raisonne comme un nutritionniste** pour améliorer le plan hebdomadaire. Pas d'algorithme numérique aveugle — Claude identifie une carence, réfléchit à quel aliment la comblerait, le cherche dans l'USDA, le teste.

### Architecture (validée)
1. Le cron donne à Claude le contexte : plan actuel + calories par repas + bilan (carences détaillées) + cibles.
2. **Claude (modèle Opus)** raisonne et utilise des **outils** (tool use) : `search_usda(query)`, `get_food_detail(fdcId)`, en boucle (réfléchit → cherche → teste → ajuste).
3. Claude renvoie un **plan candidat** (JSON).
4. **Notre code calcule un score déterministe** du candidat vs plan actuel.
5. **Si le score est meilleur → applique automatiquement + historise.** Sinon, ne touche à rien.
6. **Page dédiée** : historique des plans appliqués, avec **retour arrière** vers n'importe quel plan précédent.

### Décisions validées
- **Leviers** : ajuster les quantités ET remplacer/ajouter des aliments.
- **Jours** : variables autorisés (donc le critère régularité s'applique).
- **Sourcing** : piloté par les carences, requêtes USDA limitées à **Foundation / SR Legacy** (vrais aliments complets).
- **Modèle** : **Opus** (qualité de raisonnement max).
- **Juge** : **notre score déterministe** décide d'appliquer (Claude propose seulement).
- **Auto-application** : oui, dès que mieux noté. Pas de garde-fou supplémentaire — le score-gate fait foi (un aliment incomplet ou la suppression d'un supplément dégraderait le score, donc serait rejeté naturellement).

### Score (déterministe, somme pondérée)
- **Équilibre** (poids fort) : pour chaque nutriment, crédit = min(réel/cible, 1) — couvrir tout compte, pas de bonus à dépasser.
- **Calories/jour** : pénalité sur l'écart à la cible journalière + écart aux cibles par repas (30/35/10/25).
- **Simplicité** : pénalité par aliment supplémentaire dans un repas.
- **Régularité** : pénalité quand les jours diffèrent trop.
- Pondérations à régler finement lors de l'implémentation.

### Points pratiques à gérer à l'implémentation
- **Clé API Anthropic** (nouvelle variable d'env) + budget. ⚠️ Opus quotidien = coût non négligeable (estimer ~$3-15/mois selon tokens) ; utiliser la **mise en cache de prompt** pour réduire.
- **Limite de temps du cron Vercel** (~60s Hobby) : Opus + plusieurs allers-retours d'outils peut être long → **borner le nombre de tours d'agent par run** ; le progrès s'accumule jour après jour via l'historique.
- Réutiliser le cache d'aliments (table `Food`) pour limiter les appels USDA.
- Outils à coder + fonction d'application du plan + modèle `PlanHistory` (snapshots de plans appliqués avec score).
- Utiliser le skill `claude-api` (SDK Anthropic + prompt caching) au moment de coder.

## 7. Optimisation UX/UI mobile

**Idée** : l'app est pensée desktop (grille 7×4 large, dialogs centrés). L'optimiser pour le téléphone de l'utilisateur — c'est là qu'il consulte « ce qu'il doit manger ».

**À faire** :
- ⚠️ **Demander la résolution exacte du téléphone de l'utilisateur** avant de commencer.
- Repenser la grille « Ma Semaine » en mobile (la table 7 colonnes scrolle horizontalement aujourd'hui — pas idéal). Pistes : vue par jour (sélecteur de jour), accordéon, cartes empilées.
- Dialogs et formulaires adaptés au tactile (cibles de tap, plein écran sur mobile).
- Navigation et tailles de police adaptées.

## 8. (Plus tard) Détails mineurs

- Qualité de traduction MyMemory parfois mauvaise (ex : noms USDA avec mentions de programme USDA).
- Plusieurs RDA micronutriments sont des valeurs fixes, non ajustées à l'âge/sexe (la signature `rdaFn` le permet pourtant).
- Aucun test automatisé.
- `next build` de production à valider (longtemps tourné en dev uniquement).
