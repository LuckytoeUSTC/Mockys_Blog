import type { QuartzTransformerPlugin } from "@quartz-community/types"

type MdastNode = {
  type: string
  value?: string
  children?: MdastNode[]
}

type Episode = {
  title: string
  duration: string
  description: string
  link: string
}

const directive = /^podcast-rss:(https?:\/\/[^|]+?)(?:\|apple=(\d+))?$/

function decodeEntities(value: string): string {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    quot: '"',
    nbsp: " ",
  }

  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity.startsWith("#x")) return String.fromCodePoint(Number.parseInt(entity.slice(2), 16))
    if (entity.startsWith("#")) return String.fromCodePoint(Number.parseInt(entity.slice(1), 10))
    return named[entity.toLowerCase()] ?? match
  })
}

function unwrap(value: string): string {
  return value.replace(/^\s*<!\[CDATA\[|\]\]>\s*$/g, "").trim()
}

function tag(xml: string, name: string): string {
  const escaped = name.replace(":", "\\:")
  const match = xml.match(new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`, "i"))
  return match ? decodeEntities(unwrap(match[1])) : ""
}

function plainText(html: string): string {
  return decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/(p|div|li)>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  )
}

function excerpt(value: string, maximum = 280): string {
  const characters = Array.from(value)
  return characters.length > maximum ? `${characters.slice(0, maximum).join("")}…` : value
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function parseLatestEpisode(xml: string): Episode {
  const item = xml.match(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/i)?.[1]
  if (!item) throw new Error("RSS 中没有找到节目单集")

  const description = plainText(tag(item, "description") || tag(item, "itunes:summary"))
  return {
    title: tag(item, "title") || "未命名单集",
    duration: tag(item, "itunes:duration") || "未提供",
    description: excerpt(description || "本期 RSS 未提供简介。"),
    link: tag(item, "link"),
  }
}

async function fetchLatestEpisode(feedUrl: string): Promise<Episode> {
  const response = await fetch(feedUrl, {
    headers: { "user-agent": "Mockys-Podcast-RSS/1.0" },
    redirect: "follow",
  })
  if (!response.ok) throw new Error(`RSS 请求失败：${response.status}`)
  return parseLatestEpisode(await response.text())
}

function formatMilliseconds(milliseconds: number): string {
  const seconds = Math.round(milliseconds / 1000)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainder = seconds % 60
  return hours > 0
    ? `${hours}:${minutes.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`
    : `${minutes}:${remainder.toString().padStart(2, "0")}`
}

async function fetchLatestAppleEpisode(collectionId: string): Promise<Episode> {
  const response = await fetch(
    `https://itunes.apple.com/lookup?id=${collectionId}&entity=podcastEpisode&limit=20`,
  )
  if (!response.ok) throw new Error(`Apple Podcasts 请求失败：${response.status}`)
  const payload = (await response.json()) as {
    results?: Array<Record<string, unknown>>
  }
  const episodes = (payload.results ?? [])
    .filter((result) => result.wrapperType === "podcastEpisode")
    .sort((left, right) =>
      String(right.releaseDate ?? "").localeCompare(String(left.releaseDate ?? "")),
    )
  const latest = episodes[0]
  if (!latest) throw new Error("Apple Podcasts 中没有找到节目单集")

  return {
    title: String(latest.trackName ?? "未命名单集"),
    duration:
      typeof latest.trackTimeMillis === "number"
        ? formatMilliseconds(latest.trackTimeMillis)
        : "未提供",
    description: excerpt(plainText(String(latest.description ?? "本期未提供简介。"))),
    link: String(latest.trackViewUrl ?? latest.collectionViewUrl ?? ""),
  }
}

function renderEpisode(episode: Episode, feedUrl: string): string {
  const title = escapeHtml(episode.title)
  const duration = escapeHtml(episode.duration)
  const description = escapeHtml(episode.description)
  const href = escapeHtml(episode.link || feedUrl)
  const rssHref = escapeHtml(feedUrl)

  return `<article class="podcast-rss-card" style="border:1px solid var(--lightgray);border-radius:14px;padding:1rem 1.15rem;margin:.75rem 0 1.75rem;background:var(--light);box-shadow:0 1px 3px rgba(0,0,0,.04);"><div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:.55rem 1rem;align-items:flex-start;"><div style="font-size:1.05rem;font-weight:650;line-height:1.45;flex:1 1 20rem;"><a href="${href}" target="_blank" rel="noopener noreferrer">${title}</a></div><span style="white-space:nowrap;color:var(--darkgray);background:var(--lightgray);border-radius:999px;padding:.18rem .55rem;font-size:.82rem;">${duration}</span></div><p style="margin:.75rem 0 0;color:var(--darkgray);line-height:1.7;">${description}</p><div style="margin-top:.75rem;font-size:.82rem;"><a href="${rssHref}" target="_blank" rel="noopener noreferrer" style="color:var(--gray);">RSS ↗</a></div></article>`
}

function renderError(feedUrl: string, error: unknown): string {
  const message = error instanceof Error ? error.message : "未知错误"
  return `<aside class="podcast-rss-error" style="border:1px solid var(--lightgray);border-radius:12px;padding:1rem;margin:1rem 0;"><strong>暂时无法读取最新一期</strong><p style="margin:.5rem 0 0;">${escapeHtml(message)}</p><p style="margin:.5rem 0 0;"><a href="${escapeHtml(feedUrl)}" target="_blank" rel="noopener noreferrer">打开 RSS ↗</a></p></aside>`
}

async function transformChildren(node: MdastNode): Promise<void> {
  if (!node.children) return

  for (let index = 0; index < node.children.length; index++) {
    const child = node.children[index]
    const text = child.type === "paragraph" && child.children?.length === 1 ? child.children[0] : undefined
    const match = text?.type === "inlineCode" && text.value ? text.value.trim().match(directive) : null

    if (match) {
      const feedUrl = match[1].trim()
      const appleId = match[2]
      let value: string
      try {
        value = renderEpisode(await fetchLatestEpisode(feedUrl), feedUrl)
      } catch (error) {
        if (appleId) {
          try {
            value = renderEpisode(await fetchLatestAppleEpisode(appleId), feedUrl)
          } catch {
            value = renderError(feedUrl, error)
          }
        } else {
          value = renderError(feedUrl, error)
        }
      }
      node.children[index] = { type: "html", value }
      continue
    }

    await transformChildren(child)
  }
}

function remarkPodcastRss() {
  return async (tree: MdastNode) => transformChildren(tree)
}

export const PodcastRss: QuartzTransformerPlugin = () => ({
  name: "PodcastRss",
  markdownPlugins() {
    return [remarkPodcastRss]
  },
})
