import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import OpenAI from 'openai'

const REPORT_PROMPT = `你是一位资深的产品竞品分析师，专注于视频播放器领域。请根据以下采集的原始数据，生成一份结构化的竞品周报。

你需要关注的竞品包括：
- 桌面端：PotPlayer、VLC、IINA、KMPlayer、迅雷影音、腾讯视频、爱奇艺、优酷视频、芒果TV
- 移动端：MX Player、VLC Mobile、nPlayer、Infuse、OPlayer

请输出严格的 JSON 格式（不要用 markdown 代码块包裹），包含以下结构：

{
  "date": "YYYY-MM-DD",
  "title": "第N期 播放器竞品周报",
  "coreInsights": [
    {
      "type": "warning|opportunity|trend",
      "title": "简短标题",
      "content": "详细描述，需要给出产品决策建议",
      "source": "数据来源名称",
      "sourceUrl": "原始信息的完整URL链接",
      "images": [
        { "url": "相关截图或产品界面图的URL", "caption": "图片说明" }
      ]
    }
  ],
  "competitorUpdates": [
    {
      "name": "竞品名称",
      "platform": "平台",
      "updates": [
        {
          "type": "version|feature|strategy|hiring",
          "title": "更新标题",
          "detail": "详细描述",
          "source": "来源",
          "sourceUrl": "原始信息的完整URL链接",
          "impact": "high|medium|low",
          "images": [
            { "url": "新功能UI截图或实物图URL", "caption": "图片说明" }
          ]
        }
      ]
    }
  ],
  "appStoreReviews": {
    "painPoints": [
      { "title": "痛点标题", "detail": "描述", "app": "应用名", "platform": "平台", "sourceUrl": "评论页面链接" }
    ],
    "highlights": [
      { "title": "亮点标题", "detail": "描述", "app": "应用名", "platform": "平台", "sourceUrl": "评论页面链接" }
    ]
  },
  "hiringSignals": [
    {
      "company": "公司名",
      "position": "职位名",
      "keywords": ["关键词"],
      "interpretation": "解读招聘信号背后的产品方向",
      "sourceUrl": "招聘信息页面链接"
    }
  ],
  "appMetrics": [
    {
      "name": "竞品名",
      "iosRating": 4.6,
      "iosRatingCount": "12.3K",
      "androidDownloads": "100M+",
      "androidRating": 4.3,
      "githubStars": 14200,
      "weeklyCommits": 47,
      "sourceUrl": "数据来源链接"
    }
  ]
}

分析要求：
1. coreInsights 是最重要的部分，需要提炼 3-5 条对产品决策最有价值的洞察
2. 特别关注 1-3 星差评中反映的用户痛点，这些是潜在的差异化机会
3. 招聘信息反映竞品的未来方向，需要深度解读
4. 每条洞察需要给出具体的行动建议
5. 标注影响程度(impact)时要考虑对市场格局的影响
6. sourceUrl 必须填写原始信息的真实URL，用于信息溯源（如果原始数据中包含URL则直接使用）
7. images 字段：如果该条信息涉及新功能UI、产品截图或实物图，从原始数据中提取图片URL填入；如没有图片则省略该字段

原始数据如下：
`

async function main() {
  const today = new Date().toISOString().split('T')[0]
  const rawDataPath = resolve(process.cwd(), `data/raw/${today}.json`)

  if (!existsSync(rawDataPath)) {
    console.error(`[analyze] No raw data found for ${today}. Run collect first.`)
    process.exit(1)
  }

  const rawData = readFileSync(rawDataPath, 'utf-8')
  console.log(`[analyze] Loaded raw data (${rawData.length} bytes)`)

  const apiKey = process.env.DASHSCOPE_API_KEY
  if (!apiKey) {
    console.error('[analyze] DASHSCOPE_API_KEY not set')
    process.exit(1)
  }

  const client = new OpenAI({
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiKey
  })

  console.log('[analyze] Calling Qwen API for analysis...')
  const response = await client.chat.completions.create({
    model: 'qwen-plus',
    max_tokens: 8000,
    messages: [
      {
        role: 'user',
        content: REPORT_PROMPT + rawData
      }
    ]
  })

  const text = response.choices[0]?.message?.content
  if (!text) {
    console.error('[analyze] No response from Qwen')
    process.exit(1)
  }

  let report: any
  try {
    report = JSON.parse(text)
  } catch {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      report = JSON.parse(jsonMatch[0])
    } else {
      console.error('[analyze] Failed to parse response as JSON')
      console.error(text.slice(0, 500))
      process.exit(1)
    }
  }

  // Ensure date is set
  report.date = today

  // Determine issue number from manifest
  const manifestPath = resolve(process.cwd(), 'reports/manifest.json')
  let manifest: Array<{ date: string; title: string }> = []
  if (existsSync(manifestPath)) {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
  }
  const issueNumber = manifest.length + 1
  report.title = `第${issueNumber}期 播放器竞品周报`

  // Save report
  const reportPath = resolve(process.cwd(), `reports/${today}.json`)
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8')
  console.log(`[analyze] Report saved to ${reportPath}`)

  // Update manifest
  manifest.unshift({ date: today, title: report.title })
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8')
  console.log(`[analyze] Manifest updated`)
}

main().catch(err => {
  console.error('[analyze] Fatal error:', err)
  process.exit(1)
})
