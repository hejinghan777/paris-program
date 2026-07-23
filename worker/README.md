# 智能导游安全代理

这个 Cloudflare Worker 使用 Workers AI 的 Llama 3.1 8B Instruct 模型。模型通过 `AI`
binding 在服务器端运行，不会向 GitHub Pages 暴露任何账户凭据。Cloudflare Workers AI
提供每日免费额度；额度耗尽或服务异常时，网页会自动回退到本地结构化推荐。

1. 在 `worker` 目录运行 `pnpm install`。
2. 登录 Cloudflare：`pnpm wrangler login`。
3. 部署：`pnpm deploy`。
4. 将 Worker 地址保存为 GitHub 仓库变量 `GUIDE_API_URL`，重新运行 Pages 工作流。

模型只能基于网页发送的结构化景点和餐厅数据生成回答，不能编造实时票价、营业状态或交通信息。
