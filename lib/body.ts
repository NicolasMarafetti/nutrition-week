/**
 * Composition corporelle : masse grasse / masse maigre et projection vers un
 * objectif de % de matière grasse.
 *
 * Principe : la masse maigre (lean mass) est ce qu'on cherche à faire monter en
 * prise de masse ; le % de matière grasse n'est qu'un ratio. Projeter un objectif
 * de % suppose donc de choisir ce qu'on garde constant — ici la masse maigre,
 * qui est l'hypothèse réaliste à court terme.
 */

export interface BodyComposition {
  weightKg: number
  bodyFatPct: number
}

/** Masse grasse en kg. */
export function fatMassKg({ weightKg, bodyFatPct }: BodyComposition): number {
  return (weightKg * bodyFatPct) / 100
}

/** Masse maigre (tout sauf la graisse) en kg. */
export function leanMassKg(c: BodyComposition): number {
  return c.weightKg - fatMassKg(c)
}

/**
 * Poids correspondant à un objectif de % de matière grasse, **à masse maigre
 * constante**. Sert à traduire « viser 17,5% » en un poids concret.
 */
export function weightAtBodyFat(c: BodyComposition, targetPct: number): number {
  if (targetPct <= 0 || targetPct >= 100) return c.weightKg
  return leanMassKg(c) / (1 - targetPct / 100)
}

export type BodyFatBand = "essential" | "athletic" | "fitness" | "average" | "high"

interface BandDef {
  band: BodyFatBand
  label: string
  /** Borne haute (exclue) du % de matière grasse. */
  max: number
}

// Repères ACE (American Council on Exercise), bornes hautes par catégorie.
const BANDS_MALE: BandDef[] = [
  { band: "essential", label: "Graisse essentielle", max: 6 },
  { band: "athletic", label: "Athlète", max: 14 },
  { band: "fitness", label: "Sportif", max: 18 },
  { band: "average", label: "Moyenne", max: 25 },
  { band: "high", label: "Élevé", max: Infinity },
]

const BANDS_FEMALE: BandDef[] = [
  { band: "essential", label: "Graisse essentielle", max: 14 },
  { band: "athletic", label: "Athlète", max: 21 },
  { band: "fitness", label: "Sportive", max: 25 },
  { band: "average", label: "Moyenne", max: 32 },
  { band: "high", label: "Élevé", max: Infinity },
]

/** Catégorie ACE correspondant à un % de matière grasse. */
export function classifyBodyFat(pct: number, sex: "MALE" | "FEMALE"): BandDef {
  const bands = sex === "MALE" ? BANDS_MALE : BANDS_FEMALE
  return bands.find((b) => pct < b.max) ?? bands[bands.length - 1]
}

/** IMC — repère grossier, sans distinction masse grasse / masse maigre. */
export function bmi(weightKg: number, heightCm: number): number {
  if (heightCm <= 0) return 0
  const m = heightCm / 100
  return weightKg / (m * m)
}
