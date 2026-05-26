# Render 部署说明

本项目已经准备好使用 Render Blueprint 部署。

## 当前仓库

- GitHub: https://github.com/YrianZhao/zoonoab-agent
- Branch: `main`
- Blueprint: `render.yaml`
- Service: `zoonoab-agent`

## 部署步骤

1. 打开 Render Blueprint 创建页：
   https://dashboard.render.com/blueprints/new
2. 登录 Render，并授权连接 GitHub。
3. 选择仓库 `YrianZhao/zoonoab-agent`。
4. Blueprint path 保持默认的 `render.yaml`。
5. 点击 Apply / Create Blueprint。
6. 等待构建完成后，Render 会生成一个类似下面的 HTTPS 地址：

```text
https://zoonoab-agent.onrender.com
```

## Render 配置

`render.yaml` 已包含以下配置：

- Runtime: Node
- Plan: Free
- Build Command: `npm ci`
- Start Command: `npm start`
- Health Check: `/api/health`
- Auto Deploy: enabled
- Node version: `24.14.1`

## 验证

部署完成后访问：

```text
https://你的-render-域名/api/health
```

成功时应返回：

```json
{"ok":true,"platform":"ZoonoAb","sessions":0}
```

然后打开 Render 域名首页，确认页面正常加载，WebSocket 状态为 connected。

## 语音识别环境变量

当前 Blueprint 默认使用运行时页面配置 ASR：

```bash
VOICE_ASR_PROVIDER=deepseek
VOICE_TRANSCRIBE_MODEL=deepseek-v4-flash
```

如果希望服务端固定配置 API Key，可在 Render Dashboard 的 Environment 页面添加以下变量之一。

OpenAI:

```bash
VOICE_ASR_PROVIDER=openai
OPENAI_API_KEY=你的 OpenAI API Key
VOICE_TRANSCRIBE_MODEL=gpt-4o-transcribe
```

DeepSeek 兼容音频网关:

```bash
VOICE_ASR_PROVIDER=deepseek
DEEPSEEK_API_KEY=你的 DeepSeek Key
DEEPSEEK_ASR_BASE_URL=https://your-deepseek-asr-gateway.example.com/v1/audio/transcriptions
VOICE_TRANSCRIBE_MODEL=deepseek-v4-flash
```
