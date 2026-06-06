import { prisma } from "@/lib/prisma"
import { translateToFrench } from "@/lib/translate"

// POST /api/admin/translate — traduit tous les aliments sans nameFr
export async function POST() {
  const foods = await prisma.food.findMany({ where: { nameFr: null } })
  if (foods.length === 0) return Response.json({ translated: 0 })

  let count = 0
  for (const food of foods) {
    const nameFr = await translateToFrench(food.name)
    await prisma.food.update({ where: { fdcId: food.fdcId }, data: { nameFr } })
    count++
  }
  return Response.json({ translated: count })
}
