# 🚀 ZoonoAb 一键部署到 Railway - 完整指南

## ✅ 已完成准备
- ✅ `vercel.json` - 部署配置
- ✅ `.gitignore` - 忽略文件
- ✅ `package.json` - 项目配置
- ✅ `server.js` - 服务器代码
- ✅ `public/index.html` - 前端页面

---

## 🎯 方案 A：使用 Railway 网页版部署（推荐，无需 Git）

### 步骤 1：打包项目文件

1. 打开文件资源管理器
2. 进入文件夹：`C:\Users\xlion\Desktop\ZoonoAb\ZoonoAb\zoonoab-agent`
3. **全选所有文件**（Ctrl+A）
4. **右键 → 发送到 → 压缩 (zipped) 文件夹**
5. 得到 `zoonoab-agent.zip`

### 步骤 2：上传到 Railway

1. **访问** https://railway.app
2. **注册/登录**（使用 GitHub 账号最快）
3. 点击 **"New Project"**
4. 选择 **"Deploy from GitHub repo"**
5. 如果是第一次使用，需要授权 Railway 访问 GitHub

### 步骤 3：创建 GitHub 仓库（如果还没有）

1. 访问 https://github.com/new
2. **Repository name**: `zoonoab-agent`
3. 选择 **Public**
4. **不要** 勾选 "Add README"
5. 点击 **"Create repository"**

### 步骤 4：上传代码到 GitHub

#### 方法 1：使用 GitHub 网页上传（最简单）

1. 打开刚创建的仓库：`https://github.com/你的用户名/zoonoab-agent`
2. 点击 **"uploading an existing file"**
3. **拖入所有文件**：
   - server.js
   - package.json
   - package-lock.json
   - vercel.json
   - .gitignore
   - public/ 文件夹（整个文件夹）
4. 点击 **"Commit changes"**

#### 方法 2：使用 Git 命令行（如果已安装 Git）

```bash
cd C:\Users\xlion\Desktop\ZoonoAb\ZoonoAb\zoonoab-agent

# 初始化 Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 关联远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/zoonoab-agent.git

# 推送
git branch -M main
git push -u origin main
```

### 步骤 5：在 Railway 部署

1. 回到 Railway 项目页面
2. 选择刚才创建的 `zoonoab-agent` 仓库
3. Railway 会**自动检测**这是 Node.js 项目
4. 点击 **"Deploy"**
5. 等待部署完成（约 1-2 分钟）

### 步骤 6：设置公网访问

1. 部署完成后，点击 **"Settings"**
2. 找到 **"Domains"** 部分
3. 点击 **"Generate Domain"**
4. 你会得到一个公开 URL，如：
   ```
   https://zoonoab-production.up.railway.app
   ```

### 步骤 7：验证访问

1. 打开浏览器访问生成的 URL
2. 检查页面是否正常加载
3. 测试 WebSocket 连接（页面应该显示 "Connected"）

---

## 🎯 方案 B：使用 Vercel 部署（备选）

### 步骤 1：安装 Vercel CLI

```bash
npm install -g vercel
```

### 步骤 2：部署

```bash
cd C:\Users\xlion\Desktop\ZoonoAb\ZoonoAb\zoonoab-agent
vercel login
vercel --prod
```

### 步骤 3：获取访问地址

部署完成后会显示：
```
https://zoonoab-agent.vercel.app
```

---

## 🎯 方案 C：使用 Render 部署（无需 CLI）

### 步骤 1：访问 Render

1. 访问 https://render.com
2. 注册/登录（使用 GitHub 账号）

### 步骤 2：创建 Web Service

1. 点击 **"New Web Service"**
2. 选择你的 GitHub 仓库 `zoonoab-agent`
3. 配置如下：
   - **Name**: `zoonoab-agent`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### 步骤 3：部署

1. 点击 **"Create Web Service"**
2. 等待部署完成（约 2-3 分钟）
3. 获得访问地址：
   ```
   https://zoonoab-agent.onrender.com
   ```

---

## 📊 部署成功检查清单

- [ ] 页面可以正常访问
- [ ] WebSocket 状态显示 "Connected"（绿色）
- [ ] 侧边栏可以正常打开/关闭
- [ ] 聊天功能正常工作
- [ ] 3D 分子查看器正常加载
- [ ] Demo 按钮可以运行演示流程
- [ ] 已通过页面 `ASR` 按钮或环境变量配置语音识别，点击麦克风可以完成转写

---

## 🎙️ 语音与聊天配置

语音模块用于大屏演示，浏览器录音后由服务端转发到云端 ASR；未命中演示规则的问题由独立聊天模型兜底回答。打开知识库后，左侧栏“系统设置”里有 `语音配置` 页面，进入后分别填写两套 API：

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

安全策略：

- 两套 API Key 都不写入代码、不写入 Git、不写入浏览器 localStorage。
- 保存后页面会立即清空 API Key 输入框。
- 服务端只把 Key 保存在内存会话里，默认 2 小时过期；服务重启或页面刷新后需要重新填写。
- 前端后续请求只发送短期 session token，不发送明文 API Key。
- 聊天兜底由服务端注入“小诺”系统提示，回答中不会主动暴露底层供应商或模型名称。

也可以在 Railway / Render / Vercel 环境变量中配置固定 ASR：

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

线上演示必须使用 HTTPS 域名才能稳定调用麦克风；本地调试可使用 `http://localhost:8080`。

---

## 🔧 常见问题解决

### 1. 部署失败

**错误**：Build failed
**解决**：
- 检查 `package.json` 是否正确
- 确保所有依赖都已列出
- 查看部署日志

### 2. WebSocket 连接失败

**错误**：Disconnected（红色）
**解决**：
- Railway/Render 都支持 WebSocket
- 确保使用 `wss://` 而不是 `ws://`
- 检查前端代码中的 WebSocket URL

### 3. 页面 404

**错误**：Cannot GET /
**解决**：
- 检查 `server.js` 中的静态文件路径
- 确保 `public` 文件夹存在
- 查看 `express.static` 配置

### 4. 3Dmol 加载失败

**错误**：3Dmol is not defined
**解决**：
- 确保 `public/lib/3Dmol-min.js` 存在
- 检查文件路径是否正确

---

## 🎉 部署完成！

现在你可以：
1. **分享链接**给朋友/同事
2. **自定义域名**（可选）
3. **设置环境变量**（如果需要）
4. **监控日志**（在 Railway/Render Dashboard）

---

## 📞 需要帮助？

- Railway 文档：https://docs.railway.app
- Render 文档：https://render.com/docs
- Vercel 文档：https://vercel.com/docs

---

**祝你部署成功！🚀**
