import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"
import { syncProfileFromLatest } from "@/lib/profile-sync"

/** DELETE /api/measurements/[id] — supprime une pesée. */
export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/measurements/[id]">
) {
  const { id } = await ctx.params
  const numericId = Number(id)
  if (!Number.isInteger(numericId)) {
    return Response.json({ error: "invalid_id" }, { status: 400 })
  }

  await prisma.bodyMeasurement.delete({ where: { id: numericId } })
  // Supprimer la pesée la plus récente doit ramener le profil sur la précédente.
  await syncProfileFromLatest()
  return Response.json({ deleted: numericId })
}
