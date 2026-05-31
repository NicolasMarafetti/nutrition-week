import { prisma } from "@/lib/prisma"
import { computeTargets, sumMealEntryNutrients } from "@/lib/nutrition"
import type { NutrientsMap } from "@/lib/nutrients"

export async function GET() {
  const profile = await prisma.profile.findUnique({ where: { id: 1 } })
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
    targetWeightKg: profile.targetWeightKg,
    heightCm: profile.heightCm,
    sex: profile.sex as "MALE" | "FEMALE",
  })

  return Response.json({ targets, weekTotal, waterMl: Math.round(profile.weightKg * 35) })
}
