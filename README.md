# Mockys' Nest

[![Site](https://img.shields.io/website?url=https%3A%2F%2Fmockys.net&label=site)](https://mockys.net) [![Cloudflare Pages](https://img.shields.io/github/check-runs/LuckytoeUSTC/Mockys_Blog/v5?nameFilter=Cloudflare%20Pages&label=Pages)](https://github.com/LuckytoeUSTC/Mockys_Blog/commits/v5/) [![Last commit](https://img.shields.io/github/last-commit/LuckytoeUSTC/Mockys_Blog/v5)](https://github.com/LuckytoeUSTC/Mockys_Blog/commits/v5/)

Moe 与 Lucky 共同维护的数字花园，记录数学、物理、人文、摄影、播客与仍在生长的问题。访问网站：[mockys.net](https://mockys.net)。

## 网站如何运行

这是一个没有“内容管理后台”的静态网站。GitHub 仓库保存文章与配置，是网站内容的唯一来源；Cloudflare Pages 监听发布分支，每次收到新提交后运行 Quartz，把 Markdown 编译成网页并自动上线。

```mermaid
flowchart LR
    A["作者<br/>Markdown 与普通附件"] -->|"GitHub 网页端<br/>Upload files"| B["GitHub<br/>content/作者目录/"]
    B -->|"提交到 v5"| C["Cloudflare Pages<br/>运行 Quartz v5 构建"]
    C --> D["mockys.net<br/>公开网站"]
    E["大文件<br/>无法压缩到 25 MiB 以下"] -->|"上传到图床"| F["Cloudflare R2"]
    F -->|"assets.mockys.net 外链"| D
```

- **内容**：博文和普通附件位于 `content/`，按作者归档。
- **发布**：`v5` 是当前默认及生产分支；直接提交后，Cloudflare Pages 自动构建和部署。
- **普通附件**：与文章一起提交到作者目录下的 `assets/`，由 GitHub 跟踪并随 Pages 发布。
- **大文件**：先压缩；仍然过大时交给 Lucky 上传 R2，文章只保存 `assets.mockys.net` 外链。

顶部的状态徽章各自回答一个问题：`site` 检测网站此刻能否访问；`Pages` 只读取最新提交中名为 `Cloudflare Pages` 的 Check Run，判断最新构建是否成功；`last commit` 显示远端 `v5` 最近一次提交的时间。Cloudflare Pages 负责构建，并通过 [Cloudflare Git 集成](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/#check-runs)把结果写回 GitHub；Shields 再把这条结果绘制成徽章。详细构建日志仍以 Cloudflare Dashboard 为准。

## 给合作者：用 GitHub 网页上传博文

### 1. 确认文件放在哪里

- Moe 的文章放入 [`content/Moe/`](https://github.com/LuckytoeUSTC/Mockys_Blog/tree/v5/content/Moe)。
- Lucky 的文章放入 [`content/Lucky/`](https://github.com/LuckytoeUSTC/Mockys_Blog/tree/v5/content/Lucky)。
- 共同写作、暂不区分作者或尚未归档的文章放入 [`content/Undetermined/`](https://github.com/LuckytoeUSTC/Mockys_Blog/tree/v5/content/Undetermined)。

日常投稿只改自己的作者目录，不要移动其他作者的文章。

### 2. 准备 Markdown 文件

在本地用 Typora 或其他编辑器写好 `.md` 文件。建议使用英文文件名，单词之间不要空格，例如 `notes-on-light.md`。

文章开头保留以下 Frontmatter：

```md
---
title: 文章标题
description: 一句话介绍这篇文章
date: 2026-08-06
tags:
  - 标签一
  - 标签二
---
```

`title` 是网页标题，`description` 用于搜索结果和链接预览，`date` 使用 `YYYY-MM-DD` 格式。每个标签单独占一行；不需要标签时可以删掉整个 `tags` 部分。

### 3. 直接上传并发布

1. 打开上方对应的作者目录，确认左上方分支为 `v5`（默认）。
2. 点击 **Add file → Upload files**。
3. 把写好的 `.md` 文件拖入上传区域；文章有图片或其它附件时，把附件拖入准备好的 `assets` 文件夹。
4. 检查页面列出的目标路径，确认所有文件都位于 `content/自己的名字/`。
5. 在 **Commit changes** 中填写简短说明，例如 `post: add notes on light`。
6. 选择直接提交到 `v5`，点击 **Commit changes**。通常等待几分钟后即可在 [mockys.net](https://mockys.net) 查看结果。

需要修改已有文章时，打开对应 `.md` 文件并点击右上角铅笔图标；也可以在本地修改后重新上传同名文件。

### 4. 图片与附件

普通图片或附件放在作者目录下的 `assets/` 文件夹。例如：

```text
content/
└── Moe/
    ├── notes-on-light.md
    └── assets/
        └── prism.jpg
```

文章中使用相对路径引用：

```md
![棱镜实验](./assets/prism.jpg)
```

> [!IMPORTANT]
> **单个附件必须小于 25 MiB，并且不要卡着上限。** GitHub 网页上传和 Cloudflare Pages 的单个站点资源都以 25 MiB 为上限。图片、音频或视频请先压缩；如果无法压到限制以内，请把原文件交给 Lucky，由 Lucky 上传到 R2，再把 `https://assets.mockys.net/...` 链接发给你。

大文件外链的写法：

```md
[下载附件](https://assets.mockys.net/路径/文件名.pdf)

![图片说明](https://assets.mockys.net/路径/图片.jpg)
```

## 项目结构

```text
content/                         博文与普通附件
├── Lucky/                       Lucky 的内容
├── Moe/                         Moe 的内容；.gitkeep 用于保留空目录
├── Undetermined/                共同写作或尚未归档的内容
└── index.md                     网站首页
quartz/                          Quartz 程序代码
quartz.config.default.yaml       网站配置
README.md                        架构、投稿说明与状态入口
```

## 文件大小依据

- [GitHub：通过浏览器添加文件，每个文件上限为 25 MiB](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)
- [Cloudflare Pages：单个站点资源上限为 25 MiB，较大文件建议使用 R2](https://developers.cloudflare.com/pages/platform/limits/#file-size)

<details>
<summary>Developer入口</summary>
<ul>
<li><a href="https://dash.cloudflare.com/">Cloudflare Dashboard</a></li>
<li><a href="https://search.google.com/search-console">Google Search Console</a></li>
<li><a href="https://ziyuan.baidu.com/dashboard/index?site=https://www.mockys.net/">百度搜索资源平台</a></li>
<li><a href="https://quartz.jzhao.xyz/">Quartz 文档</a></li>
</ul>
</details>
