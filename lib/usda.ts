const USDA_API_KEY = process.env.USDA_API_KEY ?? "DEMO_KEY"
const BASE = "https://api.nal.usda.gov/fdc/v1"

export interface UsdaSearchResult {
  fdcId: number
  description: string
  dataType: string
  brandOwner?: string
}

export interface UsdaFoodDetail {
  fdcId: number
  description: string
  dataType: string
  foodNutrients: Array<{
    nutrient: { id: number; name: string; unitName: string }
    amount: number
  }>
}

const DATA_TYPE_PRIORITY: Record<string, number> = {
  "Foundation": 0,
  "SR Legacy": 1,
  "Survey (FNDDS)": 2,
  "Branded": 3,
}

export async function searchFoods(query: string, pageSize = 25): Promise<UsdaSearchResult[]> {
  const params = new URLSearchParams({
    query,
    dataType: "Foundation,SR Legacy,Branded",
    pageSize: String(pageSize),
    api_key: USDA_API_KEY,
  })
  const res = await fetch(`${BASE}/foods/search?${params}`, { next: { revalidate: 86400 } })
  if (res.status === 429) throw new Error("RATE_LIMIT")
  if (!res.ok) throw new Error(`USDA search failed: ${res.status}`)
  const data = await res.json()

  const results: UsdaSearchResult[] = (data.foods ?? []).map((f: Record<string, unknown>) => {
    const dataType = f.dataType as string
    const brandOwner = f.brandOwner as string | undefined
    // Build a readable display name: append brand for Branded items
    const description = f.description as string
    const displayName = dataType === "Branded" && brandOwner
      ? `${description} — ${brandOwner}`
      : description
    return { fdcId: f.fdcId as number, description: displayName, dataType, brandOwner }
  })

  // Sort: Foundation and SR Legacy first, Branded last
  return results.sort((a, b) => {
    const pa = DATA_TYPE_PRIORITY[a.dataType] ?? 9
    const pb = DATA_TYPE_PRIORITY[b.dataType] ?? 9
    return pa - pb
  })
}

export async function getFoodDetail(fdcId: number): Promise<UsdaFoodDetail> {
  const params = new URLSearchParams({ api_key: USDA_API_KEY })
  const res = await fetch(`${BASE}/food/${fdcId}?${params}`, { next: { revalidate: 86400 } })
  if (!res.ok) throw new Error(`USDA food detail failed: ${res.status}`)
  return res.json()
}

export function normalizeFoodNutrients(
  detail: UsdaFoodDetail
): Array<{ nutrientId: number; value: number }> {
  return detail.foodNutrients
    .filter((fn) => fn.amount != null)
    .map((fn) => ({ nutrientId: fn.nutrient.id, value: fn.amount }))
}
