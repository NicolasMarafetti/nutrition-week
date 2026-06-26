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

## Sodium (minéral)

- **Valeur retenue (actuelle dans `lib/nutrients.ts`)** : **1500 mg / jour**, commentée « apport adéquat ».
  Le sel ajouté à la cuisson **n'est pas tracké** (seul le sodium intrinsèque des aliments l'est).
- **Statut** : ce n'est **ni une limite de toxicité, ni un plafond strict**. Toutes les références ci-dessous
  sont des **cibles de prévention cardiovasculaire** (réduire la tension artérielle dans la population
  générale), pas un seuil au-delà duquel on serait « en danger ». Les valeurs varient selon l'organisme.

### Panorama des références officielles

| Organisme | Valeur sodium / j | Nature de la valeur |
|---|---|---|
| **NASEM/IOM (US) 2019** | **1500 mg** (14–50 ans) | *Adequate Intake* (AI). C'est la valeur reprise par l'app et par l'American Heart Association comme « idéal ». La plus basse / la plus stricte. |
| **NASEM (US) 2019** | **2300 mg** | *CDRR* (Chronic Disease Risk Reduction) : seuil **au-dessus duquel** il est recommandé de réduire pour baisser le risque chronique. |
| **EFSA (Europe) 2019** | **2000 mg** | *Safe and adequate intake* pour l'adulte UE : niveau jugé sûr **et** suffisant pour l'équilibre sodique, avec confiance dans une baisse du risque cardiovasculaire. |
| **OMS 2023** | **< 2000 mg** | Maximum recommandé (= < 5 g de sel/j). |
| **ANSES** | besoin physiologique **~1500 mg** ; objectif de santé publique exprimé en **sel** (réduire vers ≤ ~5 g sel/j ; cibles PNNS historiques 6,5–8 g sel selon sexe). | Le travail ANSES vise surtout à **faire baisser** la surconsommation française (8,7 g sel/j hommes, 6,7 g femmes), pas à fixer un minimum. |

- **Conversion sel ↔ sodium** : **1 g de sodium = 2,5 g de sel (NaCl)** ; **1 g de sel = 0,4 g de sodium**.
  Donc 1500 mg sodium ≈ **3,8 g de sel**, et 2000 mg sodium ≈ **5 g de sel**.
- **Lecture** : les références convergent vers une **fourchette de 1500 à 2300 mg/j**. 1500 (NASEM/AHA) est
  le bas « idéal » ; 2000 (EFSA/OMS) le repère « sûr et adéquat » européen ; 2300 (NASEM CDRR) le seuil
  au-delà duquel réduire. Aucune n'est un mur de toxicité.

### Contexte spécifique : marche de compétition (endurance)

- L'utilisateur est **marcheur de compétition (longues distances)** → pertes sudorales importantes.
  Le sodium évacué par la sueur est de **500–2000 mg par litre**, pour un débit sudoral de **1–3 L/h** :
  une sortie longue peut faire perdre **plusieurs centaines de mg à > 1 g** de sodium.
- Le sodium soutient le **volume plasmatique, l'hydratation, la fonction neuromusculaire** et prévient
  l'**hyponatrémie d'effort**. Pour ce profil, viser le **bas de la fourchette (1500) est inutilement
  restrictif** ; **~2000 mg/j (EFSA/OMS) est plus adapté**, avec un apport supplémentaire les jours de
  sortie longue (réhydratation sodée).
- **Réserve** : en cas d'**hypertension** ou de **sensibilité au sel** diagnostiquée, viser le bas
  (≤ 1500 mg) redevient préférable.

### Recommandation pour ce projet

- Passer la cible de **1500 → 2000 mg/j** (alignement EFSA/OMS, mieux adapté au profil d'endurance), **et**
  traiter le sodium comme une **cible avec marge** plutôt qu'un plafond rigide. À 2000 mg, le plan actuel
  (~1500 mg) garde de la marge ; la sauce tomate salée n'est plus du tout un « dépassement ».

- **Sources** :
  - EFSA NDA Panel, *Dietary reference values for sodium*, EFSA Journal 2019;17(9):5778 — apport sûr et adéquat **2,0 g/j**. https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2019.5778
  - NASEM (US National Academies), *Dietary Reference Intakes for Sodium and Potassium* (2019) — AI **1500 mg**, CDRR **2300 mg**. https://nap.nationalacademies.org/resource/25353/030519DRISodiumPotassium.pdf
  - OMS, *Sodium reduction* fact sheet (2023) — **< 2 g sodium/j** (< 5 g sel). https://www.who.int/news-room/fact-sheets/detail/sodium-reduction
  - ANSES, *Salt / Sel* — surconsommation française, objectifs de réduction PNNS. https://www.anses.fr/en/content/salt
  - Baker LB, et al. *Normative data for sweating rate, sweat sodium concentration and sweat sodium loss in athletes.* J Sports Sci. 2019 — pertes sudorales **500–2000 mg Na/L**. https://www.tandfonline.com/doi/full/10.1080/02640414.2019.1633159

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
| Sodium | 1500 mg/j (code) — **2000 recommandé** | cible cardiovasculaire, pas un plafond ; profil endurance | EFSA 2019 / NASEM 2019 / OMS 2023 |
