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
    const data = await res.json()
    return data
  } catch (err) {
    log(`Error fetching ${url}: ${err}`)
    return null
  }
}

export async function runWithConcurrency<T> (tasks: (() => Promise<T>)[], concurrency: number): Promise<T[]> {
  const results: T[] = []
  let index = 0

  async function worker () {
    while (index < tasks.length) {
      const current = index++
      const task = tasks[current]

      if (task) {
        results[current] = await task()
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker))
  return results
}
