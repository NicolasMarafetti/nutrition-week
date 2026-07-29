# Lait & produits laitiers — mauvaise digestion

Décision **2026-07-29** : Nicolas digère mal le lait → **plus de lait « normal » dans les repas**.

## Ce qui a été fait

| Avant | Après | Pourquoi |
|---|---|---|
| Lait entier 250 g (petit-déj, 7j) | **Lait entier sans lactose** 250 g | Choix explicite de Nicolas |
| Yaourt nature lait entier 150 g (en-cas, 7j) | **Yaourt soja nature** 150 g (SILK, USDA SR Legacy 175227) | Nicolas a demandé à le remplacer aussi |

## Le lait sans lactose est nutritionnellement identique

C'est du lait ordinaire auquel on a ajouté de la **lactase** : le lactose est pré-digéré en
glucose + galactose. Calcium, vitamine D, protéines, lipides sont **inchangés**. C'est pourquoi
il est implémenté comme **aliment custom (`customFoodId` 6)** clonant exactement le profil
nutritionnel du lait entier USDA (fdcId 171265) — et non comme une entrée USDA « Branded »
dont la couverture en micronutriments est très pauvre.

## Le yaourt soja est un meilleur échange qu'il n'y paraît

Par portion de 150 g, comparé au yaourt au lait entier :

| | Yaourt lait entier | Yaourt soja | Effet |
|---|---|---|---|
| Calcium | 182 mg | **198 mg** | + |
| Vitamine D | 0,15 µg | **1,95 µg** | ++ |
| Graisses saturées | 3,14 g | **0,33 g** | **−2,8 g** — soulage le seul plafond du plan |
| Protéines | 5,2 g | 4,0 g | sans effet (protéines à ~300%) |

→ Le calcium reste à **101% de la cible** après les deux remplacements. C'était le vrai risque :
lait + yaourt portaient ensemble ~465 mg de calcium/jour. Garder le lait (sans lactose) sauve
283 mg ; le yaourt soja enrichi rend les 182 mg restants.

## À retenir pour les prochaines modifs

- **Ne pas réintroduire de lait ordinaire, ni de fromage, ni de crème** — au motif digestion
  *et* au motif graisses saturées (voir [bilan-contraintes.md](bilan-contraintes.md)).
- Si on retire le lait sans lactose un jour, il faut **remplacer 283 mg de calcium et ~3,2 µg de
  vitamine D** par autre chose (boisson végétale enrichie, tofu au sulfate de calcium…).
- Le yaourt soja n'a **pas de profil d'acides aminés** dans l'USDA : il ne compte pas comme source
  de glycine/leucine. Sans importance ici (tous en large surplus sauf la glycine, qui vient du
  collagène).
