import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"
import { MEASUREMENT_FIELDS, type Measurement } from "@/lib/feelfit"
import { syncProfileFromLatest } from "@/lib/profile-sync"

/** GET /api/measurements[?limit=N] — pesées, de la plus récente à la plus ancienne. */
export async function GET(req: NextRequest) {
  const limitParam = req.nextUrl.searchParams.get("limit")
  const limit = limitParam ? Math.min(Math.max(Number(limitParam) || 0, 1), 2000) : undefined

  const rows = await prisma.bodyMeasurement.findMany({
    orderBy: { measuredAt: "desc" },
    ...(limit ? { take: limit } : {}),
  })
  return Response.json(rows)
}

/** Ne garde que les champs du modèle, et convertit "" / undefined en null. */
function sanitize(raw: Record<string, unknown>) {
  const measuredAt = new Date(String(raw.measuredAt))
  if (Number.isNaN(measuredAt.getTime())) return null

  const weightKg = Number(raw.weightKg)
  if (!Number.isFinite(weightKg) || weightKg <= 0 || weightKg > 500) return null

  const data: Record<string, unknown> = { measuredAt, weightKg }
  for (const field of MEASUREMENT_FIELDS) {
    if (field === "measuredAt" || field === "weightKg") continue
    const v = raw[field]
    const n = v === null || v === undefined || v === "" ? null : Number(v)
    data[field] = n !== null && Number.isFinite(n) ? n : null
  }
  return data as { measuredAt: Date; weightKg: number } & Record<string, unknown>
}

/**
 * POST /api/measurements
 * Corps : une pesée, ou { measurements: [...] } pour un import.
 * Une pesée déjà connue (même date) est mise à jour, pas dupliquée — réimporter
 * le même fichier deux fois ne crée donc pas de doublons.
 */
export async function POST(req: NextRequest) {
  const body = await req.json()
  const incoming: Measurement[] = Array.isArray(body?.measurements)
    ? body.measurements
    : [body]

  if (incoming.length === 0) return Response.json({ error: "empty" }, { status: 400 })
  if (incoming.length > 5000) return Response.json({ error: "too_many" }, { status: 413 })

  const source = typeof body?.source === "string" ? body.source : "feelfit"

  let created = 0
  let updated = 0
  let rejected = 0

  for (const raw of incoming) {
    const data = sanitize(raw as unknown as Record<string, unknown>)
    if (!data) { rejected++; continue }

    const existing = await prisma.bodyMeasurement.findUnique({
      where: { measuredAt: data.measuredAt },
      select: { id: true },
    })
    await prisma.bodyMeasurement.upsert({
      where: { measuredAt: data.measuredAt },
      update: { ...data, source },
      create: { ...data, source } as never,
    })
    if (existing) updated++
    else created++
  }

  await syncProfileFromLatest()
  return Response.json({ created, updated, rejected })
}
