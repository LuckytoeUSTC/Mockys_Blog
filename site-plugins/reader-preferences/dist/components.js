import { jsx, jsxs } from "preact/jsx-runtime";
const beforeDOMLoaded = `
const root = document.documentElement
const savedFont = localStorage.getItem("mockys-reader-font")
const savedSize = localStorage.getItem("mockys-reader-size")
root.dataset.readerFont = ["sans", "serif"].includes(savedFont) ? savedFont : "sans"
root.dataset.readerSize = ["small", "medium", "large"].includes(savedSize) ? savedSize : "medium"
`;
const afterDOMLoaded = `
function setupExplorerPageState() {
  const isDesktop = window.matchMedia("(min-width: 801px)").matches
  const shouldOpen = isDesktop && document.body.dataset.slug === "index"

  for (const explorer of document.querySelectorAll(".explorer")) {
    explorer.classList.toggle("collapsed", !shouldOpen)
    explorer.setAttribute("aria-expanded", String(shouldOpen))
  }

  if (!shouldOpen) document.documentElement.classList.remove("mobile-no-scroll")
}

function scheduleExplorerPageState() {
  const observers = []

  for (const explorer of document.querySelectorAll(".explorer")) {
    const list = explorer.querySelector(".explorer-ul")
    if (!list) continue

    const observer = new MutationObserver(() => {
      if (!list.querySelector("li:not(.overflow-end)")) return
      setupExplorerPageState()
      observer.disconnect()
    })
    observer.observe(list, { childList: true })
    observers.push(observer)
  }

  const timer = window.setTimeout(setupExplorerPageState, 0)
  window.addCleanup(() => {
    window.clearTimeout(timer)
    for (const observer of observers) observer.disconnect()
  })
}

function setupReaderPreferences() {
  const root = document.documentElement
  const containers = document.querySelectorAll(".reader-preferences")

  for (const container of containers) {
    if (container.dataset.bound === "true") continue
    container.dataset.bound = "true"

    const toggle = container.querySelector(".reader-preferences-toggle")
    const panel = container.querySelector(".reader-preferences-panel")
    const buttons = container.querySelectorAll("button[data-reader-value]")
    if (!toggle || !panel) continue

    const refresh = () => {
      for (const button of buttons) {
        const kind = button.dataset.readerKind
        const value = button.dataset.readerValue
        const selected = kind === "font" ? root.dataset.readerFont === value : root.dataset.readerSize === value
        button.setAttribute("aria-pressed", String(selected))
      }
    }

    const setOpen = (open) => {
      panel.hidden = !open
      toggle.setAttribute("aria-expanded", String(open))
    }

    const onToggle = () => setOpen(panel.hidden)
    const onChoice = (event) => {
      const button = event.currentTarget
      const kind = button.dataset.readerKind
      const value = button.dataset.readerValue
      if (kind === "font") {
        root.dataset.readerFont = value
        localStorage.setItem("mockys-reader-font", value)
      } else {
        root.dataset.readerSize = value
        localStorage.setItem("mockys-reader-size", value)
      }
      refresh()
    }
    const onOutside = (event) => {
      if (!container.contains(event.target)) setOpen(false)
    }
    const onKeydown = (event) => {
      if (event.key === "Escape") {
        setOpen(false)
        toggle.focus()
      }
    }

    toggle.addEventListener("click", onToggle)
    for (const button of buttons) button.addEventListener("click", onChoice)
    document.addEventListener("click", onOutside)
    document.addEventListener("keydown", onKeydown)
    window.addCleanup(() => {
      toggle.removeEventListener("click", onToggle)
      for (const button of buttons) button.removeEventListener("click", onChoice)
      document.removeEventListener("click", onOutside)
      document.removeEventListener("keydown", onKeydown)
    })

    refresh()
  }
}

document.addEventListener("nav", setupReaderPreferences)
document.addEventListener("render", setupReaderPreferences)
document.addEventListener("nav", scheduleExplorerPageState)
document.addEventListener("render", scheduleExplorerPageState)
`;
const styles = `
.reader-preferences {
  position: relative;
  display: flex;
  align-items: center;
}

.reader-preferences-toggle {
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 0.4rem;
  color: var(--darkgray);
  background: transparent;
  font-family: var(--codeFont);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
}

.reader-preferences-toggle:hover,
.reader-preferences-toggle[aria-expanded="true"] {
  color: var(--dark);
  border-color: var(--lightgray);
  background: var(--highlight);
}

.reader-preferences-panel {
  position: absolute;
  z-index: 20;
  top: calc(100% + 0.65rem);
  right: 0;
  width: 13rem;
  box-sizing: border-box;
  padding: 0.9rem;
  border: 1px solid var(--lightgray);
  border-radius: 0.6rem;
  background: var(--light);
  box-shadow: 0 14px 36px rgba(22, 28, 30, 0.14);
}

.reader-preferences-panel[hidden] {
  display: none;
}

.reader-preferences-title {
  display: block;
  margin-bottom: 0.75rem;
  color: var(--dark);
  font-size: 0.85rem;
  font-weight: 700;
}

.reader-preferences-row {
  display: grid;
  grid-template-columns: 3.2rem 1fr;
  align-items: center;
  gap: 0.55rem;
}

.reader-preferences-row + .reader-preferences-row {
  margin-top: 0.65rem;
}

.reader-preferences-label {
  color: var(--gray);
  font-size: 0.75rem;
}

.reader-preferences-options {
  display: flex;
  gap: 0.3rem;
}

.reader-preferences-options button {
  flex: 1;
  min-height: 1.85rem;
  padding: 0.18rem 0.42rem;
  border: 1px solid var(--lightgray);
  border-radius: 0.35rem;
  color: var(--darkgray);
  background: transparent;
  font: inherit;
  font-size: 0.75rem;
  cursor: pointer;
}

.reader-preferences-options button[data-reader-value="sans"] {
  font-family: var(--mockys-sans);
}

.reader-preferences-options button[data-reader-value="serif"] {
  font-family: var(--mockys-serif);
  font-size: 0.82rem;
}

.reader-preferences-options button:hover {
  border-color: var(--gray);
  color: var(--dark);
}

.reader-preferences-options button[aria-pressed="true"] {
  border-color: var(--secondary);
  color: var(--light);
  background: var(--secondary);
}

@media (max-width: 800px) {
  .reader-preferences-panel {
    top: auto;
    right: 0;
    bottom: calc(100% + 0.65rem);
    width: min(13rem, calc(100vw - 2rem));
  }
}
`;
const ReaderPreferences = () => {
  const Component = ({ displayClass }) => /* @__PURE__ */ jsxs("div", { class: `reader-preferences ${displayClass ?? ""}`, children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        class: "reader-preferences-toggle",
        "aria-label": "\u8C03\u6574\u9605\u8BFB\u6837\u5F0F",
        "aria-expanded": "false",
        title: "\u9605\u8BFB\u6837\u5F0F",
        children: "Aa"
      }
    ),
    /* @__PURE__ */ jsxs("div", { class: "reader-preferences-panel", role: "group", "aria-label": "\u9605\u8BFB\u6837\u5F0F", hidden: true, children: [
      /* @__PURE__ */ jsx("span", { class: "reader-preferences-title", children: "\u9605\u8BFB\u6837\u5F0F" }),
      /* @__PURE__ */ jsxs("div", { class: "reader-preferences-row", children: [
        /* @__PURE__ */ jsx("span", { class: "reader-preferences-label", children: "\u5B57\u4F53" }),
        /* @__PURE__ */ jsxs("div", { class: "reader-preferences-options", children: [
          /* @__PURE__ */ jsx("button", { type: "button", "data-reader-kind": "font", "data-reader-value": "sans", children: "\u65E0\u886C\u7EBF" }),
          /* @__PURE__ */ jsx("button", { type: "button", "data-reader-kind": "font", "data-reader-value": "serif", children: "\u886C\u7EBF" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { class: "reader-preferences-row", children: [
        /* @__PURE__ */ jsx("span", { class: "reader-preferences-label", children: "\u5B57\u53F7" }),
        /* @__PURE__ */ jsxs("div", { class: "reader-preferences-options", children: [
          /* @__PURE__ */ jsx("button", { type: "button", "data-reader-kind": "size", "data-reader-value": "small", children: "\u5C0F" }),
          /* @__PURE__ */ jsx("button", { type: "button", "data-reader-kind": "size", "data-reader-value": "medium", children: "\u4E2D" }),
          /* @__PURE__ */ jsx("button", { type: "button", "data-reader-kind": "size", "data-reader-value": "large", children: "\u5927" })
        ] })
      ] })
    ] })
  ] });
  Component.beforeDOMLoaded = beforeDOMLoaded;
  Component.afterDOMLoaded = afterDOMLoaded;
  Component.css = styles;
  return Component;
};
export {
  ReaderPreferences
};
