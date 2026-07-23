# 法国研学第一组导游地图

面向巴黎研学小组的中文旅行工具，包含餐厅资料、浏览器精确定位、站内步行导航、结构化景点数据库和智能导游。

## 已实现

- 全新中文旅行应用界面与移动端布局
- 右上角支持中文、English、Français 三语切换并记住用户选择
- 26 家餐厅搜索、菜系筛选、价格/评分/距离排序
- 高精度浏览器定位、定位精度提示和持续位置更新
- 站内步行路线、距离、时间与分步指引
- Google Maps 可选接入；未配置密钥时自动使用 OpenStreetMap
- 8 个研学地点、官方来源与餐厅数据库驱动的本地推荐
- Cloudflare Workers AI Llama 3.3 70B 安全代理；模型不可用时自动回退到本地推荐
- 密码保护的管理后台，可在线修改餐厅预算、营业说明、景点地址和关门时间
- GitHub Pages 自动构建与发布

## 本地运行

```bash
pnpm install
pnpm dev
```

生产构建：

```bash
pnpm build
```

## Google Maps

在仓库 `Settings → Secrets and variables → Actions` 中创建 Actions secret：

`GOOGLE_MAPS_API_KEY`

需要在 Google Cloud 启用 Maps JavaScript API 和结算，并将密钥限制为 HTTP referrer：

`https://hejinghan777.github.io/paris-program/*`

浏览器地图密钥会随前端代码发送给访客，因此必须使用来源限制；不要使用无限制密钥。

## 智能模型

GitHub Pages 本身不能安全运行服务端模型。`worker/` 使用 Cloudflare Workers AI 的
Llama 3.3 70B Instruct，通过安全代理生成回答，不需要在浏览器中保存模型密钥。部署方法见
[worker/README.md](worker/README.md)。部署后将 Worker URL 保存为仓库变量
`GUIDE_API_URL`。未配置该变量或免费额度暂时用完时，网站仍会使用结构化数据库提供稳定推荐。

## 管理后台

部署后的管理入口为：

[https://hejinghan777.github.io/paris-program/#/admin](https://hejinghan777.github.io/paris-program/#/admin)

管理员密码保存在 Cloudflare Worker 的 `ADMIN_PASSWORD` secret 中，不写入浏览器代码或 GitHub
仓库。内容修改保存在 D1 数据库；保存后，餐厅地图和智能导游会自动读取最新数据。

## 发布

推送到 `main` 分支后，`.github/workflows/deploy-pages.yml` 会自动构建并发布到：

[https://hejinghan777.github.io/paris-program/](https://hejinghan777.github.io/paris-program/)
