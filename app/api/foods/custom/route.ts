import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

export async function GET() {
  const foods = await prisma.customFood.findMany({ orderBy: { name: "asc" } })
  return Response.json(foods)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const food = await prisma.customFood.create({
    data: { name: body.name, nutrients: body.nutrients },
  })
  return Response.json(food)
}
