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
  /** Absent des snapshots version 1 (antérieurs aux pesées). */
  measurements?: unknown[]
}

/** Lit toutes les données métier et renvoie un snapshot complet. */
export async function buildSnapshot(): Promise<Snapshot> {
  const [profile, foods, customFoods, ignoredFoods, translations, mealEntries, measurements] =
    await Promise.all([
      prisma.profile.findUnique({ where: { id: 1 } }),
      prisma.food.findMany(),
      prisma.customFood.findMany(),
      prisma.ignoredFood.findMany(),
      prisma.translation.findMany(),
      prisma.mealEntry.findMany(),
      prisma.bodyMeasurement.findMany(),
    ])

  return {
    version: 2,
    createdAt: new Date().toISOString(),
    profile,
    foods,
    customFoods,
    ignoredFoods,
    translations,
    mealEntries,
    measurements,
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
  // Snapshots v1 : pas de pesées. On ne les efface alors pas — un vieux backup ne
  // doit pas faire disparaître un historique importé depuis.
  const measurements = snap.measurements as Row[] | undefined
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

    // 4. Pesées — seulement si le snapshot en contient (voir plus haut)
    if (measurements) {
      await tx.bodyMeasurement.deleteMany({})
      if (measurements.length)
        await tx.bodyMeasurement.createMany({
          data: measurements.map((m) => ({
            id: m.id as number,
            measuredAt: new Date(m.measuredAt as string),
            weightKg: m.weightKg as number,
            bmi: (m.bmi ?? null) as number | null,
            bodyFatPct: (m.bodyFatPct ?? null) as number | null,
            musclePct: (m.musclePct ?? null) as number | null,
            muscleMassKg: (m.muscleMassKg ?? null) as number | null,
            waterPct: (m.waterPct ?? null) as number | null,
            proteinPct: (m.proteinPct ?? null) as number | null,
            boneMassKg: (m.boneMassKg ?? null) as number | null,
            visceralFat: (m.visceralFat ?? null) as number | null,
            bmrKcal: (m.bmrKcal ?? null) as number | null,
            subcutaneousFatPct: (m.subcutaneousFatPct ?? null) as number | null,
            skeletalMusclePct: (m.skeletalMusclePct ?? null) as number | null,
            metabolicAge: (m.metabolicAge ?? null) as number | null,
            source: (m.source ?? "feelfit") as string,
          })),
        })
    }

    // 5. Profil
    if (profile)
      await tx.profile.upsert({
        where: { id: 1 },
        // targetWeightKg présent dans les vieux snapshots : volontairement ignoré,
        // la colonne n'existe plus (objectif exprimé en % de masse grasse).
        update: {
          age: profile.age as number,
          weightKg: profile.weightKg as number,
          heightCm: profile.heightCm as number,
          sex: profile.sex as never,
          bodyFatPct: (profile.bodyFatPct ?? null) as number | null,
          targetBodyFatPct: (profile.targetBodyFatPct ?? null) as number | null,
        },
        create: {
          id: 1,
          age: profile.age as number,
          weightKg: profile.weightKg as number,
          heightCm: profile.heightCm as number,
          sex: profile.sex as never,
          bodyFatPct: (profile.bodyFatPct ?? null) as number | null,
          targetBodyFatPct: (profile.targetBodyFatPct ?? null) as number | null,
        },
      })

    // 6. Resynchroniser les séquences auto-increment (id réinsérés explicitement)
    await tx.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"MealEntry"', 'id'), COALESCE((SELECT MAX(id) FROM "MealEntry"), 1))`
    )
    await tx.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"CustomFood"', 'id'), COALESCE((SELECT MAX(id) FROM "CustomFood"), 1))`
    )
    await tx.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"BodyMeasurement"', 'id'), COALESCE((SELECT MAX(id) FROM "BodyMeasurement"), 1))`
    )
  })
}
