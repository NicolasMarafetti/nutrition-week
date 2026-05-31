"use client"

import { useEffect, useState, useCallback } from "react"
import MealDialog from "@/components/meal-dialog"
import type { MealEntry, DayOfWeek, MealType } from "@/types"

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: "MON", label: "Lun" },
  { key: "TUE", label: "Mar" },
  { key: "WED", label: "Mer" },
  { key: "THU", label: "Jeu" },
  { key: "FRI", label: "Ven" },
  { key: "SAT", label: "Sam" },
  { key: "SUN", label: "Dim" },
]

const MEALS: { key: MealType; label: string }[] = [
  { key: "BREAKFAST", label: "Petit-déjeuner" },
  { key: "LUNCH", label: "Déjeuner" },
  { key: "SNACK", label: "En-cas" },
  { key: "DINNER", label: "Dîner" },
]

export default function WeekPage() {
  const [entries, setEntries] = useState<MealEntry[]>([])
  const [selected, setSelected] = useState<{ day: DayOfWeek; meal: MealType } | null>(null)

  const load = useCallback(async () => {
    const res = await fetch("/api/meals")
    setEntries(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  function cellEntries(day: DayOfWeek, meal: MealType) {
    return entries.filter((e) => e.day === day && e.meal === meal)
  }

  function cellSummary(es: MealEntry[]) {
    if (es.length === 0) return null
    return es.map((e) => {
      const name = e.food?.name ?? e.customFood?.name ?? "?"
      const short = name.length > 22 ? name.slice(0, 20) + "…" : name
      return `${short} (${e.grams}g)`
    })
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Ma Semaine</h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm min-w-[700px]">
          <thead>
            <tr>
              <th className="w-32 text-left text-zinc-500 font-medium pb-3 pr-3"></th>
              {DAYS.map((d) => (
                <th key={d.key} className="text-center text-zinc-400 font-medium pb-3 px-1">
                  {d.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MEALS.map((m) => (
              <tr key={m.key}>
                <td className="text-zinc-500 text-xs font-medium pr-3 py-1.5 align-top pt-3">
                  {m.label}
                </td>
                {DAYS.map((d) => {
                  const es = cellEntries(d.key, m.key)
                  const summary = cellSummary(es)
                  return (
                    <td key={d.key} className="px-1 py-1.5 align-top">
                      <button
                        onClick={() => setSelected({ day: d.key, meal: m.key })}
                        className={[
                          "w-full min-h-[64px] rounded-lg border text-left p-2 transition-colors",
                          es.length > 0
                            ? "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                            : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900",
                        ].join(" ")}
                      >
                        {summary ? (
                          <ul className="space-y-0.5">
                            {summary.map((s, i) => (
                              <li key={i} className="text-zinc-300 text-xs leading-snug">
                                {s}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-zinc-700 text-xs">+ ajouter</span>
                        )}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <MealDialog
          day={selected.day}
          meal={selected.meal}
          entries={cellEntries(selected.day, selected.meal)}
          open={true}
          onClose={() => setSelected(null)}
          onRefresh={load}
        />
      )}
    </div>
  )
}
