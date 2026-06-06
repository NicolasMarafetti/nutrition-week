import { prisma } from "@/lib/prisma"
import { buildSnapshot } from "@/lib/snapshot"
import { isAuthorized } from "@/lib/admin-auth"
import { NextRequest } from "next/server"

const KEEP = 14 // nombre de snapshots conservés

// GET /api/backup/run — déclenché par Vercel Cron (quotidien). Crée un snapshot.
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return new Response("Unauthorized", { status: 401 })

  const data = await buildSnapshot()
  const backup = await prisma.backup.create({
    data: { trigger: "cron", data: data as object },
  })

  // Purge : ne conserver que les KEEP plus récents
  const old = await prisma.backup.findMany({
    orderBy: { createdAt: "desc" },
    skip: KEEP,
    select: { id: true },
  })
  if (old.length > 0) {
    await prisma.backup.deleteMany({ where: { id: { in: old.map((b) => b.id) } } })
  }

  return Response.json({
    ok: true,
    backupId: backup.id,
    createdAt: backup.createdAt,
    counts: {
      foods: data.foods.length,
      customFoods: data.customFoods.length,
      mealEntries: data.mealEntries.length,
    },
  })
}
