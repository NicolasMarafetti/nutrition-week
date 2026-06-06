export type NutrientGroup =
  | "macros"
  | "performance"
  | "collagen"
  | "recovery"
  | "energy"
  | "general"

export interface NutrientDef {
  key: string
  label: string
  unit: string
  group: NutrientGroup
  usdaIds: number[]
  // "sum" (default): additionne tous les IDs trouvés (ex: oméga-3 = ALA+EPA+DHA)
  // "first": prend le premier ID disponible dans l'ordre (ex: calories, plusieurs façons de reporter l'énergie)
  mode?: "sum" | "first"
  rdaFn: (profile: { age: number; weightKg: number; sex: "MALE" | "FEMALE" }) => number
  priority: number
}

// USDA FoodData Central nutrient IDs (fdcId for nutrients)
export const NUTRIENTS: NutrientDef[] = [
  // ─── Macros ──────────────────────────────────────────────────────────
  {
    key: "calories",
    label: "Calories",
    unit: "kcal",
    group: "macros",
    // 1008 = Energy (kcal), 2047/2048 = Energy via Atwater factors (Foundation foods)
    usdaIds: [1008, 2047, 2048],
    mode: "first",
    rdaFn: ({ weightKg }) => Math.round((10 * weightKg + 625 + 5) * 1.55 + 400),
    priority: 1,
  },
  {
    key: "protein",
    label: "Protéines",
    unit: "g",
    group: "macros",
    usdaIds: [1003],
    rdaFn: ({ weightKg }) => Math.round(weightKg * 2.2),
    priority: 2,
  },
  {
    key: "carbs",
    label: "Glucides",
    unit: "g",
    group: "macros",
    usdaIds: [1005],
    rdaFn: ({ weightKg }) => Math.round((((10 * weightKg + 625 + 5) * 1.55 + 400) * 0.45) / 4),
    priority: 3,
  },
  {
    key: "fat",
    label: "Lipides",
    unit: "g",
    group: "macros",
    usdaIds: [1004],
    rdaFn: ({ weightKg }) => Math.round(weightKg * 1.0),
    priority: 4,
  },
  {
    key: "fiber",
    label: "Fibres",
    unit: "g",
    group: "macros",
    usdaIds: [1079],
    rdaFn: () => 38,
    priority: 5,
  },

  // ─── Performance musculaire ──────────────────────────────────────────
  {
    key: "leucine",
    label: "Leucine (BCAA)",
    unit: "g",
    group: "performance",
    usdaIds: [1212],
    rdaFn: ({ weightKg }) => Math.round(weightKg * 0.045 * 10) / 10,
    priority: 6,
  },
  {
    key: "isoleucine",
    label: "Isoleucine (BCAA)",
    unit: "g",
    group: "performance",
    usdaIds: [1211],
    rdaFn: ({ weightKg }) => Math.round(weightKg * 0.023 * 10) / 10,
    priority: 7,
  },
  {
    key: "valine",
    label: "Valine (BCAA)",
    unit: "g",
    group: "performance",
    usdaIds: [1219],
    rdaFn: ({ weightKg }) => Math.round(weightKg * 0.026 * 10) / 10,
    priority: 8,
  },
  {
    key: "creatine",
    label: "Créatine",
    unit: "g",
    group: "performance",
    usdaIds: [1322],
    rdaFn: () => 3,
    priority: 9,
  },
  {
    key: "glutamine",
    label: "Glutamine",
    unit: "g",
    group: "performance",
    usdaIds: [1215],
    rdaFn: ({ weightKg }) => Math.round(weightKg * 0.2 * 10) / 10,
    priority: 10,
  },
  {
    key: "arginine",
    label: "Arginine",
    unit: "g",
    group: "performance",
    usdaIds: [1220],
    rdaFn: () => 5,
    priority: 11,
  },

  // ─── Collagène & articulations ───────────────────────────────────────
  {
    key: "glycine",
    label: "Glycine (collagène)",
    unit: "g",
    group: "collagen",
    usdaIds: [1222],
    rdaFn: () => 10,
    priority: 12,
  },
  {
    key: "proline",
    label: "Proline (collagène)",
    unit: "g",
    group: "collagen",
    usdaIds: [1215],
    rdaFn: () => 5,
    priority: 13,
  },
  {
    key: "vitaminC",
    label: "Vitamine C",
    unit: "mg",
    group: "collagen",
    usdaIds: [1162],
    rdaFn: () => 90,
    priority: 14,
  },

  // ─── Récupération ────────────────────────────────────────────────────
  {
    key: "magnesium",
    label: "Magnésium",
    unit: "mg",
    group: "recovery",
    usdaIds: [1090],
    rdaFn: () => 420,
    priority: 15,
  },
  {
    key: "zinc",
    label: "Zinc",
    unit: "mg",
    group: "recovery",
    usdaIds: [1095],
    rdaFn: () => 11,
    priority: 16,
  },
  {
    key: "omega3",
    label: "Oméga-3 (ALA+EPA+DHA)",
    unit: "g",
    group: "recovery",
    usdaIds: [1404, 1278, 1279],
    rdaFn: () => 1.6,
    priority: 17,
  },
  {
    key: "vitaminD",
    label: "Vitamine D",
    unit: "µg",
    group: "recovery",
    usdaIds: [1114],
    rdaFn: () => 20,
    priority: 18,
  },
  {
    key: "vitaminE",
    label: "Vitamine E",
    unit: "mg",
    group: "recovery",
    usdaIds: [1109],
    rdaFn: () => 15,
    priority: 19,
  },

  // ─── Énergie & endurance ─────────────────────────────────────────────
  {
    key: "iron",
    label: "Fer",
    unit: "mg",
    group: "energy",
    usdaIds: [1089],
    rdaFn: () => 8,
    priority: 20,
  },
  {
    key: "vitaminB12",
    label: "Vitamine B12",
    unit: "µg",
    group: "energy",
    usdaIds: [1178],
    rdaFn: () => 2.4,
    priority: 21,
  },
  {
    key: "vitaminB9",
    label: "Folate (B9)",
    unit: "µg",
    group: "energy",
    usdaIds: [1177],
    rdaFn: () => 400,
    priority: 22,
  },
  {
    key: "vitaminB6",
    label: "Vitamine B6",
    unit: "mg",
    group: "energy",
    usdaIds: [1175],
    rdaFn: () => 1.7,
    priority: 23,
  },
  {
    key: "vitaminB1",
    label: "Thiamine (B1)",
    unit: "mg",
    group: "energy",
    usdaIds: [1165],
    rdaFn: () => 1.2,
    priority: 24,
  },

  // ─── Santé générale ──────────────────────────────────────────────────
  {
    key: "calcium",
    label: "Calcium",
    unit: "mg",
    group: "general",
    usdaIds: [1087],
    rdaFn: () => 1000,
    priority: 25,
  },
  {
    key: "potassium",
    label: "Potassium",
    unit: "mg",
    group: "general",
    usdaIds: [1092],
    rdaFn: () => 3400,
    priority: 26,
  },
  {
    key: "sodium",
    label: "Sodium",
    unit: "mg",
    group: "general",
    usdaIds: [1093],
    rdaFn: () => 2300,
    priority: 27,
  },
  {
    key: "selenium",
    label: "Sélénium",
    unit: "µg",
    group: "general",
    usdaIds: [1103],
    rdaFn: () => 55,
    priority: 28,
  },
  {
    key: "vitaminA",
    label: "Vitamine A",
    unit: "µg",
    group: "general",
    usdaIds: [1106],
    rdaFn: () => 900,
    priority: 29,
  },
  {
    key: "vitaminK1",
    label: "Vitamine K",
    unit: "µg",
    group: "general",
    usdaIds: [1185],
    rdaFn: () => 120,
    priority: 30,
  },
  {
    key: "omega6",
    label: "Oméga-6",
    unit: "g",
    group: "general",
    usdaIds: [1269],
    rdaFn: () => 17,
    priority: 31,
  },
  {
    key: "saturatedFat",
    label: "Graisses saturées",
    unit: "g",
    group: "general",
    usdaIds: [1258],
    rdaFn: ({ weightKg }) => Math.round(weightKg * 0.3),
    priority: 32,
  },
]

export const GROUP_LABELS: Record<NutrientGroup, string> = {
  macros: "Macronutriments",
  performance: "Performance & Muscle",
  collagen: "Collagène & Articulations",
  recovery: "Récupération",
  energy: "Énergie & Endurance",
  general: "Santé Générale",
}

export type NutrientsMap = Record<string, number>

export function extractNutrients(usdaNutrients: Array<{ nutrientId: number; value: number }>): NutrientsMap {
  const result: NutrientsMap = {}
  for (const def of NUTRIENTS) {
    if (def.mode === "first") {
      // Prend le premier ID disponible dans l'ordre de priorité (pas de somme)
      for (const id of def.usdaIds) {
        const found = usdaNutrients.find((n) => n.nutrientId === id)
        if (found && found.value > 0) {
          result[def.key] = found.value
          break
        }
      }
    } else {
      // Somme de tous les IDs trouvés
      let total = 0
      for (const id of def.usdaIds) {
        const found = usdaNutrients.find((n) => n.nutrientId === id)
        if (found) total += found.value
      }
      if (total > 0) result[def.key] = total
    }
  }
  return result
}

export function waterRecommendationMl(weightKg: number): number {
  return Math.round(weightKg * 35)
}
