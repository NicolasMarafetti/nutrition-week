import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

// POST { fromDay, toDay } — copie tous les repas d'un jour vers un autre
export async function POST(req: NextRequest) {
  const { fromDay, toDay } = await req.json()
  if (!fromDay || !toDay || fromDay === toDay) {
    return Response.json({ error: "invalid" }, { status: 400 })
  }

  const sourceEntries = await prisma.mealEntry.findMany({ where: { day: fromDay } })

  // Supprimer les entrées existantes du jour cible
  await prisma.mealEntry.deleteMany({ where: { day: toDay } })

  // Recréer
  if (sourceEntries.length > 0) {
    await prisma.mealEntry.createMany({
      data: sourceEntries.map((e) => ({
        day: toDay,
        meal: e.meal,
        grams: e.grams,
        foodId: e.foodId,
        customFoodId: e.customFoodId,
      })),
    })
  }

  return Response.json({ copied: sourceEntries.length })
}
