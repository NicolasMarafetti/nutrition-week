"use client"

import { useEffect, useState, useCallback } from "react"
import MealDialog from "@/components/meal-dialog"
import CopyDayDialog from "@/components/copy-day-dialog"
import { displayName } from "@/lib/food-name"
import { mealCalorieTargets, mealStatus, type BodyProfile, type MealKey } from "@/lib/nutrients"
import { readCache, writeCache, hasChanged, CACHE_KEYS } from "@/lib/cache"
import type { MealEntry, DayOfWeek, MealType } from "@/types"

const DAYS: { key: DayOfWeek; label: string; full: string }[] = [
  { key: "MON", label: "Lun", full: "Lundi" },
  { key: "TUE", label: "Mar", full: "Mardi" },
  { key: "WED", label: "Mer", full: "Mercredi" },
  { key: "THU", label: "Jeu", full: "Jeudi" },
  { key: "FRI", label: "Ven", full: "Vendredi" },
  { key: "SAT", label: "Sam", full: "Samedi" },
  { key: "SUN", label: "Dim", full: "Dimanche" },
]

const MEALS: { key: MealType; label: string }[] = [
  { key: "BREAKFAST", label: "Petit-déjeuner" },
  { key: "MORNING_SNACK", label: "Collation 10h" },
  { key: "LUNCH", label: "Déjeuner" },
  { key: "SNACK", label: "En-cas" },
  { key: "DINNER", label: "Dîner" },
]

// JS getDay(): 0=Dim..6=Sam  →  index dans DAYS (Lun=0..Dim=6)
const TODAY_INDEX = (new Date().getDay() + 6) % 7

