import type { QuartzComponent, QuartzComponentConstructor } from "@quartz-community/types"

const beforeDOMLoaded = `
const root = document.documentElement
const savedFont = localStorage.getItem("mockys-reader-font")
const savedSize = localStorage.getItem("mockys-reader-size")
root.dataset.readerFont = ["sans", "serif"].includes(savedFont) ? savedFont : "sans"
root.dataset.readerSize = ["small", "medium", "large"].includes(savedSize) ? savedSize : "medium"
`

const afterDOMLoaded = `
// Keep the media object outside the swapped SPA document body.
const ambience = window.__mockysAmbience ??= (() => {
  const audio = new Audio("https://assets.mockys.net/WhatSilenceSoundLike/full.flac")
  audio.loop = true
  audio.preload = "none"
  let requested = false
  let playing = false
  let failed = false
  let enabled = true
  try { enabled = localStorage.getItem("mockys-ambience") !== "off" } catch {}
  const refresh = () => {
    for (const button of document.querySelectorAll(".ambience-toggle")) {
      const label = failed ? "音频加载失败，点击重试" : requested ? "暂停声之无" : "播放声之无"
      button.dataset.playing = String(playing)
      button.setAttribute("aria-pressed", String(requested))
      button.setAttribute("aria-label", label)
      button.title = label
    }
  }
  const start = () => {
    failed = false
    requested = true
    refresh()
    audio.play().catch((error) => {
      if (!requested || error.name === "AbortError") return
      requested = false
      playing = false
      failed = error.name !== "NotAllowedError"
      refresh()
    })
  }
  audio.addEventListener("playing", () => { playing = true; refresh() })
  audio.addEventListener("waiting", () => { playing = false; refresh() })
  audio.addEventListener("pause", () => { requested = false; playing = false; refresh() })
  audio.addEventListener("error", () => { failed = true; requested = false; playing = false; refresh() })
  const toggle = () => {
    enabled = !requested
    try { localStorage.setItem("mockys-ambience", enabled ? "on" : "off") } catch {}
    if (enabled) {
      if (audio.error) audio.load()
      start()
    } else audio.pause()
  }
  return { audio, refresh, toggle, start, enabled }
})()

function setupAmbience() {
  for (const button of document.querySelectorAll(".ambience-toggle")) {
    if (button.dataset.bound === "true") continue
    button.dataset.bound = "true"
    button.addEventListener("click", ambience.toggle)
    window.addCleanup(() => button.removeEventListener("click", ambience.toggle))
  }
  ambience.refresh()
  if (!ambience.attempted) {
    ambience.attempted = true
    if (ambience.enabled) ambience.start()
  }
}
document.addEventListener("nav", setupAmbience)
document.addEventListener("render", setupAmbience)

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

    const toggle = container.querySelector(".reader-preferences-font-toggle")
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
`

const styles = `
.ambience-toggle {
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.ambience-toggle svg {
  width: 1.4rem;
  height: 1.4rem;
  transform-box: fill-box;
  transform-origin: center;
  transform: rotate(0deg);
}
.ambience-toggle[data-playing="true"] svg {
  animation: ambience-spin 10s linear infinite;
}
@keyframes ambience-spin {
  to { transform: rotate(360deg); }
}
@media (prefers-reduced-motion: reduce) {
  .ambience-toggle[data-playing="true"] svg { animation: none; }
}
.reader-preferences {
  position: relative;
  gap: 0.5rem;
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
`

export const ReaderPreferences: QuartzComponentConstructor = () => {
  const Component: QuartzComponent = ({ displayClass }) => (
    <div class={`reader-preferences ${displayClass ?? ""}`}>
      <button
        type="button"
        class="reader-preferences-toggle ambience-toggle"
        aria-label="播放声之无"
        aria-pressed="false"
        title="播放声之无"
      >
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path
            d="M12 25V8l16-3v17M12 12l16-3"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <ellipse cx="8" cy="25" rx="5" ry="3.5" fill="currentColor" />
          <ellipse cx="24" cy="22" rx="5" ry="3.5" fill="currentColor" />
        </svg>
      </button>
      <button
        type="button"
        class="reader-preferences-toggle reader-preferences-font-toggle"
        aria-label="调整阅读样式"
        aria-expanded="false"
        title="阅读样式"
      >
        Aa
      </button>
      <div class="reader-preferences-panel" role="group" aria-label="阅读样式" hidden>
        <span class="reader-preferences-title">阅读样式</span>
        <div class="reader-preferences-row">
          <span class="reader-preferences-label">字体</span>
          <div class="reader-preferences-options">
            <button type="button" data-reader-kind="font" data-reader-value="sans">
              无衬线
            </button>
            <button type="button" data-reader-kind="font" data-reader-value="serif">
              衬线
            </button>
          </div>
        </div>
        <div class="reader-preferences-row">
          <span class="reader-preferences-label">字号</span>
          <div class="reader-preferences-options">
            <button type="button" data-reader-kind="size" data-reader-value="small">
              小
            </button>
            <button type="button" data-reader-kind="size" data-reader-value="medium">
              中
            </button>
            <button type="button" data-reader-kind="size" data-reader-value="large">
              大
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  Component.beforeDOMLoaded = beforeDOMLoaded
  Component.afterDOMLoaded = afterDOMLoaded
  Component.css = styles
  return Component
}
