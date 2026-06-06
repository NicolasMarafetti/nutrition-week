# NutriWeek — Améliorations à traiter

Suivi des points identifiés. Ordre = priorité décidée avec l'utilisateur.

## 1. Sodium & graisses saturées : plafonds, pas cibles

**Problème** : le bilan traite tous les nutriments comme « atteindre 100% ». Or :
- **Sodium** = une **fourchette** : plancher ~1500 mg/jour, plafond ~2300 mg/jour. En-dessous du plancher = trop peu ; au-dessus du plafond = trop. (Athlète d'endurance : besoin potentiellement plus élevé.)
- **Graisses saturées** = un **plafond** seul : rester sous ~20-25 g/jour (≈10% des calories). Plus bas = mieux. Pas de plancher.

**À faire** :
- Introduire une notion de type de nutriment : `target` (atteindre), `ceiling` (rester sous), `range` (entre plancher et plafond).
- Affichage : « OK » quand dans la zone saine, alerte distincte si trop bas (range) ou si dépassement (ceiling). Ne plus afficher « Déficit » rouge pour un sodium bas.
- Couleurs/labels adaptés par type.

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

## 4. (Plus tard) Détails mineurs

- Qualité de traduction MyMemory parfois mauvaise (ex : noms USDA avec mentions de programme USDA).
- Plusieurs RDA micronutriments sont des valeurs fixes, non ajustées à l'âge/sexe (la signature `rdaFn` le permet pourtant).
- Aucun test automatisé.
- `next build` de production à valider (longtemps tourné en dev uniquement).
