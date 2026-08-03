# 慢帧时光 film — 胶片相机集市

胶片相机销售 H5 网页，纯静态，手机端优先，复古胶片视觉风格。

## 快速开始

直接在浏览器打开 `index.html` 即可预览。

---

## 文件结构

```
film-camera-shop/
├── index.html          # 首页 — 相机卡片列表
├── detail.html         # 详情页 — 图片轮播/视频/信息/操作按钮
├── css/
│   └── style.css       # 全局样式（一般不需要改）
├── js/
│   ├── cameras.js      # 📍 相机数据 — 你主要改这个！
│   └── main.js         # 📍 全局配置 — 改微信号和闲鱼链接
├── images/
│   └── placeholder.svg # 占位图（替换为你的照片）
├── videos/             # 📍 视频文件放这里
└── README.md           # 本文件
```

---

## 你需要做的事情

### 第一步：修改全局配置

打开 `js/main.js`，找到最顶部的 `SITE_CONFIG`：

```js
var SITE_CONFIG = {
  wechatId: '你的微信号',       // ← 改这里
  xianyuLink: '你的闲鱼链接',   // ← 改这里
  siteName: '慢帧时光',
  siteSubtitle: 'film camera market'
};
```

### 第二步：修改相机数据

打开 `js/cameras.js`，每个相机对象的字段说明：

| 字段 | 说明 | 示例 |
|------|------|------|
| `id` | 唯一标识（英文+连字符，不要重复） | `'contax-t2'` |
| `name` | 显示名称 | `'Contax T2'` |
| `brand` | 品牌 | `'Contax'` |
| `model` | 型号 | `'T2'` |
| `price` | 价格（纯数字，不加 ¥） | `3800` |
| `condition` | 成色标签 | `'9成新'` |
| `images` | 图片路径数组 | `['images/contax-1.jpg']` |
| `video` | 视频路径（可留空 `''`） | `'videos/contax.mp4'` |
| `accessories` | 附件清单 | `['镜头盖', '皮套']` |
| `description` | 详细描述 | `'经典口袋胶片机...'` |

**添加新相机**：复制文件末尾的模板，去掉注释符号 `//`，修改内容即可。

### 第三步：替换图片和视频

1. 拍好相机照片 → 放进 `images/` 文件夹
2. 拍好相机视频 → 放进 `videos/` 文件夹
3. 回到 `js/cameras.js`，把 `images` 和 `video` 字段的路径改成实际文件名

**图片命名建议**：`相机英文名-编号.jpg`，例如 `contax-t2-1.jpg`

---

## 如何部署到免费托管平台

### 方案一：GitHub Pages（推荐，完全免费）

1. 注册 [GitHub](https://github.com) 账号
2. 创建一个新仓库，命名为 `film-camera-shop`
3. 把整个项目文件夹上传到仓库
4. 进入仓库 → Settings → Pages → Source 选择 `main` 分支 → Save
5. 等待 1 分钟后，访问 `https://你的用户名.github.io/film-camera-shop/`
6. 把链接发给别人就行！

### 方案二：Vercel（免费，国内访问快）

1. 注册 [Vercel](https://vercel.com)
2. 导入 GitHub 仓库
3. 自动部署，获得 `xxx.vercel.app` 域名

### 方案三：Netlify（免费，拖拽上传）

1. 打开 [Netlify](https://netlify.com)
2. 注册后进入 Sites，把 `film-camera-shop` 整个文件夹拖进去
3. 自动获得 `xxx.netlify.app` 域名

---

## 技术栈

- 纯 HTML + CSS + 原生 JavaScript
- 零外部依赖，零框架
- 移动端优先，响应式设计
- 原生触摸滑动轮播

---

## 许可证

MIT
