# 前端开发全景设计规范 (Frontend Design & Architecture System)

本文档系统性地记录了 **Shuo Blog** 前端工程的设计规范、视觉体系、字体排版、配色令牌、物理交互动效以及核心组件与页面架构，作为全站前端开发、重构与维护的标准设计指南。

---

## 目录 (Table of Contents)

1. [设计理念与视觉美学 (Design Philosophy)](#1-设计理念与视觉美学-design-philosophy)
2. [字体与排版体系 (Typography System)](#2-字体与排版体系-typography-system)
3. [色彩系统与设计令牌 (Color System & Tokens)](#3-色彩系统与设计令牌-color-system--tokens)
4. [物理动效与交互规范 (Motion & Physics Interactions)](#4-物理动效与交互规范-motion--physics-interactions)
5. [全站页面与路由架构 (Pages & Routes)](#5-全站页面与路由架构-pages--routes)
6. [组件库与使用清单 (Component Catalog)](#6-组件库与使用清单-component-catalog)
7. [数据架构与状态持久化 (State & Storage Architecture)](#7-数据架构与状态持久化-state--storage-architecture)
8. [技术栈与核心依赖 (Tech Stack)](#8-技术栈与核心依赖-tech-stack)

---

## 1. 设计理念与视觉美学 (Design Philosophy)

项目遵循 **“克制即尊重”（Restraint as Respect）** 的独立数字杂志美学与 **Apple / Emil Kowalski UI 设计工程哲学**：
- **消解视觉噪音**：无弹窗、无干扰性横幅广告、无侵入式推销，保留阅读的呼吸感与宁静。
- **杂志级排版节奏**：大号古典衬线体标题搭配现代无衬线正文，遵循 65ch 黄金阅读行宽与 1.85x 行高。
- **物理真实感反馈**：引入基于真实光照渲染的 3D 钛金属名片、Apple 弹簧阻尼滑块、以及视口圆形扩散主题切换。

---

## 2. 字体与排版体系 (Typography System)

字体加载配置位于 `src/styles/fonts.css`，采用 Google Fonts CDN 配合本地回退字体栈。

### 2.1 字体家族分类

| 字体分类 | 字体名称 | 引入形式 | 适用场景 |
| :--- | :--- | :--- | :--- |
| **Editorial Serif**<br>*(古典衬线体)* | **Fraunces**<br>*(可变光学尺寸 `opsz: 9..144`)* | `@import fonts.css` | 品牌 Logo (`Shuo`)、各页面主标题 (H1)、章节大标题 (H2)、金句引用 (Blockquote) |
| **Modern Sans**<br>*(现代无衬线)* | **Inter** / **Apple System UI** | `@import fonts.css` + `system-ui` | 正文段落（中英文阅读）、菜单导航、按钮标签、输入表单、卡片导言与 Studio 控制台 |
| **Technical Mono**<br>*(等宽代码体)* | **System Monospace**<br>*(SF Mono, Menlo, Monaco, Consolas)* | 系统本地字体栈 | 发布日期、阅读时长、章节小地图计数器、代码块、数据看板数字 (Tabular Figures)、URL 路径 |

### 2.2 排版尺度与行高标准

- **正文行宽 (Measure)**：文章正文锁在 `max-w-3xl`（约 `680px`），每行字数维持在 60–75 字符（中文字符 35–45 字）。
- **段落行高 (Line Height)**：正文为 `leading-[1.85]`；大标题为 `leading-[1.14 ~ 1.15]`；次级标题为 `leading-[1.25]`。
- **字偶间距 (Kerning & Tracking)**：大标题启用 `tracking-tight`，等宽数字与元标签启用 `tracking-wide` / `uppercase`。

---

## 3. 色彩系统与设计令牌 (Color System & Tokens)

色彩体系在 `src/styles/theme.css` 中基于 **Tailwind CSS v4** 与 **OKLCH 色彩空间** 定义，支持全站暗色模式（Dark Mode）与流畅的主题切换。

### 3.1 核心语义色彩令牌 (Semantic Tokens)

```css
/* 亮色模式 (Light Theme) */
:root {
  --background: #ffffff;
  --foreground: oklch(0.145 0 0);           /* 深墨黑 */
  --card: #ffffff;
  --card-foreground: oklch(0.145 0 0);
  --primary: #030213;
  --primary-foreground: oklch(1 0 0);
  --muted: #ececf0;
  --muted-foreground: #717182;             /* 柔和石板灰 */
  --accent: #e9ebef;
  --border: rgba(0, 0, 0, 0.1);             /* 10% 微透明细边框 */
  --input-background: #f3f3f5;
  --radius: 0.625rem;                      /* 基础圆角 10px */
}

/* 暗色模式 (Dark Theme) */
.dark {
  --background: oklch(0.145 0 0);          /* 深邃黑曜石底色 */
  --foreground: oklch(0.985 0 0);          /* 纯净纸白 */
  --card: oklch(0.145 0 0);
  --card-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --border: oklch(0.269 0 0);              /* 暗调柔和分割线 */
}
```

### 3.2 强调色谱 (Accent Palette)

- 🔵 **Blue (`#2563eb` / `oklch(0.6 0.18 ...)` )**：交互链接、浏览量 (PV)、激活态高亮；
- 🟢 **Emerald (`#10b981` / `oklch(0.696 0.17 162.48)` )**：成功状态、完读率增长、GitHub 贡献活跃绿点；
- 🟣 **Purple (`#8b5cf6` / `oklch(0.488 0.243 264.376)` )**：读者数 (UV)、特别标签；
- 🔴 **Rose / Red (`#f43f5e` / `oklch(0.637 0.237 25.331)` )**：爱心点赞、警告与删除操作；
- 🟠 **Amber (`#f59e0b` / `oklch(0.769 0.188 70.08)` )**：阅读时长、星标高亮。

---

## 4. 物理动效与交互规范 (Motion & Physics Interactions)

动效设计深度吸纳 **Emil Kowalski 《You Don't Need Animations》** 与 Apple 物理弹簧工程哲学——**“最好的动效，有时就是没有动效”（Sometimes the best animation is no animation）**。

### 4.1 动效四大黄金法则 (Four Golden Principles)
1. **有目的性 (Purposeful)**：
   - **状态确认**：所有交互按钮与卡片底栏均配备微触觉按压反馈（`active:scale-[0.96~0.97]`）；
   - **空间连续性**：章节小地图与页面跳转遵循视口物理运动方向。
2. **交互频次决定动效 (Frequency of Use)**：
   - **高频操作零动画/极速响应**：后台 Studio CMS 编辑器、工具栏与列表操作无冗余动画，点击即刻响应；
   - **键盘触发行为**：键盘操作与 Tab 切换严禁附加平移动效，采用清晰聚焦环（`focus-visible:ring`）瞬时高亮；
   - **列表高频 Hover**：过渡时长控制在 `duration-150` 以内，避免拖泥带水。
3. **速度感知与 300ms 天花板 (Perception of Speed & 300ms Ceiling)**：
   - 阅读页中英双语切换压进 `160ms ~ 180ms` 黄金感知区间；
   - 所有通用 UI 动效严格控制在 `300ms` 以内完成。
4. **无障碍动效降级 (Reduced Motion Support)**：
   - 适配 `prefers-reduced-motion: reduce`，针对动效敏感用户自动降级为静态瞬切。

### 4.2 核心动效实现清单 (Motion Implementations)
1. **Apple 缓动曲线**：
   - 进场/出场：`transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}`；
   - 模糊淡入：初始 `opacity: 0, y: 8, filter: "blur(4px)"` → 稳定态 `opacity: 1, y: 0, filter: "blur(0px)"`。
2. **主题圆形光波扩散 (View Transitions Circular Reveal)**：
   - `src/app/components/theme-toggle.tsx` 配合 `document.startViewTransition()`，点击时以按钮中心坐标向全屏扩散圆形遮罩裁剪（`clip-path: circle(...)`）。
3. **物理弹簧滑块切换 (Continuous Tabs Spring Slider)**：
   - 采用 `type: "spring", stiffness: 450, damping: 32, mass: 0.8` 配合 `layoutId`，实现灵敏且无多余晃动的跟手切换。
4. **小地图物理距离感应 (Proximity Minimap)**：
   - `src/app/components/ui/proximity-sidebar.tsx` 鼠标滑动时根据 Y 轴距离动态拉长指示线条（`useSpring`），并实时高亮视口当前章节。

---

## 5. 全站页面与路由架构 (Pages & Routes)

路由由 `react-router` 驱动，分为 **前台读者端 (Public)** 与 **后台创作控制台 (Studio CMS)**：

```
/ (Layout)
├── / ........................... 博客首页 (Home): 双列紧凑 Twitter/X 式长文卡片流
├── /post/:slug ................. 文章沉浸阅读页 (Post): 双栏排版 + 置顶头图 + 章节小地图
├── /about ...................... 关于作者 (About): 3D 钛金属名片 + 生平故事 + GitHub 贡献热力图
│
└── /admin (AdminLayout)
    ├── /admin/login ............ Studio 密码验证登录网关
    ├── /admin .................. 文章总览与操作看板 (PostList)
    ├── /admin/new .............. 新建文章编辑器 (双模 Markdown + 拖拽上传头图)
    ├── /admin/edit/:slug ....... 编辑已有文章 (PostEditor)
    └── /admin/settings ......... 数据趋势分析 + Studio 中英双语切换 + 密码安全设置
```

---

## 6. 组件库与使用清单 (Component Catalog)

所有组件均位于 `src/app/components/` 及其子目录 `src/app/components/ui/` 下：

### 6.1 前台核心展示组件

| 组件名称 | 文件路径 | 职责与功能特性 |
| :--- | :--- | :--- |
| **`ArticleCard`** | `src/app/components/ui/article-card.tsx` | Twitter/X 深度长文卡片：包含 16:9 封面、微缩放悬停、加粗标题、2行主题导言、分类标签与即时点赞/转发底栏。 |
| **`ProximitySidebar`** | `src/app/components/ui/proximity-sidebar.tsx` | 文章左侧物理距离感应目录小地图：动态计算鼠标与滚动的物理距离伸缩线条，支持平滑滚动定位。 |
| **`MarkdownRenderer`** | `src/app/components/ui/markdown-renderer.tsx` | 标准 Markdown 语法解析渲染器：支持 H1~H3、引用块、列表、代码高亮复制、加粗斜体及图片展示。 |
| **`PersonalCard`** | `src/app/components/personal-card.tsx` | 基于 `@react-three/fiber` 的 **3D 钛金属质感名片**：支持鼠标陀螺仪物理倾斜、动态环境光全息反射与微磨砂贴图。 |
| **`GitHubActivity`** | `src/app/components/github-activity.tsx` | 动态 GitHub 贡献矩阵：读取实时或模拟贡献数据，以墨绿阶梯色块呈现开发者活跃度。 |
| **`ThemeToggle`** | `src/app/components/theme-toggle.tsx` | 3D 触觉质感主题开关：配合 View Transition API 实现圆形光波扩散明暗切换。 |
| **`NowPlayingBar`** | `src/app/components/now-playing-bar.tsx` | 右下角悬浮氛围音乐播放条：带声波跳动微动效与播放控制。 |

### 6.2 交互与控制组件

| 组件名称 | 文件路径 | 职责与功能特性 |
| :--- | :--- | :--- |
| **`ContinuousTabs`** | `src/app/components/ui/continuous-tabs.tsx` | Apple 物理弹簧滑块选项卡：用于 Studio 导航、时间范围切换与中英文语言切换。 |
| **`DiscreteTabs`** | `src/app/components/ui/discrete-tabs.tsx` | 顶部主导航栏选项卡：提供平滑胶囊切换效果。 |
| **`Badge`** | `src/app/components/ui/badge.tsx` | 文章主题胶囊标签：用于渲染 `#Writing`、`#Craft` 等分类微标签。 |

---

## 7. 数据架构与状态持久化 (State & Storage Architecture)

全站无需复杂重型后端数据库，通过结构化 Store 与 `localStorage` 实现高可靠的持久化与离线创作：

1. **文章数据中心 (`usePostsStore`)**
   - 文件：`src/app/services/posts-store.ts`
   - 机制：持久化 key 为 `shuo_blog_custom_posts_v1`。初始内置 4 篇深度中英文双语文章，用户在 Studio 新建、修改、删除的文章及本地上传的 Base64 图片均直接保存在本地存储中，前后台即时联动。
2. **流量与互动引擎 (`analytics-store.ts`)**
   - 文件：`src/app/services/analytics-store.ts`
   - 机制：根据文章 slug 生成稳定且具物理现实感的数据（PV、UV、点赞数、停留时长、完读率与 14 天趋势），并支持读者即时点赞自增。
3. **Studio 国际化系统 (`StudioI18nProvider`)**
   - 文件：`src/app/services/studio-i18n.tsx`
   - 机制：提供完整的 `zh`（简体中文）与 `en`（English）字典，支持 Studio 界面一键热切换。

---

## 8. 技术栈与核心依赖 (Tech Stack)

- **核心框架**：`React 18.3` + `TypeScript` + `Vite 6`
- **路由系统**：`React Router 7`
- **样式方案**：`Tailwind CSS v4` + `@tailwindcss/vite` + `tw-animate-css`
- **动效引擎**：`Framer Motion 13` (`motion/react`)
- **3D 渲染**：`Three.js` + `@react-three/fiber` + `@react-three/drei`
- **图标库**：`Lucide React`
- **构建工具**：`Vite 6`（全模块打包耗时 < 1.3s，零警告构建）
