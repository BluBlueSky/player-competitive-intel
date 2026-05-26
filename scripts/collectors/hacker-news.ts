import { fetchJSON, sleep } from '../utils/http.js'

/**
 * Hacker News Collector
 * Uses Algolia HN Search API (completely free, no auth needed)
 * Searches for video player related discussions from the past week
 */

interface HNStory {
  title: string
  url: string | null
  points: number
  numComments: number
  author: string
  createdAt: string
  objectID: string
  hnUrl: string
}

const SEARCH_QUERIES = [
  'video player',
  'VLC',
  'IINA',
  'Infuse',
  'media player',
  'mpv player',
  'codec',
  'HDR video',
  'AV1 decode'
]

export interface HackerNewsData {
  fetchedAt: string
  stories: HNStory[]
}

export async function collectHackerNews(): Promise<HackerNewsData> {
  const allStories: HNStory[] = []
  const seenIds = new Set<string>()
  const oneWeekAgo = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000)

  for (const query of SEARCH_QUERIES) {
    try {
      // Algolia HN Search API: https://hn.algolia.com/api
      const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&numericFilters=created_at_i>${oneWeekAgo},points>5&hitsPerPage=10`
      const data = await fetchJSON(url)

      if (data?.hits) {
        for (const hit of data.hits) {
          if (seenIds.has(hit.objectID)) continue
          seenIds.add(hit.objectID)

          allStories.push({
            title: hit.title || '',
            url: hit.url || null,
            points: hit.points || 0,
            numComments: hit.num_comments || 0,
            author: hit.author || '',
            createdAt: hit.created_at || '',
            objectID: hit.objectID,
            hnUrl: `https://news.ycombinator.com/item?id=${hit.objectID}`
          })
        }
      }

      await sleep(1000) // be respectful to Algolia
    } catch (err) {
      console.warn(`[hacker-news] Failed for query "${query}":`, err)
    }
  }

  // Sort by points descending, take top 20
  allStories.sort((a, b) => b.points - a.points)
  const topStories = allStories.slice(0, 20)

  console.log(`[hacker-news] Found ${topStories.length} relevant stories`)
  return { fetchedAt: new Date().toISOString(), stories: topStories }
}
