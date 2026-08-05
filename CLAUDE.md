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
- **批次三·第二项·历史趋势图**：位置详情面板里 Bortle/SQM 下方加了柱状趋势图（`src/components/TrendChart.tsx` + `src/app/api/trend/route.ts`），合并 VIIRS V21（2013-2021）+ V22（2022+）两个年度合成数据集，一次 `getRegion()` 拿到某个点全部年份的数据。已完成。
- **街道文字太粗**：底图 CJK 字体回退到较粗的字重，用 `text-halo-width` 调细（`Map.tsx` 的 `thinOutLabels`）。已完成。
- **世界视图下颜色图层太稀疏**：`tile-layer/route.ts` 生成瓦片的图像加了 `reduceResolution({reducer: ee.Reducer.max(), maxPixels: 1024, bestEffort: true})`，缩到最小时也能看到连成片的亮色区域，不再是稀疏光点。已完成，细节见下方已知坑点。
- **后续候选批次**（用户按此优先级排的序，还没做）：暗空地点图层 / 极光图层 / 天气叠加 / 昼夜分界线（这几个都需要接入全新的第三方数据源，工作量最大，放最后）

## 已知坑点（踩过的坑，遇到类似问题不用重新排查一遍）

- **maplibre-gl v6 地图纯黑不渲染**：v6 是纯 ESM 包，打包工具解析不了它内部 Web Worker 的脚本地址，必须手动 `setWorkerUrl()`（已在 `Map.tsx` 里处理）。worker 文件还用相对路径 import 了一个同目录的 `maplibre-gl-shared.mjs`，不能指向打包工具生成的带 hash 文件名路径，所以用 `scripts/copy-maplibre-worker.mjs` 在 postinstall 时复制到 `public/maplibre/` 保持原文件名。
- **图层遮住地图文字**：`map.addLayer()` 不传第二个参数会把新图层加到最顶层，盖住底图的文字标注。要用 `map.getStyle().layers.find(l => l.type === "symbol")?.id` 找到第一个文字图层传进去。
- **VIIRS 瓦片像素马赛克感**：原始分辨率约 463m/像素，缩放到街道级别很明显。用 `image.resample("bilinear")`（只用于生成瓦片图那次调用，不影响 `point-value` 用的原始像素值）能让色块平滑过渡。
- **Earth Engine `getMap()`/`visualize()` 不允许同时传 `gamma` 和 `palette`**，会直接报错。
- **`@google/earthengine` 这个包的 Node 客户端完全不支持走代理，分两条独立链路，都得单独修**（不再需要开 TUN 模式）：
  - **数据层请求**（瓦片、取值等）：内部用老式 `xmlhttprequest`，请求写死 `agent: false`。`src/lib/earthEngineTransport.ts` 把 `xmlhttprequest` 包导出的构造函数换成一个用 `fetch` 实现的替身。**关键坑**：`@google/earthengine` 的 `main.js` 在自己模块顶层用 `const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest` 把类**缓存成一个常量**（只在这个包第一次被 require 时执行一次，不是每次用的时候才读）。只在某个 API 路由自己的文件里 `import "./earthEngineTransport"` 不够早——实测发现 Next.js 在真正处理请求之前的某个阶段（应该是路由编译/分析）就已经把 `@google/earthengine` require 过一次，那次拿到的还是原始未替换的类，之后不管怎么改路由文件里的 import 顺序都没用。**真正的修复是把这个 import 挪到 `src/instrumentation.ts` 的 `register()` 里**——这是 Next.js 保证全局最早执行的地方，比任何路由模块都早。另外 `next.config.ts` 里给 `@google/earthengine` 和 `xmlhttprequest` 都加了 `serverExternalPackages`，让它们走 Node 真正的 `require()` 缓存而不是被 webpack 按路由各打一份包（避免同一个包在不同路由里出现两份不同的模块实例）。顺带抓到一个真 bug：`xmlhttprequest` 对不带 body 的 GET 请求会调用 `send("")`，但原生 `fetch()` 只要 GET/HEAD 请求带了 body（哪怕是空字符串）就直接抛错，得转成 `body ? body : undefined`。
  - **认证请求**（拿 access token）：`ee.data.authenticateViaPrivateKey` 内部用 googleapis 的 `google.auth.JWT`，走 `gaxios`，跟上面那条链路完全独立，不受 xmlhttprequest 补丁影响。`gaxios` 会根据 `HTTP_PROXY`/`HTTPS_PROXY` 构造一个 Node 风格的 `HttpsProxyAgent`，但它实际发请求用的是 Node 原生 `fetch`——原生 `fetch` 根本没有 `agent` 这个选项，这个代理配置被静默丢弃，认证请求直接走直连，在需要代理才能连 Google 的网络下必然失败。**修复：不走 `authenticateViaPrivateKey`，改成自己手写 RFC 7523 JWT-bearer token 交换**（`earthEngine.ts` 的 `getGoogleAccessToken`，用 Node `crypto.createSign` 签名 + `undici` 包自己的 `fetch`/`ProxyAgent`），拿到 token 后用 `ee.data.setAuthToken(...)` 直接灌给 EE，完全绕开 gaxios。这里也有个坑：**必须用 `undici` npm 包自己导出的 `fetch` 搭配它自己的 `ProxyAgent`**，不能把 `undici` 的 `ProxyAgent` 塞给 Node 原生 `fetch`（`instrumentation.ts` 里 `setGlobalDispatcher` 设的默认代理同理不可靠）——原生 `fetch` 内部用的是 Node **自带**的 undici 版本，跟 `node_modules` 里装的 `undici` npm 包版本不一定一致，混用会报 `InvalidArgumentError: invalid onRequestStart method`。两个函数都通过 `earthEngineTransport.ts` 导出的 `getUndiciClient()` 复用同一份 fetch+dispatcher。
