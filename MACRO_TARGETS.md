# Cibles de macronutriments — valeurs retenues et sources

Ce document justifie chaque cible utilisée dans `lib/nutrients.ts` pour les macronutriments,
avec les sources officielles. Les valeurs des macros (protéines, lipides, glucides, fibres)
visent un **adulte en population générale** (recommandations standard ANSES/EFSA).
L'énergie utilise le métabolisme de base **× facteur d'activité (actif, ×1,55)** + surplus prise de masse.

> Priorité aux sources officielles : **ANSES** (agence française), **EFSA** (Europe).
> Les forums ne sont pas utilisés (non fiables).

---

## Énergie (calories)

- **Valeur retenue** : `métabolisme de base (Mifflin-St Jeor) × 1,55 (actif) + 400 kcal` (surplus prise de masse).
- **Méthode BMR** : équation de Mifflin-St Jeor (référence clinique courante).
  - Homme : `10 × poids(kg) + 6,25 × taille(cm) − 5 × âge + 5`
  - Femme : `… − 161`
- **Facteur d'activité** : ×1,55 correspond à un niveau « actif » (PAL — Physical Activity Level),
  qui convertit le métabolisme de repos en dépense énergétique journalière totale (TDEE).
- **Sources** :
  - Mifflin MD, St Jeor ST, et al. *A new predictive equation for resting energy expenditure in healthy individuals.* Am J Clin Nutr. 1990. https://pubmed.ncbi.nlm.nih.gov/2305711/
  - FAO/WHO/UNU, *Human energy requirements* (2004) — niveaux d'activité physique (PAL). https://www.fao.org/3/y5686e/y5686e00.htm

## Protéines

- **Valeur retenue** : **0,83 g/kg de poids corporel / jour**.
- **Justification** : c'est l'Apport de référence pour la population (PRI) d'EFSA pour l'adulte,
  équivalent à l'ANSES (0,8 g/kg). Représente le besoin de la population générale (pas un niveau sportif).
- **Sources** :
  - EFSA, *Scientific Opinion on Dietary Reference Values for protein*, EFSA Journal 2012;10(2):2557 — PRI 0,83 g/kg/j. https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2012.2557
  - ANSES, *Actualisation des repères du PNNS — références nutritionnelles* (déc. 2016) — 0,8 g/kg/j, ≥10% AET. https://www.anses.fr/fr/system/files/NUT2012SA0103Ra-2.pdf

## Lipides

- **Valeur retenue** : **35 % de l'apport énergétique total (AET)**, à 9 kcal/g.
- **Justification** : l'ANSES recommande 35-40 % de l'AET pour les lipides totaux ; on retient la
  borne basse (35 %), cohérente aussi avec la borne haute d'EFSA (20-35 %).
- **Sources** :
  - ANSES (déc. 2016) — lipides 35-40 % AET. https://www.anses.fr/fr/system/files/NUT2012SA0103Ra-2.pdf
  - EFSA, *Dietary Reference Values for fats* — intervalle de référence 20-35 % E. https://www.efsa.europa.eu/en/efsajournal/pub/1461

## Glucides

- **Valeur retenue** : **50 % de l'AET**, à 4 kcal/g.
- **Justification** : ANSES (45-60 % AET) et EFSA (45-60 % E) convergent ; on retient la valeur médiane (50 %).
- **Sources** :
  - ANSES (déc. 2016) — glucides 45-60 % AET (min. 40 %). https://www.anses.fr/fr/system/files/NUT2012SA0103Ra-2.pdf
  - EFSA, *Scientific Opinion on Dietary Reference Values for carbohydrates and dietary fibre*, EFSA Journal 2010;8(3):1462 — 45-60 % E. https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2010.1462

## Fibres

- **Valeur retenue** : **30 g / jour**.
- **Justification** : apport satisfaisant de l'ANSES pour l'adulte. EFSA retient 25 g/j ;
  on prend la valeur française (30 g), plus exigeante.
- **Sources** :
  - ANSES (déc. 2016) — apport satisfaisant 30 g/j. https://www.anses.fr/fr/system/files/NUT2012SA0103Ra-2.pdf
  - EFSA (2010) — 25 g/j adéquats pour un transit normal. https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2010.1462

## Collagène (supplément)

- **Valeur retenue** : **15 g / jour** de peptides de collagène hydrolysés, **avec vitamine C**,
  pris ~30–60 min **avant l'effort** (marche de compétition).
- **Statut particulier** : le collagène **n'est pas un nutriment essentiel** (le corps le synthétise).
  Il n'existe donc **aucune valeur de référence officielle ANSES/EFSA** — EFSA n'a fixé aucune DRV et a
  même **rejeté en 2011** l'allégation santé « collagène hydrolysé / maintien des articulations ».
  La cible retenue ici vient de la **littérature clinique**, pas d'une agence.
