# Mockys' Nest

[![Website](https://img.shields.io/website?url=https%3A%2F%2Fmockys.net&label=mockys.net)](https://mockys.net) [![Pages](https://img.shields.io/github/checks-status/LuckytoeUSTC/Mockys_Blog/v5?label=Pages)](https://github.com/LuckytoeUSTC/Mockys_Blog/commits/v5/) [![Last commit](https://img.shields.io/github/last-commit/LuckytoeUSTC/Mockys_Blog/v5)](https://github.com/LuckytoeUSTC/Mockys_Blog/commits/v5/)

Moe 与 Lucky 共同维护的数字花园，记录数学、物理、人文、摄影、播客与仍在生长的问题。网站由 [Quartz v5](https://quartz.jzhao.xyz/) 构建，提交到当前发布分支 `v5` 后，Cloudflare Pages 会自动更新 [mockys.net](https://mockys.net)。

## 给合作者：用 GitHub 网页发布Blog

日常投稿只需要修改 `content/你的名字/`，不区分作者的Blog（或者共同写作的Blog）可以放在 `content/Undetermined`下面。最好不要改动其他作者的目录。

### 1. 准备文章

建议把文件命名为简短的英文小写名称，单词之间使用连字符，例如 `notes-on-light.md`。文章开头可以复制下面的模板：

```md
---
title: 文章标题
description: 一句话介绍这篇文章
date: 2026-08-06
tags:
  - 标签一
  - 标签二
---

从这里开始写正文。
```

- `title` 是网页上显示的标题。
- `description` 用于搜索结果和链接预览
- `date` 使用 `YYYY-MM-DD` 格式。
- 每个标签单独写一行；不需要标签时可以删掉整个 `tags` 部分。

### 2. 在网页端新建文章

1. 打开 [GitHub 仓库](https://github.com/LuckytoeUSTC/Mockys_Blog)，确认左上方分支是 `v5`（默认）。
2. 点击 **Add file → Create new file**。
3. 在文件名中填写完整路径，例如 `content/Moe/notes-on-light.md`。
4. 粘贴上面的模板和正文，切换到 **Preview** 检查标题、列表、链接与图片语法。
5. 点击 **Commit changes**，提交说明写清文章名称，例如 `post: add notes on light`。
6. 选择直接提交到 `v5`，再次点击 **Commit changes**。通常等待几分钟后即可在 [mockys.net](https://mockys.net) 查看结果。

修改已有文章也很简单：打开对应的 `.md` 文件，点击右上角铅笔图标，编辑后再次提交。

### 3. 添加图片和附件

普通图片或附件放在自己目录下的 `assets/` 文件夹，并随文章一起提交。例如：

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

上传附件时，进入自己的作者目录，点击 **Add file → Upload files**；可以拖入单个文件，也可以拖入准备好的 `assets` 文件夹。提交前请再次确认目标路径位于 `content/你的名字/`。

> [!IMPORTANT]
> **单个附件必须小于 25 MiB，并且不要卡着上限。** GitHub 网页上传和 Cloudflare Pages 的单个站点资源都以 25 MiB 为上限。图片、音频或视频请先压缩；如果无法压到限制以内，请把原文件交给 Lucky，由 Lucky 上传到 R2，再把 `https://assets.mockys.net/...` 链接发给你。不要自行配置 R2，也不要把访问密钥写进仓库。

大文件外链的写法：

```md
[下载附件](https://assets.mockys.net/路径/文件名.pdf)

![图片说明](https://assets.mockys.net/路径/图片.jpg)
```

### 4. 发布前检查

- 文件位于 `content/自己的名字/`，没有误改其他目录。
- 标题、日期和标签格式正确，正文中没有账号、密码、密钥或不应公开的信息。
- 本地图片链接使用 `./assets/文件名`，并且附件已经一同上传。
- 每个附件都小于 25 MiB；更大的文件已经交给 Lucky 处理。
- 提交后等待构建完成，再检查网页；若失败，请把提交链接或页面截图发给 Lucky，不要连续重复提交。

## 项目结构

```text
content/                 博文与普通附件；合作者日常只需进入这里
├── Lucky/               Lucky 的内容
├── Moe/                 Moe 的内容
└── index.md             网站首页
quartz/                  Quartz 程序代码
quartz.config.default.yaml
README.md                本说明与简要状态入口
```

## 文件大小依据

- [GitHub：通过浏览器添加文件，每个文件上限为 25 MiB](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)
- [Cloudflare Pages：单个站点资源上限为 25 MiB，较大文件建议使用 R2](https://developers.cloudflare.com/pages/platform/limits/#file-size)

<details>
<summary>维护者入口</summary>

- [Cloudflare Dashboard](https://dash.cloudflare.com/)
- [Google Search Console](https://search.google.com/search-console)
- [百度搜索资源平台](https://ziyuan.baidu.com/)
- [Quartz 文档](https://quartz.jzhao.xyz/)

</details>
