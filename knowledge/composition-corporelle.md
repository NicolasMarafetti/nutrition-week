# Composition corporelle & mesures FeelFit

Décision **2026-07-29** : l'objectif de Nicolas devient **17,5% de matière grasse**, et l'app
doit accueillir l'historique de sa balance connectée **FeelFit** pour l'analyse.

## L'objectif 17,5% a REMPLACÉ le poids cible

Décision **2026-07-29** (même journée) : `targetWeightKg` est **supprimé** de la base. L'objectif
de corpulence s'exprime uniquement en % de masse grasse ; le poids correspondant se déduit.
Le retrait était sans risque : `targetWeightKg` n'alimentait **aucun calcul** (la cible calorique
part du poids *actuel*), il n'était qu'affiché.

### Le calcul du poids correspondant

```
1. masse grasse = poids × %MG
2. masse maigre = poids − masse grasse
3. poids à X %  = masse maigre ÷ (1 − X/100)
```

L'étape 3 est la seule non évidente : elle inverse la définition. Si la masse maigre doit
représenter (100 − X) % du corps, alors le corps entier vaut masse maigre ÷ ((100 − X)/100).
Exemple réel (profil au 2026-07-29) : 68 kg à 13,2% → 8,98 kg de gras → 59,02 kg de maigre
→ 59,02 ÷ 0,825 = **71,5 kg**.

### Le poids visé vient de l'historique, pas d'un modèle (2026-07-29, révision)

Nicolas a rejeté le modèle « masse maigre constante » : il supposait que **tout kilo futur est du
gras**, ce que son historique dément (sur 6 mois : +6 kg dont la moitié de masse maigre). Il
sous-estimait donc lourdement le poids visé — 73,2 kg contre ~78,4 kg en réalité.

**Méthode retenue** ([lib/projection.ts](../lib/projection.ts)) : mesurer sur ses propres pesées
**combien de kilos accompagnent un point de % de masse grasse**, puis extrapoler jusqu'à l'objectif.

```
poids visé = poids actuel + pente × (objectif%MG − %MG actuel)
```

La pente vient d'une **régression linéaire des moindres carrés** du poids sur le %MG, pas d'un
ratio entre deux points pris au hasard : un ratio par paire explose dès que l'écart de %MG est
petit, la régression utilise toutes les pesées de la fenêtre.

**Résultats mesurés (fenêtre 6 mois, n=104)** : pente **2,05 kg/point**, R² **0,995**,
poids visé **78,4 kg**. La pente est remarquablement stable — testée sur 3 mois / 6 mois / 1 an /
2 ans / tout l'historique, elle reste entre **2,00 et 2,19**, et les trois façons de projeter
(ancrée sur la dernière pesée, lue sur la droite, ratio naïf premier↔dernier point) donnent toutes
78–79 kg. Ancrer sur la dernière pesée a été retenu : ça évite de faire porter l'extrapolation à
l'ordonnée à l'origine.

**Réserve honnête à garder en tête :** un R² de 0,995 est anormalement élevé pour une relation
physiologique. Une balance à impédancemétrie calcule le %MG à partir de l'impédance **et du poids** :
une partie de cette corrélation reflète donc la formule interne de la balance, pas seulement la
physiologie. Le ratio reste la meilleure description disponible des données de Nicolas, mais ne pas
le présenter comme une loi biologique.

**Repli** (`method: "lean-constant"`) si moins de 8 pesées sur la fenêtre, moins de 1 point de
variation de %MG, R² < 0,5, ou pente négative. L'UI dit alors explicitement pourquoi.

### Ce poids visé pilote la cible calorique (2026-07-29)

Nicolas : « c'est mon objectif de poids qui devrait calculer la quantité de calories/jour ».
Mifflin-St Jeor est donc appliqué au **poids visé**, plus au poids actuel (`energyBasisWeightKg`
dans `lib/nutrients.ts`). Logique : on mange l'énergie du corps qu'on construit.

Effet mesuré, en deux temps : **2940 → 3021 kcal** avec « masse maigre constante » (73,2 kg), puis
**3021 → 3102 kcal** une fois la projection sur l'historique adoptée (78,4 kg). L'apport réel de la
semaine (3008 kcal) est à **97%** de cette cible.

Le surplus de +400 kcal reste nécessaire : l'écart de TDEE entre 69,6 kg et 78,4 kg n'est que de
~160 kcal, loin d'un surplus de prise de masse. Les deux se cumulent, ce n'est pas un double comptage.

**Protéines, eau et plafond de graisses saturées restent sur le poids ACTUEL** — ce sont des besoins
liés à la masse corporelle réelle, pas à un objectif. Ne pas « harmoniser » par réflexe.

### Le poids ne se saisit plus (2026-07-29)

`weightKg` et `bodyFatPct` sont recopiés automatiquement depuis la dernière pesée
(`syncProfileFromLatest`, appelé après chaque import et chaque suppression). La page Profil les
affiche en lecture seule. Cela supprime le piège décrit juste en dessous, qui existait tant que le
profil pouvait décrocher de la balance.

### Piège (résolu) : deux pages, deux valeurs

Le résultat dépend de **la pesée prise comme point de départ** :
- page **Profil** → part du `weightKg` du profil (68 kg) → **71,5 kg** ;
- page **Mesures** → part de la dernière pesée (69,6 kg) → **73,2 kg**.

C'était déroutant sans être un bug. **Réglé à la source** par la synchronisation automatique
ci-dessus : le profil suit désormais la dernière pesée, donc les deux pages disent 73,2 kg.
Si ce problème réapparaît, chercher du côté de `syncProfileFromLatest` plutôt que d'ajouter
un second calcul.

