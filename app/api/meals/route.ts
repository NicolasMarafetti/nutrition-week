import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

export async function GET() {
  const entries = await prisma.mealEntry.findMany({
    include: { food: true, customFood: true },
    orderBy: [{ day: "asc" }, { meal: "asc" }],
  })
  return Response.json(entries)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const entry = await prisma.mealEntry.create({
    data: {
      day: body.day,
      meal: body.meal,
      grams: body.grams,
      foodId: body.foodId ?? null,
      customFoodId: body.customFoodId ?? null,
    },
    include: { food: true, customFood: true },
  })
  return Response.json(entry)
}
