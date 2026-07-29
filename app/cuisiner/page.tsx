import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cuisiner",
  description:
    "Comment préparer chaque repas de la semaine type : étapes de cuisson, ingrédients et astuces.",
}

interface Recipe {
  emoji: string
  meal: string
  subtitle: string
  note?: string
  ingredients: string[]
  steps: string[]
  tips?: string[]
}

const RECIPES: Recipe[] = [
  {
    emoji: "🥣",
    meal: "Petit-déjeuner",
    subtitle: "Overnight oats cacao + œuf",
    note: "À préparer la veille (overnight oats) — pas au blender : le mixage accélère le pic de glycémie. Le trempage gonfle l'avoine et le chia, stabilise la glycémie et améliore l'absorption des minéraux.",
    ingredients: [
      "68 g de flocons d'avoine",
      "250 ml de lait entier sans lactose",
      "15 g de graines de chia",
      "5 g de cacao en poudre non sucré",
      "15 g de collagène (peptides)",
      "3 g de créatine monohydrate",
      "100 g de banane (~1 petite banane)",
      "100 g d'œuf (~2 œufs), à part",
    ],
    steps: [
      "La veille au soir : dans un bocal, mélanger l'avoine, le chia, le lait sans lactose et le cacao. Bien remuer.",
      "Ajouter le collagène et la créatine et remuer — les deux sont stables au froid toute la nuit, aucune dégradation.",
      "Couvrir et placer au réfrigérateur au moins 6 h (toute la nuit).",
      "Le matin : couper la banane en rondelles et l'incorporer (le cacao masque le brunissement).",
      "À part, cuire les œufs brouillés ou en omelette — c'est le seul élément préparé le matin.",
    ],
    tips: [
      "Tout peut se faire la veille, banane comprise, si tu es pressé le matin.",
      "Pas de sucre ajouté : la banane suffit, le cacao apporte l'amertume qui équilibre.",
    ],
  },
  {
    emoji: "🍎",
    meal: "Collation 10h",
    subtitle: "Pomme & beurre de cacahuète",
    note: "Aucune cuisson, se prépare en 1 minute et s'emporte. Le beurre de cacahuète (sans sel) apporte des graisses insaturées, du magnésium et de la vitamine E — c'est ce qui remonte la ligne « lipides » du bilan sans toucher aux graisses saturées.",
    ingredients: [
      "210 g de pomme (~1 grosse pomme, avec la peau)",
      "30 g de beurre de cacahuète non salé (~1,5 c. à soupe)",
    ],
    steps: [
      "Couper la pomme en quartiers épais, garder la peau (fibres et potassium).",
      "Tremper dans le beurre de cacahuète, ou l'étaler sur les quartiers.",
    ],
    tips: [
      "Prendre le beurre de cacahuète 100 % arachide, sans sucre ni huile de palme ajoutés.",
      "À emporter : quartiers dans une boîte + le beurre de cacahuète dans un petit pot à part.",
    ],
  },
  {
    emoji: "🍝",
    meal: "Déjeuner",
    subtitle: "Pâtes, poulet & protéine du jour, sauce tomate ail-basilic",
    note: "Le poisson n'est plus quotidien (PCB/dioxines des poissons gras). La « protéine du jour » tourne sur la semaine ; le poulet, lui, reste tous les jours.",
    ingredients: [
      "115 g de pâtes sèches",
      "65 g de poulet (blanc) — tous les jours",
      "Protéine du jour : Lun & Jeu saumon 130 g · Mar & Ven cabillaud 150 g · Mer & Sam lentilles 150 g (cuites) · Dim œufs 100 g",
      "80 g de carottes",
      "70 g de poivron rouge",
      "Huile d'olive : 19 g (jours saumon) ou 34 g (jours maigres cabillaud/lentilles, pour compenser le gras du poisson)",
      "90 g de sauce tomate + ail et basilic",
    ],
    steps: [
      "Faire bouillir les pâtes en eau salée et les cuire al dente.",
      "Air fryer (180 °C) : enrober le poulet, les carottes et le poisson du jour d'huile d'olive. Démarrer poulet + carottes ~7–8 min.",
      "Ajouter le poisson (saumon ou cabillaud) + le poivron, poursuivre ~7 min. Vérifier le poulet à cœur : 74 °C.",
      "Jours sans poisson : réchauffer les lentilles (Mer/Sam) ou cuire une omelette (Dim) à la poêle pendant que l'air fryer tourne.",
      "Réchauffer la sauce tomate à part (casserole ou micro-ondes) avec l'ail et ~1 c. à café de basilic séché.",
      "Mélanger pâtes + sauce ; disposer poulet, protéine du jour et légumes par-dessus, ajouter un filet d'huile d'olive crue.",
    ],
    tips: [
      "Thermomètre pour le poulet (74 °C) : seul vrai enjeu de sécurité.",
      "La sauce tomate ne va jamais dans le panier de l'air fryer (elle éclabousse, fume, empêche le doré).",
      "Basilic frais (4–6 feuilles) : à ajouter hors du feu, en fin de préparation.",
    ],
  },
  {
    emoji: "🥜",
    meal: "En-cas",
    subtitle: "Yaourt soja & amandes",
    note: "Yaourt au soja enrichi en calcium, à la place du yaourt au lait entier. À apport de calcium équivalent, il apporte plus de vitamine D et ~3 g de graisses saturées en moins par portion.",
    ingredients: [
      "150 g de yaourt au soja nature (enrichi calcium + vit. D)",
      "25 g d'amandes",
    ],
    steps: [
      "Verser le yaourt dans un bol.",
      "Concasser grossièrement les amandes et les parsemer dessus. Aucune cuisson.",
    ],
    tips: ["Se prépare en boîte hermétique pour emporter."],
  },
  {
    emoji: "🍗",
    meal: "Dîner",
    subtitle: "Poulet, pâtes, brocoli & épinards, sauce tomate herbes de Provence",
    note: "Cuisson à l'air fryer (180 °C). La sauce tomate ne va pas dans le panier (éclabousse, fume, empêche le doré) : on la réchauffe à part.",
    ingredients: [
      "130 g de poulet (blanc)",
      "135 g de pâtes sèches",
      "90 g de brocoli",
      "60 g d'épinards frais",
      "8 g d'huile d'olive",
      "90 g de sauce tomate + herbes de Provence",
    ],
    steps: [
      "Faire cuire les pâtes al dente en eau salée.",
      "Couper le poulet ; enrober poulet et brocoli d'un filet d'huile d'olive. Préchauffer l'air fryer à 180 °C.",
      "Air fryer : démarrer le poulet ~7–8 min.",
      "Ajouter le brocoli, poursuivre ~7 min ; ajouter les épinards les 2–3 dernières minutes seulement (ils réduisent en quelques secondes).",
      "Vérifier le poulet à cœur : 74 °C.",
      "Pendant ce temps, réchauffer la sauce tomate à part avec ~1 c. à café d'herbes de Provence.",
      "Assembler : pâtes + sauce + brocoli + épinards, poulet par-dessus.",
    ],
    tips: [
      "Thermomètre pour le poulet (74 °C) : seul vrai enjeu de sécurité.",
      "À l'air fryer (sans eau), le brocoli garde bien sa vitamine C et son croquant.",
    ],
  },
]

