const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; scraper/1.0)',
  Accept: 'application/json',
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function log (msg: string) {
  console.log(`[${new Date().toTimeString().slice(0, 8)}] ${msg}`)
}

export async function fetchJson<T> (url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: HEADERS })
    if (!res.ok) {
      log(`HTTP ${res.status} → ${url}`)
      return null
    }
    return (await res.json()) as T
  } catch (err) {
    log(`Error: ${err}`)
    return null
  }
}
