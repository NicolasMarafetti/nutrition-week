import { NextRequest } from "next/server"

/**
 * Autorise une requête si elle présente le secret CRON_SECRET, soit via
 * l'en-tête `Authorization: Bearer <secret>` (utilisé automatiquement par
 * Vercel Cron), soit via le paramètre `?key=<secret>` (pratique en manuel).
 */
export function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false // pas de secret configuré → tout est refusé

  const auth = req.headers.get("authorization")
  if (auth === `Bearer ${secret}`) return true

  const key = req.nextUrl.searchParams.get("key")
  if (key === secret) return true

  return false
}
