# 小诺本机离线语音识别

目标：让网页语音交互像 VocoType 一样，不依赖云端 ASR Key。首次安装模型需要网络；模型缓存完成后，本机离线也可以转写。

## 首次安装

```bash
npm run asr:setup
```

这会安装 FunASR、ModelScope、PyTorch 和音频依赖。首次启动本地服务时会下载 `iic/speech_paraformer-large_asr_nat-zh-cn-16k-common-vocab8404-pytorch` 识别模型。
依赖会安装到项目内 `.runtime/local-asr-venv`，不会写入仓库，也不会污染系统 Python。

## 启动本机离线 ASR

默认情况下，`npm start` 会在网页读取语音配置或首次转写时自动启动本机 ASR sidecar。也可以手动开一个终端运行：

```bash
npm run asr:local
```

默认地址：

```text
http://127.0.0.1:8765/v1/audio/transcriptions
```

服务启动后 `/health` 会立刻可用；识别模型会在后台预热。首次下载和加载完成后，再次启动会明显更快。

网页后端还提供聚合诊断接口：

```bash
curl http://127.0.0.1:8080/api/voice/health
```

该接口会返回 ASR provider、模型、安装状态、sidecar 进程状态、模型加载状态、是否可转写，以及现场人员可读的状态消息。页面的 API 面板会同步显示这些信息，并在录音或唤醒时显示麦克风授权和输入音量。

运行网页服务：

```bash
npm start
```

网页默认会优先调用本机离线 ASR。API 面板里的语音识别默认地址也指向本机服务，本机模式不需要 API Key。需要禁用自动启动时可设置：

```bash
LOCAL_ASR_AUTO_START=0 npm start
```

## 自定义模型或端口

```bash
LOCAL_ASR_MODEL=iic/speech_paraformer-large_asr_nat-zh-cn-16k-common-vocab8404-pytorch LOCAL_ASR_PORT=8765 npm run asr:local
```

默认针对现场短语音命令识别，不加载额外 VAD 和标点模型，避免首次启动额外下载约 1GB 标点权重。需要长音频切分或标点时可以手动开启：

```bash
LOCAL_ASR_VAD_MODEL=fsmn-vad LOCAL_ASR_PUNC_MODEL=ct-punc npm run asr:local
```

本机模式下，前端普通语音和“小诺同学”唤醒监听都会发送 16k WAV，避免浏览器 `webm/mp4` 在本机 FunASR 环境里依赖 ffmpeg。ASR sidecar 默认带抗体设计领域热词，可通过 `LOCAL_ASR_HOTWORDS` 覆盖。

后端也可以通过环境变量指向别的本地 ASR 服务：

```bash
VOICE_ASR_PROVIDER=local LOCAL_ASR_BASE_URL=http://127.0.0.1:8765/v1/audio/transcriptions npm start
```

## 常见问题

- 页面提示“本机离线语音服务未启动”：先确认已经运行过 `npm run asr:setup`；默认 `npm start` 会自动尝试拉起本机 ASR，也可以手动运行 `npm run asr:local`。
- 页面提示“本机离线语音模型正在加载”：等待首次模型下载或预热完成，不需要填写 API Key。
- 页面提示“麦克风声音偏低”：靠近麦克风、检查系统输入设备，或降低现场噪声后再试；页面音量条应能看到输入变化。
- 首次启动慢：模型第一次下载和加载需要时间，之后会快很多。
- 完全断网前：先联网完成 `npm run asr:setup` 和第一次 `npm run asr:local`，确保模型已缓存到本机。
