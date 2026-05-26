import { fetchJSON, fetchPage, sleep } from '../utils/http.js'

/**
 * Free app ranking & rating data from public sources:
 * - iOS: App Store RSS feed for category rankings
 * - Android: Google Play public page (download tier, rating)
 * - Desktop: GitHub stars & activity for open-source players
 */

interface AppInfo {
  name: string
  iosId?: string
  androidPackage?: string
  githubRepo?: string
}

const TRACKED_APPS: AppInfo[] = [
  { name: 'VLC', iosId: '650377962', androidPackage: 'org.videolan.vlc', githubRepo: 'videolan/vlc' },
  { name: 'IINA', githubRepo: 'iina/iina' },
  { name: 'Infuse', iosId: '1136220934' },
  { name: 'MX Player', androidPackage: 'com.mxtech.videoplayer.ad' },
  { name: 'KMPlayer', androidPackage: 'com.kmplayer' },
  { name: 'nPlayer', iosId: '1116905928' },
  { name: 'mpv', githubRepo: 'mpv-player/mpv' }
]

export interface RankingData {
  name: string
  ios?: {
    rating: number
    ratingCount: string
    currentVersionRating?: number
  }
  android?: {
    downloads: string   // e.g. "100M+", "10M+"
    rating: number
    ratingCount: string
  }
  github?: {
    stars: number
    starsThisWeek: number
    forks: number
    openIssues: number
    lastCommitDate: string
  }
}

export async function collectAppRankings(): Promise<RankingData[]> {
  const results: RankingData[] = []

  for (const app of TRACKED_APPS) {
    const data: RankingData = { name: app.name }

    // iOS App Store lookup (free API)
    if (app.iosId) {
      try {
        const iosData = await fetchiOSAppInfo(app.iosId)
        data.ios = iosData
      } catch (err) {
        console.warn(`[rankings] iOS lookup failed for ${app.name}:`, err)
      }
      await sleep(1000)
    }

    // Google Play public info
    if (app.androidPackage) {
      try {
        const androidData = await fetchGooglePlayInfo(app.androidPackage)
        data.android = androidData
      } catch (err) {
        console.warn(`[rankings] Google Play failed for ${app.name}:`, err)
      }
      await sleep(1000)
    }

    // GitHub stats
    if (app.githubRepo) {
      try {
        const ghData = await fetchGitHubStats(app.githubRepo)
        data.github = ghData
      } catch (err) {
        console.warn(`[rankings] GitHub failed for ${app.name}:`, err)
      }
      await sleep(1000)
    }

    results.push(data)
  }

  return results
}

async function fetchiOSAppInfo(appId: string) {
  // Apple's free iTunes Lookup API
  const url = `https://itunes.apple.com/cn/lookup?id=${appId}`
  const data = await fetchJSON(url)
  const app = data?.results?.[0]
  if (!app) throw new Error('App not found')

  return {
    rating: app.averageUserRating || 0,
    ratingCount: formatCount(app.userRatingCount || 0),
    currentVersionRating: app.averageUserRatingForCurrentVersion
  }
}

async function fetchGooglePlayInfo(packageName: string) {
  // Scrape Google Play public page for basic info
  const url = `https://play.google.com/store/apps/details?id=${packageName}&hl=zh&gl=CN`
  try {
    const html = await fetchPage(url)

    // Extract rating from meta or structured data
    const ratingMatch = html.match(/content="(\d+\.?\d*)" itemprop="ratingValue"/)
    const ratingCountMatch = html.match(/content="(\d+)" itemprop="ratingCount"/)
    // Download tier is often in text like "100,000,000+"
    const downloadsMatch = html.match(/"(\d[\d,]+)\+[^"]*下载/)
      || html.match(/installs[^>]*>([\d,]+\+)/)
      || html.match(/"([\d,]+\+)"/)

    return {
      downloads: downloadsMatch ? downloadsMatch[1] : '未知',
      rating: ratingMatch ? parseFloat(ratingMatch[1]) : 0,
      ratingCount: ratingCountMatch ? formatCount(parseInt(ratingCountMatch[1])) : '0'
    }
  } catch {
    return { downloads: '未知', rating: 0, ratingCount: '0' }
  }
}

async function fetchGitHubStats(repo: string) {
  // GitHub public API (no auth needed, 60 requests/hour limit)
  const url = `https://api.github.com/repos/${repo}`
  const data = await fetchJSON(url, {
    'Accept': 'application/vnd.github.v3+json'
  })

  // Get recent commit activity
  let starsThisWeek = 0
  try {
    const starsUrl = `https://api.github.com/repos/${repo}/stargazers?per_page=1&page=1`
    // We can't easily get "stars this week" without auth, so use commit activity as proxy
    const activityUrl = `https://api.github.com/repos/${repo}/stats/participation`
    const activity = await fetchJSON(activityUrl, {
      'Accept': 'application/vnd.github.v3+json'
    })
    // Last week's commits from all contributors
    starsThisWeek = activity?.all?.[activity.all.length - 1] || 0
  } catch {
    // ignore
  }

  return {
    stars: data.stargazers_count || 0,
    starsThisWeek, // Actually weekly commits as activity proxy
    forks: data.forks_count || 0,
    openIssues: data.open_issues_count || 0,
    lastCommitDate: data.pushed_at || ''
  }
}

function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n)
}
