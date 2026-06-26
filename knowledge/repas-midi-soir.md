# Repas midi & soir

## Composition (identique les 7 jours)

**Midi** : pâtes (140 g) + poulet (65 g, tous les jours) + **protéine du jour en rotation** + carottes,
poivron rouge, huile d'olive + **Sauce tomate (ail, basilic) — 90 g**.
- Rotation protéine du jour (depuis 2026-06-26, pour limiter le saumon) :
  **Lun & Jeu saumon 130 g · Mar & Ven cabillaud 150 g · Mer & Sam lentilles 150 g cuites · Dim œufs 100 g**.
  Voir [poisson-saumon.md](poisson-saumon.md).
- Huile d'olive portée à **32 g** les jours maigres (cabillaud/lentilles) pour compenser le gras du
  poisson retiré (sinon les lipides tombent ~82 %). Reste à 17 g les jours saumon.

**Soir** : poulet, pâtes, brocoli, épinards, huile d'olive
+ **Sauce tomate (herbes de Provence) — 90 g** (ajoutée le 2026-06-26, pour le goût).

## Pourquoi ces sauces (décision 2026-06-26)

Même logique que le cacao au petit déj : améliorer le goût **sans casser le bilan**.

- Base = USDA « Tomato products, canned, sauce » (**salée**, fdcId 170054), ~24 kcal et **0,04 g de
  graisses saturées /100 g** → impact quasi nul côté lipides/calories.
  - *Historique* : d'abord posée en version « no salt added » (fdcId 169074, sodium 11 mg/100 g), puis
    Nicolas a demandé la version **salée** (sodium 474 mg/100 g) le 2026-06-26, ayant de la marge sur le sodium.
- Écartées : crème / beurre / fromage (carbonara, béchamel…) car **graisses saturées déjà au
  plafond (~118 %)** — c'est la vraie ligne sensible, voir [bilan-contraintes.md](bilan-contraintes.md).
- Le **sodium n'est PAS un plafond strict** : cible-fourchette 1500–2000 mg adaptée à un profil
  d'endurance. La sauce salée est donc parfaitement OK — voir [../MACRO_TARGETS.md](../MACRO_TARGETS.md).
- Respecte les goûts : **pas de citron, pas d'épicé** — voir [gouts-preferences.md](gouts-preferences.md).
- Deux herbages différents (basilic au midi, herbes de Provence au soir) = deux profils de goût
  distincts ; nutritionnellement identiques (les herbes/ail n'apportent rien de mesurable).

Implémenté comme **2 aliments custom** (`customFoodId` 3 et 4) pour que l'app affiche le nom de
chaque sauce, et non comme un simple aliment USDA partagé.

## Cuisson (préférence de Nicolas)

- **Air fryer 180 °C** pour légumes, poulet et poisson (méthode systématique). Bon choix nutritionnel
  (peu d'huile, peu de perte de vitamines vs eau bouillante).
- **Ne jamais mettre la sauce tomate dans le panier** : elle éclabousse, fume et empêche le doré →
  réchauffée à part et mélangée aux pâtes à la fin.
- Étaler les ajouts (le saumon/poisson cuit plus vite que le poulet ; épinards en toute fin). Poulet
  à vérifier à **74 °C** à cœur. Détail des étapes : page **Cuisiner** (`app/cuisiner/page.tsx`).

## Impact bilan mesuré (après ajout, sauce salée)

Graisses saturées 118 %→118 % (inchangé), calories 101 %→103 %, **sodium ~45 %→~102 %** (~1530 mg —
dans la fourchette saine 1500–2000, pas un dépassement problématique). Bonus léger : vit. C, potassium,
fibres. Aucune ligne serrée touchée.
