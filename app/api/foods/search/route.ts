import { prisma } from "@/lib/prisma"
import { searchFoods, getFoodDetail, normalizeFoodNutrients } from "@/lib/usda"
import { extractNutrients } from "@/lib/nutrients"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")
  if (!query) return Response.json({ error: "q is required" }, { status: 400 })

  try {
    const results = await searchFoods(query)
    return Response.json(results)
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown"
    if (msg === "RATE_LIMIT") {
      return Response.json({ error: "RATE_LIMIT" }, { status: 429 })
    }
    return Response.json({ error: "USDA_ERROR" }, { status: 502 })
  }
}

// Fetch full detail for a food and cache it in DB
export async function POST(req: NextRequest) {
  const { fdcId } = await req.json()
  if (!fdcId) return Response.json({ error: "fdcId required" }, { status: 400 })

  const existing = await prisma.food.findUnique({ where: { fdcId } })
  if (existing) return Response.json({ ...existing, incomplete: isIncomplete(existing.nutrients as Record<string, number>) })

  const detail = await getFoodDetail(fdcId)
  const rawNutrients = normalizeFoodNutrients(detail)
  const nutrients = extractNutrients(rawNutrients)

  const food = await prisma.food.create({
    data: {
      fdcId: detail.fdcId,
      name: detail.description,
      dataType: detail.dataType,
      nutrients,
    },
  })
  return Response.json({ ...food, incomplete: isIncomplete(nutrients) })
}

function isIncomplete(nutrients: Record<string, number>): boolean {
  return !nutrients.calories && !nutrients.protein
}
