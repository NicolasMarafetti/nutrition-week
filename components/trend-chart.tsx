"use client"

import { useRef, useState } from "react"

export interface TrendPoint {
  t: number // horodatage (ms)
  v: number
}

interface Props {
  title: string
  unit: string
  points: TrendPoint[]
  /** Ligne de référence (objectif), tracée en pointillés. */
  target?: number | null
  targetLabel?: string
  /**
   * true si une valeur qui monte est un progrès (masse musculaire), false sinon.
   * Laissé vide quand un `target` est fourni : le progrès est alors « se
   * rapprocher de la cible », qui peut être au-dessus comme en dessous.
   */
  higherIsBetter?: boolean
  decimals?: number
}

const W = 560
const H = 170
const PAD = { top: 14, right: 12, bottom: 22, left: 40 }

/**
 * Courbe d'évolution d'une seule mesure dans le temps.
 *
 * Une métrique par graphique (petits multiples) : jamais deux échelles sur un
 * même cadre, sinon la comparaison visuelle entre deux mesures d'unités
 * différentes est trompeuse.
 */
export default function TrendChart({
  title,
  unit,
  points,
  target,
  targetLabel,
  higherIsBetter,
  decimals = 1,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<number | null>(null)

  const data = points.filter((p) => Number.isFinite(p.v)).sort((a, b) => a.t - b.t)

  if (data.length === 0) {
    return (
      <figure className="border border-zinc-800 rounded-xl p-4 m-0">
        <figcaption className="text-zinc-300 text-sm font-medium">{title}</figcaption>
        <p className="text-zinc-600 text-xs mt-6 mb-6 text-center">Pas de donnée</p>
      </figure>
    )
  }

  const tMin = data[0].t
  const tMax = data[data.length - 1].t
  const values = data.map((p) => p.v)
  if (target != null) values.push(target)
  let vMin = Math.min(...values)
  let vMax = Math.max(...values)
  if (vMax === vMin) { vMin -= 1; vMax += 1 }
  const margin = (vMax - vMin) * 0.12
  vMin -= margin
  vMax += margin

  const x = (t: number) =>
    tMax === tMin
      ? PAD.left + (W - PAD.left - PAD.right) / 2
      : PAD.left + ((t - tMin) / (tMax - tMin)) * (W - PAD.left - PAD.right)
  const y = (v: number) =>
    PAD.top + (1 - (v - vMin) / (vMax - vMin)) * (H - PAD.top - PAD.bottom)

  const line = data.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ")
  const area =
    data.length > 1
      ? `${line} L${x(tMax).toFixed(1)},${H - PAD.bottom} L${x(tMin).toFixed(1)},${H - PAD.bottom} Z`
      : ""

  // Graduations : 3 valeurs — dédoublonnées sur leur libellé, sinon une plage
  // étroite (graisse viscérale 4→5, sans décimale) affiche « 5 » deux fois.
  const ticks = [...new Map(
    [vMin + margin, (vMin + vMax) / 2, vMax - margin].map((v) => [v.toFixed(decimals), v])
  ).values()]

  const first = data[0].v
  const last = data[data.length - 1].v
  const delta = last - first

  // Sens du progrès : consigne explicite si donnée, sinon rapprochement de la
  // cible (viser 17,5% de masse grasse en partant de 13% = monter est un progrès),
  // sinon aucun jugement.
  const deltaGood =
    higherIsBetter != null
      ? higherIsBetter === delta > 0
      : target != null
        ? Math.abs(last - target) < Math.abs(first - target)
        : null

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    // Le SVG est mis à l'échelle par viewBox : on reprojette la position souris.
    const svgX = ((e.clientX - rect.left) / rect.width) * W
    let best = 0
    let bestDist = Infinity
    data.forEach((p, i) => {
      const d = Math.abs(x(p.t) - svgX)
      if (d < bestDist) { bestDist = d; best = i }
    })
    setHover(best)
  }

  const hovered = hover != null ? data[hover] : null
  const fmt = (v: number) => v.toFixed(decimals)
  const fmtDate = (t: number) =>
    new Date(t).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "2-digit" })

  return (
    <figure className="border border-zinc-800 rounded-xl p-4 m-0">
      <figcaption className="flex items-baseline justify-between gap-2 mb-1">
        <span className="text-zinc-300 text-sm font-medium">{title}</span>
        <span className="text-zinc-100 text-sm font-semibold tabular-nums">
          {fmt(last)}
          <span className="text-zinc-500 font-normal"> {unit}</span>
        </span>
      </figcaption>

      <div className="flex items-center gap-2 mb-2 text-[11px]">
        <span
          className={
            deltaGood == null
              ? "text-zinc-500"
              : deltaGood
                ? "text-emerald-400"
                : "text-amber-400"
          }
        >
          {delta > 0 ? "+" : ""}
          {fmt(delta)} {unit}
        </span>
        <span className="text-zinc-600">
          depuis le {fmtDate(tMin)} · {data.length} pesée{data.length > 1 ? "s" : ""}
        </span>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-[170px] overflow-visible"
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label={`${title} : de ${fmt(first)} à ${fmt(last)} ${unit}`}
      >
        {/* Grille — volontairement discrète */}
        {ticks.map((v) => (
          <g key={v}>
            <line
              x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)}
              stroke="currentColor" className="text-zinc-800" strokeWidth={1}
            />
            <text
              x={PAD.left - 6} y={y(v) + 3} textAnchor="end"
              className="fill-zinc-600 text-[10px] tabular-nums"
            >
              {fmt(v)}
            </text>
          </g>
        ))}

        {/* Objectif */}
        {target != null && target >= vMin && target <= vMax && (
          <>
            <line
              x1={PAD.left} x2={W - PAD.right} y1={y(target)} y2={y(target)}
              stroke="currentColor" className="text-zinc-600"
              strokeWidth={1} strokeDasharray="4 3"
            />
            <text
              x={W - PAD.right} y={y(target) - 4} textAnchor="end"
              className="fill-zinc-500 text-[10px]"
            >
              {targetLabel ?? `objectif ${fmt(target)}`}
            </text>
          </>
        )}

        {data.length > 1 && (
          <>
            <defs>
              <linearGradient id={`fill-${title.replace(/\W/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(16 185 129)" stopOpacity="0.18" />
                <stop offset="100%" stopColor="rgb(16 185 129)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill={`url(#fill-${title.replace(/\W/g, "")})`} />
          </>
        )}

        <path
          d={line} fill="none" stroke="rgb(16 185 129)" strokeWidth={2}
          strokeLinejoin="round" strokeLinecap="round"
        />

        {/* Points : discrets, sauf s'il n'y a qu'une pesée */}
        {data.map((p, i) => (
          <circle
            key={p.t} cx={x(p.t)} cy={y(p.v)}
            r={hover === i ? 4.5 : data.length === 1 ? 4 : 2}
            fill="rgb(16 185 129)"
            stroke="rgb(9 9 11)" strokeWidth={hover === i ? 2 : 0}
          />
        ))}

        {/* Repère de survol */}
        {hovered && (
          <line
            x1={x(hovered.t)} x2={x(hovered.t)} y1={PAD.top} y2={H - PAD.bottom}
            stroke="currentColor" className="text-zinc-700" strokeWidth={1}
          />
        )}

        {/* Dates aux extrémités */}
        <text x={PAD.left} y={H - 6} className="fill-zinc-600 text-[10px]">{fmtDate(tMin)}</text>
        {tMax !== tMin && (
          <text x={W - PAD.right} y={H - 6} textAnchor="end" className="fill-zinc-600 text-[10px]">
            {fmtDate(tMax)}
          </text>
        )}
      </svg>

      <p className="text-[11px] text-zinc-500 h-4 mt-1 tabular-nums">
        {hovered ? `${fmtDate(hovered.t)} — ${fmt(hovered.v)} ${unit}` : ""}
      </p>
    </figure>
  )
}
