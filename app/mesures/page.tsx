"use client"

import { useCallback, useEffect, useState } from "react"
import MeasurementImport from "@/components/measurement-import"
import TrendChart, { type TrendPoint } from "@/components/trend-chart"
import { weightAtBodyFat, classifyBodyFat } from "@/lib/body"

interface Measurement {
  id: number
  measuredAt: string
  weightKg: number
  bmi: number | null
  bodyFatPct: number | null
  musclePct: number | null
  muscleMassKg: number | null
  waterPct: number | null
  proteinPct: number | null
  boneMassKg: number | null
  visceralFat: number | null
  bmrKcal: number | null
  subcutaneousFatPct: number | null
  skeletalMusclePct: number | null
  metabolicAge: number | null
  source: string
}

interface Profile {
  weightKg: number
  sex: "MALE" | "FEMALE"
  bodyFatPct: number | null
  targetBodyFatPct: number | null
}

/** Fenêtres d'analyse. `null` = tout l'historique. */
const RANGES: { key: string; label: string; days: number | null }[] = [
  { key: "90", label: "3 mois", days: 90 },
  { key: "180", label: "6 mois", days: 180 },
  { key: "365", label: "1 an", days: 365 },
  { key: "all", label: "Tout", days: null },
]

export default function MesuresPage() {
  const [rows, setRows] = useState<Measurement[] | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [range, setRange] = useState("180")
  const [showTable, setShowTable] = useState(false)
  // Instant de référence des fenêtres d'analyse, figé au chargement des données
  // (l'heure courante n'est pas lisible pendant le rendu).
  const [nowMs, setNowMs] = useState(0)
  const [reloadToken, setReloadToken] = useState(0)

  const load = useCallback(() => setReloadToken((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const [measurements, prof] = await Promise.all([
        fetch("/api/measurements")
          .then((r) => (r.ok ? r.json() : []))
          .catch(() => []),
        fetch("/api/profile").then((r) => r.json()).catch(() => null),
      ])
      if (cancelled) return
      setRows(Array.isArray(measurements) ? measurements : [])
      setProfile(prof)
      setNowMs(Date.now())
    })()
    return () => { cancelled = true }
  }, [reloadToken])

  async function remove(id: number) {
    await fetch(`/api/measurements/${id}`, { method: "DELETE" })
    load()
  }

  if (rows === null) return <p className="text-zinc-500">Chargement…</p>

  const days = RANGES.find((r) => r.key === range)?.days ?? null
  const cutoff = days ? nowMs - days * 86400_000 : 0
  // L'API renvoie du plus récent au plus ancien ; les courbes veulent l'ordre chronologique.
  const inRange = rows
    .filter((m) => new Date(m.measuredAt).getTime() >= cutoff)
    .sort((a, b) => a.measuredAt.localeCompare(b.measuredAt))

  const latest = rows[0] ?? null
  const targetBf = profile?.targetBodyFatPct ?? null

  const series = (pick: (m: Measurement) => number | null): TrendPoint[] =>
    inRange
      .map((m) => ({ t: new Date(m.measuredAt).getTime(), v: pick(m) }))
      .filter((p): p is TrendPoint => p.v != null)

  const comp =
    latest?.bodyFatPct != null
      ? { weightKg: latest.weightKg, bodyFatPct: latest.bodyFatPct }
      : null
  const band = comp ? classifyBodyFat(comp.bodyFatPct, profile?.sex ?? "MALE") : null
  const gap = comp && targetBf != null ? comp.bodyFatPct - targetBf : null
  const weightAtTarget = comp && targetBf != null ? weightAtBodyFat(comp, targetBf) : null

  return (
    <div className="space-y-8">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h1 className="text-xl font-semibold">Mesures</h1>
        {rows.length > 0 && (
          <p className="text-zinc-500 text-xs">
            {rows.length} pesée{rows.length > 1 ? "s" : ""} · dernière le{" "}
            {new Date(rows[0].measuredAt).toLocaleDateString("fr-FR")}
          </p>
        )}
      </div>

      {/* Chiffres clés de la dernière pesée */}
      {latest && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Poids" value={`${latest.weightKg} kg`} />
          <Stat
            label="Masse grasse"
            value={latest.bodyFatPct != null ? `${latest.bodyFatPct} %` : "—"}
            note={band ? band.label.toLowerCase() : undefined}
          />
          <Stat
            label={targetBf != null ? `Poids à ${targetBf} % MG` : "Poids visé"}
            value={weightAtTarget != null ? `${weightAtTarget.toFixed(1)} kg` : "—"}
            note={weightAtTarget != null ? "base de la cible calorique" : "objectif à définir"}
          />
          <Stat
            label={targetBf != null ? `Écart à ${targetBf} % MG` : "Objectif MG"}
            value={gap != null ? `${gap > 0 ? "+" : ""}${gap.toFixed(1)} pt` : "—"}
            note={
              gap == null
                ? "à définir dans le profil"
                : gap < 0
                  ? "en dessous de la cible"
                  : gap > 0
                    ? "au-dessus de la cible"
                    : "à la cible"
            }
            accent={gap != null && gap <= 0}
          />
        </div>
      )}

      {rows.length > 0 && (
        <>
          <div className="flex items-center gap-1.5 flex-wrap">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={[
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  range === r.key
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200",
                ].join(" ")}
              >
                {r.label}
              </button>
            ))}
            <button
              onClick={() => setShowTable((s) => !s)}
              className="ml-auto text-zinc-500 hover:text-zinc-300 text-xs underline underline-offset-2"
            >
              {showTable ? "Masquer le tableau" : "Voir le tableau"}
            </button>
          </div>

          {inRange.length === 0 ? (
            <p className="text-zinc-500 text-sm">Aucune pesée sur cette période.</p>
          ) : (
            <div className="grid lg:grid-cols-2 gap-4">
              <TrendChart
                title="Poids" unit="kg" points={series((m) => m.weightKg)}
                target={weightAtTarget}
                targetLabel={weightAtTarget != null ? `${weightAtTarget.toFixed(1)} kg à ${targetBf} % MG` : undefined}
              />
              <TrendChart
                title="Masse grasse" unit="%" points={series((m) => m.bodyFatPct)}
                target={targetBf} targetLabel={targetBf != null ? `objectif ${targetBf} %` : undefined}
                higherIsBetter={targetBf == null ? false : undefined}
              />
              <TrendChart
                title="Masse musculaire" unit="kg" points={series((m) => m.muscleMassKg)}
                higherIsBetter={true}
              />
              <TrendChart title="Eau corporelle" unit="%" points={series((m) => m.waterPct)} />
              <TrendChart
                title="Graisse viscérale" unit="" points={series((m) => m.visceralFat)}
                higherIsBetter={false} decimals={0}
              />
              <TrendChart
                title="Métabolisme de base" unit="kcal" points={series((m) => m.bmrKcal)}
                decimals={0}
              />
            </div>
          )}

          <p className="text-zinc-500 text-xs leading-relaxed max-w-2xl">
            Une balance à impédancemétrie a une marge d&apos;erreur de plusieurs points sur le % de masse
            grasse : la <em>tendance</em> est fiable, pas la valeur absolue d&apos;une pesée isolée. Pour
            comparer, se peser toujours dans les mêmes conditions (à jeun, le matin). La dernière pesée
            alimente automatiquement le profil, et donc la cible calorique.
          </p>

          {showTable && (
            <div className="overflow-x-auto border border-zinc-800 rounded-xl">
              <table className="w-full text-xs min-w-[640px]">
                <thead>
                  <tr className="text-zinc-500">
                    <th className="text-left font-medium px-3 py-2">Date</th>
                    <th className="text-right font-medium px-3 py-2">Poids</th>
                    <th className="text-right font-medium px-3 py-2">IMC</th>
                    <th className="text-right font-medium px-3 py-2">MG %</th>
                    <th className="text-right font-medium px-3 py-2">Muscle kg</th>
                    <th className="text-right font-medium px-3 py-2">Eau %</th>
                    <th className="text-right font-medium px-3 py-2">Viscérale</th>
                    <th className="text-right font-medium px-3 py-2">MB</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {[...inRange].reverse().map((m) => (
                    <tr key={m.id} className="border-t border-zinc-800 text-zinc-300 tabular-nums">
                      <td className="px-3 py-2 whitespace-nowrap">
                        {new Date(m.measuredAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="text-right px-3 py-2">{m.weightKg}</td>
                      <td className="text-right px-3 py-2">{m.bmi ?? "—"}</td>
                      <td className="text-right px-3 py-2">{m.bodyFatPct ?? "—"}</td>
                      <td className="text-right px-3 py-2">{m.muscleMassKg ?? "—"}</td>
                      <td className="text-right px-3 py-2">{m.waterPct ?? "—"}</td>
                      <td className="text-right px-3 py-2">{m.visceralFat ?? "—"}</td>
                      <td className="text-right px-3 py-2">{m.bmrKcal ?? "—"}</td>
                      <td className="text-right px-3 py-2">
                        <button
                          onClick={() => remove(m.id)}
                          className="text-zinc-600 hover:text-red-400"
                          title="Supprimer cette pesée"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <MeasurementImport onImported={load} />
    </div>
  )
}

function Stat({
  label, value, note, accent,
}: { label: string; value: string; note?: string; accent?: boolean }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
      <p className="text-zinc-400 text-xs">{label}</p>
      <p className={`font-semibold mt-0.5 ${accent ? "text-emerald-400" : "text-zinc-100"}`}>{value}</p>
      {note && <p className="text-zinc-500 text-xs mt-0.5">{note}</p>}
    </div>
  )
}
