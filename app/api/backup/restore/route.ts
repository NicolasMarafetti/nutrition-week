import { prisma } from "@/lib/prisma"
import { restoreSnapshot, type Snapshot } from "@/lib/snapshot"
import { isAuthorized } from "@/lib/admin-auth"
import { NextRequest } from "next/server"

// POST /api/backup/restore?key=SECRET  body: { id?: number }
// Restaure le snapshot demandé (ou le plus récent). DESTRUCTIF.
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return new Response("Unauthorized", { status: 401 })

  const body = await req.json().catch(() => ({}))
  const id: number | undefined = body?.id

  const backup = id
    ? await prisma.backup.findUnique({ where: { id } })
    : await prisma.backup.findFirst({ orderBy: { createdAt: "desc" } })

  if (!backup) return Response.json({ error: "no_backup" }, { status: 404 })

  await restoreSnapshot(backup.data as unknown as Snapshot)

  return Response.json({ ok: true, restoredFrom: backup.id, createdAt: backup.createdAt })
}
