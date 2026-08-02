@AGENTS.md

# 项目说明

练手项目：复刻 [lightpollutionmap.app](https://lightpollutionmap.app) 的核心功能（光污染地图 + Bortle/SQM 点位查询），目标是学习全栈开发流程和 Claude Code 建站工作流。用户是全栈新手，边做边学，讲解时倾向解释概念而不是只给结论。

## 技术栈

- Next.js (App Router，webpack 而非 Turbopack，见下方"已知坑点") + TypeScript + Tailwind CSS v4
- 地图：MapLibre GL JS v6（免费开源，无需 API key）
- 光污染数据：Google Earth Engine（NOAA VIIRS 卫星年度合成数据 `NOAA/VIIRS/DNB/ANNUAL_V22`），服务端通过服务账号认证调用
- 地点搜索：Nominatim (OpenStreetMap) 地理编码，经后端 API 路由代理
- 部署：Vercel，代码仓库 [MorningSeven77/lightpollution-clone](https://github.com/MorningSeven77/lightpollution-clone)，线上地址 https://lightpollution-clone.vercel.app

## 目录约定

- `src/app/api/*/route.ts` — 后端接口（geocode 代理、Earth Engine 瓦片/点位查询）
- `src/components/` — React 组件（`Map.tsx` 是核心，受控组件，见下方）
- `src/lib/` — 工具函数与第三方服务封装（Earth Engine 认证、Bortle/SQM 换算、URL 状态同步、配色/底图配置）
- `scripts/copy-maplibre-worker.mjs` — postinstall 时把 maplibre worker 文件复制到 `public/maplibre/`，不要删

## 当前进度

- **MVP 闭环**：地图 + 真实 VIIRS 光污染叠加层 + 点击查询 Bortle/SQM + 地点搜索 + URL 分享，全部完成并部署上线
- **批次二·视觉改版**：4 套配色风格（经典/柔光/科幻/群光）+ 底图切换（暗色/浅色/彩色）+ 透明度滑块 + 右上角设置面板，全部完成并部署上线
- **批次三·第一项·位置详情面板**：点击地图弹出左侧常驻面板（坐标、反查地名、大字 Bortle、SQM、粗略可见恒星数），替换了原来的小气泡，全部完成并部署上线
- **后续候选批次**（用户按此优先级排的序，还没做）：
  1. 历史趋势图（查 Earth Engine 历年 VIIRS 数据，画某个点多年的光污染变化趋势）
  2. 暗空地点图层 / 极光图层 / 天气叠加 / 昼夜分界线（这几个都需要接入全新的第三方数据源，工作量最大，放最后）

## 已知坑点（踩过的坑，遇到类似问题不用重新排查一遍）

- **maplibre-gl v6 地图纯黑不渲染**：v6 是纯 ESM 包，打包工具解析不了它内部 Web Worker 的脚本地址，必须手动 `setWorkerUrl()`（已在 `Map.tsx` 里处理）。worker 文件还用相对路径 import 了一个同目录的 `maplibre-gl-shared.mjs`，不能指向打包工具生成的带 hash 文件名路径，所以用 `scripts/copy-maplibre-worker.mjs` 在 postinstall 时复制到 `public/maplibre/` 保持原文件名。
- **图层遮住地图文字**：`map.addLayer()` 不传第二个参数会把新图层加到最顶层，盖住底图的文字标注。要用 `map.getStyle().layers.find(l => l.type === "symbol")?.id` 找到第一个文字图层传进去。
- **VIIRS 瓦片像素马赛克感**：原始分辨率约 463m/像素，缩放到街道级别很明显。用 `image.resample("bilinear")`（只用于生成瓦片图那次调用，不影响 `point-value` 用的原始像素值）能让色块平滑过渡。
- **Earth Engine `getMap()`/`visualize()` 不允许同时传 `gamma` 和 `palette`**，会直接报错。
- **`@google/earthengine` 这个包的 Node 客户端完全不支持走代理**（内部用老式 xmlhttprequest，请求写死 `agent: false`）。本机需要在 Clash Verge 里开 **TUN 模式**（系统网络层接管全部流量）才能连上 `earthengine.googleapis.com`。如果换一台电脑本来就能直连境外服务，这步可以跳过——`src/instrumentation.ts` 里给普通 `fetch` 用的代理逻辑是按有没有设 `HTTP_PROXY`/`HTTPS_PROXY` 环境变量自动判断的，没设就不启用。
- **`git push` 卡死不报错**：如果这台电脑是新装的 `gh` CLI，`gh repo create --push` 能成功是因为它自己处理认证，但后续单独 `git push` 会因为 git 没配置凭证助手卡在等一个不会来的密码输入。解决：跑一次 `gh auth setup-git`。
- **maplibre-gl `Marker` 先 `addTo()` 再 `setLngLat()` 会报错**：`Cannot read properties of undefined (reading 'lng')`。`addTo(map)` 内部要读 marker 自己的经纬度算初始屏幕位置，所以必须先 `.setLngLat()` 再 `.addTo(map)`（链式调用顺序：`new Marker().setLngLat([lng,lat]).addTo(map)`）。
- **Nominatim 反向地理编码查不到地名时返回 200**：不是失败状态码，响应体里是 `{"error":"Unable to geocode"}`，要当正常的"无地名"结果处理，不能当成上游请求失败。

## 注意事项

- Earth Engine 服务账号密钥用 `EARTH_ENGINE_SERVICE_ACCOUNT_KEY_B64` 这个环境变量（base64 编码后的完整 JSON key），放在 `.env.local`（已在 .gitignore 中排除，绝不提交到仓库）。本机之外的新环境需要单独配置这个变量（Vercel 在项目设置里配，本地开发就建 `.env.local` 文件）。
- `npm run dev` / `npm run build` 都带了 `--webpack` 参数，故意不用默认的 Turbopack（排查 maplibre 渲染问题时发现的兼容性顾虑，webpack 更稳）。
