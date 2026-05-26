# 播放器竞品观察

每周五自动采集和分析视频播放器竞品动态，生成结构化竞品报告。

## 快速开始

```bash
npm install
npm run dev
```

## 配置 API Keys

在 GitHub 仓库的 Settings → Secrets 中配置以下密钥：

| Secret | 说明 | 必需 |
|--------|------|------|
| `ANTHROPIC_API_KEY` | Claude API 密钥，用于 AI 分析 | 是 |
| `QIMAI_API_KEY` | 七麦数据 API | 否 |
| `DIANDIAN_API_KEY` | 点点数据 API | 否 |
| `SIMILARWEB_API_KEY` | SimilarWeb API | 否 |

## 手动运行

```bash
# 采集数据
npm run collect

# 生成报告（需要 ANTHROPIC_API_KEY 环境变量）
ANTHROPIC_API_KEY=sk-xxx npm run analyze
```

## 微信公众号数据

微信公众号无法自动采集，请手动更新 `data/wechat-updates.json`：

```json
[
  {
    "account": "公众号名称",
    "title": "文章标题",
    "summary": "内容摘要",
    "date": "2026-05-23",
    "url": "文章链接（可选）"
  }
]
```

## 追踪的竞品

**桌面端**: PotPlayer、VLC、IINA、KMPlayer、迅雷影音

**移动端**: MX Player、VLC Mobile、nPlayer、Infuse、OPlayer

## 数据源

- 知乎讨论
- App Store / Google Play 评论（重点关注 1-3 星差评）
- 竞品官网更新日志
- 微信公众号（手动录入）
- Boss 直聘招聘信息
- 七麦数据
- 点点数据
- SimilarWeb
