import type { QuartzComponent, QuartzComponentConstructor } from "@quartz-community/types"
import { resolveRelative } from "@quartz-community/utils"

type FileData = {
  slug?: string
  relativePath?: string
  filePath?: string
  frontmatter?: Record<string, unknown>
}

const styles = `
.page-header .flex-component:has(.language-switcher) > div:first-child {
  min-width: 0;
}

.language-switcher {
  display: inline-flex;
  align-items: center;
  min-height: 1.75rem;
  box-sizing: border-box;
  margin-bottom: 0.2rem;
  padding: 0.2rem 0.65rem;
  border: 1px solid var(--lightgray);
  border-radius: 999px;
  color: var(--secondary);
  background: transparent;
  font-size: 0.76rem;
  font-weight: 650;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
}

.language-switcher:hover {
  border-color: var(--secondary);
  color: var(--dark);
  background: var(--highlight);
}
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
      <a
        href={href}
        class={`language-switcher ${displayClass ?? ""}`}
        lang={chineseIsCurrent ? "en" : "zh-CN"}
        aria-label={label}
        title={label}
      >
        {chineseIsCurrent ? "EN" : "中文"}
      </a>
    )
  }
  Component.css = styles
  return Component
}
