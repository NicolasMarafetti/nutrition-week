export async function translateToFrench(text: string): Promise<string> {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|fr`
    const res = await fetch(url, { next: { revalidate: 86400 * 30 } })
    if (!res.ok) return text
    const data = await res.json()
    const translated: string = data?.responseData?.translatedText
    if (!translated || data?.responseStatus !== 200) return text
    // MyMemory sometimes returns HTML entities — decode basic ones
    return translated
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
  } catch {
    return text
  }
}
