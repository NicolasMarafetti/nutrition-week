# Bilan — contraintes « load-bearing »

Lors de toute modif de repas, **toujours relire `/api/bilan`** avant de changer une source.
La plupart des nutriments sont en large surplus ; seuls quelques-uns sont serrés et conditionnent
la composition. État au **2026-07-29** (après ajout de la collation de 10h et retrait des
produits laitiers ordinaires) :

## Serrés — à NE PAS casser (déficits : viser ≥ 90%)

| Nutriment | % cible | Source critique |
|---|---|---|
| Lipides | ~91% | huile d'olive, **beurre de cacahuète (10h)**, chia, amandes |
| Glycine (collagène) | ~95% | collagène (peptides) + œuf + **beurre de cacahuète** |
| Glucides | ~96% | avoine, pâtes, pomme, banane |
| Oméga-6 | ~100% | huile d'olive, beurre de cacahuète, amandes |
| Créatine | ~100% (pile) | créatine monohydrate 3g |
| Calcium | ~101% | **lait sans lactose** (283 mg) + **yaourt soja enrichi** (198 mg) + amandes |
| Vitamine D | ~185% | **supplément D3 1000 UI** + lait sans lactose + yaourt soja |

→ Avant de retirer/remplacer **collagène, créatine, lait sans lactose, yaourt soja ou œuf**,
vérifier l'impact sur ces lignes. Le lait et le yaourt portent ensemble ~480 mg de calcium :
tout remplacement doit fournir une source équivalente, **enrichie en calcium et vit. D**.
Détail du raisonnement : [lait-lactose.md](lait-lactose.md).

## Cibles « hautes » — ni déficit à combler, ni mur de toxicité

| Nutriment | % cible (1500) | Note |
|---|---|---|
| **Sodium** | ~102% (~1530 mg) | **Pas un plafond strict.** Les références forment une fourchette **1500–2300 mg/j** (NASEM AI 1500 / EFSA-OMS 2000 / NASEM CDRR 2300) — ce sont des **cibles cardiovasculaires**, pas un seuil de danger. Pour un **marcheur d'endurance** (pertes sudorales 500–2000 mg/L), **~2000 mg est plus adapté** que 1500. Donc être autour de 1500–2000 est très bien ; pas besoin de minimiser à tout prix. Réserve : viser bas si hypertension/sensibilité au sel. Détails et sources → [../MACRO_TARGETS.md](../MACRO_TARGETS.md). |
| **Graisses saturées** | ~106% | **Toujours au-dessus du plafond (21 g)**, mais amélioré (118% → 106%). ⚠️ **C'est ce plafond qui empêche de combler la ligne « lipides » (91%)** : toute source de gras en apporte. Un ajustement calorique doit donc passer surtout par les **glucides** — c'est ce qui a été fait le 2026-07-29 (option « mixte à dominante glucides » : +95 kcal, glucides 92→96%, saturées 104→106% seulement). C'est la **vraie** ligne sensible : éviter crème, beurre, fromage. Levier restant si besoin : passer le lait sans lactose en **demi-écrémé** (−2 g env.), au prix d'un peu de calories et de vit. D. |
| Calories | ~102% | À la cible (surplus prise de masse inclus). Ne pas gonfler inutilement. |

→ Le seul « plafond » réellement contraignant ici est les **graisses saturées**. Le sodium est une cible
avec marge (la cible codée 1500 est la borne la plus stricte ; ~2000 conviendrait mieux à ce profil).

## En large surplus (marge pour ajuster)

Sélénium ~430%, Vit. K ~350%, Valine ~304%, Protéines ~301%, Isoleucine ~283%, Vit. C ~272%,
Leucine ~264%, Fer ~235%, Oméga-3 ~200%, Glutamine ~190%, Proline ~189%, Magnésium ~167%, etc.
→ Ajouter de petits ingrédients (ex : 5g cacao → +Fer/Magnésium/Fibres) ne pose aucun problème ici.

## Méthode

1. `curl http://localhost:3000/api/bilan` (le serveur dev doit tourner).
2. Le bilan = somme des `nutrients × grams/100` de tous les `MealEntry`, divisée par 7 (moyenne/jour).
3. Modifs de repas via l'API : `POST /api/foods/search {fdcId}` (cache) puis `POST /api/meals {day,meal,grams,foodId}`.
