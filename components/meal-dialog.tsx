"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { MealEntry, UsdaSearchResult } from "@/types"

interface Props {
  day: string
  meal: string
  entries: MealEntry[]
  open: boolean
  onClose: () => void
  onRefresh: () => void
}

export default function MealDialog({ day, meal, entries, open, onClose, onRefresh }: Props) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<UsdaSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [adding, setAdding] = useState<number | null>(null)
  const [gramsMap, setGramsMap] = useState<Record<number, string>>({})
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const res = await fetch(`/api/foods/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data)
      setSearching(false)
    }, 400)
  }, [query])

  async function addFood(fdcId: number) {
    const grams = Number(gramsMap[fdcId] ?? 100)
    if (!grams || grams <= 0) return
    setAdding(fdcId)
    // cache food detail if not already
    await fetch("/api/foods/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fdcId }),
    })
    await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day, meal, grams, foodId: fdcId }),
    })
    setAdding(null)
    setQuery("")
    setResults([])
    setGramsMap({})
    onRefresh()
  }

  async function removeEntry(id: number) {
    await fetch(`/api/meals/${id}`, { method: "DELETE" })
    onRefresh()
  }

  async function updateGrams(id: number, grams: number) {
    await fetch(`/api/meals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grams }),
    })
    onRefresh()
  }

  const MEAL_LABELS: Record<string, string> = {
    BREAKFAST: "Petit-déjeuner",
    LUNCH: "Déjeuner",
    SNACK: "En-cas",
    DINNER: "Dîner",
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-zinc-900 border-zinc-700 max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">
            {MEAL_LABELS[meal]} — {day}
          </DialogTitle>
        </DialogHeader>

        {/* Current entries */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {entries.length === 0 && (
            <p className="text-zinc-500 text-sm">Aucun aliment ajouté.</p>
          )}
          {entries.map((e) => (
            <div key={e.id} className="flex items-center gap-2 text-sm">
              <span className="flex-1 text-zinc-200 truncate">
                {e.food?.name ?? e.customFood?.name}
              </span>
              <Input
                type="number"
                defaultValue={e.grams}
                onBlur={(ev) => updateGrams(e.id, Number(ev.target.value))}
                className="w-20 bg-zinc-800 border-zinc-700 text-xs"
              />
              <span className="text-zinc-500 text-xs">g</span>
              <button
                onClick={() => removeEntry(e.id)}
                className="text-zinc-500 hover:text-red-400 text-xs px-1"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <hr className="border-zinc-800" />

        {/* Search */}
        <div className="space-y-3">
          <Input
            placeholder="Rechercher un aliment (en anglais)…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-zinc-800 border-zinc-700"
          />
          {searching && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 bg-zinc-800" />)}
            </div>
          )}
          <div className="space-y-1.5 max-h-56 overflow-y-auto">
            {results.map((r) => (
              <div key={r.fdcId} className="flex items-center gap-2 text-sm">
                <div className="flex-1 min-w-0">
                  <span className="text-zinc-200 truncate block">{r.description}</span>
                  <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-500">
                    {r.dataType}
                  </Badge>
                </div>
                <Input
                  type="number"
                  placeholder="100"
                  value={gramsMap[r.fdcId] ?? ""}
                  onChange={(e) =>
                    setGramsMap((m) => ({ ...m, [r.fdcId]: e.target.value }))
                  }
                  className="w-20 bg-zinc-800 border-zinc-700 text-xs"
                />
                <span className="text-zinc-500 text-xs">g</span>
                <Button
                  size="sm"
                  onClick={() => addFood(r.fdcId)}
                  disabled={adding === r.fdcId}
                  className="bg-emerald-700 hover:bg-emerald-600 text-xs h-7"
                >
                  {adding === r.fdcId ? "…" : "Ajouter"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
