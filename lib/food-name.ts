export function displayName(food: { name: string; nameFr?: string | null } | null | undefined): string {
  if (!food) return ""
  return food.nameFr || food.name
}
