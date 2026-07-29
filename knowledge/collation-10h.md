# Collation de 10h

Ajoutée le **2026-07-29** à la demande de Nicolas : la journée passe de **4 à 5 repas**.

## Part calorique et rééquilibrage

Nicolas a choisi une **collation légère (~10% de l'AET)**, pas un second petit-déjeuner.
Nouvelle répartition (`MEAL_DISTRIBUTION`, lib/nutrients.ts) :

| Repas | Avant | Après |
|---|---|---|
| Petit-déjeuner | 30% | **25%** |
| **Collation 10h** | — | **10%** |
| Déjeuner | 35% | **32%** |
| En-cas (après-midi) | 10% | **8%** |
| Dîner | 25% | 25% |

Le total journalier était déjà à la cible (~102%) : les 294 kcal de la collation ont donc été
**pris sur les repas existants**, pas ajoutés. Coupes appliquées sur les 7 jours :
- avoine **80 → 60 g** et banane **120 → 100 g** au petit-déj ;
- pâtes **140 → 105 g** au déjeuner (le dîner garde ses 135 g) ;
- retrait des **10 g de noix** de l'en-cas (l'oméga-3 reste à ~200% grâce au chia).

> **Réajusté le 2026-07-29** après le passage de la cible à 3102 kcal (poids visé projeté sur
> l'historique) : avoine **60 → 68 g**, pomme **180 → 210 g**, pâtes du midi **105 → 115 g**,
> huile d'olive du midi **+2 g** (19 g jours saumon / 34 g jours maigres).

## Contenu retenu : pomme 210 g + beurre de cacahuète 30 g (~310 kcal)

Pourquoi cette combinaison plutôt qu'une autre :
- **Zéro préparation, transportable** — critère « simplicité » de PLAN_OPTIMIZATION.md.
- Le beurre de cacahuète **sans sel** (USDA SR Legacy 172470, pas la version salée) remonte la
  ligne **lipides** qui était le pire déficit du bilan (90%), avec des graisses surtout
  insaturées → ça ne pousse pas les **graisses saturées**, seul vrai plafond du plan.
- Bonus non négligeables : **0,43 g de glycine** par portion (la glycine est serrée, ~94%),
  magnésium, vitamine E, potassium.
- Compatible avec les goûts : ni citron ni épicé (voir [gouts-preferences.md](gouts-preferences.md)).

Écartés : plus d'amandes (déjà 25 g à l'en-cas, monotone), les produits laitiers (voir
[lait-lactose.md](lait-lactose.md)), le pain (glucides déjà couverts par 2 portions de pâtes/jour).
