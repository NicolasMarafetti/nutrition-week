# Bilan — contraintes « load-bearing »

Lors de toute modif de repas, **toujours relire `/api/bilan`** avant de changer une source.
La plupart des nutriments sont en large surplus ; seuls quelques-uns sont serrés et conditionnent
la composition. État au 2026-06-26 (semaine type actuelle) :

## Serrés — à NE PAS casser (déficits : viser ≥ 90%)

| Nutriment | % cible | Source critique au petit déj |
|---|---|---|
| Glycine (collagène) | ~98% | collagène (peptides) + œuf |
| Créatine | ~100% (pile) | créatine monohydrate 3g |
| Vitamine D | ~176% | **supplément D3 1000 UI** + lait entier (le saumon n'est plus quotidien) |
| Calcium | ~95% | lait entier |
| Glucides / Lipides | ~92% / ~91% | avoine, lait, banane |

→ Avant de retirer/remplacer **collagène, créatine, lait entier ou œuf** au petit déj, vérifier
l'impact sur ces lignes. Le lait entier porte à la fois vit. D et calcium : un remplacement doit
fournir une source équivalente de vit. D enrichie.

## Cibles « hautes » — ni déficit à combler, ni mur de toxicité

| Nutriment | % cible (1500) | Note |
|---|---|---|
| **Sodium** | ~102% (~1530 mg) | **Pas un plafond strict.** Les références forment une fourchette **1500–2300 mg/j** (NASEM AI 1500 / EFSA-OMS 2000 / NASEM CDRR 2300) — ce sont des **cibles cardiovasculaires**, pas un seuil de danger. Pour un **marcheur d'endurance** (pertes sudorales 500–2000 mg/L), **~2000 mg est plus adapté** que 1500. Donc être autour de 1500–2000 est très bien ; pas besoin de minimiser à tout prix. Réserve : viser bas si hypertension/sensibilité au sel. Détails et sources → [../MACRO_TARGETS.md](../MACRO_TARGETS.md). |
| **Graisses saturées** | ~118% | **Déjà au-dessus du plafond (20 g).** C'est la **vraie** ligne sensible : éviter crème, beurre, fromage. |
| Calories | ~103% | À la cible (surplus prise de masse inclus). Ne pas gonfler inutilement. |

→ Le seul « plafond » réellement contraignant ici est les **graisses saturées**. Le sodium est une cible
avec marge (la cible codée 1500 est la borne la plus stricte ; ~2000 conviendrait mieux à ce profil).

## En large surplus (marge pour ajuster)

Protéines ~313%, BCAA ~300-350%, Sélénium ~477%, Vit. K ~342%, B12 ~282%, Oméga-3 ~256%,
Vit. C ~242%, Proline ~211%, Glutamine ~201%, Fer ~200-208%, etc.
→ Ajouter de petits ingrédients (ex : 5g cacao → +Fer/Magnésium/Fibres) ne pose aucun problème ici.

## Méthode

1. `curl http://localhost:3000/api/bilan` (le serveur dev doit tourner).
2. Le bilan = somme des `nutrients × grams/100` de tous les `MealEntry`, divisée par 7 (moyenne/jour).
3. Modifs de repas via l'API : `POST /api/foods/search {fdcId}` (cache) puis `POST /api/meals {day,meal,grams,foodId}`.
