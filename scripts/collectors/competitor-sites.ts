import { fetchPage, sleep } from '../utils/http.js'

interface CompetitorSite {
  name: string
  urls: Array<{ type: string; url: string }>
}

const COMPETITOR_SITES: CompetitorSite[] = [
  {
    name: 'VLC',
    urls: [
      { type: 'changelog', url: 'https://www.videolan.org/vlc/releases/' },
      { type: 'news', url: 'https://www.videolan.org/news.html' }
    ]
  },
  {
    name: 'PotPlayer',
    urls: [
      { type: 'changelog', url: 'https://potplayer.daum.net/' }
    ]
  },
  {
    name: 'IINA',
    urls: [
      { type: 'releases', url: 'https://github.com/iina/iina/releases' }
    ]
  },
  {
    name: 'Infuse',
    urls: [
      { type: 'news', url: 'https://firecore.com/blog' }
    ]
  },
  {
    name: 'KMPlayer',
    urls: [
      { type: 'changelog', url: 'https://www.kmplayer.com/update' }
    ]
  }
]

interface SiteUpdate {
  competitor: string
  type: string
  url: string
  content: string
  fetchedAt: string
}

export async function collectCompetitorSites(): Promise<SiteUpdate[]> {
  const results: SiteUpdate[] = []

  for (const site of COMPETITOR_SITES) {
    for (const target of site.urls) {
      try {
        const html = await fetchPage(target.url)
        const content = extractMainContent(html)
        results.push({
          competitor: site.name,
          type: target.type,
          url: target.url,
          content: content.slice(0, 2000),
          fetchedAt: new Date().toISOString()
        })
        await sleep(2000)
      } catch (err) {
        console.warn(`[competitor-sites] Failed: ${site.name} (${target.type}):`, err)
      }
    }
  }

  return results
}

function extractMainContent(html: string): string {
  try {
    const { load } = require('cheerio')
    const $ = load(html)

    // Remove scripts, styles, nav, footer
    $('script, style, nav, footer, header').remove()

    // Try common content selectors
    const selectors = ['main', 'article', '.content', '.post-content', '#content', '.changelog']
    for (const sel of selectors) {
      const text = $(sel).text().trim()
      if (text.length > 100) return text
    }

    return $('body').text().trim()
  } catch {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  }
}
