# 个人作品集网站 — Codex 交接文档

> 本文档用于向 Codex 交接项目状态。最后更新：2026-09-10

## 一、项目概览

| 项目 | 信息 |
|------|------|
| 项目名称 | 个人作品集网站（单页滚动） |
| 线上地址 | https://caraharal.github.io/portfolio/ |
| 仓库 | `git@github.com:caraharal/portfolio.git` |
| 本地路径 | `/Users/caraharal/personal-website/` |
| 技术栈 | 纯静态 HTML5 + CSS3 + Vanilla JS，零依赖、零构建 |
| 部署 | GitHub Pages（push 即部署，无需手动构建） |
| 核心文件 | `index.html` / `css/style.css` / `js/main.js` |

## 二、网站结构（单页滚动，按顺序）

```
🏠 Hero        → 陈会凌 / 摄影师·内容创作者·AI创作者
👤 关于        → 个人介绍 + 教育背景 + 数据亮点(8W+/100+/10+)
💼 经历        → 6段实习（卡姿兰/麦和/国际在线/香蕉文化/天猫校园）
🚀 项目        → 8个项目卡片（含胶片相机网站 + AI内容创作实践 + AI营销内容生成器）
📷 摄影        → 5个分类 Gallery + 灯箱（数据由 js/main.js 动态渲染）
🎬 视频        → 5个分类（信息流/美妆口播/AI工具生成/剧情片/作品集）
🤖 Vibe Coding → 3个项目卡片 + 4条产品决策日志 + 4个用户思维标签页
🛠 技能        → 影像/AI/新媒体/摄影/证书
✉️ 联系        → 联系方式 + 表单（Formspree 后端）
```

## 三、文件结构

```
personal-website/
├── index.html           # 主页面（所有内容都在这里，约 900 行）
├── css/style.css        # 全部样式
├── js/main.js           # 摄影 Gallery + 灯箱 + 主题切换等交互
├── assets/
│   ├── images/          # 摄影作品图片（按分类分目录）
│   └── videos/          # 视频作品（按分类分目录）
│       ├── info-flow/    # 信息流剪辑（9个）
│       ├── beauty/       # 美妆口播（1个）
│       ├── ai-generated/ # AI工具生成（5个）
│       ├── drama/        # 剧情片（1个）
│       └── documentary/  # 作品集（1个）
├── film-camera-shop/    # 子项目：胶片相机电商网站（独立页面）
├── README.md
└── HANDOFF.md           # 本文档
```

## 四、最近改动（本轮 Claude 会话已完成并 push）

1. **新增「AI 营销内容生成器」项目** — 两处：
   - `index.html` 项目经历区新增第 8 张卡片（约 L405-428）
   - Vibe Coding 区新增第 3 张卡片（约 L690-712），带线上链接
2. **更新「卡姿兰」实习经历** — 岗位改为「视频剪辑」，文案强化数据导向 + A/B 测试 + 从0到1（约 L148-158）
3. **删除「用户思维」模块 4 处占位提示** — 原文字「👆 请根据你的实际情况修改这个例子」已全部清除

当前 git 状态：**working tree clean**，无未提交改动。最新提交 `d5b0ea8`。

## 五、当前待办事项

### 1. 更新「信息流剪辑」视频（用户正在做，优先级最高）
- 视频存放路径：`assets/videos/info-flow/`
- 当前有 9 个视频，共 238MB，文件清单：

| # | 文件 | 大小 |
|---|------|------|
| 1 | infoflow-01.mp4 | 50M |
| 2 | infoflow-02.mp4 | 26M |
| 3 | infoflow-03.mp4 | 48M |
| 4 | infoflow-04.mp4 | 41M |
| 5 | infoflow-05.mp4 | 36M |
| 6 | infoflow-06.mp4 | 31M |
| 7 | infoflow-ai-01.mp4 | 2.0M |
| 8 | infoflow-ai-02.mp4 | 2.1M |
| 9 | infoflow-ai-03.mp4 | 3.1M |

- 用户计划：删除部分旧视频 + 拖入新视频
- 更新后需要同步修改 `index.html` 两处：
  1. 缩略图 strip 区（`#strip-info-flow`，约 L484-492）— 每删一个视频删一行 `div.video-card__thumb`，每加一个视频加一行
  2. 作品数量 `<p class="video-card__count">9 个作品</p>`（约 L496）
- 缩略图行格式（注意 data-idx 和 thumb-index 从 0 开始递增）：
  ```html
  <div class="video-card__thumb" data-idx="9" data-src="assets/videos/info-flow/infoflow-07.mp4" onclick="changeVideo('info-flow',9,this)"><video src="assets/videos/info-flow/infoflow-07.mp4" muted preload="metadata"></video><span class="video-card__thumb-index">10</span></div>
  ```

### 2. Vibe Coding 预览图占位（低优先级）
- AI 营销内容生成器卡片（约 L693-696）预览区目前是占位背景 +「截图准备中」提示
- 胶片相机网站卡片（约 L646-649）预览区同样是占位
- 需等用户提供实际网站截图后替换

## 六、重要注意事项

1. **视频文件大小**：GitHub 对单文件有 100MB 硬限制。建议每个视频 ≤50MB，否则 push 会失败。历史经验是视频压缩到 22MB 以内再传。
2. **视频文件名**：必须用英文/数字（如 `infoflow-07.mp4`），不要用中文或空格，否则 GitHub Pages 路径会出错。
3. **部署方式**：直接 push 到 `main` 分支即可，GitHub Pages 自动部署，无需构建步骤。
4. **摄影 Gallery 数据**：摄影图片不是写死在 HTML，而是由 `js/main.js` 里的数据数组动态渲染，改摄影图片要去 `js/main.js` 找对应的分类数组。
5. **胶片相机电商网站**是独立子项目，有独立的管理后台（`film-camera-shop/manage-7xk2.html`），图片通过 GitHub API 上传，数据存 localStorage。

## 七、常用 Git 命令

```bash
cd /Users/caraharal/personal-website
git add -A
git commit -m "描述改动"
git push
```

## 八、其他关联项目

- **AI 营销内容生成器**（本次新增到作品集的项目）：
  - 代码位置：`/Users/caraharal/Desktop/ai-marketing-generator`
  - 线上：https://ai-marketing-generator-one.vercel.app
  - 技术栈：Next.js 16 + TypeScript + Tailwind + Claude API + Vercel
