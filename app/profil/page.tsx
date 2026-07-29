"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  waterRecommendationMl,
  tdee,
  calorieTarget,
  energyBasisWeightKg,
  MASS_GAIN_SURPLUS,
} from "@/lib/nutrients"
import { leanMassKg, weightAtBodyFat, classifyBodyFat, bmi } from "@/lib/body"

interface Projection {
  weightKg: number
  method: "trend" | "lean-constant"
  slope?: number
  r2?: number
  n?: number
  fromDate?: string
  toDate?: string
  fallbackReason?: string
}

interface ProfileData {
  age: number
  weightKg: number
  heightCm: number
  sex: "MALE" | "FEMALE"
  bodyFatPct: number | null
  targetBodyFatPct: number | null
  projection?: Projection | null
  projectedTargetWeightKg?: number | null
}

/** Champs que l'utilisateur saisit encore lui-même. */
type EditableField = "age" | "heightCm" | "targetBodyFatPct"

export default function ProfilPage() {
  const [form, setForm] = useState<ProfileData>({
    age: 30,
    weightKg: 75,
    heightCm: 175,
    sex: "MALE",
    bodyFatPct: null,
    targetBodyFatPct: 17.5,
  })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  // Dernière pesée importée : elle fournit poids et masse grasse, qui ne se
  // saisissent plus à la main.
  const [latest, setLatest] = useState<{ measuredAt: string } | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const [profile, rows] = await Promise.all([
        fetch("/api/profile").then((r) => r.json()).catch(() => null),
        fetch("/api/measurements?limit=1").then((r) => r.json()).catch(() => []),
      ])
      if (cancelled) return
      if (profile) setForm(profile)
      if (Array.isArray(rows) && rows.length) setLatest(rows[0])
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [])

  async function handleSave() {
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function field(key: EditableField, label: string, opts?: { step?: string; hint?: string }) {
    return (
      <div className="flex flex-col gap-1.5">
        <Label>{label}</Label>
        <Input
          type="number"
          step={opts?.step}
          value={(form[key] ?? "") as string | number}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              [key]: e.target.value === "" ? null : Number(e.target.value),
            }))
          }
          className="bg-zinc-900 border-zinc-700 w-full"
        />
        {opts?.hint && <p className="text-zinc-600 text-xs">{opts.hint}</p>}
      </div>
    )
  }

  if (loading) return <p className="text-zinc-500">Chargement…</p>

  const tdeeValue = tdee(form)
  const protein = Math.round(form.weightKg * 0.83)
  const calories = calorieTarget(form)
  const water = waterRecommendationMl(form.weightKg)
  const basisWeight = energyBasisWeightKg(form)

  const target = form.targetBodyFatPct
  const comp = form.bodyFatPct != null ? { weightKg: form.weightKg, bodyFatPct: form.bodyFatPct } : null
  const weightAtTarget = comp && target != null ? weightAtBodyFat(comp, target) : null
  const gap = comp && target != null ? form.bodyFatPct! - target : null
  const band = comp ? classifyBodyFat(form.bodyFatPct!, form.sex) : null
  const lean = comp ? leanMassKg(comp) : null

  const proj = form.projection ?? null
  const isTrend = proj?.method === "trend"

  const measuredOn = latest ? new Date(latest.measuredAt).toLocaleDateString("fr-FR") : null

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Profil</h1>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* ─── Colonne gauche : ce que je renseigne ─────────────── */}
        <div className="space-y-6">
          <section className="border border-zinc-800 rounded-xl p-5 space-y-5">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
              Mes données
            </h2>

            <div className="grid sm:grid-cols-2 gap-5">
              {field("age", "Âge")}
              {field("heightCm", "Taille (cm)")}
              <div className="flex flex-col gap-1.5">
                <Label>Sexe</Label>
                <select
                  value={form.sex}
                  onChange={(e) => setForm((f) => ({ ...f, sex: e.target.value as "MALE" | "FEMALE" }))}
                  className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 w-full"
                >
                  <option value="MALE">Homme</option>
                  <option value="FEMALE">Femme</option>
                </select>
              </div>
              {field("targetBodyFatPct", "Objectif masse grasse (%)", {
                step: "0.1",
                hint: "C'est cet objectif qui fixe la cible calorique.",
              })}
            </div>

            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500">
              {saved ? "Sauvegardé ✓" : "Sauvegarder"}
            </Button>
          </section>

          <section className="border border-zinc-800 rounded-xl p-5 space-y-3">
            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                Dernière pesée
              </h2>
              {measuredOn && <span className="text-zinc-500 text-xs">{measuredOn}</span>}
            </div>

            {latest ? (
              <>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Stat label="Poids" value={`${form.weightKg} kg`} />
                  <Stat
                    label="Masse grasse"
                    value={form.bodyFatPct != null ? `${form.bodyFatPct} %` : "—"}
                    note={band ? band.label.toLowerCase() : undefined}
                  />
                </div>
                <p className="text-zinc-500 text-xs leading-relaxed">
                  Reprises automatiquement de la dernière pesée importée — rien à saisir.{" "}
                  <Link href="/mesures" className="text-emerald-500 hover:text-emerald-400 underline underline-offset-2">
                    Voir l&apos;historique
                  </Link>
                </p>
              </>
            ) : (
              <p className="text-zinc-500 text-xs">
                Aucune pesée importée : le poids reste celui enregistré ({form.weightKg} kg).{" "}
                <Link href="/mesures" className="text-emerald-500 hover:text-emerald-400 underline underline-offset-2">
                  Importer un historique
                </Link>
              </p>
            )}
          </section>
        </div>

        {/* ─── Colonne droite : ce que l'app en déduit ──────────── */}
        <div className="space-y-6">
          <section className="border border-zinc-800 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
              Objectifs calculés
            </h2>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <Stat
                label="Calories / jour"
                value={`${calories} kcal`}
                note={`TDEE ${tdeeValue} + ${MASS_GAIN_SURPLUS}`}
              />
              <Stat label="Protéines / jour" value={`${protein} g`} note="0,83g × poids (EFSA)" />
              <Stat label="Eau / jour" value={`${water} ml`} note="35ml × poids" />
              <Stat label="Niveau d'activité" value="Actif" note="×1.55" />
              <Stat label="IMC" value={bmi(form.weightKg, form.heightCm).toFixed(1)} note="repère grossier" />
              {gap != null && (
                <Stat
                  label="Écart à l'objectif"
                  value={`${gap > 0 ? "+" : ""}${gap.toFixed(1)} pt`}
                  note={gap > 0 ? "au-dessus" : gap < 0 ? "en dessous" : "à la cible"}
                />
              )}
            </div>
          </section>

          {weightAtTarget != null && (
            <section className="border border-zinc-800 rounded-xl p-5 space-y-3">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                Base du calcul calorique
              </h2>

              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <Stat
                  label={`Poids visé (à ${target} % MG)`}
                  value={`${basisWeight.toFixed(1)} kg`}
                  note={`${basisWeight - form.weightKg >= 0 ? "+" : ""}${(basisWeight - form.weightKg).toFixed(1)} kg vs aujourd'hui`}
                  accent
                />
                <Stat
                  label={isTrend ? "Ratio observé" : "Méthode"}
                  value={isTrend ? `${proj!.slope!.toFixed(2)} kg / pt` : "masse maigre constante"}
                  note={
                    isTrend
                      ? `d'après ${proj!.n} pesées · R² ${proj!.r2!.toFixed(3)}`
                      : "historique insuffisant"
                  }
                />
              </div>

              <p className="text-zinc-500 text-xs leading-relaxed">
                Les calories sont calculées sur ce <span className="text-zinc-400">poids visé</span>,
                pas sur ton poids du jour : c&apos;est l&apos;énergie du corps que tu construis, pas de
                celui que tu as. Ton objectif de masse grasse pilote donc directement ta cible calorique.
              </p>

              <details>
                <summary className="text-zinc-400 text-xs cursor-pointer hover:text-zinc-200 select-none">
                  Détail du calcul du poids à {target} %
                </summary>

                {isTrend ? (
                  <>
                    <p className="text-zinc-500 text-xs mt-2 leading-relaxed">
                      Méthode : <span className="text-zinc-400">ta propre courbe de prise de masse</span>.
                      Sur {proj!.n} pesées depuis le{" "}
                      {new Date(proj!.fromDate!).toLocaleDateString("fr-FR")}, on mesure combien de kilos
                      accompagnent chaque point de masse grasse gagné.
                    </p>
                    <ol className="mt-2 space-y-2 text-xs text-zinc-500 tabular-nums">
                      <li>
                        <span className="text-zinc-400">1.</span> Ratio observé ={" "}
                        <span className="text-zinc-300">{proj!.slope!.toFixed(2)} kg par point de %MG</span>{" "}
                        <span className="text-zinc-600">
                          (régression sur {proj!.n} pesées, R² = {proj!.r2!.toFixed(3)})
                        </span>
                      </li>
                      <li>
                        <span className="text-zinc-400">2.</span> Points de %MG à gagner ={" "}
                        {target} − {form.bodyFatPct} ={" "}
                        <span className="text-zinc-300">{(target! - form.bodyFatPct!).toFixed(1)} pt</span>
                      </li>
                      <li>
                        <span className="text-zinc-400">3.</span> Poids visé = {form.weightKg} +{" "}
                        {proj!.slope!.toFixed(2)} × {(target! - form.bodyFatPct!).toFixed(1)} ={" "}
                        <span className="text-emerald-400">{proj!.weightKg.toFixed(1)} kg</span>
                      </li>
                    </ol>
                    <p className="text-zinc-500 text-xs mt-3 leading-relaxed">
                      Le R² dit à quel point la relation est régulière (1 = parfaitement linéaire).
                      Au-dessus de 0,9, le ratio est très stable chez toi.
                      <br />
                      À titre de comparaison, l&apos;ancienne méthode « à masse maigre constante »
                      donnait {weightAtTarget.toFixed(1)} kg — elle supposait que tu ne gagnes que du
                      gras, ce que ton historique dément.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-amber-400/80 text-xs mt-2 leading-relaxed">
                      Pas assez d&apos;historique pour déduire ton ratio réel
                      {proj?.fallbackReason ? ` (${proj.fallbackReason})` : ""} — repli sur le calcul
                      « à masse maigre constante ».
                    </p>
                    <ol className="mt-2 space-y-2 text-xs text-zinc-500 tabular-nums">
                      <li>
                        <span className="text-zinc-400">1.</span> Masse grasse = {form.weightKg} ×{" "}
                        {form.bodyFatPct} % = {(form.weightKg - lean!).toFixed(2)} kg
                      </li>
                      <li>
                        <span className="text-zinc-400">2.</span> Le reste (muscle, os, eau, organes) ={" "}
                        {form.weightKg} − {(form.weightKg - lean!).toFixed(2)} ={" "}
                        <span className="text-zinc-300">{lean!.toFixed(2)} kg</span>
                      </li>
                      <li>
                        <span className="text-zinc-400">3.</span> Ce reste doit représenter{" "}
                        {(100 - target!).toFixed(1)} % du corps, donc le corps entier pèse{" "}
                        {lean!.toFixed(2)} ÷ {((100 - target!) / 100).toFixed(3)} ={" "}
                        <span className="text-emerald-400">{weightAtTarget.toFixed(1)} kg</span>
                      </li>
                    </ol>
                    <p className="text-zinc-500 text-xs mt-3 leading-relaxed">
                      Ce calcul suppose que tu ne gagnes que du gras — il sous-estime donc le poids visé
                      dès que tu construis du muscle. Il sera remplacé par ton ratio réel dès qu&apos;il
                      y aura assez de pesées.
                    </p>
                  </>
                )}
              </details>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function Stat({
  label, value, note, accent,
}: { label: string; value: string; note?: string; accent?: boolean }) {
  return (
    <div className="bg-zinc-900 rounded-lg p-3">
      <p className="text-zinc-400 text-xs">{label}</p>
      <p className={`font-semibold mt-0.5 ${accent ? "text-emerald-400" : "text-zinc-100"}`}>{value}</p>
      {note && <p className="text-zinc-500 text-xs mt-0.5">{note}</p>}
    </div>
  )
}
