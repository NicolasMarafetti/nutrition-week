// Petit cache localStorage pour le pattern "stale-while-revalidate" :
// afficher la valeur en cache immédiatement, puis revalider via l'API et ne
// re-rendre/réécrire que si la donnée a changé.

export function readCache<T>(key: string): T | null {
  try {
    const v = localStorage.getItem(key)
    return v ? (JSON.parse(v) as T) : null
  } catch {
    return null
  }
}

export function writeCache<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // quota plein / mode privé : on ignore, le cache est optionnel
  }
}

/** true si la nouvelle valeur diffère de l'ancienne (comparaison JSON). */
export function hasChanged<T>(prev: T, next: T): boolean {
  return JSON.stringify(prev) !== JSON.stringify(next)
}

export const CACHE_KEYS = {
  meals: "nutriweek:meals",
  profile: "nutriweek:profile",
} as const
