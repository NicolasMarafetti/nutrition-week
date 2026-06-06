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
