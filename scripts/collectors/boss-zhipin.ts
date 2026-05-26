import { fetchPage, sleep } from '../utils/http.js'

const SEARCH_QUERIES = [
  { company: 'VideoLAN', keywords: ['VLC', '视频播放'] },
  { company: 'IINA', keywords: ['IINA', 'Swift 播放器'] },
  { company: 'Firecore', keywords: ['Infuse', '视频 iOS'] },
  { company: '迅雷', keywords: ['迅雷影音', '视频播放'] },
  { company: 'Kakao/Daum', keywords: ['PotPlayer', '视频解码'] },
  { company: 'MX Media', keywords: ['MX Player', '视频 Android'] }
]

interface HiringData {
  company: string
  positions: Array<{
    title: string
    keywords: string[]
    salary?: string
    location?: string
    description: string
  }>
}

export async function collectBossZhipin(): Promise<HiringData[]> {
  const results: HiringData[] = []

  for (const query of SEARCH_QUERIES) {
    try {
      // Boss直聘 has strict anti-scraping measures.
      // In production, use their open API or a managed scraping service.
      // Here we construct search URLs for reference.
      const searchUrl = `https://www.zhipin.com/web/geek/job?query=${encodeURIComponent(query.keywords[0])}`
      console.log(`[boss] Would search: ${searchUrl}`)

      // Placeholder: in production, implement actual scraping or API call
      const positions = await searchPositions(query)
      results.push({ company: query.company, positions })

      await sleep(3000)
    } catch (err) {
      console.warn(`[boss] Failed for ${query.company}:`, err)
      results.push({ company: query.company, positions: [] })
    }
  }

  return results
}

async function searchPositions(query: typeof SEARCH_QUERIES[0]) {
  // In production, this would scrape Boss直聘 or use an API.
  // For now, return empty array as placeholder.
  // The actual data can also be manually entered via a JSON file.
  return []
}
