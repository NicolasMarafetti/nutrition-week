import { prisma } from "@/lib/prisma"

async function translate(text: string, langpair: string): Promise<string> {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) return text
    const data = await res.json()
    const translated: string = data?.responseData?.translatedText
    if (!translated || data?.responseStatus !== 200) return text
    return translated
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
  } catch {
    return text
  }
}

export function translateToFrench(text: string): Promise<string> {
  return translate(text, "en|fr")
}

export function translateToEnglish(text: string): Promise<string> {
  return translate(text, "fr|en")
}

/**
 * Translate many English strings to French, using a DB cache so each
 * distinct label is only sent to MyMemory once. Returns a source→target map.
 */
export async function translateManyToFrenchCached(
  sources: string[]
): Promise<Map<string, string>> {
  const unique = [...new Set(sources)]
  const result = new Map<string, string>()

  // 1. Load already-cached translations
  const cached = await prisma.translation.findMany({
    where: { source: { in: unique } },
  })
  for (const c of cached) result.set(c.source, c.target)

  // 2. Translate the misses (in parallel), then persist them
  const misses = unique.filter((s) => !result.has(s))
  const translated = await Promise.all(
    misses.map(async (src) => ({ src, fr: await translate(src, "en|fr") }))
  )

  for (const { src, fr } of translated) {
    result.set(src, fr)
  }

  if (translated.length > 0) {
    await prisma.translation.createMany({
      data: translated.map(({ src, fr }) => ({ source: src, target: fr })),
      skipDuplicates: true,
    })
  }

  return result
}
