import { prisma } from "@/lib/prisma"

// DELETE /api/admin/clean — supprime les aliments sans calories ni protéines
export async function DELETE() {
  const foods = await prisma.food.findMany()
  const incomplete = foods.filter((f) => {
    const n = f.nutrients as Record<string, number>
    return !n.calories && !n.protein
  })
  const ids = incomplete.map((f) => f.fdcId)
  if (ids.length === 0) return Response.json({ deleted: 0 })

  await prisma.mealEntry.deleteMany({ where: { foodId: { in: ids } } })
  await prisma.food.deleteMany({ where: { fdcId: { in: ids } } })
  return Response.json({ deleted: ids.length, removedFoods: incomplete.map((f) => f.name) })
}
