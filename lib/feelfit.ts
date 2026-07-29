/**
 * Lecture d'un export de balance connectée (FeelFit et compatibles).
 *
 * Le format exact n'est pas documenté et change selon la version de l'app, la
 * langue et le modèle de balance. On ne suppose donc rien : on lit le CSV/TSV,
 * on devine chaque colonne par son intitulé, et l'UI laisse corriger la
 * correspondance à la main avant d'importer.
 */

export const MEASUREMENT_FIELDS = [
  "measuredAt",
  "weightKg",
  "bmi",
  "bodyFatPct",
  "musclePct",
  "muscleMassKg",
  "waterPct",
  "proteinPct",
  "boneMassKg",
  "visceralFat",
  "bmrKcal",
  "subcutaneousFatPct",
  "skeletalMusclePct",
  "metabolicAge",
] as const

export type MeasurementField = (typeof MEASUREMENT_FIELDS)[number]

export const FIELD_LABELS: Record<MeasurementField, string> = {
  measuredAt: "Date de la pesée",
  weightKg: "Poids (kg)",
  bmi: "IMC",
  bodyFatPct: "Masse grasse (%)",
  musclePct: "Muscle (%)",
  muscleMassKg: "Masse musculaire (kg)",
  waterPct: "Eau corporelle (%)",
  proteinPct: "Protéines (%)",
  boneMassKg: "Masse osseuse (kg)",
  visceralFat: "Graisse viscérale",
  bmrKcal: "Métabolisme de base (kcal)",
  subcutaneousFatPct: "Graisse sous-cutanée (%)",
  skeletalMusclePct: "Muscle squelettique (%)",
  metabolicAge: "Âge métabolique",
}

/** Les deux seules colonnes sans lesquelles une ligne n'a pas de sens. */
export const REQUIRED_FIELDS: MeasurementField[] = ["measuredAt", "weightKg"]

/**
 * Intitulés reconnus, en français et en anglais. Comparés après normalisation
 * (minuscules, sans accents, sans unité entre parenthèses, sans ponctuation),
 * donc « Body Fat(%) », « body_fat » et « Masse grasse » tombent sur la même clé.
 */
const SYNONYMS: Record<MeasurementField, string[]> = {
  measuredAt: ["date", "time", "datetime", "datadetime", "heure", "dateheure", "measuretime", "measurementtime", "testtime", "recordtime", "createdat", "horodatage", "timestamp"],
  weightKg: ["weight", "poids", "bodyweight", "poidscorporel", "masse"],
  bmi: ["bmi", "imc", "bodymassindex", "indicedemassecorporelle"],
  bodyFatPct: ["bodyfat", "fat", "bodyfatrate", "massegrasse", "graissecorporelle", "tauxdemassegrasse", "tauxdegraisse", "fatpercentage", "graisse"],
  musclePct: ["muscle", "musclerate", "tauxmusculaire", "musclepercentage", "tauxdemuscle"],
  muscleMassKg: ["musclemass", "massemusculaire", "musclemasskg", "poidsmusculaire"],
  waterPct: ["water", "bodywater", "eau", "eaucorporelle", "tauxdhydratation", "hydratation", "waterrate", "moisture"],
  proteinPct: ["protein", "proteine", "proteines", "proteinrate", "tauxdeproteines"],
  boneMassKg: ["bonemass", "bone", "masseosseuse", "os", "massosseuse"],
  visceralFat: ["visceralfat", "visceral", "graisseviscerale", "visceralfatlevel", "niveaudegraisseviscerale"],
  bmrKcal: ["bmr", "basalmetabolism", "basalmetabolicrate", "metabolismedebase", "metabolismebasal", "mb"],
  subcutaneousFatPct: ["subcutaneousfat", "subcutaneous", "graissesouscutanee", "souscutanee"],
  skeletalMusclePct: ["skeletalmuscle", "musclesquelettique", "skeletalmusclerate", "musclesquelettiques"],
  metabolicAge: ["metabolicage", "agemetabolique", "bodyage", "agecorporel"],
}

/** minuscules, sans accents, sans unité entre parenthèses, sans ponctuation. */
export function normalizeHeader(h: string): string {
  return h
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/[^a-z0-9]/g, "")
}

