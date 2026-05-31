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

export async function searchFoods(query: string, pageSize = 20): Promise<UsdaSearchResult[]> {
  const params = new URLSearchParams({
    query,
    dataType: "Foundation,SR Legacy,Branded",
    pageSize: String(pageSize),
    api_key: USDA_API_KEY,
  })
  const res = await fetch(`${BASE}/foods/search?${params}`, { next: { revalidate: 86400 } })
  if (!res.ok) throw new Error(`USDA search failed: ${res.status}`)
  const data = await res.json()
  return (data.foods ?? []).map((f: Record<string, unknown>) => ({
    fdcId: f.fdcId as number,
    description: f.description as string,
    dataType: f.dataType as string,
    brandOwner: f.brandOwner as string | undefined,
  }))
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
