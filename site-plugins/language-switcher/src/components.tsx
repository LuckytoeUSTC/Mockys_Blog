import type { QuartzComponent, QuartzComponentConstructor } from "@quartz-community/types"
import { resolveRelative } from "@quartz-community/utils"

type FileData = {
  slug?: string
  relativePath?: string
  filePath?: string
  frontmatter?: Record<string, unknown>
}

const styles = `
.language-switcher { display: inline-flex; align-items: center; height: 2rem; box-sizing: border-box; padding: 0.16rem; border: 1px solid var(--lightgray); border-radius: 0.45rem; color: var(--gray); background: transparent; font-size: 0.72rem; font-weight: 650; line-height: 1; }
.language-switcher a, .language-switcher-current { display: grid; min-width: 1.65rem; height: 1.55rem; box-sizing: border-box; place-items: center; padding: 0 0.35rem; border-radius: 0.3rem; }
.language-switcher a { color: var(--gray); text-decoration: none; }
.language-switcher a:hover { color: var(--dark); background: var(--highlight); }
.language-switcher-current { color: var(--light); background: var(--secondary); }
`

const languageOf = (file: FileData): "zh" | "en" | undefined => {
  const value = file.frontmatter?.language ?? file.frontmatter?.lang
  if (typeof value === "string") {
    const language = value.toLowerCase()
    if (language.startsWith("zh")) return "zh"
    if (language.startsWith("en")) return "en"
  }
  if (file.slug?.endsWith(".en")) return "en"
  return undefined
}

const translationKey = (file: FileData) =>
  (file.relativePath ?? file.filePath ?? "")
    .replace(/\\/g, "/")
    .replace(/\.md$/i, "")
    .replace(/\.en$/i, "")
    .toLowerCase()

export const LanguageSwitcher: QuartzComponentConstructor = () => {
  const Component: QuartzComponent = ({ fileData, allFiles, displayClass }) => {
    const current = fileData as FileData
    const currentSlug = current.slug
    if (!currentSlug) return null

    const currentLanguage = languageOf(current)
    const currentKey = translationKey(current)
    const alternate = (allFiles as FileData[]).find(
      (file) => translationKey(file) === currentKey && languageOf(file) !== currentLanguage,
    )
    if (!currentLanguage || !alternate || languageOf(alternate) === currentLanguage) return null

    const alternateSlug = alternate.slug
    if (!alternateSlug) return null
    const href = resolveRelative(currentSlug as never, alternateSlug as never)
    const chineseIsCurrent = currentLanguage === "zh"
    const label = chineseIsCurrent ? "Read in English" : "阅读中文版"

    return (
      <nav class={`language-switcher ${displayClass ?? ""}`} aria-label="文章语言">
        {chineseIsCurrent ? (
          <span class="language-switcher-current" aria-current="page">
            中
          </span>
        ) : (
          <a href={href} class="internal" lang="zh-CN" aria-label={label} title={label}>
            中
          </a>
        )}
        {chineseIsCurrent ? (
          <a href={href} class="internal" lang="en" aria-label={label} title={label}>
            EN
          </a>
        ) : (
          <span class="language-switcher-current" aria-current="page">
            EN
          </span>
        )}
      </nav>
    )
  }
  Component.css = styles
  return Component
}
