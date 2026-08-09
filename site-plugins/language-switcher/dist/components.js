import { jsx, jsxs } from "preact/jsx-runtime";
import { resolveRelative } from "@quartz-community/utils";
const styles = `
.language-switcher { display: inline-flex; align-items: center; height: 2rem; box-sizing: border-box; padding: 0.16rem; border: 1px solid var(--lightgray); border-radius: 0.45rem; color: var(--gray); background: transparent; font-size: 0.72rem; font-weight: 650; line-height: 1; }
.language-switcher a, .language-switcher-current { display: grid; min-width: 1.65rem; height: 1.55rem; box-sizing: border-box; place-items: center; padding: 0 0.35rem; border-radius: 0.3rem; }
.language-switcher a { color: var(--gray); text-decoration: none; }
.language-switcher a:hover { color: var(--dark); background: var(--highlight); }
.language-switcher-current { color: var(--light); background: var(--secondary); }
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
    const alternateSlug = alternate.slug;
    if (!alternateSlug) return null;
    const href = resolveRelative(currentSlug, alternateSlug);
    const chineseIsCurrent = currentLanguage === "zh";
    const label = chineseIsCurrent ? "Read in English" : "\u9605\u8BFB\u4E2D\u6587\u7248";
    return /* @__PURE__ */ jsxs("nav", { class: `language-switcher ${displayClass ?? ""}`, "aria-label": "\u6587\u7AE0\u8BED\u8A00", children: [
      chineseIsCurrent ? /* @__PURE__ */ jsx("span", { class: "language-switcher-current", "aria-current": "page", children: "\u4E2D" }) : /* @__PURE__ */ jsx("a", { href, class: "internal", lang: "zh-CN", "aria-label": label, title: label, children: "\u4E2D" }),
      chineseIsCurrent ? /* @__PURE__ */ jsx("a", { href, class: "internal", lang: "en", "aria-label": label, title: label, children: "EN" }) : /* @__PURE__ */ jsx("span", { class: "language-switcher-current", "aria-current": "page", children: "EN" })
    ] });
  };
  Component.css = styles;
  return Component;
};
export {
  LanguageSwitcher
};
