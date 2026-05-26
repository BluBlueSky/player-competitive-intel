const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
}

export async function fetchPage(url: string, headers?: Record<string, string>): Promise<string> {
  const res = await fetch(url, {
    headers: { ...DEFAULT_HEADERS, ...headers }
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`)
  return res.text()
}

export async function fetchJSON<T = any>(url: string, headers?: Record<string, string>): Promise<T> {
  const res = await fetch(url, {
    headers: { ...DEFAULT_HEADERS, 'Accept': 'application/json', ...headers }
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`)
  return res.json()
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