- **`reduceResolution` 的 `maxPixels` 硬上限是 1024，缩到最小时可能不够用**：给 VIIRS 瓦片加 `reduceResolution({reducer: max, maxPixels: 1024})` 解决"世界视图下颜色稀疏成一个个光点"的问题时，缩到最低的几级（z=0-3 左右），一个输出像素覆盖的原始像素数会超过 1024，直接报 `Too many input pixels per output pixel`。加 `bestEffort: true` 就行——超过上限时会退化成"抽样聚合"而不是直接报错，视觉上区别不大（反正只是判断"这片区域亮不亮"，不需要精确聚合每一个像素）。
- **`git push` 卡死不报错**：如果这台电脑是新装的 `gh` CLI，`gh repo create --push` 能成功是因为它自己处理认证，但后续单独 `git push` 会因为 git 没配置凭证助手卡在等一个不会来的密码输入。解决：跑一次 `gh auth setup-git`。
- **maplibre-gl `Marker` 先 `addTo()` 再 `setLngLat()` 会报错**：`Cannot read properties of undefined (reading 'lng')`。`addTo(map)` 内部要读 marker 自己的经纬度算初始屏幕位置，所以必须先 `.setLngLat()` 再 `.addTo(map)`（链式调用顺序：`new Marker().setLngLat([lng,lat]).addTo(map)`）。
- **Nominatim 反向地理编码查不到地名时返回 200**：不是失败状态码，响应体里是 `{"error":"Unable to geocode"}`，要当正常的"无地名"结果处理，不能当成上游请求失败。

## 注意事项

- Earth Engine 服务账号密钥用 `EARTH_ENGINE_SERVICE_ACCOUNT_KEY_B64` 这个环境变量（base64 编码后的完整 JSON key），放在 `.env.local`（已在 .gitignore 中排除，绝不提交到仓库）。本机之外的新环境需要单独配置这个变量（Vercel 在项目设置里配，本地开发就建 `.env.local` 文件）。
- `npm run dev` / `npm run build` 都带了 `--webpack` 参数，故意不用默认的 Turbopack（排查 maplibre 渲染问题时发现的兼容性顾虑，webpack 更稳）。
