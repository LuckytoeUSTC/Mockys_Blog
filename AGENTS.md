# Mockys_Blog working rules

## Scope and authors

- This repository is a shared Quartz v5 digital garden maintained by Moe and Lucky.
- Determine the author from Frontmatter and directory before editing prose. Never apply Lucky's voice to Moe or to jointly authored copy.
- `content/Lucky/` and `content/Moe/` are author-owned. Use `content/Undetermined/` for joint or not-yet-classified work.

## Content work

- For review, diagnosis, or planning, inspect and report without editing. For an explicit writing or editing request, change only the named note.
- Prefer Obsidian CLI for scoped reads, search, outline, properties, links, tasks, and post-write verification. On Windows use `obsidian`; if the process PATH is stale, call `C:\Users\lucky\AppData\Local\Programs\Obsidian\Obsidian.com`. Never call `Obsidian.exe` as the CLI.
- Load only the relevant skill: `obsidian-cli` and `obsidian-markdown` for notes, `defuddle` for web extraction, `json-canvas` for `.canvas`, `obsidian-bases` for `.base`, and `lucky-writing` only for Lucky's personal prose.
- Use Claudian inline edit for selected prose. Do not overwrite a whole long note unless the user explicitly asks for a full rewrite.
- Preserve author intent. Do not invent experiences, positions, feelings, facts, sources, or conclusions.

## Markdown and metadata

- Prefer Frontmatter fields `title`, `author`, `language`, `date`, `description`, and `tags`.
- Keep Markdown compatible with Obsidian, Typora, GitHub, and Quartz.
- Keep each native HTML block continuous: no blank lines inside one `<details>` or `<div>` block, and no Markdown lists inside native HTML blocks.
- Reread the target note after writing. Verify Frontmatter, links, and unusual markup in Obsidian when practical.

## Design and engineering

- Keep the site visually quiet and minimal. Prioritize typography, whitespace, hierarchy, and responsive reading over decoration, animation, or extra panels.
- Keep site-specific changes in `quartz.config.yaml`, `quartz.ts`, `quartz/styles/custom.scss`, `siteMetadata.tsx`, or `site-plugins/`; avoid changing upstream Quartz source unless necessary.
- Local build: `node .\quartz\bootstrap-cli.mjs build`. Live preview: `node .\quartz\bootstrap-cli.mjs build --serve`, then open `http://localhost:8080`.
- Do not upgrade dependencies because Dependabot or an AI suggests it. Require a concrete need, compatibility review, and explicit user approval.

## Git

- Obsidian Git synchronization is manual. Pull before a writing session; review the diff and sync after the work is complete.
- Do not commit, push, pull, merge, or change branches unless explicitly requested.
- Preserve unrelated user changes in a dirty worktree.
