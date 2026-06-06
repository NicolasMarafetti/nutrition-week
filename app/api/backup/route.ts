import { prisma } from "@/lib/prisma"
import { buildSnapshot } from "@/lib/snapshot"
import { isAuthorized } from "@/lib/admin-auth"
import { NextRequest } from "next/server"

// GET /api/backup?key=SECRET — liste les snapshots existants (métadonnées).
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return new Response("Unauthorized", { status: 401 })

  const backups = await prisma.backup.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, createdAt: true, trigger: true },
  })
  return Response.json(backups)
}

// POST /api/backup?key=SECRET — crée un snapshot manuel immédiat.
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return new Response("Unauthorized", { status: 401 })

  const data = await buildSnapshot()
  const backup = await prisma.backup.create({
    data: { trigger: "manual", data: data as object },
  })
  return Response.json({ ok: true, backupId: backup.id, createdAt: backup.createdAt })
}
