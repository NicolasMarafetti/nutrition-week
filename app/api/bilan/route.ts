import { prisma } from "@/lib/prisma"
import { computeTargets, sumMealEntryNutrients } from "@/lib/nutrition"
import { displayName } from "@/lib/food-name"
import type { NutrientsMap } from "@/lib/nutrients"
import { loadProfileWithProjection } from "@/lib/profile-projection"

export async function GET() {
  // Même source que /api/profile : la cible calorique du bilan doit être celle
  // affichée sur la page Profil, projection comprise.
  const profile = await loadProfileWithProjection()
  if (!profile) return Response.json({ error: "no_profile" }, { status: 400 })

  const entries = await prisma.mealEntry.findMany({
    include: { food: true, customFood: true },
  })

  const enriched = entries.map((e: typeof entries[number]) => ({
    grams: e.grams,
    nutrients: (e.food?.nutrients ?? e.customFood?.nutrients ?? {}) as NutrientsMap,
  }))

  const weekTotal = sumMealEntryNutrients(enriched)
  const targets = computeTargets(weekTotal, {
    age: profile.age,
    weightKg: profile.weightKg,
    heightCm: profile.heightCm,
    sex: profile.sex as "MALE" | "FEMALE",
    bodyFatPct: profile.bodyFatPct,
    targetBodyFatPct: profile.targetBodyFatPct,
    projectedTargetWeightKg: profile.projectedTargetWeightKg,
  })

  // Contributions par aliment et par nutriment (moyenne journalière = total semaine ÷ 7)
  // On agrège par aliment distinct (mêmes aliments répétés sur plusieurs jours/repas)
  const byNutrient: Record<string, Record<string, { name: string; amount: number }>> = {}
  for (const e of entries) {
    const nutrients = (e.food?.nutrients ?? e.customFood?.nutrients ?? {}) as NutrientsMap
    const name = e.food ? displayName(e.food) : (e.customFood?.name ?? "?")
    const foodKey = e.foodId ? `f${e.foodId}` : `c${e.customFoodId}`
    const factor = e.grams / 100
    for (const [key, val] of Object.entries(nutrients)) {
      if (!byNutrient[key]) byNutrient[key] = {}
      if (!byNutrient[key][foodKey]) byNutrient[key][foodKey] = { name, amount: 0 }
      byNutrient[key][foodKey].amount += val * factor
    }
  }

  // Convertit en listes triées (contribution journalière décroissante)
  const contributions: Record<string, Array<{ name: string; amount: number }>> = {}
  for (const [key, foods] of Object.entries(byNutrient)) {
    contributions[key] = Object.values(foods)
      .map((f) => ({ name: f.name, amount: Math.round((f.amount / 7) * 100) / 100 }))
      .filter((f) => f.amount > 0)
      .sort((a, b) => b.amount - a.amount)
  }

  return Response.json({
    targets,
    weekTotal,
    waterMl: Math.round(profile.weightKg * 35),
    contributions,
  })
}
