import { fetchJSON, sleep } from '../utils/http.js'

interface AppStoreApp {
  name: string
  iosId?: string
  androidPackage?: string
}

const TRACKED_APPS: AppStoreApp[] = [
  { name: 'VLC', iosId: '650377962', androidPackage: 'org.videolan.vlc' },
  { name: 'Infuse', iosId: '1136220934' },
  { name: 'MX Player', androidPackage: 'com.mxtech.videoplayer.ad' },
  { name: 'nPlayer', iosId: '1116905928' },
  { name: 'IINA', iosId: '' }, // macOS only, no iOS
  { name: 'KMPlayer', androidPackage: 'com.kmplayer' }
]

interface ReviewData {
  app: string
  platform: string
  sourceUrl: string
  reviews: Array<{
    rating: number
    title: string
    content: string
    date: string
    author: string
  }>
}

export async function collectAppStoreReviews(): Promise<ReviewData[]> {
  const results: ReviewData[] = []

  for (const app of TRACKED_APPS) {
    if (app.iosId) {
      try {
        const iosReviews = await fetchiOSReviews(app.iosId, app.name)
        results.push(iosReviews)
        await sleep(1500)
      } catch (err) {
        console.warn(`[app-store] iOS reviews failed for ${app.name}:`, err)
      }
    }

    if (app.androidPackage) {
      try {
        const androidReviews = await fetchGooglePlayReviews(app.androidPackage, app.name)
        results.push(androidReviews)
        await sleep(1500)
      } catch (err) {
        console.warn(`[app-store] Google Play reviews failed for ${app.name}:`, err)
      }
    }
  }

  return results
}

async function fetchiOSReviews(appId: string, appName: string): Promise<ReviewData> {
  // Apple provides RSS feed for app reviews
  const url = `https://itunes.apple.com/cn/rss/customerreviews/id=${appId}/sortBy=mostRecent/json`
  const data = await fetchJSON(url)

  const entries = data?.feed?.entry || []
  const reviews = entries
    .filter((e: any) => e['im:rating'])
    .map((entry: any) => ({
      rating: parseInt(entry['im:rating']?.label || '5'),
      title: entry.title?.label || '',
      content: (entry.content?.label || '').slice(0, 300),
      date: entry.updated?.label || '',
      author: entry.author?.name?.label || ''
    }))
    // Prioritize low-rating reviews (1-3 stars)
    .sort((a: any, b: any) => a.rating - b.rating)

  return {
    app: appName,
    platform: 'App Store (CN)',
    sourceUrl: `https://apps.apple.com/cn/app/id${appId}?see-all=reviews`,
    reviews: reviews.slice(0, 20)
  }
}

async function fetchGooglePlayReviews(packageName: string, appName: string): Promise<ReviewData> {
  // Google Play doesn't have a public API for reviews.
  // Options: use google-play-scraper npm package, or SerpApi.
  // Here we use a simplified approach via the web.
  // In production, consider using the google-play-scraper package.

  console.log(`[app-store] Google Play scraping for ${packageName} - requires google-play-scraper package`)

  return {
    app: appName,
    platform: 'Google Play',
    sourceUrl: `https://play.google.com/store/apps/details?id=${packageName}&showAllReviews=true`,
    reviews: []
  }
}
