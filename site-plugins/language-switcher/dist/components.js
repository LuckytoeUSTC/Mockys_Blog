import { jsx, jsxs } from "preact/jsx-runtime";
import { resolveRelative } from "@quartz-community/utils";
const styles = `
.language-switcher {
  display: inline-flex;
  align-items: center;
  box-sizing: border-box;
  gap: 0.2rem;
  margin-top: 0.65rem;
  padding: 0.2rem;
  border: 1px solid var(--lightgray);
  border-radius: 999px;
  background: transparent;
  font-size: 0.76rem;
  font-weight: 650;
  line-height: 1;
}

.language-switcher-option {
  min-width: 2.25rem;
  box-sizing: border-box;
  padding: 0.38rem 0.65rem;
  border-radius: 999px;
  color: var(--gray);
  text-align: center;
  text-decoration: none;
}

.language-switcher-option:hover {
  color: var(--dark);
  background: var(--highlight);
}

.language-switcher-option[aria-current="page"] {
  color: var(--light);
  background: var(--secondary);
}
`;
const languageOf = (file) => {
  const value = file.frontmatter?.language ?? file.frontmatter?.lang;
  if (typeof value === "string") {
    const language = value.toLowerCase();
    if (language.startsWith("zh")) return "zh";
    if (language.startsWith("en")) return "en";
  }
  if (file.slug?.endsWith(".en")) return "en";
  return void 0;
};
const translationKey = (file) => (file.relativePath ?? file.filePath ?? "").replace(/\\/g, "/").replace(/\.md$/i, "").replace(/\.en$/i, "").toLowerCase();
const LanguageSwitcher = () => {
  const Component = ({ fileData, allFiles, displayClass }) => {
    const current = fileData;
    const currentSlug = current.slug;
    if (!currentSlug) return null;
    const currentLanguage = languageOf(current);
    const currentKey = translationKey(current);
    const alternate = allFiles.find(
      (file) => translationKey(file) === currentKey && languageOf(file) !== currentLanguage
    );
    if (!currentLanguage || !alternate || languageOf(alternate) === currentLanguage) return null;
    const chineseFile = currentLanguage === "zh" ? current : alternate;
    const englishFile = currentLanguage === "en" ? current : alternate;
    if (!chineseFile.slug || !englishFile.slug) return null;
    const chineseHref = resolveRelative(currentSlug, chineseFile.slug);
    const englishHref = resolveRelative(currentSlug, englishFile.slug);
    return /* @__PURE__ */ jsxs("nav", { class: `language-switcher ${displayClass ?? ""}`, "aria-label": "\u6587\u7AE0\u8BED\u8A00", children: [
      /* @__PURE__ */ jsx(
        "a",
        {
          href: chineseHref,
          class: "language-switcher-option",
          lang: "zh-CN",
          "aria-current": currentLanguage === "zh" ? "page" : void 0,
          children: "\u4E2D\u6587"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: englishHref,
          class: "language-switcher-option",
          lang: "en",
          "aria-current": currentLanguage === "en" ? "page" : void 0,
          children: "EN"
        }
      )
    ] });
  };
  Component.css = styles;
  return Component;
};
export {
  LanguageSwitcher
};
