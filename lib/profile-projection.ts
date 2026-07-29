import { prisma } from "@/lib/prisma"
import { projectWeightAtBodyFat, type Projection } from "@/lib/projection"

export interface ProfileWithProjection {
  id: number
  age: number
  weightKg: number
  heightCm: number
  sex: string
  bodyFatPct: number | null
  targetBodyFatPct: number | null
  /** Projection à l'objectif de masse grasse, déduite de l'historique des pesées. */
  projection: Projection | null
  /** Raccourci consommé par energyBasisWeightKg (lib/nutrients.ts). */
  projectedTargetWeightKg: number | null
}

/**
 * Profil enrichi de la projection du poids visé.
 *
 * Centralisé ici pour que l'API profil et l'API bilan partent exactement du même
 * calcul — sinon la cible calorique affichée et celle du bilan divergent.
 */
export async function loadProfileWithProjection(): Promise<ProfileWithProjection | null> {
  const profile = await prisma.profile.findUnique({ where: { id: 1 } })
  if (!profile) return null

  let projection: Projection | null = null
  if (profile.targetBodyFatPct != null) {
    const measurements = await prisma.bodyMeasurement.findMany({
      where: { bodyFatPct: { not: null } },
      orderBy: { measuredAt: "asc" },
      select: { measuredAt: true, weightKg: true, bodyFatPct: true },
    })
    projection = projectWeightAtBodyFat(
      measurements.map((m) => ({
        measuredAt: m.measuredAt.toISOString(),
        weightKg: m.weightKg,
        bodyFatPct: m.bodyFatPct,
      })),
      profile.targetBodyFatPct
    )
  }

  return {
    ...profile,
    projection,
    projectedTargetWeightKg: projection?.weightKg ?? null,
  }
}
