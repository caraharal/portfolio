# 个人作品集网站

简约现代风格的个人作品集网站，纯静态 HTML/CSS/JS 构建，零依赖。

## 功能特性

- 🎨 **现代简约设计** — 干净的排版与布局
- 🌓 **暗色/亮色主题** — 一键切换，自动记忆偏好，跟随系统主题
- 📱 **响应式设计** — 完美适配手机、平板和桌面端
- ✉️ **联系表单** — 客户端验证 + Formspree 后端
- 🧭 **平滑滚动导航** — Intersection Observer 高亮当前板块
- 🎭 **滚动动画** — 元素进入视口时优雅展示
- ♿ **无障碍访问** — 语义化 HTML、ARIA 标签、键盘导航
- ⚡ **高性能** — 零 JS 框架，零构建步骤，秒开体验

## 快速开始

### 本地预览

直接用浏览器打开 `index.html`：

```bash
open index.html
```

或使用任意本地服务器：

```bash
# Python 3
python3 -m http.server 8000

# Node.js (npx)
npx serve .
```

然后访问 `http://localhost:8000`

### 自定义内容

1. **个人信息**：编辑 `index.html`，将"你的名字"、"your-email@example.com" 等处替换为你的真实信息
2. **项目作品**：在项目卡片区修改项目名称、描述、技术标签和链接
3. **技能**：在技能区更新你的技能列表和熟练度
4. **联系表单**：在 [Formspree](https://formspree.io) 注册免费账号，获取你的 form ID，替换 `index.html` 中表单 `action` 属性的 `your-form-id`
5. **头像**：将你的头像图片放入 `assets/images/` 并更新 HTML 中的引用

## 技术栈

- HTML5 语义化标签
- CSS3（自定义属性、Grid、Flexbox、动画）
- Vanilla JavaScript（ES5/ES6）
- Google Fonts (Inter)
- Formspree（表单后端）

## 文件结构

```
personal-website/
├── index.html          # 主页面
├── css/
│   └── style.css       # 样式表
├── js/
│   └── main.js         # 交互脚本
├── assets/
│   └── images/         # 图片资源
└── README.md
```

## 部署

本网站为纯静态文件，可部署到任何静态托管平台：

- **GitHub Pages** — 免费，推送即部署
- **Netlify** — 拖拽部署，自带表单处理
- **Vercel** — 一键部署
- **Cloudflare Pages** — 全球 CDN 加速

### GitHub Pages 部署示例

```bash
# 1. 创建仓库并推送代码
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main

# 2. 在仓库 Settings → Pages 中启用 GitHub Pages
# 选择 main 分支作为源，保存即可
```

## 浏览器支持

支持所有现代浏览器（Chrome、Firefox、Safari、Edge）。

## 许可

MIT License
