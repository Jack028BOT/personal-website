# 个人作品集

> 新媒体运营 / 内容运营 / 网页开发

零依赖、零构建的静态作品集。双击 `index.html` 就能打开，也可以直接部署到任意静态托管。

---

## 一、快速开始

**本地看**：双击 `index.html`（不需要服务器、不需要装任何东西）

**跑测试**（需要 Node）：

```bash
cd .workbuddy/tools
NODE_PATH="C:/Users/86198/.workbuddy/binaries/node/workspace/node_modules" node _e2e.js
python _static_check.py
```

- `_e2e.js` —— 51 项端到端测试（首页结构、作品卡无装饰件、主题切换与记忆、云热区转发、轮播卡组、详情页加载、上下站闭环、移动端无横滚、数字滚动、console error = 0）
- `_static_check.py` —— 静态校验（占位符残留、旧数据口径污染、链接与图片可达性、数据口径上下文、编码完整性）

**重新生成详情页**：`python .workbuddy/tools/_gen_works.py`（6 页内容集中在脚本顶部的 `PAGES` 字典里，改内容改那里）

**部署**：把整个目录传到 GitHub Pages / Vercel / Netlify / 任意静态空间即可，无构建步骤。

---

## 二、目录结构

```
index.html                 首页（单页简历版：简介 + Selected work + Client works）
works/                     作品详情页 × 6
├─ cute-face-grid.html      萌系贴贴生成器
├─ tincase.html             铁盒贴
├─ pre-grid.html            Pre 素材库（内容整理中 · 占位页）
├─ caotai.html              什么是草台班子
├─ data-review.html         数据复盘
└─ workspace.html           我的大学工作台

demo/                      可直接点开的真实作品 × 5
├─ workspace.html   minecraft.html   agent-farm.html
└─ crt-home.html   ai-manual.html

assets/
├─ css/
│  ├─ tokens.css            设计令牌 + 本地字体 @font-face（改配色只动这里）
│  ├─ base.css              reset / 骨架 / 模式开关
│  ├─ home.css              首页：简历模式 + 作品模式
│  ├─ work.css              详情页 11 模块
│  └─ deco.css              像素装饰 + 响应式断点
├─ js/
│  └─ site.js               像素画生成 / 云视差 / 戳云彩 / 像素鸟 / 主题切换 / 摇树 / 轮播卡组 / 数字滚动（共享）
├─ fonts/                   6 个 latin 子集 woff2（252 KB）
└─ img/shots/               21 张素材截图（3.3 MB）
```

---

## 三、数据口径对照表 ⚠️ 最重要的一张表

这个站有两套数字，**不能混用**。面试被追问时按这张表回答。

| 指标 | 账号累计口径 | 复盘样本口径 | 说明 |
|---|---|---|---|
| 笔记数 | **63 篇** | 28 篇 | 复盘只做了 28 篇，不是全量 |
| 赞藏 | **1.4W** | 4,662 赞藏评 | 4,662 是"赞+藏+评"总数，不是赞藏 |
| 粉丝 | **597** | 涨粉 80 | 80 是这 28 篇带来的 |
| 单篇最高赞藏 | **7,500+** | — | 指《萌系贴贴生成器》那条 |
| 总曝光 | — | **234,762** | 仅 28 篇样本 |
| 封面点击率 | — | **13.3%** | 基准约 10%，判定「优秀」 |
| 互动率 | — | **16.1%** | 基准 5%+，判定「远超基准」 |
| 收藏率 | — | **5.9%** | 目标 8%+，判定「接近但未达标」 |
| 分享率 | — | **1.2%** | 目标 2%+，判定「未达标」 |
| 评论占互动比 | — | **3.7%**（174/4,662） | 判定「严重偏低」 |

**铁盒贴**（不同时点，后台数据持续增长）：

| 时点 | 点赞 | 收藏 | 赞藏合计 |
|---|---|---|---|
| 9-25 发布当周 | 100 | 92 | 192 |
| 10-29 | 125 | 119 | 244 |
| **10-31（站内唯一口径）** | **352** | **340** | **692** |

其他：另运营 180+ 人社群；英语四级 512 / 六级 460。

> 站上每一处「28 篇」都带「样本 / 复盘 / 逐篇」限定，由 `_static_check.py` 自动校验。

---

## 四、视觉与实现说明

**基调**：白底 + 钴蓝 `#3b5bff` + 灰阶，保留模板的像素装饰（云朵 / 太阳月亮 / 小鸟 / 鸟窝）。

