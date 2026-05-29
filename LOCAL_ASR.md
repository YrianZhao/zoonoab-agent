# 小诺本机离线语音识别

目标：让网页语音交互像 VocoType 一样，不依赖云端 ASR Key。首次安装模型需要网络；模型缓存完成后，本机离线也可以转写。

## 首次安装

```bash
npm run asr:setup
```

这会安装 FunASR、ModelScope、PyTorch 和音频依赖。首次启动本地服务时会下载 `iic/SenseVoiceSmall`、`fsmn-vad` 和 `ct-punc` 模型。

## 启动本机离线 ASR

开一个终端运行：

```bash
npm run asr:local
```

默认地址：

```text
http://127.0.0.1:8765/v1/audio/transcriptions
```

再开另一个终端运行网页服务：

```bash
npm start
```

网页默认会优先调用本机离线 ASR。API 面板里的语音识别默认地址也指向本机服务，本机模式不需要 API Key。

## 自定义模型或端口

```bash
LOCAL_ASR_MODEL=iic/SenseVoiceSmall LOCAL_ASR_PORT=8765 npm run asr:local
```

后端也可以通过环境变量指向别的本地 ASR 服务：

```bash
VOICE_ASR_PROVIDER=local LOCAL_ASR_BASE_URL=http://127.0.0.1:8765/v1/audio/transcriptions npm start
```

## 常见问题

- 页面提示“本机离线语音服务未启动”：先确认 `npm run asr:local` 正在运行。
- 首次启动慢：模型第一次下载和加载需要时间，之后会快很多。
- 完全断网前：先联网完成 `npm run asr:setup` 和第一次 `npm run asr:local`，确保模型已缓存到本机。
