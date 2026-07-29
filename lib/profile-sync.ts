import { prisma } from "@/lib/prisma"

/**
 * Recopie la dernière pesée dans le profil (poids + % de masse grasse).
 *
 * Le profil reste la source unique pour tous les calculs (cible calorique,
 * protéines, eau) : on évite ainsi deux vérités qui divergent, et le poids n'a
 * plus à être ressaisi à la main — il suit l'historique importé.
 *
 * À appeler après toute écriture sur BodyMeasurement (import ou suppression).
 */
export async function syncProfileFromLatest(): Promise<void> {
  const latest = await prisma.bodyMeasurement.findFirst({
    orderBy: { measuredAt: "desc" },
    select: { weightKg: true, bodyFatPct: true },
  })
  if (!latest) return

  try {
    await prisma.profile.update({
      where: { id: 1 },
      data: {
        weightKg: latest.weightKg,
        // Une pesée sans impédancemétrie ne doit pas effacer la dernière valeur connue.
        ...(latest.bodyFatPct != null ? { bodyFatPct: latest.bodyFatPct } : {}),
      },
    })
  } catch {
    // Pas encore de profil créé : rien à synchroniser.
  }
}
