import { prisma } from "@/lib/prisma"
import { getFoodDetail, normalizeFoodNutrients } from "@/lib/usda"
import { extractNutrients } from "@/lib/nutrients"

// POST /api/admin/reextract — re-télécharge et recalcule les nutriments de tous les aliments cachés
export async function POST() {
  const foods = await prisma.food.findMany()
  const updated: string[] = []

  for (const food of foods) {
    try {
      const detail = await getFoodDetail(food.fdcId)
      const nutrients = extractNutrients(normalizeFoodNutrients(detail))
      await prisma.food.update({ where: { fdcId: food.fdcId }, data: { nutrients } })
      updated.push(food.name)
    } catch {
      // skip on error (rate limit, etc.)
    }
  }

  return Response.json({ updated: updated.length, foods: updated })
}
