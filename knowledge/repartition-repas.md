# Répartition calorique entre les repas

Source de vérité : `MEAL_DISTRIBUTION` dans [../lib/nutrients.ts](../lib/nutrients.ts).

| Repas | 2026-07-29 | **2026-08-09 (actuel)** |
|---|---|---|
| Petit-déjeuner | 25% | 25% |
| Collation 10h | 10% | **15%** |
| Déjeuner | 32% | **27%** |
| En-cas 16h | 8% | **13%** |
| Dîner | 25% | **20%** |

## Décision du 2026-08-09 — « plan B »

Nicolas n'arrivait pas à **finir le déjeuner et le dîner** ; les deux collations passaient sans
effort. 5 points de l'AET ont donc été retirés à chacun des deux gros repas et reportés sur les
deux collations (±315 kcal déplacées).

### Le raisonnement, qui n'est pas dans les chiffres du bilan

Le bilan compare des plans **sur le papier**, en supposant que tout est mangé. Sur ce terrain les
trois options testées se tenaient à quelques points près — aucun argument nutritionnel ne
défendait le statu quo.

Ce qui a tranché : **un plan à 3102 kcal dont on laisse ~150 kcal deux fois par jour est un plan à
~2800 kcal, soit le surplus de prise de masse annulé.** C'est l'objectif principal qui saute. Et ce
qu'on laisse dans l'assiette (pâtes, poulet, poisson, huile d'olive) touche justement les lignes
déjà serrées. **L'observance prime sur l'optimum théorique.**

### Options écartées

Trois scénarios ont été simulés sur les données réelles :

| | Actuel | A — scaling uniforme | **B — coupe ciblée** | C — ajouts fruit seul |
|---|---|---|---|---|
| Lipides | 91% | 99% | **96%** | 90% |
| Glucides | 96% | 94% | **96%** | 101% |
| Sodium | 98% | 85% | **96%** | 95% |
| Gr. saturées | 106% | 111% | **110%** | 106% |
| Calcium | 102% | 116% | **114%** | 100% |

- **A** (tout ×facteur) : casse le sodium à 85%, parce que la sauce tomate rétrécit avec le repas.
  Or le sodium doit rester dans 1500–2000 mg pour un marcheur d'endurance — voir
  [bilan-contraintes.md](bilan-contraintes.md).
- **C** (n'ajouter que du fruit aux collations) : tient le plafond des graisses saturées à 106%
  mais laisse les **lipides à 90%**, le pire déficit du plan, sans amélioration.
- **B** retenue : coupe là où le volume gêne (**les féculents et les légumes, pas la protéine ni le
  poisson**), garde la sauce et l'huile d'olive intactes, et récupère quand même 5 points de lipides.
  Le +1 g de graisses saturées est un coût négligeable face à un déficit calorique chronique.

### Grammages modifiés (les 7 jours)

- **Déjeuner** : pâtes 115→**80 g**, carottes 80→**55 g**, poivron 70→**50 g**, poulet 65→**50 g**.
  Sauce (90 g), huile d'olive et la protéine du jour **inchangées**.
- **Dîner** : pâtes 135→**95 g**, brocoli 90→**70 g**, poulet 130→**110 g**. Sauce, huile et
  épinards inchangés.
- **Collation 10h** : pomme 210→**280 g**, beurre de cacahuète 30→**38 g**, **+ banane 80 g**.
- **En-cas 16h** : yaourt soja 150→**250 g**, amandes 25→**28 g**, **+ banane 90 g**.

La banane a été choisie pour les ajouts : zéro préparation, dominante glucides (n'aggrave pas le
plafond des graisses saturées), déjà au plan donc aucun nouvel aliment à acheter.

## Risque identifié — à surveiller

Un en-cas de 16h à ~400 kcal arrive **2 à 3 h avant le dîner** et peut couper l'appétit du soir,
recréant le problème un cran plus loin. Si ça se produit, les correctifs sont :
1. décaler l'en-cas vers 15h ;
2. basculer une partie des 5 points du dîner vers la **collation de 10h** plutôt que celle de 16h.

**Juge de paix : les pesées** ([composition-corporelle.md](composition-corporelle.md)), pas le bilan.
Le bilan ne mesure que l'intention ; seuls le poids et le %MG disent si les calories passent
réellement. Horizon d'évaluation : 2 à 3 semaines à partir du 2026-08-09.

## Rappel technique

Changer `MEAL_DISTRIBUTION` **ne modifie pas le bilan** : `/api/bilan` somme tous les `MealEntry`
sans regarder le repas. La constante ne pilote que les cibles par repas affichées sur « Ma Semaine ».
Toute vraie modification de la couverture passe par les **grammages**.
