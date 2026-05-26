import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve } from 'path'
import { collectAppStoreReviews } from './collectors/app-store.js'
import { collectCompetitorSites } from './collectors/competitor-sites.js'
import { collectAppRankings } from './collectors/app-rankings.js'
import { collectGitHubTrends } from './collectors/github-trends.js'
import { collectHackerNews } from './collectors/hacker-news.js'

interface CollectorResult {
  source: string
  reliability: 'high' | 'medium' | 'low'
  itemCount: number
  fetchedAt: string
  data: any
}

async function main() {
  const today = new Date().toISOString().split('T')[0]
  console.log(`[collect] Starting data collection for ${today}`)

  const rawDataDir = resolve(process.cwd(), 'data/raw')
  if (!existsSync(rawDataDir)) {
    mkdirSync(rawDataDir, { recursive: true })
  }

  const collectors = [
    {
      name: 'appStoreReviews',
      source: 'ios_rss_and_google_play',
      reliability: 'high' as const,
      fn: collectAppStoreReviews
    },
    {
      name: 'competitorSites',
      source: 'github_releases_and_web',
      reliability: 'high' as const,
      fn: collectCompetitorSites
    },
    {
      name: 'appRankings',
      source: 'itunes_lookup_and_github_api',
      reliability: 'high' as const,
      fn: collectAppRankings
    },
    {
      name: 'githubTrends',
      source: 'github_api',
      reliability: 'high' as const,
      fn: collectGitHubTrends
    },
    {
      name: 'hackerNews',
      source: 'algolia_hn_search',
      reliability: 'high' as const,
      fn: collectHackerNews
    }
  ]

  const rawData: Record<string, CollectorResult | null> = {
    collectedAt: new Date().toISOString() as any
  }

  for (const { name, source, reliability, fn } of collectors) {
    console.log(`[collect] Running ${name}...`)
    try {
      const data = await fn()
      const itemCount = Array.isArray(data) ? data.length :
        (data && typeof data === 'object' && 'stories' in data) ? (data as any).stories?.length || 0 :
        (data && typeof data === 'object' && 'repos' in data) ? (data as any).repos?.length || 0 : 1

      rawData[name] = {
        source,
        reliability,
        itemCount,
        fetchedAt: new Date().toISOString(),
        data
      }
      console.log(`[collect] ✓ ${name} done (${itemCount} items)`)
    } catch (err) {
      console.error(`[collect] ✗ ${name} failed:`, err)
      rawData[name] = null
    }
  }

  const outputPath = resolve(rawDataDir, `${today}.json`)
  writeFileSync(outputPath, JSON.stringify(rawData, null, 2), 'utf-8')
  console.log(`[collect] Raw data saved to ${outputPath}`)

  return outputPath
}

main().catch(err => {
  console.error('[collect] Fatal error:', err)
  process.exit(1)
})
