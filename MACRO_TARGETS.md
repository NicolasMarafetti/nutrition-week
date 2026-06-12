# Cibles de macronutriments — valeurs retenues et sources

Ce document justifie chaque cible utilisée dans `lib/nutrients.ts` pour les macronutriments,
avec les sources officielles. Les valeurs visent un **adulte en population générale**
(recommandations standard), **sans multiplicateur d'activité** (retiré à la demande de l'utilisateur).

> Priorité aux sources officielles : **ANSES** (agence française), **EFSA** (Europe).
> Les forums ne sont pas utilisés (non fiables).

---

## Énergie (calories)

- **Valeur retenue** : `métabolisme de base (Mifflin-St Jeor) + 400 kcal` (surplus prise de masse), **sans facteur d'activité**.
- **Méthode BMR** : équation de Mifflin-St Jeor (référence clinique courante).
  - Homme : `10 × poids(kg) + 6,25 × taille(cm) − 5 × âge + 5`
  - Femme : `… − 161`
- **Note importante** : retirer le multiplicateur d'activité (×1,55) signifie que la cible
  ne couvre plus la dépense liée à l'activité physique. Pour une personne active, la cible
  obtenue est donc **volontairement basse** (proche du repos + surplus). Choix assumé par l'utilisateur.
- **Sources** :
  - Mifflin MD, St Jeor ST, et al. *A new predictive equation for resting energy expenditure in healthy individuals.* Am J Clin Nutr. 1990. https://pubmed.ncbi.nlm.nih.gov/2305711/

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

---

## Récapitulatif

| Macro | Cible | Base | Source principale |
|---|---|---|---|
| Énergie | BMR + 400 kcal (sans ×activité) | Mifflin-St Jeor | Mifflin 1990 |
| Protéines | 0,83 g/kg | PRI population | EFSA 2012 / ANSES 2016 |
| Lipides | 35 % AET | borne basse ANSES | ANSES 2016 / EFSA |
| Glucides | 50 % AET | médiane 45-60 % | ANSES 2016 / EFSA 2010 |
| Fibres | 30 g/j | apport satisfaisant | ANSES 2016 |
