import { fetchPage, fetchJSON, sleep } from '../utils/http.js'

/**
 * Competitor Sites Collector
 * - Uses GitHub Releases API for structured version data (IINA, VLC, mpv)
 * - Scrapes Firecore blog for Infuse updates
 * - Scrapes PotPlayer changelog page
 */

interface ReleaseInfo {
  competitor: string
  type: 'github_release' | 'blog' | 'changelog'
  version?: string
  title: string
  body: string
  url: string
  publishedAt: string
}

const GITHUB_REPOS = [
  { name: 'IINA', repo: 'iina/iina' },
  { name: 'VLC', repo: 'videolan/vlc' },
  { name: 'mpv', repo: 'mpv-player/mpv' }
]

const WEB_SOURCES = [
  { name: 'Infuse', type: 'blog' as const, url: 'https://firecore.com/blog' },
  { name: 'PotPlayer', type: 'changelog' as const, url: 'https://potplayer.daum.net/' }
]

export async function collectCompetitorSites(): Promise<ReleaseInfo[]> {
  const results: ReleaseInfo[] = []

  // GitHub Releases (structured, reliable)
  for (const { name, repo } of GITHUB_REPOS) {
    try {
      const releases = await fetchGitHubReleases(repo, name)
      results.push(...releases)
      await sleep(1500)
    } catch (err) {
      console.warn(`[competitor-sites] GitHub releases failed for ${name}:`, err)
    }
  }

  // Web sources (less structured)
  for (const source of WEB_SOURCES) {
    try {
      const html = await fetchPage(source.url)
      const content = extractMainContent(html)
      results.push({
        competitor: source.name,
        type: source.type,
        title: `${source.name} latest update`,
        body: content.slice(0, 3000),
        url: source.url,
        publishedAt: new Date().toISOString()
      })
      await sleep(2000)
    } catch (err) {
      console.warn(`[competitor-sites] Web scrape failed for ${source.name}:`, err)
    }
  }

  return results
}

async function fetchGitHubReleases(repo: string, name: string): Promise<ReleaseInfo[]> {
  const headers = { 'Accept': 'application/vnd.github.v3+json' }
  // Get releases from the last 30 days
  const url = `https://api.github.com/repos/${repo}/releases?per_page=5`
  const releases = await fetchJSON(url, headers)

  if (!Array.isArray(releases)) return []

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  return releases
    .filter((r: any) => new Date(r.published_at) > thirtyDaysAgo)
    .map((r: any) => ({
      competitor: name,
      type: 'github_release' as const,
      version: r.tag_name,
      title: r.name || r.tag_name,
      body: (r.body || '').slice(0, 2000),
      url: r.html_url,
      publishedAt: r.published_at
    }))
}

function extractMainContent(html: string): string {
  try {
    const cheerio = require('cheerio')
    const $ = cheerio.load(html)

    // Remove noise
    $('script, style, nav, footer, header, iframe').remove()

    // Try content selectors
    const selectors = ['main', 'article', '.content', '.post-content', '#content', '.changelog', '.blog-post']
    for (const sel of selectors) {
      const text = $(sel).text().trim()
      if (text.length > 100) return text
    }

    return $('body').text().trim()
  } catch {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  }
}
