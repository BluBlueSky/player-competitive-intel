import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import { resolve } from 'path'
import OpenAI from 'openai'

const REPORT_PROMPT = `你是一位为CEO和高级产品经理服务的竞品分析顾问。你的职责不是罗列信息，而是提炼可执行的产品决策建议。

## 硬性约束（必须遵守）

1. **绝对不要编造数字**。如果原始数据中没有具体数字，使用定性描述（如"多条评论提及"、"近期有明显趋势"）。
2. **每条建议必须引用原始数据**。在 sourceRef 中指明你依据的数据来源。
3. **数据不足时降低 confidence**。宁可标注 low confidence，也不要编造看似有数据支撑的结论。
4. **如果本周数据整体偏少，在 executiveSummary 中直接说明**，不要硬凑内容。
5. **没有数据支撑的字段留空数组或省略**，不要填充。

## 你关注的竞品

桌面端：PotPlayer、VLC、IINA、KMPlayer、mpv
移动端：MX Player、VLC Mobile、nPlayer、Infuse

## 输出格式

输出严格的 JSON（不要用 markdown 代码块包裹），结构如下：

{
  "date": "YYYY-MM-DD",
  "title": "第N期 播放器竞品周报",

  "executiveSummary": "用1-2句话概括：本周最值得CEO关注的事情是什么。如果数据有限，直接说明。",

  "actionItems": [
    {
      "priority": "P0|P1|P2",
      "action": "建议采取的具体行动（可执行、可度量）",
      "reason": "为什么需要做这件事（基于什么数据/信号）",
      "deadline": "建议完成时间框架（如：2周内、本季度）",
      "owner": "建议负责团队（如：播放内核组、产品设计组、移动端组）",
      "confidence": "high|medium|low",
      "sourceRef": "引用的原始数据描述（如：'iOS RSS评论中VLC多条1星评价提及HDR问题'）"
    }
  ],

  "competitiveLandscape": {
    "thisWeekMoves": [
      {
        "competitor": "竞品名称",
        "move": "做了什么（基于实际数据）",
        "ourResponse": "建议我们如何回应",
        "urgency": "immediate|this_quarter|watch",
        "sourceUrl": "原始信息URL",
        "confidence": "high|medium|low"
      }
    ],
    "featureGapAlert": [
      {
        "feature": "功能名称",
        "whoHasIt": ["哪些竞品已有此功能"],
        "userDemandSignal": "有什么信号表明用户需要此功能",
        "priority": "high|medium|low"
      }
    ]
  },

  "userVoice": {
    "unmetNeeds": [
      {
        "need": "用户未被满足的需求",
        "evidence": "来自评论的原文证据（引用实际内容）",
        "affectedApps": ["涉及哪些应用"],
        "opportunity": "我们的差异化机会是什么"
      }
    ],
    "satisfactionShifts": [
      {
        "app": "应用名称",
        "direction": "up|down",
        "signal": "什么信号表明满意度在变化",
        "implication": "这对我们意味着什么"
      }
    ]
  },

  "techTrends": [
    {
      "trend": "技术趋势描述",
      "evidence": "支撑证据（来自HN讨论/GitHub动态等）",
      "implication": "对播放器产品的影响",
      "timeframe": "short_term|mid_term|long_term"
    }
  ],

  "weekOverWeek": {
    "newThisWeek": ["本周新出现的信号（简短描述）"],
    "continuedFromLastWeek": ["上周已存在且本周仍持续的信号"],
    "resolvedOrFaded": ["上周提到但本周消退/已解决的信号"]
  },

  "dataQuality": {
    "sourcesUsed": ["本期实际有效的数据源名称"],
    "sourcesFailed": ["本期采集失败或无数据的源"],
    "overallConfidence": "high|medium|low",
    "caveat": "本期数据的局限性说明（一句话）"
  }
}

## 分析思路指引

1. **actionItems 是最重要的部分**。CEO最想知道的是："这周我该让团队做什么？" 每个 action 都应该是具体、可执行的。
2. **P0 = 本周必须响应**（竞品发布重大功能、出现严重用户流失信号）
3. **P1 = 本月应启动**（功能差距警告、明确的市场机会）
4. **P2 = 持续关注**（技术趋势、早期信号）
5. 从用户差评中提炼"我们的机会"而非仅仅报告"他们的问题"
6. 技术趋势关注：编解码演进(AV1/VVC)、AI应用(字幕/增强)、跨平台框架变化
7. weekOverWeek：如果有上期报告数据，请对比分析变化；如果没有，newThisWeek列出所有本周信号

## 原始数据如下：
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

  // Load previous report for week-over-week comparison
  const previousReport = loadPreviousReport(today)
  let contextSuffix = ''
  if (previousReport) {
    contextSuffix = `\n\n## 上期报告（用于 weekOverWeek 对比）：\n${JSON.stringify(previousReport, null, 2)}`
    console.log(`[analyze] Loaded previous report for comparison: ${previousReport.date}`)
  } else {
    console.log(`[analyze] No previous report found, skipping week-over-week comparison`)
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
        content: REPORT_PROMPT + rawData + contextSuffix
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

function loadPreviousReport(currentDate: string): any | null {
  const reportsDir = resolve(process.cwd(), 'reports')
  if (!existsSync(reportsDir)) return null

  const manifestPath = resolve(reportsDir, 'manifest.json')
  if (!existsSync(manifestPath)) return null

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
    // Find the first report that's not today's
    const prevEntry = manifest.find((e: any) => e.date !== currentDate)
    if (!prevEntry) return null

    const prevPath = resolve(reportsDir, `${prevEntry.date}.json`)
    if (!existsSync(prevPath)) return null

    const prevReport = JSON.parse(readFileSync(prevPath, 'utf-8'))
    // Only send a summary to avoid token bloat
    return {
      date: prevReport.date,
      title: prevReport.title,
      executiveSummary: prevReport.executiveSummary || '',
      actionItems: (prevReport.actionItems || []).map((a: any) => ({
        action: a.action,
        priority: a.priority
      })),
      competitiveLandscape: prevReport.competitiveLandscape ? {
        thisWeekMoves: (prevReport.competitiveLandscape.thisWeekMoves || []).map((m: any) => ({
          competitor: m.competitor,
          move: m.move
        }))
      } : null
    }
  } catch {
    return null
  }
}

main().catch(err => {
  console.error('[analyze] Fatal error:', err)
  process.exit(1)
})
