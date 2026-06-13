# Optimisation manuelle du plan — rubrique à suivre

Quand l'utilisateur demande d'**améliorer / optimiser sa semaine**, suivre cette rubrique
**systématiquement** (mêmes critères à chaque fois, pas d'improvisation).

> Contexte : l'optimiseur automatique (cron + agent Claude, cf. IMPROVEMENTS.md #6) a été
> jugé trop lourd. On garde le raisonnement de Claude, mais **en manuel, dans une session**.
> Cette rubrique formalise les conditions de notation décidées avec l'utilisateur.

## Contraintes (à ne jamais violer)

- Structure **4 repas/jour** : Petit-déjeuner / Déjeuner / En-cas / Dîner.
- **Garder les suppléments** : créatine 3 g et collagène 15 g (seules sources de créatine et de
  glycine — les retirer crée immédiatement un déficit). Collagène : à prendre avec vitamine C,
  ~30–60 min avant la marche. Dose justifiée dans MACRO_TARGETS.md.
- N'utiliser que des aliments USDA **Foundation / SR Legacy** (données nutritionnelles complètes).
  Éviter les entrées Branded/incomplètes et la liste des aliments ignorés.
- **Sodium** : cible 1500 mg, ne pas chercher à la dépasser. **Graisses saturées** : rester bas est sain.
- Appliquer les changements sur **les 7 jours** (l'utilisateur garde la semaine identique chaque jour).

## Critères de notation (par ordre de priorité)

1. **Équilibre** (critère principal) : couvrir les ~32 nutriments au plus proche de 100 %.
   Crédit par nutriment = `min(réel / cible, 1)` — pas de bonus à dépasser la cible.
   Traiter en priorité les déficits les plus sévères (les plus bas en %).
2. **Calories par jour** : total quotidien le plus proche possible de `calorieTarget` (≈ 2940 kcal
   pour le profil actuel). Et répartition par repas proche de **30 / 35 / 10 / 25 %**
   (petit-déj / déj / en-cas / dîner), tolérance ±15 %.
3. **Simplicité** : minimiser le nombre d'aliments distincts par repas (repas faciles à préparer).
4. **Régularité** : garder les jours cohérents entre eux (éviter une grande variation jour par jour).

## Règle d'analyse (IMPORTANTE)

**Toujours vérifier les contributions réelles via l'API avant d'attribuer une source de nutriment.**
Ne jamais affirmer « tel aliment apporte tel nutriment » de mémoire / connaissance générale.
`GET /api/bilan` renvoie un champ `contributions` : un objet `{ [clé_nutriment]: [{ name, amount }] }`
trié par apport décroissant (moyenne/jour). C'est la **seule source de vérité** pour dire d'où vient
un nutriment. (Ex. réel constaté : ce sont les **pâtes** qui fournissent 66% du sélénium, pas l'œuf
ni le poisson comme on pourrait le supposer.)

## Processus

1. Lire le bilan : `GET /api/bilan` (déficits triés ; champ `contributions` pour les sources réelles).
2. Pour chaque déficit, choisir un **aliment entier riche** dans ce nutriment (connaissance
   nutritionnelle), vérifier les valeurs réelles via l'USDA, puis l'ajouter ou ajuster les grammes.
3. **Ordre de préférence des actions** : d'abord ajuster les **quantités** d'aliments déjà présents
   (préserve simplicité + régularité), puis seulement ajouter de **nouveaux aliments** si nécessaire.
4. Vérifier la **répartition calorique par repas** et le **total journalier**.
5. **Re-vérifier le bilan après modifications** pour confirmer le gain, sans créer de nouveau déficit
   ni de dépassement inutile.
6. Résumer à l'utilisateur : ce qui a été ajouté/ajusté, et l'effet sur le bilan (avant → après).
