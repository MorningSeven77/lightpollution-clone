@AGENTS.md

# 项目说明

练手项目：复刻 [lightpollutionmap.app](https://lightpollutionmap.app) 的核心功能（光污染地图 + Bortle/SQM 点位查询），目标是学习全栈开发流程和 Claude Code 建站工作流。

## 技术栈

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- 地图：MapLibre GL JS（免费开源，无需 API key）
- 光污染数据：Google Earth Engine（VIIRS 卫星年度合成数据），服务端通过服务账号认证调用
- 地点搜索：Nominatim (OpenStreetMap) 地理编码，经后端 API 路由代理
- 部署：Vercel

## 目录约定

- `src/app/api/*/route.ts` — 后端接口（geocode 代理、Earth Engine 瓦片/点位查询）
- `src/components/` — React 组件
- `src/lib/` — 工具函数与第三方服务封装（Earth Engine 认证、Bortle/SQM 换算、URL 状态同步）

## 注意事项

- Earth Engine 服务账号密钥等敏感信息只放在 `.env.local`（已在 .gitignore 中排除），绝不提交到仓库。
- 完整需求和实施步骤见项目计划文件（用户本机路径）：`C:\Users\Admin（无密码）\.claude\plans\lightpollutionmap-app-claude-code-peppy-castle.md`
