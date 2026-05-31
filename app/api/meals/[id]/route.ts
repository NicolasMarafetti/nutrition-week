import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/meals/[id]">) {
  const { id } = await ctx.params
  const body = await req.json()
  const entry = await prisma.mealEntry.update({
    where: { id: Number(id) },
    data: { grams: body.grams },
    include: { food: true, customFood: true },
  })
  return Response.json(entry)
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/meals/[id]">) {
  const { id } = await ctx.params
  await prisma.mealEntry.delete({ where: { id: Number(id) } })
  return new Response(null, { status: 204 })
}
