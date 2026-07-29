/**
 * Lecture d'un export Apple Santé (`export.xml`).
 *
 * Voie de secours quand l'export FeelFit direct n'est pas accessible : FeelFit
 * synchronise ses pesées vers Apple Santé, qui sait tout exporter.
 *
 * Limite à connaître : seules **3 métriques** transitent par Apple Santé —
 * poids, % de masse grasse et IMC. Le muscle, l'eau, la graisse viscérale et le
 * métabolisme de base restent dans FeelFit et ne sont pas dans ce fichier.
 */

import type { ExtractResult, Measurement } from "./feelfit"

/** Types HealthKit utiles ici. LeanBodyMass est volontairement ignoré : il vaut
 *  exactement poids × (1 − %MG), donc l'app le recalcule elle-même. */
const WEIGHT = "HKQuantityTypeIdentifierBodyMass"
const BODY_FAT = "HKQuantityTypeIdentifierBodyFatPercentage"
const BMI = "HKQuantityTypeIdentifierBodyMassIndex"

/** Reconnaît un export Apple Santé sans avoir à lire tout le fichier. */
export function isAppleHealthExport(text: string): boolean {
  return /<HealthData\b/.test(text.slice(0, 8192))
}

/** Valeur d'un attribut dans une balise ouvrante déjà isolée. */
function attr(tag: string, name: string): string | null {
  const m = tag.match(new RegExp(`\\b${name}="([^"]*)"`))
  return m ? m[1] : null
}

/** Apple date : "2026-07-29 06:34:45 +0200". */
function parseAppleDate(raw: string): Date | null {
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2}) ([+-])(\d{2})(\d{2})$/)
  if (!m) {
    const d = new Date(raw)
    return Number.isNaN(d.getTime()) ? null : d
  }
  const [, y, mo, d, h, mi, s, sign, oh, om] = m
  const offsetMin = (sign === "-" ? -1 : 1) * (Number(oh) * 60 + Number(om))
  const utc = Date.UTC(+y, +mo - 1, +d, +h, +mi, +s) - offsetMin * 60_000
  return new Date(utc)
}

const KG_PER_LB = 0.45359237

function toKg(value: number, unit: string | null): number {
  if (unit === "lb") return value * KG_PER_LB
  if (unit === "g") return value / 1000
  return value
}

/**
 * % de masse grasse. **Piège Apple Santé** : l'attribut annonce `unit="%"` mais
 * la valeur est une *fraction* (0.132 = 13,2 %). On ne se fie donc pas à
 * l'unité, mais à l'ordre de grandeur — aucun humain n'est à 1% de masse grasse.
 */
function toPercent(value: number): number {
  return value <= 1 ? value * 100 : value
}

interface Bucket {
  weightKg?: number
  bodyFatPct?: number
  bmi?: number
  /** Priorité de la source : la balance elle-même prime sur les ré-synchros. */
  weightFromScale?: boolean
  bodyFatFromScale?: boolean
  bmiFromScale?: boolean
}

/** Ré-synchros d'applis tierces (Yazio, Zepp…) : gardées seulement à défaut. */
function isScale(source: string | null): boolean {
  return (source ?? "").toLowerCase().includes("feelfit")
}

export function extractFromAppleHealth(text: string): ExtractResult {
  const skipped: ExtractResult["skipped"] = []
  // Une pesée = un instant. Les 3 mesures d'une même pesée partagent exactement
  // le même startDate (vérifié sur l'export réel), donc on regroupe dessus.
  const buckets = new Map<number, Bucket>()

  let malformed = 0
  // Balise ouvrante <Record …> : les attributs ne peuvent pas contenir de '>'.
  const tagRe = /<Record\b[^>]*>/g
  let match: RegExpExecArray | null

  while ((match = tagRe.exec(text)) !== null) {
    const tag = match[0]
    const type = attr(tag, "type")
    if (type !== WEIGHT && type !== BODY_FAT && type !== BMI) continue

    const rawDate = attr(tag, "startDate")
    const rawValue = attr(tag, "value")
    const date = rawDate ? parseAppleDate(rawDate) : null
    const value = rawValue == null ? NaN : Number(rawValue)

    if (!date || !Number.isFinite(value)) { malformed++; continue }

    const t = date.getTime()
    const bucket = buckets.get(t) ?? {}
    const fromScale = isScale(attr(tag, "sourceName"))

    if (type === WEIGHT) {
      if (bucket.weightKg === undefined || (fromScale && !bucket.weightFromScale)) {
        bucket.weightKg = toKg(value, attr(tag, "unit"))
        bucket.weightFromScale = fromScale
      }
    } else if (type === BODY_FAT) {
      if (bucket.bodyFatPct === undefined || (fromScale && !bucket.bodyFatFromScale)) {
        bucket.bodyFatPct = toPercent(value)
        bucket.bodyFatFromScale = fromScale
      }
    } else {
      if (bucket.bmi === undefined || (fromScale && !bucket.bmiFromScale)) {
        bucket.bmi = value
        bucket.bmiFromScale = fromScale
      }
    }
    buckets.set(t, bucket)
  }

  if (malformed) skipped.push({ line: 0, reason: `${malformed} enregistrement(s) illisible(s)` })

  const measurements: Measurement[] = []
  let noWeight = 0

  for (const [t, b] of buckets) {
    // Le poids est la seule donnée indispensable : une masse grasse sans poids
    // ne dit rien et ne peut pas alimenter la masse maigre.
    if (b.weightKg === undefined) { noWeight++; continue }
    if (b.weightKg <= 0 || b.weightKg > 500) { noWeight++; continue }

    measurements.push({
      measuredAt: new Date(t).toISOString(),
      weightKg: round(b.weightKg)!,
      bmi: round(b.bmi),
      bodyFatPct: round(b.bodyFatPct),
      musclePct: null,
      muscleMassKg: null,
      waterPct: null,
      proteinPct: null,
      boneMassKg: null,
      visceralFat: null,
      bmrKcal: null,
      subcutaneousFatPct: null,
      skeletalMusclePct: null,
      metabolicAge: null,
    })
  }

  if (noWeight) skipped.push({ line: 0, reason: `${noWeight} pesée(s) sans poids exploitable` })

  measurements.sort((a, b) => a.measuredAt.localeCompare(b.measuredAt))
  return { measurements, skipped }
}

function round(n: number | undefined): number | null {
  if (n === undefined || !Number.isFinite(n)) return null
  return Math.round(n * 100) / 100
}
