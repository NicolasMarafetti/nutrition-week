import { buildSnapshot } from "@/lib/snapshot"
import { isAuthorized } from "@/lib/admin-auth"
import { NextRequest } from "next/server"

// GET /api/export?key=SECRET — télécharge un export JSON complet (backup hors-ligne).
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return new Response("Unauthorized", { status: 401 })

  const data = await buildSnapshot()
  const date = new Date().toISOString().slice(0, 10)

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="nutriweek-backup-${date}.json"`,
    },
  })
}