export default function CuisinerPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">Cuisiner</h1>
        <p className="text-zinc-500 text-sm">Comment préparer chaque repas de la semaine type</p>
      </div>

      <p className="text-zinc-500 text-sm">
        Quantités indiquées <span className="text-zinc-400">par jour</span>, en cru/sec (les pâtes, le
        poulet et le saumon pèsent davantage une fois cuits). La semaine est identique les 7 jours.
      </p>

      <div className="space-y-6">
        {RECIPES.map((r) => (
          <section
            key={r.meal}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-5 space-y-4"
          >
            <div className="flex items-baseline gap-3">
              <span className="text-2xl">{r.emoji}</span>
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">{r.meal}</h2>
                <p className="text-zinc-400 text-sm">{r.subtitle}</p>
              </div>
            </div>

            {r.note && (
              <p className="text-amber-300/90 text-sm bg-amber-500/5 border border-amber-500/15 rounded-lg px-3 py-2">
                {r.note}
              </p>
            )}

            <div className="grid sm:grid-cols-[minmax(0,14rem)_1fr] gap-5">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Ingrédients</p>
                <ul className="space-y-1">
                  {r.ingredients.map((ing, i) => (
                    <li key={i} className="text-zinc-300 text-sm flex gap-2">
                      <span className="text-zinc-600">•</span>
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Préparation</p>
                <ol className="space-y-2">
                  {r.steps.map((step, i) => (
                    <li key={i} className="text-zinc-200 text-sm flex gap-3">
                      <span className="text-zinc-500 font-semibold shrink-0">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>

                {r.tips && r.tips.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-zinc-800 space-y-1.5">
                    {r.tips.map((tip, i) => (
                      <p key={i} className="text-zinc-400 text-xs flex gap-2">
                        <span>💡</span>
                        <span>{tip}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
