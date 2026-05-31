import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

export async function GET() {
  const profile = await prisma.profile.findUnique({ where: { id: 1 } })
  if (!profile) return Response.json(null)
  return Response.json(profile)
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const profile = await prisma.profile.upsert({
    where: { id: 1 },
    update: body,
    create: { id: 1, ...body },
  })
  return Response.json(profile)
}
