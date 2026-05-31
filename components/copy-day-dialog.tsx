"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { DayOfWeek } from "@/types"

const DAY_LABELS: Record<DayOfWeek, string> = {
  MON: "Lundi",
  TUE: "Mardi",
  WED: "Mercredi",
  THU: "Jeudi",
  FRI: "Vendredi",
  SAT: "Samedi",
  SUN: "Dimanche",
}

const DAYS: DayOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

interface Props {
  fromDay: DayOfWeek
  open: boolean
  onClose: () => void
  onRefresh: () => void
}

export default function CopyDayDialog({ fromDay, open, onClose, onRefresh }: Props) {
  const [copying, setCopying] = useState<DayOfWeek | null>(null)
  const [done, setDone] = useState<DayOfWeek | null>(null)

  async function copyTo(toDay: DayOfWeek) {
    setCopying(toDay)
    await fetch("/api/meals/copy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromDay, toDay }),
    })
    setCopying(null)
    setDone(toDay)
    onRefresh()
    setTimeout(() => setDone(null), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-zinc-900 border-zinc-700 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">
            Copier {DAY_LABELS[fromDay]} vers…
          </DialogTitle>
        </DialogHeader>
        <p className="text-zinc-500 text-xs -mt-2">
          Les repas du jour cible seront remplacés.
        </p>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {DAYS.filter((d) => d !== fromDay).map((d) => (
            <Button
              key={d}
              variant="outline"
              onClick={() => copyTo(d)}
              disabled={copying !== null}
              className={[
                "border-zinc-700 text-sm",
                done === d
                  ? "border-emerald-600 text-emerald-400 bg-emerald-950"
                  : "hover:border-zinc-500 hover:text-zinc-100",
              ].join(" ")}
            >
              {copying === d ? "Copie…" : done === d ? "✓ Copié" : DAY_LABELS[d]}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
