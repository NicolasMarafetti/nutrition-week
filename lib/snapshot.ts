import { prisma } from "@/lib/prisma"

export interface Snapshot {
  version: number
  createdAt: string
  profile: unknown | null
  foods: unknown[]
  customFoods: unknown[]
  ignoredFoods: unknown[]
  translations: unknown[]
  mealEntries: unknown[]
}

/** Lit toutes les données métier et renvoie un snapshot complet. */
export async function buildSnapshot(): Promise<Snapshot> {
  const [profile, foods, customFoods, ignoredFoods, translations, mealEntries] =
    await Promise.all([
      prisma.profile.findUnique({ where: { id: 1 } }),
      prisma.food.findMany(),
      prisma.customFood.findMany(),
      prisma.ignoredFood.findMany(),
      prisma.translation.findMany(),
      prisma.mealEntry.findMany(),
    ])

  return {
    version: 1,
    createdAt: new Date().toISOString(),
    profile,
    foods,
    customFoods,
    ignoredFoods,
    translations,
    mealEntries,
  }
}

type Row = Record<string, unknown>

/**
 * Restaure un snapshot : remplace TOUTES les données métier par celles du snapshot.
 * Opération destructive, exécutée dans une transaction.
 */
export async function restoreSnapshot(snap: Snapshot): Promise<void> {
  const foods = (snap.foods ?? []) as Row[]
  const customFoods = (snap.customFoods ?? []) as Row[]
  const ignoredFoods = (snap.ignoredFoods ?? []) as Row[]
  const translations = (snap.translations ?? []) as Row[]
  const mealEntries = (snap.mealEntries ?? []) as Row[]
  const profile = snap.profile as Row | null

  await prisma.$transaction(async (tx) => {
    // 1. Vider (ordre respectant les clés étrangères)
    await tx.mealEntry.deleteMany({})
    await tx.food.deleteMany({})
    await tx.customFood.deleteMany({})
    await tx.ignoredFood.deleteMany({})
    await tx.translation.deleteMany({})

    // 2. Réinsérer les référentiels
    if (foods.length)
      await tx.food.createMany({
        data: foods.map((f) => ({
          fdcId: f.fdcId as number,
          name: f.name as string,
          nameFr: (f.nameFr ?? null) as string | null,
          dataType: f.dataType as string,
          nutrients: f.nutrients as object,
          cachedAt: new Date(f.cachedAt as string),
        })),
      })

    if (customFoods.length)
      await tx.customFood.createMany({
        data: customFoods.map((c) => ({
          id: c.id as number,
          name: c.name as string,
          nutrients: c.nutrients as object,
          createdAt: new Date(c.createdAt as string),
        })),
      })

    if (ignoredFoods.length)
      await tx.ignoredFood.createMany({
        data: ignoredFoods.map((i) => ({
          fdcId: i.fdcId as number,
          name: i.name as string,
          ignoredAt: new Date(i.ignoredAt as string),
        })),
      })

    if (translations.length)
      await tx.translation.createMany({
        data: translations.map((t) => ({
          source: t.source as string,
          target: t.target as string,
          createdAt: new Date(t.createdAt as string),
        })),
      })

    // 3. Repas (référencent food/customFood)
    if (mealEntries.length)
      await tx.mealEntry.createMany({
        data: mealEntries.map((m) => ({
          id: m.id as number,
          day: m.day as never,
          meal: m.meal as never,
          grams: m.grams as number,
          foodId: (m.foodId ?? null) as number | null,
          customFoodId: (m.customFoodId ?? null) as number | null,
        })),
      })

    // 4. Profil
    if (profile)
      await tx.profile.upsert({
        where: { id: 1 },
        update: {
          age: profile.age as number,
          weightKg: profile.weightKg as number,
          targetWeightKg: profile.targetWeightKg as number,
          heightCm: profile.heightCm as number,
          sex: profile.sex as never,
        },
        create: {
          id: 1,
          age: profile.age as number,
          weightKg: profile.weightKg as number,
          targetWeightKg: profile.targetWeightKg as number,
          heightCm: profile.heightCm as number,
          sex: profile.sex as never,
        },
      })

    // 5. Resynchroniser les séquences auto-increment (id réinsérés explicitement)
    await tx.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"MealEntry"', 'id'), COALESCE((SELECT MAX(id) FROM "MealEntry"), 1))`
    )
    await tx.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"CustomFood"', 'id'), COALESCE((SELECT MAX(id) FROM "CustomFood"), 1))`
    )
  })
}