**中文适配**（模板原本按英文排版，已逐项修正）：

| 项目 | 原值 | 现值 | 原因 |
|---|---|---|---|
| `.article p` | `max-width: 74ch` | `40em` | `ch` 按"0"宽算，中文会挤成窄条 |
| `.ch-blurb` | `62ch` | `38em` | 同上 |
| `.fv-desc` | `58ch` | `36em` | 同上 |
| `.gm-note` | `62ch` | `40em` | 口径说明段是长中文句 |
| `.project-title` | `nowrap` | `normal` + `overflow-wrap` | 中文标题长，nowrap 会横向溢出 |
| `.kw-pop` | `nowrap` | `normal` + `max-width: 240px` | hover 弹卡内容变长 |
| 字体栈 | 仅拉丁 | 追加 PingFang SC / 微软雅黑 / Noto Sans SC | 三款 Google 字体都没有中文字形 |

**字体**：Bricolage Grotesque（标题）/ Hanken Grotesk（正文）/ JetBrains Mono（标签），均为 SIL Open Font License 1.1。自托管 latin 子集 woff2（252 KB），断网可用；CSS 里保留 Google Fonts 远程地址作为兜底源。

**响应式**：≤900px 收窄栏位、≤640px 详情页数据卡改两列、≤560px 头像缩小。已在 1440 / 768 / 390 / 375 四档验证无横向滚动（E2E 自动校验）；轮播卡组探出偏移在窄屏自适应收缩，`overflow-x: clip` 兜底。

**数字滚动**：页面里的数据（指标大字、作品页 stat 卡、简介与描述里的数字）由 JS 拆成 `<span class="cu">`，进视口时从 0 滚到终值（rAF + easeOutCubic，1.1s，同段内相邻数字错开 70ms）。拆分时按终值预留宽度（`tabular-nums` + `min-width`），滚动过程中段落不跳动；`prefers-reduced-motion` 下直接给终值。

**可访问性**：`prefers-reduced-motion` 全局压制动效；语义化标签 + `aria-*`；skip-link 已中文化。

---

## 五、素材来源

| 素材 | 来源 | 授权 |
|---|---|---|
| 21 张界面截图 | 本人作品实测截图 / 腾讯训练营结课证书（自采） | 自有 |
| `caotai-cover.jpg` | 《什么是草台班子》pptx 内 `docProps/thumbnail.jpeg` | 自有 |
| 6 个 woff2 | Google Fonts latin 子集 | OFL 1.1 |
| 像素云 / 日月 / 小鸟 / 鸟窝 | 字符画代码生成，无位图素材 | 自有 |
| 5 个 demo | 本人项目源码复制 | 自有 |

---

## 六、待补与待定清单

| # | 项 | 类型 | 位置 | 说明 |
|---|---|---|---|---|
| 1 | **真实邮箱** | 待补 | 首页暂无 Contact 区块，补邮箱时建议连同页脚联系方式一并加 | 页面上目前没有任何联系方式入口（详情页页脚有小红书主页链接） |
| 2 | 五个区块标题中文化 | 待定 | `Selected work` / `Client works` / `Creative coding` / `Visuals` / `Contact` | 目前保持英文原样（用户决定「先不加」） |
| 3 | 详情页「诚实短板」段 | 待定 | 6 个详情页第 ⑧ 模块 | 目前只写归因 / 经验 / 下一步。数据复盘页的 KPI 判定表照实保留（是客观结果，不是自我批评） |
| 4 | **Pre 内容体系** | 待定 | `works/pre-grid.html` + 首页 Pre 文件夹 | 当前是占位页。48 个主题的封面图导出脚本已备好（pptx 内 `docProps/thumbnail.jpeg`），补内容时一并跑 |
| 5 | 头像照片 | 可选 | `.profile-avatar` | 当前用 FS 字母块 |
| 6 | 太阳月亮排水动效 | 暂缓 | `.theme-toggle` | 方案已写好（圆形排水 + 像素画放弃 rotate/scale），待做 |

---

## 七、已知问题

- **浅色主题下月亮几乎隐形** —— 模板原有调色板 `#e8ecf5` 落在白底上对比度不足。不动主题色也能用，但要改建议加深月亮配色。
- **云朵会遮住太阳底部约 25%** —— 模板原有层级（云 z-index 11 > 日月 10）。是原站的构图风格，暂保留。
- **`demo/crt-home.html` 是 CRT 复古风**，与全站像素田园基调不同，但它作为「早期版本」在作品列表里出现，属于有意保留的对比。
