const directive = /^podcast-rss:(https?:\/\/[^|]+?)(?:\|apple=(\d+))?$/;
function decodeEntities(value) {
  const named = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    quot: '"',
    nbsp: " "
  };
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, entity) => {
    if (entity.startsWith("#x")) return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    if (entity.startsWith("#")) return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    return named[entity.toLowerCase()] ?? match;
  });
}
function unwrap(value) {
  return value.replace(/^\s*<!\[CDATA\[|\]\]>\s*$/g, "").trim();
}
function tag(xml, name) {
  const escaped = name.replace(":", "\\:");
  const match = xml.match(new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`, "i"));
  return match ? decodeEntities(unwrap(match[1])) : "";
}
function plainText(html) {
  return decodeEntities(
    html.replace(/<br\s*\/?>/gi, " ").replace(/<\/(p|div|li)>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
  );
}
function excerpt(value, maximum = 280) {
  const characters = Array.from(value);
  return characters.length > maximum ? `${characters.slice(0, maximum).join("")}\u2026` : value;
}
function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function parseLatestEpisode(xml) {
  const item = xml.match(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/i)?.[1];
  if (!item) throw new Error("RSS \u4E2D\u6CA1\u6709\u627E\u5230\u8282\u76EE\u5355\u96C6");
  const description = plainText(tag(item, "description") || tag(item, "itunes:summary"));
  return {
    title: tag(item, "title") || "\u672A\u547D\u540D\u5355\u96C6",
    duration: tag(item, "itunes:duration") || "\u672A\u63D0\u4F9B",
    description: excerpt(description || "\u672C\u671F RSS \u672A\u63D0\u4F9B\u7B80\u4ECB\u3002"),
    link: tag(item, "link")
  };
}
async function fetchLatestEpisode(feedUrl) {
  const response = await fetch(feedUrl, {
    headers: { "user-agent": "Mockys-Podcast-RSS/1.0" },
    redirect: "follow"
  });
  if (!response.ok) throw new Error(`RSS \u8BF7\u6C42\u5931\u8D25\uFF1A${response.status}`);
  return parseLatestEpisode(await response.text());
}
function formatMilliseconds(milliseconds) {
  const seconds = Math.round(milliseconds / 1e3);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  const remainder = seconds % 60;
  return hours > 0 ? `${hours}:${minutes.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}` : `${minutes}:${remainder.toString().padStart(2, "0")}`;
}
async function fetchLatestAppleEpisode(collectionId) {
  const response = await fetch(
    `https://itunes.apple.com/lookup?id=${collectionId}&entity=podcastEpisode&limit=20`
  );
  if (!response.ok) throw new Error(`Apple Podcasts \u8BF7\u6C42\u5931\u8D25\uFF1A${response.status}`);
  const payload = await response.json();
  const episodes = (payload.results ?? []).filter((result) => result.wrapperType === "podcastEpisode").sort(
    (left, right) => String(right.releaseDate ?? "").localeCompare(String(left.releaseDate ?? ""))
  );
  const latest = episodes[0];
  if (!latest) throw new Error("Apple Podcasts \u4E2D\u6CA1\u6709\u627E\u5230\u8282\u76EE\u5355\u96C6");
  return {
    title: String(latest.trackName ?? "\u672A\u547D\u540D\u5355\u96C6"),
    duration: typeof latest.trackTimeMillis === "number" ? formatMilliseconds(latest.trackTimeMillis) : "\u672A\u63D0\u4F9B",
    description: excerpt(plainText(String(latest.description ?? "\u672C\u671F\u672A\u63D0\u4F9B\u7B80\u4ECB\u3002"))),
    link: String(latest.trackViewUrl ?? latest.collectionViewUrl ?? "")
  };
}
function renderEpisode(episode, feedUrl) {
  const title = escapeHtml(episode.title);
  const duration = escapeHtml(episode.duration);
  const description = escapeHtml(episode.description);
  const href = escapeHtml(episode.link || feedUrl);
  const rssHref = escapeHtml(feedUrl);
  return `<article class="podcast-rss-card" style="border:1px solid var(--lightgray);border-radius:14px;padding:1rem 1.15rem;margin:.75rem 0 1.75rem;background:var(--light);box-shadow:0 1px 3px rgba(0,0,0,.04);"><div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:.55rem 1rem;align-items:flex-start;"><div style="font-size:1.05rem;font-weight:650;line-height:1.45;flex:1 1 20rem;"><a href="${href}" target="_blank" rel="noopener noreferrer">${title}</a></div><span style="white-space:nowrap;color:var(--darkgray);background:var(--lightgray);border-radius:999px;padding:.18rem .55rem;font-size:.82rem;">${duration}</span></div><p style="margin:.75rem 0 0;color:var(--darkgray);line-height:1.7;">${description}</p><div style="margin-top:.75rem;font-size:.82rem;"><a href="${rssHref}" target="_blank" rel="noopener noreferrer" style="color:var(--gray);">RSS \u2197</a></div></article>`;
}
function renderError(feedUrl, error) {
  const message = error instanceof Error ? error.message : "\u672A\u77E5\u9519\u8BEF";
  return `<aside class="podcast-rss-error" style="border:1px solid var(--lightgray);border-radius:12px;padding:1rem;margin:1rem 0;"><strong>\u6682\u65F6\u65E0\u6CD5\u8BFB\u53D6\u6700\u65B0\u4E00\u671F</strong><p style="margin:.5rem 0 0;">${escapeHtml(message)}</p><p style="margin:.5rem 0 0;"><a href="${escapeHtml(feedUrl)}" target="_blank" rel="noopener noreferrer">\u6253\u5F00 RSS \u2197</a></p></aside>`;
}
async function transformChildren(node) {
  if (!node.children) return;
  for (let index = 0; index < node.children.length; index++) {
    const child = node.children[index];
    const text = child.type === "paragraph" && child.children?.length === 1 ? child.children[0] : void 0;
    const match = text?.type === "inlineCode" && text.value ? text.value.trim().match(directive) : null;
    if (match) {
      const feedUrl = match[1].trim();
      const appleId = match[2];
      let value;
      try {
        value = renderEpisode(await fetchLatestEpisode(feedUrl), feedUrl);
      } catch (error) {
        if (appleId) {
          try {
            value = renderEpisode(await fetchLatestAppleEpisode(appleId), feedUrl);
          } catch {
            value = renderError(feedUrl, error);
          }
        } else {
          value = renderError(feedUrl, error);
        }
      }
      node.children[index] = { type: "html", value };
      continue;
    }
    await transformChildren(child);
  }
}
function remarkPodcastRss() {
  return async (tree) => transformChildren(tree);
}
const PodcastRss = () => ({
  name: "PodcastRss",
  markdownPlugins() {
    return [remarkPodcastRss];
  }
});
export {
  PodcastRss
};
