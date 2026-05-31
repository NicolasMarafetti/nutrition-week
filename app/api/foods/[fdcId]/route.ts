import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/foods/[fdcId]">) {
  const { fdcId } = await ctx.params
  const food = await prisma.food.findUnique({ where: { fdcId: Number(fdcId) } })
  if (!food) return Response.json({ error: "not_found" }, { status: 404 })
  return Response.json(food)
}