export default function WeekPage() {
  const [entries, setEntries] = useState<MealEntry[]>([])
  const [profile, setProfile] = useState<BodyProfile | null>(null)
  const [selected, setSelected] = useState<{ day: DayOfWeek; meal: MealType } | null>(null)
  const [copyFrom, setCopyFrom] = useState<DayOfWeek | null>(null)
  const [mobileDay, setMobileDay] = useState<DayOfWeek>(DAYS[TODAY_INDEX].key)

  // Revalidation des repas : ne met à jour l'écran + le cache que si différent.
  const load = useCallback(async () => {
    const res = await fetch("/api/meals")
    const data: MealEntry[] = await res.json()
    setEntries((prev) => {
      if (!hasChanged(prev, data)) return prev
      writeCache(CACHE_KEYS.meals, data)
      return data
    })
  }, [])

  useEffect(() => {
    // 1. Affichage immédiat depuis le cache (stale)
    const cachedMeals = readCache<MealEntry[]>(CACHE_KEYS.meals)
    if (cachedMeals) setEntries(cachedMeals)
    const cachedProfile = readCache<BodyProfile>(CACHE_KEYS.profile)
    if (cachedProfile) setProfile(cachedProfile)

    // 2. Revalidation en arrière-plan (revalidate)
    load()
    fetch("/api/profile")
      .then((r) => r.json())
      .then((p: BodyProfile | null) => {
        if (!p) return
        setProfile((prev) => {
          if (prev && !hasChanged(prev, p)) return prev
          writeCache(CACHE_KEYS.profile, p)
          return p
        })
      })
  }, [load])

  const mealTargets = profile ? mealCalorieTargets(profile) : null

  function cellEntries(day: DayOfWeek, meal: MealType) {
    return entries.filter((e) => e.day === day && e.meal === meal)
  }

  function cellCalories(es: MealEntry[]) {
    return es.reduce((sum, e) => {
      const cal = (e.food?.nutrients?.calories ?? e.customFood?.nutrients?.calories ?? 0)
      return sum + (cal * e.grams) / 100
    }, 0)
  }

  function cellSummary(es: MealEntry[]) {
    if (es.length === 0) return null
    return es.map((e) => {
      const name = e.food ? displayName(e.food) : (e.customFood?.name ?? "?")
      const short = name.length > 22 ? name.slice(0, 20) + "…" : name
      return `${short} (${e.grams}g)`
    })
  }

  // Indicateur calories d'un repas (pastille + kcal + écart)
  function CalIndicator({ es, target }: { es: MealEntry[]; target?: number }) {
    if (target == null || es.length === 0) return null
    const kcal = Math.round(cellCalories(es))
    const status = mealStatus(kcal, target)
    const deltaPct = Math.round((kcal / target - 1) * 100)
    return (
      <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-medium">
        <span className={`inline-block w-2 h-2 rounded-full ${status === "ok" ? "bg-emerald-500" : "bg-amber-500"}`} />
        <span className={status === "ok" ? "text-emerald-400" : "text-amber-400"}>{kcal} kcal</span>
        {status !== "ok" && (
          <span className="text-amber-500/80">{deltaPct > 0 ? "+" : ""}{deltaPct}%</span>
        )}
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Ma Semaine</h1>

      {/* ─── Desktop : grille 7×4 ─────────────────────────────── */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-collapse text-sm min-w-[700px]">
          <thead>
            <tr>
              <th className="w-32 text-left text-zinc-500 font-medium pb-3 pr-3"></th>
              {DAYS.map((d) => (
                <th key={d.key} className="text-center text-zinc-400 font-medium pb-3 px-1">
                  <div className="flex flex-col items-center gap-1">
                    <span>{d.label}</span>
                    <button
                      onClick={() => setCopyFrom(d.key)}
                      className="text-zinc-700 hover:text-zinc-400 text-xs transition-colors"
                      title={`Copier ${d.label}`}
                    >
                      ⎘
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MEALS.map((m) => {
              const target = mealTargets?.[m.key as MealKey]
              return (
              <tr key={m.key}>
                <td className="text-zinc-500 text-xs font-medium pr-3 py-1.5 align-top pt-3">
                  <div>{m.label}</div>
                  {target != null && (
                    <div className="text-zinc-600 text-[11px] mt-0.5">cible {target} kcal</div>
                  )}
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
                        <CalIndicator es={es} target={target} />
                        {summary ? (
                          <ul className="space-y-0.5">
                            {summary.map((s, i) => (
                              <li key={i} className="text-zinc-300 text-xs leading-snug">{s}</li>
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
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ─── Mobile : vue par jour ────────────────────────────── */}
      <div className="lg:hidden">
        {/* Sélecteur de jour */}
        <div className="flex gap-1.5 overflow-x-auto pb-3 -mx-1 px-1">
          {DAYS.map((d) => (
            <button
              key={d.key}
              onClick={() => setMobileDay(d.key)}
              className={[
                "shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                mobileDay === d.key
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800",
              ].join(" ")}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Cartes des 4 repas du jour sélectionné */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-zinc-300 font-medium">{DAYS.find((d) => d.key === mobileDay)?.full}</h2>
          <button
            onClick={() => setCopyFrom(mobileDay)}
            className="text-zinc-500 text-xs border border-zinc-800 rounded-md px-2 py-1"
          >
            ⎘ Copier ce jour
          </button>
        </div>

        <div className="space-y-3">
          {MEALS.map((m) => {
            const target = mealTargets?.[m.key as MealKey]
            const es = cellEntries(mobileDay, m.key)
            const summary = cellSummary(es)
            return (
              <button
                key={m.key}
                onClick={() => setSelected({ day: mobileDay, meal: m.key })}
                className={[
                  "w-full text-left rounded-xl border p-3 transition-colors",
                  es.length > 0
                    ? "border-zinc-700 bg-zinc-900"
                    : "border-zinc-800 bg-zinc-900/50",
                ].join(" ")}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-zinc-200 font-medium text-sm">{m.label}</span>
                  {target != null && (
                    <span className="text-zinc-600 text-[11px]">cible {target} kcal</span>
                  )}
                </div>
                <CalIndicator es={es} target={target} />
                {summary ? (
                  <ul className="space-y-0.5">
                    {summary.map((s, i) => (
                      <li key={i} className="text-zinc-300 text-xs leading-snug">{s}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-zinc-600 text-xs">+ ajouter un aliment</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {selected && (
        <MealDialog
          day={selected.day}
          meal={selected.meal}
          entries={cellEntries(selected.day, selected.meal)}
          mealTarget={mealTargets?.[selected.meal as MealKey]}
          open={true}
          onClose={() => setSelected(null)}
          onRefresh={load}
        />
      )}

      {copyFrom && (
        <CopyDayDialog
          fromDay={copyFrom}
          open={true}
          onClose={() => setCopyFrom(null)}
          onRefresh={load}
        />
      )}
    </div>
  )
}
