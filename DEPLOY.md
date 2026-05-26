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

### 网页操作：

1. 访问 https://render.com
2. 注册/登录
3. 点击 "New Web Service"
4. 连接 GitHub 仓库
5. 配置：
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
6. 点击 "Create Web Service"

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

### 语音与聊天配置

语音控制模块在浏览器端录音，服务端转发到云端 ASR；未命中演示规则的问题会走独立的聊天兜底接口。打开知识库后，左侧栏“系统设置”里有 `语音配置` 页面，进入后分别填写两套 API：

```text
ASR Base URL
ASR API Key
ASR Model

Chat Base URL
Chat API Key
Chat Model
```

页面提供 `测试语音` 和 `测试聊天` 按钮。语音测试会用当前填写的 ASR Base URL、API Key 和 Model 发起一次实际音频转写请求；聊天测试会调用 chat/completions 类型接口确认小诺兜底问答可用。

SiliconFlow / DeepSeek 兼容音频转写示例：

```text
ASR Base URL: https://api.siliconflow.cn/v1/audio/transcriptions
ASR API Key: 你的 SiliconFlow API Key
ASR Model: FunAudioLLM/SenseVoiceSmall
```

聊天兜底需要单独填写聊天模型接口，不能使用 `audio/transcriptions` 的语音模型作为聊天模型：

```text
Chat Base URL: https://api.deepseek.com/v1/chat/completions
Chat API Key: 你的聊天模型 API Key
Chat Model: deepseek-chat
```

安全说明：

- 两套 API Key 都不写入代码、不写入 Git、不写入 localStorage。
- 页面提交后会立即清空 API Key 输入框。
- 服务端只把 Key 保存在内存会话里，默认 2 小时过期；服务重启或页面刷新后需要重新填写。
- 前端后续请求只携带短期 session token，不会把 API Key 明文放进转写或聊天请求。
- 聊天兜底由服务端注入“小诺”系统提示，回答中不会主动暴露底层供应商或模型名称。

也可以继续用部署平台环境变量配置固定服务端 ASR：

```bash
VOICE_ASR_PROVIDER=deepseek
DEEPSEEK_API_KEY=你的 SiliconFlow 或兼容网关 Key
DEEPSEEK_ASR_BASE_URL=https://api.siliconflow.cn/v1/audio/transcriptions
VOICE_TRANSCRIBE_MODEL=FunAudioLLM/SenseVoiceSmall
```

固定聊天兜底接口：

```bash
VOICE_CHAT_BASE_URL=https://api.deepseek.com/v1/chat/completions
VOICE_CHAT_API_KEY=你的聊天模型 API Key
VOICE_CHAT_MODEL=deepseek-chat
```

如果使用 OpenAI：

```bash
VOICE_ASR_PROVIDER=openai
OPENAI_API_KEY=你的 OpenAI API Key
VOICE_TRANSCRIBE_MODEL=gpt-4o-transcribe
OPENAI_CHAT_API_KEY=你的 OpenAI API Key
OPENAI_CHAT_MODEL=可用的聊天模型
```

浏览器麦克风要求 HTTPS。线上 Railway/Render/Vercel 域名默认是 HTTPS；本地调试可使用 `http://localhost:8080`。

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
