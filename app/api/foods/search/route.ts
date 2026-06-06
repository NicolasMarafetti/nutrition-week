import { prisma } from "@/lib/prisma"
import { searchFoods, getFoodDetail, normalizeFoodNutrients } from "@/lib/usda"
import { extractNutrients } from "@/lib/nutrients"
import { translateToFrench, translateToEnglish, translateManyToFrenchCached } from "@/lib/translate"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")
  if (!query) return Response.json({ error: "q is required" }, { status: 400 })

  try {
    const [englishQuery, ignoredList] = await Promise.all([
      translateToEnglish(query),
      prisma.ignoredFood.findMany({ select: { fdcId: true } }),
    ])
    const results = await searchFoods(englishQuery)
    const ignoredIds = new Set(ignoredList.map((f) => f.fdcId))
    const filtered = results.filter((r) => !ignoredIds.has(r.fdcId))

    // Traduire les libellés (avec cache DB pour épargner le quota MyMemory)
    const frMap = await translateManyToFrenchCached(filtered.map((r) => r.description))
    const withFr = filtered.map((r) => ({
      ...r,
      descriptionFr: frMap.get(r.description) ?? r.description,
    }))

    return Response.json(withFr)
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown"
    if (msg === "RATE_LIMIT") return Response.json({ error: "RATE_LIMIT" }, { status: 429 })
    return Response.json({ error: "USDA_ERROR" }, { status: 502 })
  }
}

// Fetch full detail for a food, cache it, or add to ignored list if incomplete
export async function POST(req: NextRequest) {
  const { fdcId } = await req.json()
  if (!fdcId) return Response.json({ error: "fdcId required" }, { status: 400 })

  // Already ignored
  const alreadyIgnored = await prisma.ignoredFood.findUnique({ where: { fdcId } })
  if (alreadyIgnored) return Response.json({ error: "IGNORED" }, { status: 422 })

  // Already cached and complete
  const existing = await prisma.food.findUnique({ where: { fdcId } })
  if (existing) {
    if (isIncomplete(existing.nutrients as Record<string, number>)) {
      await ignoreFood(fdcId, existing.name)
      return Response.json({ error: "IGNORED" }, { status: 422 })
    }
    return Response.json(existing)
  }

  const detail = await getFoodDetail(fdcId)
  const rawNutrients = normalizeFoodNutrients(detail)
  const nutrients = extractNutrients(rawNutrients)

  if (isIncomplete(nutrients)) {
    await ignoreFood(fdcId, detail.description)
    return Response.json({ error: "IGNORED" }, { status: 422 })
  }

  const nameFr = await translateToFrench(detail.description)

  const food = await prisma.food.create({
    data: { fdcId: detail.fdcId, name: detail.description, nameFr, dataType: detail.dataType, nutrients },
  })
  return Response.json(food)
}

function isIncomplete(nutrients: Record<string, number>): boolean {
  return !nutrients.calories && !nutrients.protein
}

async function ignoreFood(fdcId: number, name: string) {
  await prisma.ignoredFood.upsert({
    where: { fdcId },
    update: {},
    create: { fdcId, name },
  })
}
