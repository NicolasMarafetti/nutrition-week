import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { NUTRIENTS, GROUP_LABELS, type NutrientGroup } from "@/lib/nutrients"
import Link from "next/link"

export default async function FoodDetailPage(props: PageProps<"/foods/[fdcId]">) {
  const { fdcId } = await props.params
  const food = await prisma.food.findUnique({ where: { fdcId: Number(fdcId) } })
  if (!food) notFound()

  const nutrients = food.nutrients as Record<string, number>
  const groups = Array.from(new Set(NUTRIENTS.map((n) => n.group))) as NutrientGroup[]

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start gap-4">
        <Link href="/" className="text-zinc-500 hover:text-zinc-300 text-sm mt-1">← Semaine</Link>
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">{food.name}</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{food.dataType} — valeurs pour 100g</p>
        </div>
      </div>

      {groups.map((group) => {
        const groupNutrients = NUTRIENTS.filter((n) => n.group === group)
        const hasData = groupNutrients.some((n) => nutrients[n.key] != null)
        if (!hasData) return null

        return (
          <section key={group}>
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              {GROUP_LABELS[group]}
            </h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              {groupNutrients.map((n, i) => {
                const val = nutrients[n.key]
                return (
                  <div
                    key={n.key}
                    className={[
                      "flex items-center justify-between px-4 py-2.5 text-sm",
                      i !== 0 ? "border-t border-zinc-800" : "",
                      val == null ? "opacity-40" : "",
                    ].join(" ")}
                  >
                    <span className="text-zinc-300">{n.label}</span>
                    <span className={val != null ? "text-zinc-100 font-medium" : "text-zinc-600"}>
                      {val != null ? `${val} ${n.unit}` : "—"}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