/** Unité de poids déclarée dans l'intitulé (« Weight (lb) »), kg par défaut. */
function weightUnitFactor(header: string): number {
  const h = header.toLowerCase()
  if (/\b(lb|lbs|pound)/.test(h)) return 0.45359237
  if (/\bst\b|stone/.test(h)) return 6.35029318
  if (/\bg\b|gramme/.test(h) && !/\bkg\b/.test(h)) return 0.001
  return 1
}

// ── Lecture CSV ────────────────────────────────────────────────────────

/** Sépare une ligne CSV en respectant les guillemets et les "" échappés. */
function splitLine(line: string, sep: string): string[] {
  const out: string[] = []
  let cur = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++ } else inQuotes = false
      } else cur += c
    } else if (c === '"') inQuotes = true
    else if (c === sep) { out.push(cur); cur = "" }
    else cur += c
  }
  out.push(cur)
  return out.map((s) => s.trim())
}

/** Séparateur le plus probable : celui qui donne le plus de colonnes stables. */
function detectSeparator(lines: string[]): string {
  const candidates = [",", ";", "\t", "|"]
  let best = ","
  let bestScore = 0
  for (const sep of candidates) {
    const counts = lines.slice(0, 10).map((l) => splitLine(l, sep).length)
    const min = Math.min(...counts)
    if (min > bestScore) { bestScore = min; best = sep }
  }
  return best
}

export interface ParsedTable {
  headers: string[]
  rows: string[][]
  separator: string
}

/** Découpe le texte en tableau. La 1re ligne non vide contenant du texte fait office d'en-tête. */
export function parseTable(text: string): ParsedTable {
  const clean = text.replace(/^\ufeff/, "").replace(/\r\n?/g, "\n")
  const lines = clean.split("\n").filter((l) => l.trim() !== "")
  if (lines.length === 0) return { headers: [], rows: [], separator: "," }

  const separator = detectSeparator(lines)
  // Certains exports ouvrent par un titre ou des méta-données : on prend comme
  // en-tête la première ligne qui a autant de colonnes que la majorité.
  const widths = lines.map((l) => splitLine(l, separator).length)
  const modal = widths.slice().sort((a, b) =>
    widths.filter((w) => w === b).length - widths.filter((w) => w === a).length
  )[0]
  const headerIdx = widths.findIndex((w) => w === modal)

  const headers = splitLine(lines[headerIdx], separator)
  const rows = lines
    .slice(headerIdx + 1)
    .map((l) => splitLine(l, separator))
    .filter((r) => r.some((c) => c !== ""))
  return { headers, rows, separator }
}

// ── Correspondance colonnes → champs ───────────────────────────────────

export type Mapping = Partial<Record<MeasurementField, number>>

/** Devine la colonne de chaque champ à partir des intitulés. */
export function guessMapping(headers: string[]): Mapping {
  const normalized = headers.map(normalizeHeader)
  const mapping: Mapping = {}
  const taken = new Set<number>()

  // Correspondance exacte d'abord, puis "commence par" — évite que « bodyfat »
  // capture la colonne « subcutaneousfat », et que « muscle » prenne
  // « musclemass » alors qu'une colonne « muscle » existe.
  for (const pass of ["exact", "prefix"] as const) {
    for (const field of MEASUREMENT_FIELDS) {
      if (mapping[field] !== undefined) continue
      for (const syn of SYNONYMS[field]) {
        const idx = normalized.findIndex((h, i) =>
          !taken.has(i) && (pass === "exact" ? h === syn : h.startsWith(syn))
        )
        if (idx !== -1) { mapping[field] = idx; taken.add(idx); break }
      }
    }
  }
  return mapping
}

// ── Conversion des valeurs ─────────────────────────────────────────────

/** Nombre tolérant : virgule décimale, unité collée, espaces insécables. */
export function parseNumber(raw: string | undefined): number | null {
  if (raw == null) return null
  const s = raw.replace(/[\u00a0\u202f]/g, " ").trim()
  if (s === "" || s === "-" || s === "--") return null
  const m = s.replace(",", ".").match(/-?\d+(\.\d+)?/)
  if (!m) return null
  const n = Number(m[0])
  return Number.isFinite(n) ? n : null
}

/**
 * Date d'une pesée. Couvre l'ISO, « JJ/MM/AAAA » (format français) et
 * « AAAA/MM/JJ », avec heure optionnelle.
 */
