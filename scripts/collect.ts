import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve } from 'path'
import { collectZhihu } from './collectors/zhihu.js'
import { collectAppStoreReviews } from './collectors/app-store.js'
import { collectCompetitorSites } from './collectors/competitor-sites.js'
import { collectBossZhipin } from './collectors/boss-zhipin.js'
import { collectAppRankings } from './collectors/app-rankings.js'

async function main() {
  const today = new Date().toISOString().split('T')[0]
  console.log(`[collect] Starting data collection for ${today}`)

  const rawDataDir = resolve(process.cwd(), 'data/raw')
  if (!existsSync(rawDataDir)) {
    mkdirSync(rawDataDir, { recursive: true })
  }

  const collectors = [
    { name: 'zhihu', fn: collectZhihu },
    { name: 'appStoreReviews', fn: collectAppStoreReviews },
    { name: 'competitorSites', fn: collectCompetitorSites },
    { name: 'bossZhipin', fn: collectBossZhipin },
    { name: 'appRankings', fn: collectAppRankings }
  ]

  const rawData: Record<string, any> = { collectedAt: new Date().toISOString() }

  for (const { name, fn } of collectors) {
    console.log(`[collect] Running ${name}...`)
    try {
      rawData[name] = await fn()
      console.log(`[collect] ✓ ${name} done`)
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
