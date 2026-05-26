import { fetchPage, sleep } from '../utils/http.js'

const SEARCH_KEYWORDS = [
  '视频播放器推荐',
  'PotPlayer 更新',
  'VLC 新版本',
  'IINA',
  'Infuse',
  'MX Player',
  '播放器 HDR',
  '播放器 字幕'
]

interface ZhihuResult {
  keyword: string
  discussions: Array<{
    title: string
    excerpt: string
    url: string
    voteCount: number
    date: string
  }>
}

export async function collectZhihu(): Promise<ZhihuResult[]> {
  const results: ZhihuResult[] = []

  for (const keyword of SEARCH_KEYWORDS) {
    try {
      const url = `https://www.zhihu.com/search?type=content&q=${encodeURIComponent(keyword)}`
      const html = await fetchPage(url)

      // Note: Zhihu has anti-scraping measures.
      // In production, consider using their API with proper auth,
      // or a headless browser like Puppeteer.
      const discussions = parseZhihuSearch(html, keyword)
      results.push({ keyword, discussions })

      await sleep(2000)
    } catch (err) {
      console.warn(`[zhihu] Failed to fetch "${keyword}":`, err)
      results.push({ keyword, discussions: [] })
    }
  }

  return results
}

function parseZhihuSearch(html: string, keyword: string) {
  // Simplified parser - in production use cheerio or puppeteer
  const discussions: ZhihuResult['discussions'] = []

  try {
    const { load } = require('cheerio')
    const $ = load(html)

    $('.SearchResult-Card').each((_: number, el: any) => {
      const $el = $(el)
      const title = $el.find('.ContentItem-title').text().trim()
      const excerpt = $el.find('.RichContent-inner').text().trim().slice(0, 200)
      const link = $el.find('.ContentItem-title a').attr('href') || ''
      const voteCount = parseInt($el.find('.VoteButton--up').text()) || 0

      if (title) {
        discussions.push({
          title,
          excerpt,
          url: link.startsWith('http') ? link : `https://www.zhihu.com${link}`,
          voteCount,
          date: new Date().toISOString().split('T')[0]
        })
      }
    })
  } catch {
    // cheerio not available or parse error
  }

  return discussions.slice(0, 10)
}