export function parseDate(raw: string | undefined): Date | null {
  if (!raw) return null
  const s = raw.trim()
  if (s === "") return null

  // AAAA-MM-JJ [HH:MM[:SS]]  /  AAAA/MM/JJ …
  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/)
  if (m) return build(+m[1], +m[2], +m[3], +(m[4] ?? 0), +(m[5] ?? 0), +(m[6] ?? 0))

  // JJ/MM/AAAA [HH:MM[:SS]] — jour en premier (convention FR)
  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/)
  if (m) return build(+m[3], +m[2], +m[1], +(m[4] ?? 0), +(m[5] ?? 0), +(m[6] ?? 0))

  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d

  function build(y: number, mo: number, d: number, h: number, mi: number, sec: number) {
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return null
    return new Date(Date.UTC(y, mo - 1, d, h, mi, sec))
  }
}

export interface Measurement {
  measuredAt: string
  weightKg: number
  bmi?: number | null
  bodyFatPct?: number | null
  musclePct?: number | null
  muscleMassKg?: number | null
  waterPct?: number | null
  proteinPct?: number | null
  boneMassKg?: number | null
  visceralFat?: number | null
  bmrKcal?: number | null
  subcutaneousFatPct?: number | null
  skeletalMusclePct?: number | null
  metabolicAge?: number | null
}

export interface ExtractResult {
  measurements: Measurement[]
  /** Lignes ignorées, avec le numéro de ligne du fichier et la raison. */
  skipped: Array<{ line: number; reason: string }>
}

/** Applique la correspondance de colonnes et convertit chaque ligne en pesée. */
export function extractMeasurements(
  table: ParsedTable,
  mapping: Mapping
): ExtractResult {
  const measurements: Measurement[] = []
  const skipped: ExtractResult["skipped"] = []

  const weightHeader = mapping.weightKg !== undefined ? table.headers[mapping.weightKg] ?? "" : ""
  const weightFactor = weightUnitFactor(weightHeader)
  const muscleHeader = mapping.muscleMassKg !== undefined ? table.headers[mapping.muscleMassKg] ?? "" : ""
  const muscleFactor = weightUnitFactor(muscleHeader)
  const boneHeader = mapping.boneMassKg !== undefined ? table.headers[mapping.boneMassKg] ?? "" : ""
  const boneFactor = weightUnitFactor(boneHeader)

  const cell = (row: string[], field: MeasurementField) => {
    const idx = mapping[field]
    return idx === undefined ? undefined : row[idx]
  }
  const num = (row: string[], field: MeasurementField) => parseNumber(cell(row, field))

  table.rows.forEach((row, i) => {
    const line = i + 2 // +1 pour l'en-tête, +1 pour une numérotation humaine
    const date = parseDate(cell(row, "measuredAt"))
    if (!date) { skipped.push({ line, reason: "date illisible" }); return }

    const rawWeight = num(row, "weightKg")
    if (rawWeight == null) { skipped.push({ line, reason: "poids manquant" }); return }
    const weightKg = rawWeight * weightFactor
    if (weightKg <= 0 || weightKg > 500) { skipped.push({ line, reason: `poids aberrant (${weightKg.toFixed(1)} kg)` }); return }

    const rawMuscle = num(row, "muscleMassKg")
    const rawBone = num(row, "boneMassKg")

    measurements.push({
      measuredAt: date.toISOString(),
      weightKg: Math.round(weightKg * 100) / 100,
      bmi: round(num(row, "bmi")),
      bodyFatPct: round(num(row, "bodyFatPct")),
      musclePct: round(num(row, "musclePct")),
      muscleMassKg: round(rawMuscle == null ? null : rawMuscle * muscleFactor),
      waterPct: round(num(row, "waterPct")),
      proteinPct: round(num(row, "proteinPct")),
      boneMassKg: round(rawBone == null ? null : rawBone * boneFactor),
      visceralFat: round(num(row, "visceralFat")),
      bmrKcal: round(num(row, "bmrKcal")),
      subcutaneousFatPct: round(num(row, "subcutaneousFatPct")),
      skeletalMusclePct: round(num(row, "skeletalMusclePct")),
      metabolicAge: round(num(row, "metabolicAge")),
    })
  })

  // Doublons de date : on garde la dernière occurrence (measuredAt est unique en base).
  const byDate = new Map<string, Measurement>()
  for (const m of measurements) byDate.set(m.measuredAt, m)

  return {
    measurements: [...byDate.values()].sort((a, b) => a.measuredAt.localeCompare(b.measuredAt)),
    skipped,
  }
}

function round(n: number | null | undefined): number | null {
  if (n == null) return null
  return Math.round(n * 100) / 100
}
