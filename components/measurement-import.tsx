"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  parseTable,
  guessMapping,
  extractMeasurements,
  MEASUREMENT_FIELDS,
  REQUIRED_FIELDS,
  FIELD_LABELS,
  type ExtractResult,
  type Mapping,
  type ParsedTable,
} from "@/lib/feelfit"
import { isAppleHealthExport, extractFromAppleHealth } from "@/lib/apple-health"

interface Props {
  onImported: () => void
}

/**
 * Import d'un export de balance connectée.
 *
 * Deux voies d'entrée :
 * - **tableau** (CSV/TSV, ou texte collé) — format FeelFit non documenté et variable,
 *   donc on devine la correspondance des colonnes, on la montre, et on la laisse corriger ;
 * - **export Apple Santé** (`export.xml`) — structure connue et stable, aucun réglage
 *   à faire, mais seulement 3 métriques y transitent (voir lib/apple-health.ts).
 */
export default function MeasurementImport({ onImported }: Props) {
  const [table, setTable] = useState<ParsedTable | null>(null)
  const [mapping, setMapping] = useState<Mapping>({})
  const [appleResult, setAppleResult] = useState<ExtractResult | null>(null)
  const [pasted, setPasted] = useState("")
  const [fileName, setFileName] = useState<string | null>(null)
  const [reading, setReading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function load(text: string, name: string | null) {
    setResult(null)
    setError(null)

    if (isAppleHealthExport(text)) {
      const extracted = extractFromAppleHealth(text)
      if (extracted.measurements.length === 0) {
        setError(
          "Export Apple Santé reconnu, mais aucune pesée dedans. La balance a-t-elle bien " +
            "l'autorisation d'écrire poids et masse grasse dans Santé ?"
        )
        return
      }
      setAppleResult(extracted)
      setTable(null)
      setFileName(name)
      return
    }

    const parsed = parseTable(text)
    if (parsed.headers.length === 0 || parsed.rows.length === 0) {
      setError("Fichier vide ou illisible : aucune ligne de données trouvée.")
      setTable(null)
      return
    }
    setTable(parsed)
    setAppleResult(null)
    setMapping(guessMapping(parsed.headers))
    setFileName(name)
  }

  async function handleFile(file: File) {
    if (/\.(xlsx|xls)$/i.test(file.name)) {
      setError(
        "Les fichiers Excel (.xlsx/.xls) ne sont pas lus directement. Ouvre le fichier, " +
          "puis « Enregistrer sous » → CSV — ou copie les cellules et colle-les ci-dessous."
      )
      return
    }
    if (/\.zip$/i.test(file.name)) {
      setError(
        "Le fichier est une archive. Décompresse-la, puis dépose le fichier " +
          "« export.xml » qu'elle contient (dossier apple_health_export)."
      )
      return
    }
    // Un export Apple Santé pèse facilement ~100 Mo : la lecture n'est pas instantanée.
    setReading(true)
    setError(null)
    try {
      const text = await file.text()
      load(text, file.name)
    } catch {
      setError("Impossible de lire ce fichier.")
    }
    setReading(false)
  }

  function reset() {
    setTable(null)
    setMapping({})
    setAppleResult(null)
    setPasted("")
    setFileName(null)
  }

  const extracted = appleResult ?? (table ? extractMeasurements(table, mapping) : null)
  const missing = appleResult ? [] : REQUIRED_FIELDS.filter((f) => mapping[f] === undefined)

  async function handleImport() {
    if (!extracted || extracted.measurements.length === 0) return
    setImporting(true)
    setError(null)
    try {
      const res = await fetch("/api/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          measurements: extracted.measurements,
          source: appleResult ? "apple-health" : "feelfit",
        }),
      })
      if (!res.ok) throw new Error(String(res.status))
      const r = await res.json()
      setResult(
        `${r.created} pesée${r.created > 1 ? "s" : ""} ajoutée${r.created > 1 ? "s" : ""}` +
          (r.updated ? `, ${r.updated} mise${r.updated > 1 ? "s" : ""} à jour` : "") +
          (r.rejected ? `, ${r.rejected} rejetée${r.rejected > 1 ? "s" : ""}` : "") +
          "."
      )
      reset()
      onImported()
    } catch {
      setError("L'import a échoué. Réessaie.")
    }
    setImporting(false)
  }

  return (
    <div className="border border-zinc-800 rounded-xl p-5 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          Importer des pesées
        </h2>
        <p className="text-zinc-500 text-xs mt-1">
          <span className="text-zinc-400">Export Apple Santé</span> — Santé → photo de profil →
          Exporter toutes les données. Décompresse l&apos;archive et dépose le fichier{" "}
          <span className="text-zinc-400">export.xml</span>. Reconnu tout seul, rien à régler.
          Ne transporte en revanche que le poids, la masse grasse et l&apos;IMC.
        </p>
        <p className="text-zinc-500 text-xs mt-1">
          <span className="text-zinc-400">Export FeelFit</span> (CSV) — plus complet, mais le chemin
          exact dans l&apos;app n&apos;est pas documenté ; cherche « exporter » du côté du profil/compte.
          Tu peux aussi coller des lignes copiées depuis un tableur, ou taper une pesée à la main.
        </p>
      </div>

      {!table && !appleResult && (
        <div className="space-y-3">
          <label className="block">
            <input
              type="file"
              accept=".csv,.tsv,.txt,.xml,text/csv,text/plain,text/xml"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              disabled={reading}
              className="block w-full text-xs text-zinc-400 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 file:cursor-pointer disabled:opacity-50"
            />
          </label>
          {reading && (
            <p className="text-zinc-500 text-xs">
              Lecture du fichier… un export Apple Santé pèse souvent ~100 Mo, ça prend quelques secondes.
            </p>
          )}

          <div className="flex items-center gap-2 text-zinc-700 text-xs">
            <span className="h-px bg-zinc-800 flex-1" /> ou <span className="h-px bg-zinc-800 flex-1" />
          </div>

          <textarea
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            onBlur={() => pasted.trim() && load(pasted, null)}
            placeholder={"Colle ici les lignes copiées (en-tête compris)…\nDate\tPoids\tMasse grasse\n2026-07-29\t68,4\t15,2"}
            rows={4}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 font-mono"
          />
          {pasted.trim() && (
            <Button size="sm" onClick={() => load(pasted, null)} className="bg-zinc-800 hover:bg-zinc-700 text-xs">
              Analyser le texte collé
            </Button>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-950 border border-red-800 rounded-lg px-3 py-2.5 text-red-300 text-xs">
          {error}
        </div>
      )}
      {result && (
        <div className="bg-emerald-950 border border-emerald-800 rounded-lg px-3 py-2.5 text-emerald-300 text-xs">
          {result}
        </div>
      )}

      {table && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-zinc-400 text-xs">
              {fileName ? <span className="text-zinc-300">{fileName}</span> : "Texte collé"} —{" "}
              {table.headers.length} colonnes, {table.rows.length} lignes
            </p>
            <button onClick={reset} className="text-zinc-500 hover:text-zinc-300 text-xs">
              Changer de fichier
            </button>
          </div>

          {/* Correspondance colonnes → mesures, corrigeable */}
          <div>
            <p className="text-zinc-400 text-xs mb-2">
              Colonnes reconnues — corrige si besoin :
            </p>
            <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2">
              {MEASUREMENT_FIELDS.map((field) => (
                <div key={field} className="flex items-center gap-2">
                  <label
                    className={`text-xs w-40 shrink-0 ${
                      REQUIRED_FIELDS.includes(field) ? "text-zinc-300" : "text-zinc-500"
                    }`}
                  >
                    {FIELD_LABELS[field]}
                    {REQUIRED_FIELDS.includes(field) && <span className="text-emerald-500"> *</span>}
                  </label>
                  <select
                    value={mapping[field] ?? ""}
                    onChange={(e) =>
                      setMapping((m) => {
                        const next = { ...m }
                        if (e.target.value === "") delete next[field]
                        else next[field] = Number(e.target.value)
                        return next
                      })
                    }
                    className="flex-1 min-w-0 bg-zinc-900 border border-zinc-700 rounded-md px-2 py-1 text-xs text-zinc-200"
                  >
                    <option value="">— aucune —</option>
                    {table.headers.map((h, i) => (
                      <option key={i} value={i}>{h || `colonne ${i + 1}`}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {missing.length > 0 && (
            <div className="bg-amber-950 border border-amber-800 rounded-lg px-3 py-2.5 text-amber-300 text-xs">
              Colonne obligatoire non reconnue :{" "}
              {missing.map((f) => FIELD_LABELS[f]).join(", ")}. Sélectionne-la ci-dessus.
            </div>
          )}
        </div>
      )}

      {appleResult && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-zinc-400 text-xs">
            <span className="text-zinc-300">{fileName ?? "export.xml"}</span> — export Apple Santé
          </p>
          <button onClick={reset} className="text-zinc-500 hover:text-zinc-300 text-xs">
            Changer de fichier
          </button>
        </div>
      )}

      {extracted && (
        <div className="space-y-2">
              <p className="text-zinc-400 text-xs">
                <span className="text-emerald-400 font-medium">
                  {extracted.measurements.length} pesée{extracted.measurements.length > 1 ? "s" : ""}
                </span>{" "}
                prête{extracted.measurements.length > 1 ? "s" : ""} à importer
                {extracted.skipped.length > 0 && (
                  <span className="text-amber-500"> · {extracted.skipped.length} ligne(s) ignorée(s)</span>
                )}
              </p>

              {extracted.skipped.length > 0 && (
                <ul className="text-zinc-600 text-[11px] space-y-0.5 max-h-20 overflow-y-auto">
                  {extracted.skipped.slice(0, 8).map((s) => (
                    <li key={s.line}>ligne {s.line} — {s.reason}</li>
                  ))}
                  {extracted.skipped.length > 8 && <li>…</li>}
                </ul>
              )}

              {extracted.measurements.length > 0 && (
                <div className="overflow-x-auto border border-zinc-800 rounded-lg">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-zinc-500">
                        <th className="text-left font-medium px-2 py-1.5">Date</th>
                        <th className="text-right font-medium px-2 py-1.5">Poids</th>
                        <th className="text-right font-medium px-2 py-1.5">MG %</th>
                        <th className="text-right font-medium px-2 py-1.5">Muscle</th>
                        <th className="text-right font-medium px-2 py-1.5">Eau %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {extracted.measurements.slice(-4).map((m) => (
                        <tr key={m.measuredAt} className="border-t border-zinc-800 text-zinc-300 tabular-nums">
                          <td className="px-2 py-1.5">
                            {new Date(m.measuredAt).toLocaleDateString("fr-FR")}
                          </td>
                          <td className="text-right px-2 py-1.5">{m.weightKg} kg</td>
                          <td className="text-right px-2 py-1.5">{m.bodyFatPct ?? "—"}</td>
                          <td className="text-right px-2 py-1.5">{m.muscleMassKg ?? "—"}</td>
                          <td className="text-right px-2 py-1.5">{m.waterPct ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {extracted.measurements.length > 4 && (
                    <p className="text-zinc-600 text-[11px] px-2 py-1.5 border-t border-zinc-800">
                      Aperçu des 4 pesées les plus récentes.
                    </p>
                  )}
                </div>
              )}

              {appleResult && (
                <p className="text-zinc-600 text-[11px]">
                  Apple Santé ne transporte que le poids, la masse grasse et l&apos;IMC : les courbes
                  muscle / eau / graisse viscérale / métabolisme resteront vides. Il faut l&apos;export
                  FeelFit direct pour les remplir.
                </p>
              )}

              <Button
                onClick={handleImport}
                disabled={importing || missing.length > 0 || extracted.measurements.length === 0}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40"
              >
                {importing ? "Import…" : `Importer ${extracted.measurements.length} pesée(s)`}
              </Button>
              <p className="text-zinc-600 text-[11px]">
                Une pesée déjà présente (même date) est mise à jour, pas dupliquée.
              </p>
        </div>
      )}
    </div>
  )
}
