"use client"

import { useEffect, useState } from "react"
import { GROUP_LABELS, type NutrientGroup } from "@/lib/nutrients"
import type { NutrientTarget } from "@/lib/nutrition"

interface Contribution {
  name: string
  amount: number
}

interface BilanData {
  targets: NutrientTarget[]
  waterMl: number
  contributions: Record<string, Contribution[]>
}

function statusColor(pct: number) {
  if (pct >= 90) return "text-emerald-400"
  if (pct >= 60) return "text-amber-400"
  return "text-red-400"
}

function statusBg(pct: number) {
  if (pct >= 90) return "bg-emerald-500"
  if (pct >= 60) return "bg-amber-500"
  return "bg-red-500"
}

function statusLabel(pct: number) {
  if (pct >= 90) return "OK"
  if (pct >= 60) return "Partiel"
  return "Déficit"
}

export default function BilanPage() {
  const [data, setData] = useState<BilanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/bilan")
      .then((r) => r.json())
      .then((d) => {
        if (d.error === "no_profile") {
          setError("Complète d'abord ton profil.")
        } else {
          setData(d)
        }
        setLoading(false)
      })
  }, [])

  if (loading) return <p className="text-zinc-500">Calcul en cours…</p>
  if (error) return (
    <div className="text-amber-400 text-sm">
      {error}{" "}
      <a href="/profil" className="underline">Aller au profil →</a>
    </div>
  )
  if (!data) return null

  const deficits = data.targets.filter((t) => t.pct < 90)
  const ok = data.targets.filter((t) => t.pct >= 90).sort((a, b) => a.pct - b.pct)

  const byGroup = (list: NutrientTarget[]) => {
    const map: Partial<Record<NutrientGroup, NutrientTarget[]>> = {}
    for (const t of list) {
      const g = t.group as NutrientGroup
      if (!map[g]) map[g] = []
      map[g]!.push(t)
    }
    return map
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">Bilan nutritionnel</h1>
        <p className="text-zinc-500 text-sm">Moyenne journalière sur ta semaine type</p>
      </div>

      {/* Water */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 flex items-center gap-4">
        <span className="text-2xl">💧</span>
        <div>
          <p className="text-zinc-400 text-sm">Eau recommandée / jour</p>
          <p className="text-zinc-100 font-semibold text-lg">{data.waterMl} ml</p>
        </div>
      </div>

      {/* Deficits — top priority */}
      {deficits.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
            À améliorer ({deficits.length})
          </h2>
          <div className="space-y-6">
            {Object.entries(byGroup(deficits)).map(([group, items]) => (
              <div key={group}>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                  {GROUP_LABELS[group as NutrientGroup]}
                </p>
                <div className="space-y-2">
                  {items!.map((t) => (
                    <NutrientRow key={t.key} t={t} contributions={data.contributions[t.key]} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* OK */}
      {ok.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
            Couverts ({ok.length})
          </h2>
          <div className="space-y-2">
            {ok.map((t) => (
              <NutrientRow key={t.key} t={t} compact contributions={data.contributions[t.key]} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function NutrientRow({
  t,
  compact = false,
  contributions,
}: {
  t: NutrientTarget
  compact?: boolean
  contributions?: Contribution[]
}) {
  const [open, setOpen] = useState(false)
  const pctCapped = Math.min(t.pct, 100)
  const hasDetail = (contributions?.length ?? 0) > 0

  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-lg px-4 ${compact ? "py-2" : "py-3"}`}>
      <button
        type="button"
        onClick={() => hasDetail && setOpen((o) => !o)}
        className={`w-full text-left ${hasDetail ? "cursor-pointer" : "cursor-default"}`}
      >
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between mb-1.5">
          <span className="text-zinc-200 text-sm font-medium flex items-center gap-1.5">
            {hasDetail && (
              <span className={`text-zinc-500 text-[10px] transition-transform ${open ? "rotate-90" : ""}`}>
                ▶
              </span>
            )}
            {t.label}
          </span>
          <div className="flex items-center gap-3 text-xs shrink-0 pl-3.5 sm:pl-0">
            <span className="text-zinc-500">
              {t.actual} / {t.target} {t.unit}
            </span>
            <span className={`font-semibold ${statusColor(t.pct)}`}>
              {t.pct}% — {statusLabel(t.pct)}
            </span>
          </div>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${statusBg(t.pct)}`}
            style={{ width: `${pctCapped}%` }}
          />
        </div>
      </button>

      {!compact && t.deficit > 0 && (
        <p className="text-zinc-500 text-xs mt-1.5">
          Manque : +{t.deficit} {t.unit}/jour
        </p>
      )}

      {open && hasDetail && (
        <div className="mt-3 pt-3 border-t border-zinc-800 space-y-1.5">
          <p className="text-zinc-600 text-[11px] uppercase tracking-wider">
            Apports / jour
          </p>
          {contributions!.map((c, i) => {
            const share = t.actual > 0 ? Math.round((c.amount / t.actual) * 100) : 0
            return (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 truncate pr-2">{c.name}</span>
                <span className="text-zinc-500 shrink-0">
                  {c.amount} {t.unit} <span className="text-zinc-600">({share}%)</span>
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