**Raisonnement clé, à ne pas perdre :** le % de matière grasse est un **ratio**, pas une quantité.
En prise de masse il peut *baisser* alors que la masse grasse augmente, si la masse maigre
augmente plus vite. C'est donc la **courbe de masse maigre** qu'il faut regarder en premier ;
le % sert de garde-fou (« la prise de poids ne part-elle pas trop en gras ? »).

`lib/body.ts` traduit l'objectif en repère concret : le **poids correspondant à 17,5% à masse
maigre constante**. C'est un repère, pas une prévision — l'hypothèse « masse maigre constante »
est fausse par construction en prise de masse, mais c'est la seule hypothèse neutre.

Repères ACE utilisés pour la classification (homme) : athlète < 14%, sportif < 18%, moyenne < 25%.
**17,5% tombe donc en haut de la catégorie « sportif »** — c'est une cible de prise de masse
raisonnable, pas une cible de sèche.

## Import FeelFit : pourquoi un importeur tolérant

Le format d'export FeelFit **n'est pas documenté publiquement** et varie selon la langue de
l'app, le modèle de balance et la version. On ne code donc **aucun format en dur** :

1. `lib/feelfit.ts` détecte le séparateur (`,` `;` tab `|`), saute d'éventuelles méta-données
   avant l'en-tête, et devine chaque colonne par son intitulé (synonymes FR + EN, normalisés
   sans accents ni unités entre parenthèses).
2. L'UI **montre la correspondance devinée et la laisse corriger** avant d'écrire en base.
3. Les valeurs sont tolérantes : virgule décimale, `lb`/`st` convertis en kg, dates ISO,
   `JJ/MM/AAAA` et `AAAA/MM/JJ`.
4. `measuredAt` est unique → **réimporter le même fichier met à jour, ne duplique pas**.

**Excel (.xlsx/.xls) n'est pas lu directement** (aucune dépendance de parsing ajoutée). L'UI
propose deux contournements : « Enregistrer sous → CSV », ou coller les cellules copiées depuis
le tableur (le collage arrive en TSV, que le parseur gère). Si un jour on veut le .xlsx natif,
il faudra un vrai fichier d'exemple de Nicolas avant d'écrire quoi que ce soit.

## Voie réellement utilisée : l'export Apple Santé (2026-07-29)

Nicolas n'a pas eu à trouver l'export FeelFit : FeelFit **synchronise vers Apple Santé**, et
Apple Santé exporte tout (Santé → photo de profil → Exporter toutes les données → `export.zip`
→ `apple_health_export/export.xml`). C'est cette voie qui a servi à charger l'historique :
**237 pesées, de janvier 2020 à juillet 2026**. `lib/apple-health.ts` la gère.

Points techniques à ne pas réapprendre :

- **Piège du pourcentage.** Apple Santé annonce `unit="%"` mais stocke une **fraction** :
  `value="0.132"` = 13,2%. On ne se fie donc pas à l'unité mais à l'ordre de grandeur
  (`value <= 1` → ×100).
- **Regroupement.** Les mesures d'une même pesée partagent **exactement** le même `startDate`
  (vérifié : 237 instants distincts). Regrouper à la minute serait une erreur — ça fusionnerait
  des pesées distinctes (230 instants au lieu de 237).
- **Doublons.** 88 clés en doublon, la plupart des ré-synchros **Yazio**/**Zepp** de la même
  pesée avec un arrondi différent. Règle : la source contenant « feelfit » (la balance) prime.
- **`LeanBodyMass` est ignoré volontairement** : il vaut exactement poids × (1 − %MG), donc
  l'app le recalcule. Vérifié sur les données réelles (60,4 kg annoncés = 60,4 kg recalculés).
- **Performance.** 97 Mo lus et analysés en ~370 ms dans le navigateur (regex sur la balise
  ouvrante, sans découpage en lignes). L'analyse reste **côté client** : seules les ~237 mesures
  extraites partent au serveur, ce qui évite la limite de 4,5 Mo de corps de requête sur Vercel.

### Limite : 3 métriques sur 8

Apple Santé ne reçoit de FeelFit que **poids, % de masse grasse et IMC**. Muscle, eau, protéines,
masse osseuse, graisse viscérale, métabolisme de base et âge métabolique **restent dans FeelFit**.
Les 4 courbes correspondantes sont donc vides tant qu'on n'a pas l'export FeelFit direct.

### État constaté au 29/07/2026

Poids **69,6 kg** · masse grasse **13,2%** · masse maigre **60,4 kg**. Sur 6 mois : +6,0 kg dont
**+3,3 kg de masse maigre** et +2,7 kg de masse grasse — bon ratio pour une prise de masse.
Nicolas est donc **en dessous** de son objectif de 17,5% : la masse grasse qui monte va *vers*
la cible. D'où la règle d'affichage : quand une cible existe, le progrès est « se rapprocher de
la cible », pas « baisser » (sinon la courbe s'affiche en alerte alors que tout va bien).

## Lecture des courbes — précaution

Une balance à **impédancemétrie** a plusieurs points d'erreur sur le % de masse grasse, et est
très sensible à l'hydratation. **La tendance est fiable, pas la valeur absolue d'une pesée
isolée.** D'où : se peser toujours dans les mêmes conditions (à jeun, le matin), et juger sur
la pente, pas sur un point. Cet avertissement est écrit sur la page Mesures.

Les courbes sont en **petits multiples, une métrique par graphique** — jamais deux échelles
différentes sur un même cadre (un double axe rend la comparaison visuelle trompeuse).
