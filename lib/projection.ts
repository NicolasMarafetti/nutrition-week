/**
 * Projection du poids correspondant à l'objectif de masse grasse, **à partir de
 * l'historique réel des pesées**.
 *
 * Pourquoi ne pas se contenter de « masse maigre constante » : ce modèle suppose
 * que tout kilo gagné est du gras. L'historique dit le contraire — sur les 6
 * derniers mois, +6 kg de poids dont la moitié de masse maigre. Il sous-estime
 * donc largement le poids atteint à l'objectif.
 *
 * Ce qu'on mesure à la place : **combien de kilos accompagnent un point de % de
 * masse grasse**, chez cette personne, sur ses propres données.
 */

export interface MeasurementPoint {
  measuredAt: string
  weightKg: number
  bodyFatPct: number | null
}

export interface Regression {
  /** kg de poids par point de % de masse grasse. */
  slope: number
  intercept: number
  /** Qualité de l'ajustement, 0 à 1. */
  r2: number
  n: number
}

/**
 * Moindres carrés de y (poids) sur x (% de masse grasse).
 *
 * C'est la version robuste du « ratio moyen » : plutôt que de comparer deux
 * points au hasard — ce qui explose dès que l'écart de %MG est petit — on ajuste
 * une droite sur toutes les pesées de la fenêtre.
 */
export function linearRegression(points: Array<{ x: number; y: number }>): Regression | null {
  const n = points.length
  if (n < 2) return null

  const meanX = points.reduce((s, p) => s + p.x, 0) / n
  const meanY = points.reduce((s, p) => s + p.y, 0) / n

  let sxy = 0
  let sxx = 0
  let syy = 0
  for (const p of points) {
    sxy += (p.x - meanX) * (p.y - meanY)
    sxx += (p.x - meanX) ** 2
    syy += (p.y - meanY) ** 2
  }
  if (sxx === 0) return null // aucune variation de %MG : pente indéfinie

  const slope = sxy / sxx
  return {
    slope,
    intercept: meanY - slope * meanX,
    r2: syy === 0 ? 0 : (sxy * sxy) / (sxx * syy),
    n,
  }
}

/** Fenêtre d'historique par défaut : assez récente pour refléter la prise de
 *  masse en cours, assez large pour avoir des dizaines de pesées. */
export const DEFAULT_WINDOW_DAYS = 180

/** En dessous, la tendance n'est pas exploitable et on retombe sur le modèle simple. */
const MIN_POINTS = 8
const MIN_BODYFAT_SPAN = 1 // points de %MG couverts par l'historique
const MIN_R2 = 0.5

export interface Projection {
  /** Poids projeté à l'objectif de masse grasse. */
  weightKg: number
  /** "trend" = déduit de l'historique ; "lean-constant" = repli. */
  method: "trend" | "lean-constant"
  /** kg par point de %MG (méthode "trend" uniquement). */
  slope?: number
  r2?: number
  n?: number
  fromDate?: string
  toDate?: string
  /** Raison du repli, quand la tendance n'a pas pu être utilisée. */
  fallbackReason?: string
}

/**
 * Poids projeté à `targetPct` de masse grasse.
 *
 * Méthode "trend" : on ancre sur la dernière pesée et on applique la pente
 * historique. Ancrer plutôt que lire la droite en `targetPct` évite de faire
 * porter l'extrapolation à l'ordonnée à l'origine, mal estimée quand on projette
 * loin du nuage de points.
 */
export function projectWeightAtBodyFat(
  measurements: MeasurementPoint[],
  targetPct: number,
  windowDays: number = DEFAULT_WINDOW_DAYS
): Projection | null {
  const usable = measurements
    .filter((m) => m.bodyFatPct != null && Number.isFinite(m.weightKg))
    .sort((a, b) => a.measuredAt.localeCompare(b.measuredAt))

  if (usable.length === 0) return null

  const latest = usable[usable.length - 1]
  const leanConstant =
    (latest.weightKg * (1 - latest.bodyFatPct! / 100)) / (1 - targetPct / 100)

  const fallback = (reason: string): Projection => ({
    weightKg: leanConstant,
    method: "lean-constant",
    fallbackReason: reason,
  })

  const cutoff = new Date(latest.measuredAt).getTime() - windowDays * 86400_000
  const window = usable.filter((m) => new Date(m.measuredAt).getTime() >= cutoff)

  if (window.length < MIN_POINTS) return fallback("pas assez de pesées sur la période")

  const xs = window.map((m) => m.bodyFatPct!)
  const span = Math.max(...xs) - Math.min(...xs)
  if (span < MIN_BODYFAT_SPAN) {
    return fallback("la masse grasse a trop peu varié pour en tirer une tendance")
  }

  const reg = linearRegression(window.map((m) => ({ x: m.bodyFatPct!, y: m.weightKg })))
  if (!reg) return fallback("tendance incalculable")
  if (reg.r2 < MIN_R2) return fallback("relation trop dispersée pour être fiable")
  if (reg.slope <= 0) {
    // Pente négative : le poids baissait pendant que la masse grasse montait.
    // Extrapoler donnerait un poids cible plus bas que le poids actuel.
    return fallback("tendance incohérente avec une prise de masse")
  }

  return {
    weightKg: latest.weightKg + reg.slope * (targetPct - latest.bodyFatPct!),
    method: "trend",
    slope: reg.slope,
    r2: reg.r2,
    n: reg.n,
    fromDate: window[0].measuredAt,
    toDate: latest.measuredAt,
  }
}
