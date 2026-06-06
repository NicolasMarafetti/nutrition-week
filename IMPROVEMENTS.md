# NutriWeek — Améliorations à traiter

Suivi des points identifiés. Ordre = priorité décidée avec l'utilisateur.

## 1. Sodium & graisses saturées : plafonds, pas cibles — DÉCIDÉ (pas de système spécifique)

Décision utilisateur : ne pas construire de logique dédiée (type `ceiling`/`range`).
- **Sodium** : cible simplement abaissée à **1500 mg/jour** (apport adéquat adulte). Le sel de cuisson, non tracké, complète. ✅ Fait.
- **Graisses saturées** : laissé tel quel (cible ~20 g via `poids × 0.3`). Les aliments recommandés sont sains, donc non prioritaire. Différé.

Note : un vrai système `target`/`ceiling`/`range` reste l'option propre si on veut un jour distinguer « atteindre » de « rester sous ». Pas demandé pour l'instant.

## 2. Incohérence du calcul des calories

**Problème** : la page Profil affiche ~2940 kcal (Mifflin-St Jeor complet avec taille/âge × 1.55 + 400), mais le Bilan vise ~2431 kcal (formule simplifiée dans `lib/nutrients.ts` : `(10*poids + 625 + 5) * 1.55 + 400`). Deux formules pour la même chose.

**À faire** :
- Source unique de vérité pour le TDEE/cible calorique (idéalement Mifflin-St Jeor complet, partagé entre Profil et Bilan).
- Vérifier que les macros dérivées (glucides ~45% des calories) utilisent la même base.

## 3. Sécuriser les routes destructrices `/api/admin/*`

**Problème** : `/api/admin/clean` (supprime des aliments + entrées repas), `reextract`, `translate` sont ouvertes sans authentification. Risque de perte de données une fois en ligne.

**À faire** :
- Protéger derrière un secret (header/clé via variable d'env) ou les désactiver en production.
- Réflexion plus large : l'app n'a aucune auth, donc les routes d'écriture normales (ajout/suppression de repas) sont aussi ouvertes. Pour un usage perso en ligne, envisager un mot de passe simple à l'échelle du site.

## 4. Backup régulier de la base de données (Neon)

**Problème** : toutes les données repas vivent dans Neon. Une suppression (accident, route admin, visiteur) = perte sèche. Git ne sauvegarde que le code.

**À faire** :
- Mettre en place un export/backup régulier de la BDD Neon (les repas, le profil, les aliments custom).
- Pistes : Neon a des branches/snapshots ; sinon un petit script `pg_dump` planifié, ou une route d'export JSON déclenchée périodiquement.
- À articuler avec le point #3 (sécuriser l'écriture) : les deux protègent les données.

## 5. (Plus tard) Détails mineurs

- Qualité de traduction MyMemory parfois mauvaise (ex : noms USDA avec mentions de programme USDA).
- Plusieurs RDA micronutriments sont des valeurs fixes, non ajustées à l'âge/sexe (la signature `rdaFn` le permet pourtant).
- Aucun test automatisé.
- `next build` de production à valider (longtemps tourné en dev uniquement).
