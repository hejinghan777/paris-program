# 智能导游安全代理

这个 Cloudflare Worker 将 Gemini API 密钥保存在服务器端，避免密钥出现在 GitHub Pages 的浏览器代码中。

1. 在 `worker` 目录运行 `pnpm install`。
2. 登录 Cloudflare：`pnpm wrangler login`。
3. 保存密钥：`pnpm wrangler secret put GEMINI_API_KEY`。
4. 部署：`pnpm deploy`。
5. 将 Worker 地址保存为 GitHub 仓库变量 `GUIDE_API_URL`，重新运行 Pages 工作流。

不要把 Gemini API 密钥写入 `.env`、源码或 GitHub 仓库。
