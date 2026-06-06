import { prisma } from "@/lib/prisma"
import { translateToFrench } from "@/lib/translate"
import { isAuthorized } from "@/lib/admin-auth"
import { NextRequest } from "next/server"

// POST /api/admin/translate — traduit tous les aliments sans nameFr
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return new Response("Unauthorized", { status: 401 })
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
