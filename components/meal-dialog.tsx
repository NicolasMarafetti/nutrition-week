"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CustomFoodForm from "@/components/custom-food-form"
import Link from "next/link"
import type { MealEntry, UsdaSearchResult } from "@/types"

interface Props {
  day: string
  meal: string
  entries: MealEntry[]
  open: boolean
  onClose: () => void
  onRefresh: () => void
}

const MEAL_LABELS: Record<string, string> = {
  BREAKFAST: "Petit-déjeuner",
  LUNCH: "Déjeuner",
  SNACK: "En-cas",
  DINNER: "Dîner",
}

export default function MealDialog({ day, meal, entries, open, onClose, onRefresh }: Props) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<UsdaSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [adding, setAdding] = useState<number | null>(null)
  const [addingCustom, setAddingCustom] = useState<number | null>(null)
  const [gramsMap, setGramsMap] = useState<Record<number, string>>({})
  const [customGrams, setCustomGrams] = useState<Record<number, string>>({})
  const [customFoods, setCustomFoods] = useState<Array<{ id: number; name: string; nutrients: Record<string, number> }>>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetch("/api/foods/custom").then((r) => r.json()).then(setCustomFoods)
  }, [])

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

  async function addUsdaFood(fdcId: number) {
    const grams = Number(gramsMap[fdcId] ?? 100)
    if (!grams || grams <= 0) return
    setAdding(fdcId)
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

  async function addCustomFood(customFoodId: number) {
    const grams = Number(customGrams[customFoodId] ?? 100)
    if (!grams || grams <= 0) return
    setAddingCustom(customFoodId)
    await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day, meal, grams, customFoodId }),
    })
    setAddingCustom(null)
    setCustomGrams({})
    onRefresh()
  }

  async function removeEntry(id: number) {
    await fetch(`/api/meals/${id}`, { method: "DELETE" })
    onRefresh()
  }

  async function updateGrams(id: number, grams: number) {
    if (!grams || grams <= 0) return
    await fetch(`/api/meals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grams }),
    })
    onRefresh()
  }

  function handleCustomCreated(food: { id: number; name: string; nutrients: Record<string, number> }) {
    setCustomFoods((prev) => [...prev, food])
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-zinc-900 border-zinc-700 max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">
            {MEAL_LABELS[meal]} — {day}
          </DialogTitle>
        </DialogHeader>

        {/* Aliments du repas */}
        <div className="space-y-2">
          {entries.length === 0 && (
            <p className="text-zinc-500 text-sm">Aucun aliment ajouté.</p>
          )}
          {entries.map((e) => (
            <div key={e.id} className="flex items-center gap-2 text-sm">
              {e.foodId ? (
                <Link
                  href={`/foods/${e.foodId}`}
                  onClick={onClose}
                  className="flex-1 text-zinc-200 truncate hover:text-emerald-400 transition-colors"
                >
                  {e.food?.name}
                </Link>
              ) : (
                <span className="flex-1 text-zinc-200 truncate">{e.customFood?.name}</span>
              )}
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

        <Tabs defaultValue="usda">
          <TabsList className="bg-zinc-800 w-full">
            <TabsTrigger value="usda" className="flex-1 text-xs">Recherche USDA</TabsTrigger>
            <TabsTrigger value="custom-list" className="flex-1 text-xs">Mes aliments</TabsTrigger>
            <TabsTrigger value="custom-create" className="flex-1 text-xs">+ Créer</TabsTrigger>
          </TabsList>

          {/* Onglet USDA */}
          <TabsContent value="usda" className="space-y-3 mt-3">
            <Input
              placeholder="Rechercher (en anglais)…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
            {searching && (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 bg-zinc-800" />)}
              </div>
            )}
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {results.map((r) => (
                <div key={r.fdcId} className="flex items-center gap-2 text-sm">
                  <div className="flex-1 min-w-0">
                    <span className="text-zinc-200 truncate block">{r.description}</span>
                    <Badge
                      variant="outline"
                      className={[
                        "text-xs",
                        r.dataType === "Foundation" || r.dataType === "SR Legacy"
                          ? "border-emerald-700 text-emerald-500"
                          : "border-zinc-700 text-zinc-500",
                      ].join(" ")}
                    >
                      {r.dataType === "SR Legacy" ? "SR Legacy ★" : r.dataType}
                    </Badge>
                  </div>
                  <Input
                    type="number"
                    placeholder="100"
                    value={gramsMap[r.fdcId] ?? ""}
                    onChange={(e) => setGramsMap((m) => ({ ...m, [r.fdcId]: e.target.value }))}
                    className="w-20 bg-zinc-800 border-zinc-700 text-xs"
                  />
                  <span className="text-zinc-500 text-xs">g</span>
                  <Button
                    size="sm"
                    onClick={() => addUsdaFood(r.fdcId)}
                    disabled={adding === r.fdcId}
                    className="bg-emerald-700 hover:bg-emerald-600 text-xs h-7 shrink-0"
                  >
                    {adding === r.fdcId ? "…" : "Ajouter"}
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Onglet aliments custom existants */}
          <TabsContent value="custom-list" className="mt-3">
            {customFoods.length === 0 ? (
              <p className="text-zinc-500 text-sm">Aucun aliment custom créé. Utilise l&apos;onglet &quot;+ Créer&quot;.</p>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {customFoods.map((f) => (
                  <div key={f.id} className="flex items-center gap-2 text-sm">
                    <span className="flex-1 text-zinc-200 truncate">{f.name}</span>
                    <Input
                      type="number"
                      placeholder="100"
                      value={customGrams[f.id] ?? ""}
                      onChange={(e) => setCustomGrams((m) => ({ ...m, [f.id]: e.target.value }))}
                      className="w-20 bg-zinc-800 border-zinc-700 text-xs"
                    />
                    <span className="text-zinc-500 text-xs">g</span>
                    <Button
                      size="sm"
                      onClick={() => addCustomFood(f.id)}
                      disabled={addingCustom === f.id}
                      className="bg-emerald-700 hover:bg-emerald-600 text-xs h-7 shrink-0"
                    >
                      {addingCustom === f.id ? "…" : "Ajouter"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Onglet création aliment custom */}
          <TabsContent value="custom-create" className="mt-3">
            <CustomFoodForm onCreated={handleCustomCreated} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