- **Justification** : la fourchette efficace est 5–15 g/j ; la majorité des RCT utilisent 10 ou 15 g/j.
  Pour les **tendons** (profil de l'utilisateur), le protocole le mieux étudié est ~15 g + vitamine C
  avant l'exercice : la charge mécanique de l'effort déclenche la synthèse de collagène, que les peptides
  amplifient. Bénéfices modestes (tendons, douleur articulaire) visibles après 8–12 semaines de prise
  régulière. Au-delà de ~15 g, aucun bénéfice supplémentaire démontré.
- **Note d'usage app** : ce n'est pas une cible RDA dans `lib/nutrients.ts` (l'app track glycine 10 g,
  proline 5 g, vitamine C 90 mg). Le collagène est un **supplément à conserver dans le plan** — voir
  `PLAN_OPTIMIZATION.md`. Il reste la principale source de glycine du plan.
- **Sources** :
  - Khatri M, et al. *The effects of collagen peptide supplementation on body composition, collagen
    synthesis, and recovery from joint injury and exercise: a systematic review.* (2021).
    https://pmc.ncbi.nlm.nih.gov/articles/PMC8521576/
  - Shaw G, et al. *Vitamin C–enriched gelatin supplementation before intermittent activity augments
    collagen synthesis.* Am J Clin Nutr. 2017. https://pubmed.ncbi.nlm.nih.gov/27852613/
  - EFSA NDA Panel, *Scientific Opinion on collagen hydrolysate and maintenance of joints* — allégation
    **non fondée** (2011). https://efsa.onlinelibrary.wiley.com/doi/abs/10.2903/j.efsa.2011.2291

## Glycine (acide aminé)

- **Valeur retenue** : **8 g / jour**.
- **Statut particulier** : la glycine est un acide aminé **dispensable / conditionnellement essentiel**
  (le corps la synthétise). Les agences (ANSES, EFSA, IOM) **ne fixent une valeur de référence que pour
  les acides aminés indispensables** — il n'existe donc **aucune DRV officielle pour la glycine**.
  La cible retenue ici est un **repère de recherche**, pas une recommandation d'agence.
- **Justification** : on aligne la cible sur la **synthèse endogène estimée** (~8 g/j chez un adulte
  de 70 kg), qui est déjà bien au-dessus de l'apport alimentaire moyen de la population (~3,2 g/j,
  NHANES). Une hypothèse de recherche (Meléndez-Hevia, 2009) suggère un besoin métabolique pouvant
  atteindre ~10 g/j, mais elle est **débattue et non consensuelle** ; on retient donc la borne
  « synthèse endogène » (8 g), plus prudente, après avoir ramené le collagène à 15 g.
- **Sources** :
  - EFSA — Dietary Reference Values (valeurs fixées pour les AA indispensables uniquement).
    https://www.efsa.europa.eu/en/topics/topic/dietary-reference-values
  - VKM, *Risk assessment of "other substances" – glycine* (2016) — synthèse endogène ~8 g/j,
    apport alimentaire moyen ~3,2 g/j.
    https://vkm.no/download/18.645b840415d03a2fe8f25c8b/1502711280583/Risk%20assessment%20of%20%22other%20substances%22%20%E2%80%93%20glycine.pdf
  - Meléndez-Hevia E, et al. *A weak link in metabolism: the metabolic capacity for glycine
    biosynthesis does not satisfy the need for collagen synthesis.* J Biosci. 2009 (hypothèse débattue).
    https://pubmed.ncbi.nlm.nih.gov/20009312/

---

## Récapitulatif

| Macro | Cible | Base | Source principale |
|---|---|---|---|
| Énergie | BMR × 1,55 + 400 kcal | Mifflin-St Jeor + PAL actif | Mifflin 1990 / FAO 2004 |
| Protéines | 0,83 g/kg | PRI population | EFSA 2012 / ANSES 2016 |
| Lipides | 35 % AET | borne basse ANSES | ANSES 2016 / EFSA |
| Glucides | 50 % AET | médiane 45-60 % | ANSES 2016 / EFSA 2010 |
| Fibres | 30 g/j | apport satisfaisant | ANSES 2016 |
| Collagène (supplément) | 15 g/j + vit. C, avant l'effort | littérature clinique (pas de DRV officielle) | Khatri 2021 / Shaw 2017 |
| Glycine | 8 g/j | synthèse endogène (pas de DRV officielle) | VKM 2016 / Meléndez-Hevia 2009 |
