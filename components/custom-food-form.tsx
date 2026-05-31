"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { NUTRIENTS } from "@/lib/nutrients"

interface Props {
  onCreated: (food: { id: number; name: string; nutrients: Record<string, number> }) => void
}

export default function CustomFoodForm({ onCreated }: Props) {
  const [name, setName] = useState("")
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(key: string, val: string) {
    setValues((v) => ({ ...v, [key]: val }))
  }

  async function handleSave() {
    if (!name.trim()) { setError("Nom requis."); return }
    setError(null)
    setSaving(true)

    const nutrients: Record<string, number> = {}
    for (const [k, v] of Object.entries(values)) {
      const n = parseFloat(v)
      if (!isNaN(n) && n > 0) nutrients[k] = n
    }

    const res = await fetch("/api/foods/custom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), nutrients }),
    })
    const food = await res.json()
    setSaving(false)
    setName("")
    setValues({})
    onCreated(food)
  }

  const groups = Array.from(new Set(NUTRIENTS.map((n) => n.group)))

  return (
    <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="space-y-1.5">
        <Label>Nom de l&apos;aliment</Label>
        <Input
          placeholder="ex: Whey Isolat Vanille"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-zinc-800 border-zinc-700"
        />
        <p className="text-zinc-500 text-xs">Valeurs pour 100g / 100ml</p>
      </div>

      {groups.map((group) => {
        const groupNutrients = NUTRIENTS.filter((n) => n.group === group)
        return (
          <div key={group}>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
              {groupNutrients[0] && groupLabel(group)}
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {groupNutrients.map((n) => (
                <div key={n.key} className="flex items-center gap-2">
                  <label className="text-zinc-300 text-xs w-36 shrink-0 truncate" title={n.label}>
                    {n.label}
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={values[n.key] ?? ""}
                    onChange={(e) => set(n.key, e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-xs h-7 w-24"
                  />
                  <span className="text-zinc-600 text-xs shrink-0">{n.unit}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-emerald-600 hover:bg-emerald-500"
      >
        {saving ? "Sauvegarde…" : "Créer l'aliment"}
      </Button>
    </div>
  )
}

function groupLabel(group: string): string {
  const labels: Record<string, string> = {
    macros: "Macronutriments",
    performance: "Performance & Muscle",
    collagen: "Collagène & Articulations",
    recovery: "Récupération",
    energy: "Énergie & Endurance",
    general: "Santé Générale",
  }
  return labels[group] ?? group
}
