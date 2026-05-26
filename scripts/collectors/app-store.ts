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
    // Prioritize low-rating reviews (1-3 stars) for pain point analysis
    .sort((a: any, b: any) => a.rating - b.rating)

  return {
    app: appName,
    platform: 'App Store (CN)',
    sourceUrl: `https://apps.apple.com/cn/app/id${appId}?see-all=reviews`,
    reviews: reviews.slice(0, 25)
  }
}

async function fetchGooglePlayReviews(packageName: string, appName: string): Promise<ReviewData> {
  // Use google-play-scraper for real reviews
  try {
    const gplay = await import('google-play-scraper')
    const reviews = await gplay.default.reviews({
      appId: packageName,
      lang: 'zh',
      country: 'cn',
      sort: gplay.default.sort.NEWEST,
      num: 30
    })

    const formattedReviews = reviews.data
      .map((r: any) => ({
        rating: r.score || 0,
        title: '',
        content: (r.text || '').slice(0, 300),
        date: r.date || '',
        author: r.userName || ''
      }))
      // Prioritize low-rating reviews
      .sort((a: any, b: any) => a.rating - b.rating)

    return {
      app: appName,
      platform: 'Google Play',
      sourceUrl: `https://play.google.com/store/apps/details?id=${packageName}&showAllReviews=true`,
      reviews: formattedReviews.slice(0, 25)
    }
  } catch (err) {
    console.warn(`[app-store] google-play-scraper failed for ${appName}, trying fallback:`, err)
    // Fallback: return empty if scraper not available
    return {
      app: appName,
      platform: 'Google Play',
      sourceUrl: `https://play.google.com/store/apps/details?id=${packageName}&showAllReviews=true`,
      reviews: []
    }
  }
}
