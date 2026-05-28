# 🚀 ZoonoAb 部署指南

## 方案 1：Railway 部署（推荐）

### 步骤：

1. **安装 Railway CLI**
```bash
npm install -g @railway/cli
```

2. **登录 Railway**
```bash
railway login
```

3. **初始化项目**
```bash
railway init
```

4. **部署**
```bash
railway up
```

5. **设置公网访问**
```bash
railway domain
```

6. **查看部署状态**
```bash
railway logs
```

### 访问地址
部署完成后会生成一个公开 URL，如：
```
https://zoonoab-agent-production.up.railway.app
```

---

## 方案 2：Vercel 部署

### 步骤：

1. **安装 Vercel CLI**
```bash
npm install -g vercel
```

2. **登录**
```bash
vercel login
```

3. **部署**
```bash
vercel --prod
```

### 访问地址
```
https://zoonoab-agent.vercel.app
```

---

## 方案 3：Render 部署

项目根目录已经包含 `render.yaml`，推荐直接用 Render Blueprint 部署。这样 Render 会自动配置 Node 版本、启动命令、健康检查、语音/聊天模型默认值，以及用于保存后端私有 API 配置的 1GB 持久磁盘。

### Blueprint 一键部署（推荐）

1. 确认代码已经推送到 GitHub 仓库，例如：
```bash
git push origin main
```

2. 打开 Render Dashboard：
```text
https://dashboard.render.com
```

3. 点击 **New +** → **Blueprint**。

4. 连接并选择 GitHub 仓库：
```text
YrianZhao/zoonoab-agent
```

5. Render 会读取根目录的 `render.yaml`，创建 `zoonoab-agent` Web Service。

6. 在 Blueprint 创建页面填写两个 secret 环境变量：
```text
VOICE_ASR_API_KEY=你的 SiliconFlow API Key
ASSISTANT_CHAT_API_KEY=你的 SiliconFlow API Key
```

7. 点击 **Apply** 或 **Create Resources**，等待部署完成。

8. 部署完成后，Render 会生成公开 HTTPS 地址，例如：
```text
https://zoonoab-agent.onrender.com
```

9. 打开健康检查地址确认服务可用：
```text
https://你的-render域名/api/health
```

返回类似下面内容即可：
```json
{"ok":true,"platform":"ZoonoAb","sessions":0}
```

`render.yaml` 已经设置：

```yaml
runtime: node
buildCommand: npm ci
startCommand: npm start
healthCheckPath: /api/health
VOICE_API_CONFIG_FILE: /var/data/voice-api-config.json
disk: /var/data, 1GB
```

这表示如果你在页面的 **API** 面板里保存语音和聊天 API，后端私有配置会写入 Render 持久磁盘 `/var/data/voice-api-config.json`，不会明文保存在前端，也不会因为普通重启而丢失。

### 手动创建 Web Service（备用）

如果不用 Blueprint，也可以手动创建：

1. Render Dashboard → **New +** → **Web Service**。
2. 选择 GitHub 仓库 `YrianZhao/zoonoab-agent`。
3. 配置：
```text
Runtime: Node
Branch: main
Build Command: npm ci
Start Command: npm start
Health Check Path: /api/health
Plan: Starter 或更高
```

4. 添加环境变量：
```text
NODE_ENV=production
NODE_VERSION=20.19.2
PORT=10000
VOICE_API_CONFIG_FILE=/var/data/voice-api-config.json
VOICE_ASR_PROVIDER=compatible
VOICE_ASR_BASE_URL=https://api.siliconflow.cn/v1/audio/transcriptions
VOICE_ASR_API_KEY=你的 SiliconFlow API Key
VOICE_TRANSCRIBE_MODEL=FunAudioLLM/SenseVoiceSmall
ASSISTANT_CHAT_BASE_URL=https://api.siliconflow.cn/v1/chat/completions
ASSISTANT_CHAT_API_KEY=你的 SiliconFlow API Key
ASSISTANT_CHAT_MODEL=Qwen/Qwen3-32B
```

5. 在 **Disks** 添加持久磁盘：
```text
Name: zoonoab-runtime
Mount Path: /var/data
Size: 1 GB
```

6. 点击 **Create Web Service**。

Render 部署完成后，打开页面，点击右下输入框旁的 **API** 按钮，再点 **测试语音** 和 **测试聊天**，确认两套接口都可用。

---

## 方案 4：手动部署到服务器

### 要求：
- 一台云服务器（如 AWS、DigitalOcean、阿里云等）
- Node.js 已安装

### 步骤：

1. **上传代码到服务器**
```bash
scp -r . user@your-server:/path/to/zoonoab
```

2. **安装依赖**
```bash
npm install
```

3. **使用 PM2 管理进程**
```bash
npm install -g pm2
pm2 start server.js --name zoonoab
pm2 save
pm2 startup
```

4. **配置 Nginx 反向代理**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🎯 推荐方案对比

| 平台 | 价格 | WebSocket | 难度 | 推荐度 |
|------|------|-----------|------|--------|
| **Railway** | $5/月免费额度 | ✅ 支持 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Render** | 免费 | ✅ 支持 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Vercel** | 免费 | ⚠️ 有限制 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **自建服务器** | $5-10/月 | ✅ 支持 | ⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 📝 部署后配置

### 语音识别和兜底聊天配置

