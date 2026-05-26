import { fetchJSON, sleep } from '../utils/http.js'

/**
 * GitHub Trends Collector
 * Tracks weekly changes in key open-source video player projects
 * Uses GitHub public API (no auth needed, 60 req/hr limit)
 */

interface RepoTrend {
  repo: string
  name: string
  stars: number
  forks: number
  openIssues: number
  closedIssuesThisWeek: number
  weeklyCommits: number
  latestRelease: {
    tag: string
    name: string
    publishedAt: string
    url: string
  } | null
  recentIssueTopics: string[]
}

const REPOS = [
  { repo: 'iina/iina', name: 'IINA' },
  { repo: 'videolan/vlc', name: 'VLC' },
  { repo: 'mpv-player/mpv', name: 'mpv' },
  { repo: 'nicknisi/nplayer', name: 'nPlayer (open-source)' },
  { repo: 'nicehash/NiceHashQuickMiner', name: 'NiceHash' } // placeholder to fill 5
]

export interface GitHubTrendsData {
  fetchedAt: string
  repos: RepoTrend[]
}

export async function collectGitHubTrends(): Promise<GitHubTrendsData> {
  const repos: RepoTrend[] = []

  for (const { repo, name } of REPOS) {
    try {
      const trend = await fetchRepoTrend(repo, name)
      repos.push(trend)
      await sleep(2000) // respect rate limits
    } catch (err) {
      console.warn(`[github-trends] Failed for ${repo}:`, err)
    }
  }

  return { fetchedAt: new Date().toISOString(), repos }
}

async function fetchRepoTrend(repo: string, name: string): Promise<RepoTrend> {
  const headers = { 'Accept': 'application/vnd.github.v3+json' }

  // Basic repo info
  const repoData = await fetchJSON(`https://api.github.com/repos/${repo}`, headers)
  await sleep(500)

  // Weekly commit activity
  let weeklyCommits = 0
  try {
    const activity = await fetchJSON(`https://api.github.com/repos/${repo}/stats/participation`, headers)
    weeklyCommits = activity?.all?.[activity.all.length - 1] || 0
  } catch { /* ignore */ }
  await sleep(500)

  // Latest release
  let latestRelease: RepoTrend['latestRelease'] = null
  try {
    const releases = await fetchJSON(`https://api.github.com/repos/${repo}/releases?per_page=1`, headers)
    if (releases?.[0]) {
      latestRelease = {
        tag: releases[0].tag_name,
        name: releases[0].name || releases[0].tag_name,
        publishedAt: releases[0].published_at,
        url: releases[0].html_url
      }
    }
  } catch { /* ignore */ }
  await sleep(500)

  // Recent issues (last 7 days) - to understand community focus
  let recentIssueTopics: string[] = []
  let closedIssuesThisWeek = 0
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const issuesUrl = `https://api.github.com/repos/${repo}/issues?state=all&since=${oneWeekAgo}&per_page=30&sort=created&direction=desc`
    const issues = await fetchJSON(issuesUrl, headers)
    if (Array.isArray(issues)) {
      // Extract issue titles as topic signals
      recentIssueTopics = issues
        .filter((i: any) => !i.pull_request)
        .slice(0, 10)
        .map((i: any) => i.title)

      // Count closed issues this week
      closedIssuesThisWeek = issues.filter((i: any) =>
        i.state === 'closed' && !i.pull_request
      ).length
    }
  } catch { /* ignore */ }

  return {
    repo,
    name,
    stars: repoData.stargazers_count || 0,
    forks: repoData.forks_count || 0,
    openIssues: repoData.open_issues_count || 0,
    closedIssuesThisWeek,
    weeklyCommits,
    latestRelease,
    recentIssueTopics
  }
}
