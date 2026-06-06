export type DayOfWeek = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN"
export type MealType = "BREAKFAST" | "LUNCH" | "SNACK" | "DINNER"

export interface MealEntry {
  id: number
  day: DayOfWeek
  meal: MealType
  grams: number
  foodId?: number | null
  customFoodId?: number | null
  food?: { fdcId: number; name: string; nameFr?: string | null; nutrients: Record<string, number> } | null
  customFood?: { id: number; name: string; nutrients: Record<string, number> } | null
}

export interface UsdaSearchResult {
  fdcId: number
  description: string
  descriptionFr?: string
  dataType: string
  brandOwner?: string
}
