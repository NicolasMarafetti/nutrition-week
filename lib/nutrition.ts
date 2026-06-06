import { NUTRIENTS, type NutrientsMap } from "./nutrients"

export interface Profile {
  age: number
  weightKg: number
  targetWeightKg: number
  heightCm: number
  sex: "MALE" | "FEMALE"
}

export interface NutrientTarget {
  key: string
  label: string
  unit: string
  group: string
  target: number
  actual: number
  pct: number
  deficit: number
  priority: number
}

export function computeTargets(
  weekNutrients: NutrientsMap,
  profile: Profile
): NutrientTarget[] {
  return NUTRIENTS.map((def) => {
    const target = def.rdaFn({
      age: profile.age,
      weightKg: profile.weightKg,
      heightCm: profile.heightCm,
      sex: profile.sex,
    })
    const actual = (weekNutrients[def.key] ?? 0) / 7
    const pct = target > 0 ? Math.min((actual / target) * 100, 999) : 0
    const deficit = Math.max(target - actual, 0)
    return {
      key: def.key,
      label: def.label,
      unit: def.unit,
      group: def.group,
      target,
      actual: Math.round(actual * 10) / 10,
      pct: Math.round(pct),
      deficit: Math.round(deficit * 10) / 10,
      priority: def.priority,
    }
  }).sort((a, b) => {
    // sort by deficit severity (worst first), then by priority
    const aScore = a.pct < 100 ? a.pct : 200
    const bScore = b.pct < 100 ? b.pct : 200
    if (aScore !== bScore) return aScore - bScore
    return a.priority - b.priority
  })
}

export function sumMealEntryNutrients(
  entries: Array<{ grams: number; nutrients: NutrientsMap }>
): NutrientsMap {
  const result: NutrientsMap = {}
  for (const entry of entries) {
    const factor = entry.grams / 100
    for (const [key, val] of Object.entries(entry.nutrients)) {
      result[key] = (result[key] ?? 0) + val * factor
    }
  }
  return result
}
