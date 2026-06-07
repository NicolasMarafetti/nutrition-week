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
import { displayName } from "@/lib/food-name"
import { mealStatus } from "@/lib/nutrients"
import type { MealEntry, UsdaSearchResult } from "@/types"

interface Props {
  day: string
  meal: string
  entries: MealEntry[]
  mealTarget?: number
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

export default function MealDialog({ day, meal, entries, mealTarget, open, onClose, onRefresh }: Props) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<UsdaSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [adding, setAdding] = useState<number | null>(null)
  const [addingCustom, setAddingCustom] = useState<number | null>(null)
  const [gramsMap, setGramsMap] = useState<Record<number, string>>({})
  const [customGrams, setCustomGrams] = useState<Record<number, string>>({})
  const [customFoods, setCustomFoods] = useState<Array<{ id: number; name: string; nutrients: Record<string, number> }>>([])
  const [searchError, setSearchError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetch("/api/foods/custom").then((r) => r.json()).then(setCustomFoods)
  }, [])

  useEffect(() => {
    if (!query.trim()) { setResults([]); setSearchError(null); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      setSearchError(null)
      const res = await fetch(`/api/foods/search?q=${encodeURIComponent(query)}`)
      if (res.status === 429) {
        setSearchError("Limite de l'API USDA atteinte (30 req/heure avec la clé gratuite). Ajoute ta clé personnelle dans .env ou réessaie dans quelques minutes.")
        setResults([])
      } else if (!res.ok) {
        setSearchError("Erreur de connexion à l'API USDA. Réessaie dans quelques instants.")
        setResults([])
      } else {
        const data = await res.json()
        setResults(data)
      }
      setSearching(false)
    }, 400)
  }, [query])

  async function addUsdaFood(fdcId: number) {
    const grams = Number(gramsMap[fdcId] ?? 100)
    if (!grams || grams <= 0) return
    setAdding(fdcId)
    const cacheRes = await fetch("/api/foods/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fdcId }),
    })

    if (cacheRes.status === 422) {
      // Incomplet — ignoré automatiquement, on retire des résultats
      setResults((prev) => prev.filter((r) => r.fdcId !== fdcId))
      setAdding(null)
      return
    }

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

  const mealKcal = Math.round(
    entries.reduce((sum, e) => {
      const cal = e.food?.nutrients?.calories ?? e.customFood?.nutrients?.calories ?? 0
      return sum + (cal * e.grams) / 100
    }, 0)
  )
  const status = mealTarget ? mealStatus(mealKcal, mealTarget) : null
  const deltaPct = mealTarget ? Math.round((mealKcal / mealTarget - 1) * 100) : 0
  const statusLabel = status === "ok" ? "ok" : status === "low" ? "trop léger" : "trop lourd"

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-zinc-900 border-zinc-700 max-w-[calc(100vw-1rem)] sm:max-w-3xl max-h-[92vh] overflow-y-auto overflow-x-hidden [&>*]:min-w-0">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">
            {MEAL_LABELS[meal]} — {day}
          </DialogTitle>
        </DialogHeader>

        {/* Bilan calories du repas */}
        {mealTarget != null && (
          <div className="flex items-center gap-2 text-sm border border-zinc-800 rounded-lg px-3 py-2">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${
                status === "ok" ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            <span className="text-zinc-300">
              Calories : <span className="text-zinc-100 font-medium">{mealKcal}</span> / {mealTarget} kcal
            </span>
            <span className={`ml-auto text-xs font-medium ${status === "ok" ? "text-emerald-400" : "text-amber-400"}`}>
              {deltaPct > 0 ? "+" : ""}{deltaPct}% · {statusLabel}
            </span>
          </div>
        )}

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
                  className="flex-1 min-w-0 text-zinc-200 truncate hover:text-emerald-400 transition-colors"
                >
                  {displayName(e.food)}
                </Link>
              ) : (
                <span className="flex-1 min-w-0 text-zinc-200 truncate">{e.customFood?.name}</span>
              )}
              <Input
                type="number"
                defaultValue={e.grams}
                onBlur={(ev) => updateGrams(e.id, Number(ev.target.value))}
                className="w-16 shrink-0 bg-zinc-800 border-zinc-700 text-zinc-100 text-xs"
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
            <TabsTrigger value="usda" className="flex-1 text-xs text-zinc-400 data-[state=active]:text-zinc-100 data-[state=active]:bg-zinc-700">Recherche USDA</TabsTrigger>
            <TabsTrigger value="custom-list" className="flex-1 text-xs text-zinc-400 data-[state=active]:text-zinc-100 data-[state=active]:bg-zinc-700">Mes aliments</TabsTrigger>
            <TabsTrigger value="custom-create" className="flex-1 text-xs text-zinc-400 data-[state=active]:text-zinc-100 data-[state=active]:bg-zinc-700">+ Créer</TabsTrigger>
          </TabsList>

          {/* Onglet USDA */}
          <TabsContent value="usda" className="space-y-3 mt-3">
            <Input
              placeholder="Rechercher un aliment (français ou anglais)…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
            />
            {searching && (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 bg-zinc-800" />)}
              </div>
            )}
            {searchError && (
              <div className="bg-red-950 border border-red-800 rounded-lg px-3 py-2.5 text-red-300 text-xs">
                {searchError}
              </div>
            )}
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {results.map((r) => (
                <div key={r.fdcId} className="flex items-center gap-2 text-sm">
                  <div className="flex-1 min-w-0">
                    <span className="text-zinc-200 truncate block">{r.descriptionFr ?? r.description}</span>
                    {r.descriptionFr && r.descriptionFr !== r.description && (
                      <span className="text-zinc-600 text-xs truncate block">{r.description}</span>
                    )}
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
                    className="w-16 shrink-0 bg-zinc-800 border-zinc-700 text-zinc-100 text-xs"
                  />
                  <span className="text-zinc-500 text-xs shrink-0">g</span>
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
                    <span className="flex-1 min-w-0 text-zinc-200 truncate">{f.name}</span>
                    <Input
                      type="number"
                      placeholder="100"
                      value={customGrams[f.id] ?? ""}
                      onChange={(e) => setCustomGrams((m) => ({ ...m, [f.id]: e.target.value }))}
                      className="w-16 shrink-0 bg-zinc-800 border-zinc-700 text-zinc-100 text-xs"
                    />
                    <span className="text-zinc-500 text-xs shrink-0">g</span>
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
