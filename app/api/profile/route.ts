import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"
import { loadProfileWithProjection } from "@/lib/profile-projection"

export async function GET() {
  const profile = await loadProfileWithProjection()
  if (!profile) return Response.json(null)
  return Response.json(profile)
}

/** Nombre, ou null si la valeur est vide/invalide (champs optionnels). */
function optionalNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  // Liste blanche : le client renvoie l'objet complet reçu du GET (id et updatedAt
  // compris), qui ne doit pas être réécrit tel quel.
  //
  // weightKg et bodyFatPct sont volontairement absents : ils viennent de la
  // dernière pesée importée (lib/profile-sync.ts) et ne se saisissent plus.
  const data = {
    age: Number(body.age),
    heightCm: Number(body.heightCm),
    sex: body.sex === "FEMALE" ? ("FEMALE" as const) : ("MALE" as const),
    targetBodyFatPct: optionalNumber(body.targetBodyFatPct),
  }

  const profile = await prisma.profile.upsert({
    where: { id: 1 },
    update: data,
    // À la création il n'existe aucune pesée : on part du poids fourni, ou d'un
    // repli neutre que le premier import viendra corriger.
    create: { id: 1, ...data, weightKg: Number(body.weightKg) || 70, bodyFatPct: optionalNumber(body.bodyFatPct) },
  })
  return Response.json(profile)
}
