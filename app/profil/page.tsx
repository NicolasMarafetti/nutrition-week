"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { waterRecommendationMl } from "@/lib/nutrients"

interface ProfileData {
  age: number
  weightKg: number
  targetWeightKg: number
  heightCm: number
  sex: "MALE" | "FEMALE"
}

function calcTDEE(p: ProfileData) {
  const bmr = p.sex === "MALE"
    ? 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + 5
    : 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age - 161
  return Math.round(bmr * 1.55)
}

export default function ProfilPage() {
  const [form, setForm] = useState<ProfileData>({
    age: 30,
    weightKg: 75,
    targetWeightKg: 80,
    heightCm: 175,
    sex: "MALE",
  })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data) setForm(data)
        setLoading(false)
      })
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

  function field(key: keyof ProfileData, label: string, type = "number") {
    return (
      <div className="flex flex-col gap-1.5">
        <Label>{label}</Label>
        <Input
          type={type}
          value={form[key] as string | number}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              [key]: type === "number" ? Number(e.target.value) : e.target.value,
            }))
          }
          className="bg-zinc-900 border-zinc-700 w-40"
        />
      </div>
    )
  }

  if (loading) return <p className="text-zinc-500">Chargement…</p>

  const tdee = calcTDEE(form)
  const protein = Math.round(form.weightKg * 2.2)
  const calories = tdee + 400
  const water = waterRecommendationMl(form.weightKg)

  return (
    <div className="max-w-lg space-y-8">
      <h1 className="text-xl font-semibold">Profil</h1>

      <div className="grid grid-cols-2 gap-5">
        {field("age", "Âge")}
        {field("weightKg", "Poids actuel (kg)")}
        {field("targetWeightKg", "Poids cible (kg)")}
        {field("heightCm", "Taille (cm)")}
        <div className="flex flex-col gap-1.5">
          <Label>Sexe</Label>
          <select
            value={form.sex}
            onChange={(e) => setForm((f) => ({ ...f, sex: e.target.value as "MALE" | "FEMALE" }))}
            className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 w-40"
          >
            <option value="MALE">Homme</option>
            <option value="FEMALE">Femme</option>
          </select>
        </div>
      </div>

      <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500">
        {saved ? "Sauvegardé ✓" : "Sauvegarder"}
      </Button>

      <div className="border border-zinc-800 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          Objectifs calculés (prise de masse)
        </h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Stat label="Calories / jour" value={`${calories} kcal`} note={`TDEE ${tdee} + 400`} />
          <Stat label="Protéines / jour" value={`${protein} g`} note="2.2g × poids" />
          <Stat label="Eau / jour" value={`${water} ml`} note="35ml × poids" />
          <Stat
            label="Niveau d'activité"
            value="Actif"
            note="×1.55"
          />
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="bg-zinc-900 rounded-lg p-3">
      <p className="text-zinc-400 text-xs">{label}</p>
      <p className="text-zinc-100 font-semibold mt-0.5">{value}</p>
      {note && <p className="text-zinc-500 text-xs mt-0.5">{note}</p>}
    </div>
  )
}