语音控制模块在浏览器端录音，服务端转发到云端 ASR。页面输入框旁有一个很小的 `API` 按钮，点击后会显示两组配置：

```text
语音识别 ASR
- Base URL
- API Key
- Model

兜底聊天 Chat
- Base URL
- API Key
- Model
```

建议把语音和聊天分开填。你现在这组 SiliconFlow 语音模型只能用于转写，不能用于兜底聊天：

```text
语音识别 ASR
Base URL: https://api.siliconflow.cn/v1/audio/transcriptions
API Key: 你的 SiliconFlow API Key
Model: FunAudioLLM/SenseVoiceSmall

兜底聊天 Chat
Base URL: https://api.siliconflow.cn/v1/chat/completions
API Key: 你的 SiliconFlow API Key
Model: Qwen/Qwen3-32B
```

安全说明：

- 两套 API Key 都不写入代码、不写入 Git、不写入 localStorage。
- 页面提交后会立即清空 API Key 输入框。
- 服务端会把 Key 写入后端私有配置文件 `.runtime/voice-api-config.json`，文件已被 `.gitignore` 忽略，不会提交到 Git。
- 前端不会读取或回显 API Key；刷新页面后只显示已配置的 Base URL、Model 和就绪状态。
- 短期 session token 仍会用于当前页面请求优化；即使 token 过期或页面刷新，服务端也会继续读取后端私有配置。

填写完成后可以先点 **测试语音** 和 **测试聊天**：

- **测试语音** 会临时录制约 2 秒音频，调用当前填写的 ASR 接口确认模型能转写。
- **测试聊天** 会向当前填写的聊天接口发送一条内部测试消息，确认兜底聊天模型可用。
- 测试不会把 API Key 写入浏览器，也不会把 Key 回传到页面；正式保存仍需要点击 **保存**。

也可以继续用部署平台环境变量配置固定服务端 ASR 和聊天：

```bash
VOICE_ASR_PROVIDER=compatible
VOICE_ASR_BASE_URL=https://api.siliconflow.cn/v1/audio/transcriptions
VOICE_ASR_API_KEY=你的 SiliconFlow API Key
VOICE_TRANSCRIBE_MODEL=FunAudioLLM/SenseVoiceSmall

ASSISTANT_CHAT_API_KEY=你的 SiliconFlow API Key
ASSISTANT_CHAT_BASE_URL=https://api.siliconflow.cn/v1/chat/completions
ASSISTANT_CHAT_MODEL=Qwen/Qwen3-32B
```

小诺问答兜底只会走聊天接口。它会以 ZoonoAb 自研助手身份回答，不会在前端暴露模型名或供应商名。如果没有配置兜底聊天接口，系统会使用本地兜底话术，不会把 ASR 模型当成聊天模型调用。

如果使用 OpenAI：

```bash
VOICE_ASR_PROVIDER=openai
OPENAI_API_KEY=你的 OpenAI API Key
VOICE_TRANSCRIBE_MODEL=gpt-4o-transcribe
```

浏览器麦克风要求 HTTPS。线上 Railway/Render/Vercel 域名默认是 HTTPS；本地调试可使用 `http://localhost:8080`。

### 现场语音演示口令

当前正式唤醒词：

```text
主唤醒词：小诺同学
备用唤醒词：小诺小诺
```

网页语音唤醒是展厅演示型唤醒：页面需要保持打开，浏览器需要先授权麦克风，不是手机系统级后台常驻唤醒。现场建议先点击唤醒按钮，让页面进入“小诺同学待命中”，再请领导说口令。

推荐现场使用：

```text
小诺同学，帮我为过敏性哮喘设计一个抗体分子，并打印一个结构模型。
小诺同学，帮我做一个肿瘤免疫治疗方向的抗体设计演示。
小诺同学，请为乳腺癌相关疾病设计一个候选抗体。
小诺同学，请为类风湿方向做一个抗炎抗体设计演示。
小诺同学，请做一次完整的抗体设计演示。
```

为保证演示稳定，第一版语音任务只走白名单路由：IL-33/ST2、PD-1/PD-L1、HER2、TNF。肺癌、EGFR、IL-23、IL-17、银屑病、炎症性肠病等暂未纳入第一版演示白名单的方向会被安全转成 IL-33/ST2 代表性示范路线；页面会说“选择当前最适合演示的过敏炎症通路”，不会显示“不支持”，也不会声称已经发送真实 3D 打印机。

### 自定义域名（可选）

在部署平台添加自定义域名：
- Railway: `railway domain your-domain.com`
- Render: 在 Dashboard 中添加
- Vercel: 在 Settings → Domains 中添加

### 环境变量

如果需要配置 API 密钥等，在平台的环境变量设置中添加。

---

## ✅ 验证部署

部署完成后，访问生成的 URL 验证：
1. 页面正常加载
2. WebSocket 连接成功
3. 所有功能正常工作

---

## 🆘 故障排除

### 常见问题：

1. **部署失败**
   - 检查 `package.json` 是否正确
   - 查看部署日志
   - 确保 `server.js` 可以正常运行

2. **WebSocket 连接失败**
   - 确保平台支持 WebSocket
   - 检查 CORS 设置
   - 使用 wss:// 而不是 ws://

3. **静态文件 404**
   - 检查 `public` 目录路径
   - 确保 `express.static` 配置正确

---

## 📞 联系支持

- Railway: https://railway.app/discord
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs
