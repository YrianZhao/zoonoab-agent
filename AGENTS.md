在项目开始之前，第一件事就是将项目 git 初始化，然后在项目文件夹创建 AGENTS.md 文件。

本项目每次完成任何文件修改后，都必须创建本地 Git commit 作为回滚点，并推送当前工作分支到 GitHub 远端；随后必须按阿里云打包上传流程上传服务器、替换线上版本、重启服务，并验证正式站点健康检查和构建版本号。除非用户明确要求暂停上传，不得只停留在未提交、本地提交、远端推送或临时验证状态。
每次完成会影响网页展示、交互、后端行为或部署行为的功能修改时，必须同步更新 `public/index.html` 中的 `APP_BUILD_VERSION` 纯数字版本号；版本号不得包含日期或语义化文字，方便现场通过页面底部标识确认是否已更新到目标版本。
提交前排除运行环境、日志、PID、密钥和后端私有配置文件，例如 `.node/`、`.tools/`、`.server.log`、`.server.pid`、`.runtime/`、`.playwright-cli/`、`output/`、`.runtime-codex-server.log`。

快速设计弹窗面向路演、展会和产品展示，应保持 guided demo/wizard 体验，而不是一次性专家参数表。快速设计 UI 和聊天可见内容不得暴露“白名单、后端、写死、固定工作流、quick_design、演示路线、大模型 API”等内部实现词；观众只应看到正式的分子设计流程话术。
快速设计必须映射到已准备好的 route/profile；默认推荐路径为：肿瘤 → PD-L1 → 阻断 PD-1/PD-L1 → 自动选择表位 → Fab → 10 个候选。新增疾病入口或靶点时，必须同步更新前端 `qdDemoRoutes/qdTargetOptions/qdMechanismOptions/qdWorkflowTriggers`、后端 `DEMO_ROUTE_RULES/buildRouteProfile`、前端断线 fallback profile，并保持疾病方向、靶点结构域、抗体背景、作用机制、表位策略和 WebSocket `quick_design` routeId 一致。提交给系统时使用固定触发句，例如默认 PD-L1 路径发送“阻断 PD-1/PD-L1 通路，设计 10 个高亲和力 Fab”，而不是发送弹窗生成的长参数说明。
快速设计向导中的选项卡片只负责选中和高亮，不能自动跳转到下一步；现场 demo 默认隐藏其他靶点、精确表位、高级参数和候选数量自定义入口，候选数量跟随固定设计路径。
快速设计弹窗应避免现场误触关闭：点击遮罩层或窗口外区域不得关闭弹窗，只能通过显式关闭按钮、Esc 或提交流程关闭；快速设计各步骤弹窗尺寸、底部按钮区和主按钮位置应保持稳定，正文超出时在弹窗内部滚动。
快速设计提交必须使用 WebSocket `quick_design` 消息类型，并由后端直接调用已准备好的设计 workflow；不要把快速设计塞进普通输入框再走 `user_msg`/聊天 API。普通聊天继续走 `user_msg`，只有 `detectIntent` 能映射到已写好的工具或 workflow 时才执行工作流，否则才允许进入兜底聊天 API。
快速设计提交按钮和语音自动提交必须使用已定义的运行状态（例如 `isRunning`/`quickDesignRunActive`）防重入，不得引用不存在的状态变量导致提交函数中断。
自然语言自动路由到抗体设计工作流必须有生物医学上下文；含电脑、手机、网络、账号、软件、服务器、黑客、木马、勒索软件等非生物/IT 场景的请求，即使出现“设计抗体/生成抗体模型”等字样，也应进入助手聊天兜底，不得启动 quick design 或 workflow。
快速设计必须在未配置语音、聊天或大模型 API Key 时仍可使用；后端接收 `quick_design` 后应立即返回工作流确认，前端应在无响应或断线时恢复操作状态并给出面向现场人员的清晰提示，避免现场展示卡在等待动画。
快速设计路线的观众可见正文、日志、tool_call/tool_result 和 fallback 文案必须按当前路线 profile 生成；不同疾病入口和靶点的疾病方向、靶点结构域、抗体背景、作用机制和表位策略不得互相混用。
快速设计和断线 fallback 的可见 Agent 数量、设计阶段数、证据条目数应由展示层动态元信息生成；同一次运行内保持一致，连续运行可变化。UniProt/靶点注释必须来自当前路线 profile，不能混用固定编号或伪实时数据库检索文案。
工作流展示支持“跳过思考”按钮：点击后应让当前整次工作流进入快速思考模式，只压缩后续服务端延迟、前端打字和断线 fallback 延迟，并按约 30 秒的演示节奏展示到最终结果和 3D 结构；不得替换、删减或跳过任何观众可见的工作流日志、阶段结果、tool_call/tool_result 或 Agent 内容，不得瞬间刷完、不得取消工作流，也不得直接跳到最终结果。快速模式只影响当前运行，`done`、取消、错误或新任务开始时必须重置。
“跳过思考”在同一次工作流中只能点击一次；进入快速思考后按钮必须保持“跳过中”禁用状态直到本次运行结束，避免现场重复点击。
历史会话列表归属于知识库侧栏，应放在“公共资料库”入口下方；不要放回 Agent Tasks 任务侧栏底部，避免任务展示区被历史记录占用。
快速设计向导不展示抗体分子类型选择步骤；抗体类型必须跟随当前 route/profile 默认值，并只在最终摘要、工作流文案和结果区中展示。
小诺同学语音链路应分层实现：前端录音/VAD 只负责采集和端点检测，ASR 只负责转写；语音识别结果可用于网站功能控制和本地站内问答，但不得写入主输入框、不得追加主聊天气泡、不得发送 `user_msg` 或启动任何普通工作流。
小诺语音识别默认使用本机/服务器本地 ASR sidecar：默认地址 `LOCAL_ASR_BASE_URL=http://127.0.0.1:8765/v1/audio/transcriptions`，启动命令 `npm run asr:local`，首次安装命令 `npm run asr:setup`；同时允许在知识库侧栏“语音 API 设置”中配置 OpenAI 兼容的云端 ASR，例如 SiliconFlow `https://api.siliconflow.cn/v1/audio/transcriptions` 搭配 `FunAudioLLM/SenseVoiceSmall` 或 `TeleAI/TeleSpeechASR`。
语音 ASR API 配置必须由后端持久化到安全运行配置文件，前端只显示 `hasApiKey`/“已保存”状态，不得明文回显 Key；保存后普通语音录入、小诺唤醒后的 WebSocket ASR、测试语音接口都必须使用当前持久 ASR 配置，未配置云端 ASR 时才回退本机离线 ASR。
悬浮语音助手的 WebSocket PCM 流必须有客户端 VAD/端点检测：检测到用户开始说话后才推送有效音频，停顿后自动发送 `asr_stop`，并限制单段时长和后端缓存大小；不得依赖用户手动关闭语音助手才触发转写。
语音播报 TTS 默认使用免 Key Edge Neural `zh-CN-XiaoxiaoNeural` 并使用偏快语速；CosyVoice/DashScope 只能在显式设置 `LOCAL_TTS_PROVIDER=cosyvoice` 或 `dashscope` 时作为可选增强，避免现场因环境 Key 自动切到异常音色。失败时再回退 Python `edge-tts` CLI、macOS `say` 或其他本地兜底。
TTS 只对播报文本做发音归一化，不改变页面展示文字；至少应将 `ZoonoAb`/`ZoonoAB`/`zoonoab` 读作 `zoono A B`，并将 `PD-L1`、`PD-1`、`CDR-H3` 等靶点和结构术语拆成更稳定的朗读形式。
浏览器 `SpeechRecognition` 只能作为“小诺同学”唤醒词检测层使用，命令内容仍必须通过本地 16k WAV ASR 转写并交给 `/api/voice/intent` 解析；普通语音输入、小诺唤醒监听和唤醒后的命令录音必须互斥且幂等，避免重复会话抢占麦克风。
语音前端 UI 可以采用悬浮麦克风按钮、悬浮免提开关和底部语音卡片的展示形态，但底层不得接入参考项目里基于大模型自由分类的 `/api/voice-intent` 路由；普通语音设计请求不得进入聊天或 workflow，普通问答只能使用本地站内答案并在语音面板展示/播报。
若直接采用参考项目的悬浮语音 UI，必须将参考前端的 `start_design`、问答发送和 WebSocket ASR 消息处理改接到当前项目链路：只有快速设计向导最终确认页才允许调用 `sendQuickDesignWorkflow(routeId)`；本地 ASR 二进制流按 16k PCM/WAV 兼容处理；不要把参考项目的鉴权、知识库或自由问答路由代码整体拼接进当前页面脚本。
本机离线 ASR 依赖安装到项目内 `.runtime/local-asr-venv`，不要污染系统 Python；默认使用 Paraformer 中文识别模型处理前端 16k WAV 短命令，`fsmn-vad` 和 `ct-punc` 默认关闭，只有需要长音频切分或标点时才通过 `LOCAL_ASR_VAD_MODEL`、`LOCAL_ASR_PUNC_MODEL` 手动开启，避免首次启动额外下载大模型并拖慢现场 demo。
网页后端在本机 local ASR 配置下应自动拉起 sidecar（可用 `LOCAL_ASR_AUTO_START=0` 关闭），前端普通语音和“小诺同学”唤醒监听都应发送 16k WAV；本机 ASR 应配置小诺、PD-1/PD-L1、IL-33/ST2、HER2、TNF、Fab/VHH 等领域热词，提高现场短命令识别稳定性。
语音现场可用性需要可诊断：后端 `/api/voice/health` 应返回 ASR 安装状态、sidecar/模型状态、是否可转写和现场人员可读消息；前端 API 面板应展示该状态，并在录音/唤醒时显示麦克风授权、实时输入音量和声波/状态反馈，低音量录音应先提示用户而不是直接送 ASR。
没有云端语音识别 Key 时，前端不得禁用普通语音按钮或“小诺同学”唤醒入口；应默认使用本机/服务器本地 ASR，必要时触发健康检查或启动 sidecar，但用户界面应显示“语音控制准备中/已就绪”等产品化文案，不展示“离线语音、模型加载、本机加载”等技术词。
普通语音按钮和“小诺同学”唤醒模式允许控制网站已有功能和回答本地站内问题；语音识别结果不得填入主输入框、不得等待手动发送、不得自动发送聊天或启动设计工作流。快速设计语音向导按步骤完成并进入第六步后，是唯一允许的语音工作流入口。
小诺语音不得从普通自然语言设计请求直接启动任何 workflow 或 quick design；只有用户先用语音打开快速设计弹窗并按向导完成疾病、靶点、机制和表位步骤后，前端才允许发送 WebSocket `quick_design`。进入第六步“设计任务已生成”时，小诺必须播报“开始分子设计”，播报完成后自动提交，不再要求用户点击按钮或再次说确认语；手动点击打开快速设计时可以保留最终按钮确认。
小诺控制快速设计应优先走前端确定性命令路由：打开/关闭快速设计、开始设计、下一步、上一步，以及按当前步骤可见选项做疾病、靶点、机制、表位的模糊匹配；鼠标点击选项卡片仍只选中/高亮，语音向导命中当前步骤选项后可自动进入下一步并播报下一步问题。该控制链路不得使用大模型自由分类来决定 quick design route。
快速设计语音选项匹配必须按当前步骤可见卡片做确定性模糊打分，并选择最可能选项；不得因为别名未完全命中而不选择，尤其 `PD-L1`、`HER2`、`EGFR`、`VEGF-A` 等靶点短命令必须稳定命中当前可见选项。
用户用语音打开快速设计后，向导内部应支持连续语音选择，不要求每一步重新说“小诺”；关闭快速设计或离开向导后再恢复普通唤醒/按钮语音逻辑。
快速设计打开时语音卡片必须自动缩到麦克风附近且不得遮挡弹窗正文、底部按钮或工作流区域；悬浮麦克风应支持拖拽并保存位置，未拖拽时自动选择不遮挡快速设计的位置。
本地 PDB 文件名可能包含小数点分数（例如 `iptm-0.7953`）；`/api/pdb/local/:filename` 需要在防目录穿越的前提下允许这种文件名，避免 Binders/3D viewer 弹窗因 PDB 请求 400 而空白。
快速设计的 3D 展示可以对外使用 `PDL1-candidate-01.pdb` 这类产品化候选别名，由服务端内部映射到真实本地 PDB 文件；观众可见的候选名称和结构 URL 不应暴露本地 4KC3/IL33 文件名前缀，除非当前路线本身就是 IL-33/ST2。
快速设计结束后自动打开的 3D 弹窗应全屏常驻展示：不得自动倒计时关闭，点击遮罩不得关闭，只保留显式关闭按钮和 Esc 作为人工出口；打开弹窗不能阻塞工作流队列或运行状态复位。
3D 弹窗遮罩关闭时必须完全隐藏并禁用交互；不得留下 `display:flex` 但透明的全屏遮罩，避免拦截快速设计、语音控制或其他页面按钮点击。
快速设计 3D 展示的 `binderData` 必须携带真实本地 PDB `file` 以及路线化展示元信息（routeId、疾病方向、靶点、机制、表位策略、候选名称、序列/CDR/可开发性摘要），前端 Sequence、Gallery 和弹窗标题应优先使用当前 route/profile 字段，缺字段时才使用本地 PDB fallback。
快速设计每条 route/profile 都应有稳定的 3D 展示预设，包括产品化 PDB 候选别名、真实本地 PDB 映射顺序、结构标题、结构类型说明、可视化摘要和抗原/抗体颜色；新增快速设计路线时必须同步补齐该 route 的 3D 预设，保证最终 3D 结果与前序疾病、靶点和机制一致。
快速设计 3D 预设结构应提前生成并保存在本地 `pdb/` 目录，工作流结束时只调用对应静态 PDB 文件，不在展示阶段实时计算、重排或把同一结构临时改名；Fab 路线应优先使用能明显呈现多链 Fab 复合体的预设结构，VHH 路线使用对应 VHH 复合体预设。
快速设计 3D 预设应优先基于对应疾病靶点的真实公开 PDB 结构或抗原-抗体复合体模板生成；没有完全匹配抗体复合体时，才使用真实靶点结构加代表 Fab/VHH 展示支架。生成文件和 `binderData` 必须保留结构来源说明、抗原链集合和抗体链集合，viewer 应按这些链集合上色，不得继续假设只有 A/B 两条链。
本地抗原 3D 预设必须优先使用 RCSB/PDB biological assembly 或条目中明确给出的生物学多聚体形态；TNF、IL-17A、VEGF-A、RSV F、Influenza HA、ANGPTL3 等天然二聚体/三聚体/多链抗原不得只截取一个单体冒充完整抗原形状。若只能使用单接触单元或代表性展示支架，观众可见文案和 `structuralBasis/interfaceDetail` 必须明确这是代表性界面展示，不得写成完整天然抗原形状。
自然语言命中已准备 route/profile 时，3D 结果必须使用该 route 对应的真实本地 PDB 预设，并确保靶点身份、抗原链集合、抗体链集合、结构来源、疾病方向和作用机制一致；不得用另一个靶点的 PDB 作为命中路线的展示结果。自然语言未命中已准备 route/profile 时，当前方案只能使用目标解析后的 generic profile 和代表性 Fab/VHH 结构预览；不得声称其为用户指定靶点的真实抗原结构。更稳妥的后续方案应接入在线结构解析和缓存，例如 UniProt/RCSB/AlphaFold 检索、物种和结构域确认、候选结构置信度标记、人工确认或离线缓存后再进入正式展示。
快速设计 3D 结果区和全屏弹窗应展示当前路线的疾病方向、靶点、作用机制、表位策略和结构依据，让观众能看出 3D 结构与前序快速设计目标的对应关系。
3D 结果区要对 `show_3d` 的 `binderData/allPDBs` 做前端归一化；如果后端 payload 为空或缺字段，必须用本地 4KC3/IL33 PDB 清单兜底渲染 Binders、Sequence、CDR strip 和结构缩略图，避免展会 demo 出现空白面板。
连续多次渲染 3D 结果时，前端必须按当前 `.section-3d` 作用域查找 Binders、Sequence、Gallery、Chain strip 等固定 id 元素，并重置 `galleryViewers`、`currentGalleryViewer`、`activeBinderIdx`，避免 `document.getElementById` 命中旧结果卡片导致新结果空白。
连续多次渲染 `Designed Binders` 结果区时，前端必须按当前 `.results-section` 作用域使用 `data-role`/scoped selectors 查找序列列表、雷达图、直方图、CDR 组成图和对比栏；不要在重复结果区内使用全局重复 id 或 `document.getElementById` 查找这些节点。
同级目录 `zoonoab,click.mab 2` 是当前 3D 结果展示的参照实现，可用于对比 Binders、Sequence、CDR strip、gallery 和 viewer modal 的预期交互。

Render 部署使用仓库根目录的 `render.yaml` Blueprint：Web Service 名称 `zoonoab-agent`，Node 运行时，`buildCommand: npm ci`，`startCommand: npm start`，健康检查 `/api/health`。Render 稳定运行服务端本地 ASR 应使用至少 `pro` 规格、20GB 持久磁盘挂载到 `/var/data`，并使用当前演示分支自动部署。Render 默认使用服务端本地 ASR：`LOCAL_ASR_BASE_URL=http://127.0.0.1:8765/v1/audio/transcriptions`、`LOCAL_ASR_AUTO_START=1`、`LOCAL_ASR_BOOTSTRAP=1`、`LOCAL_ASR_PRELOAD=1`，并将 `LOCAL_ASR_VENV_DIR`、`LOCAL_ASR_CACHE_DIR`、`MODELSCOPE_CACHE`、`HF_HOME`、`TORCH_HOME`、`PIP_CACHE_DIR` 指向 `/var/data`；首次部署或磁盘为空时允许运行时自动安装 ASR 依赖和下载模型，后续复用持久磁盘。`ASSISTANT_CHAT_API_KEY` 在 Render Dashboard 中填写，不能写入仓库。
Render Dashboard 中如果残留旧的云端语音识别配置，例如 `VOICE_TRANSCRIBE_MODEL=FunAudioLLM/SenseVoiceSmall`，后端应在本地 ASR 模式下忽略它并使用 `paraformer-zh`；`/api/health` 和 `/api/voice/health` 应暴露当前构建版本和本地 ASR 诊断信息，便于判断线上是否已经部署到最新版本。
Render 本地 ASR 启动失败时，`/api/voice/health` 应暴露最近一次 sidecar 启动事件、退出码和截断后的 stdout/stderr 摘要，便于在没有 Dashboard 日志权限时定位 Python、pip、磁盘或模型下载问题；诊断信息不得包含密钥。
Render 上应优先使用 `/var/data` 持久磁盘运行本地 ASR；如果运行时发现 `/var/data` 不可写，后端可以临时退回项目内 `.runtime` 目录以保证语音功能可启动，但健康诊断必须标明 `persistentRuntime=false` 和 fallback 原因，后续仍应修复 Render 磁盘挂载。
Render 和 Linux 服务器上的本地 ASR 安装默认必须使用 CPU-only PyTorch 源 `https://download.pytorch.org/whl/cpu`，避免安装 CUDA/NVIDIA 依赖导致部署过慢、磁盘不足或启动失败；只有明确需要 GPU 时才覆盖 `LOCAL_ASR_TORCH_INDEX_URL`。
Render 上默认使用轻量离线 Vosk 中文小模型 `vosk-model-small-cn-0.22` 作为 ASR engine，保证网页语音能快速安装和启动；本地开发仍可使用 FunASR/Paraformer large。只有 Render 持久磁盘和算力确认充足时，才把 Render 默认 ASR 切回 FunASR large。

本机临时公网 demo 可用 tmux 保活：在 `zoonoab-agent` 中启动 `tmux new-session -d -s zoonoab-demo-server -c /home/ajifang/zoonoab/zoonoab-agent 'PORT=8080 /home/ajifang/zoonoab/zoonoab-agent/.tools/node-v20.19.2-linux-x64/bin/node server.js 2>&1 | tee -a .runtime/logs/server-8080.log'`，再启动 `tmux new-session -d -s zoonoab-demo-tunnel -c /home/ajifang/zoonoab/zoonoab-agent '/home/ajifang/zoonoab/zoonoab-agent/.tools/node-v20.19.2-linux-x64/bin/node node_modules/localtunnel/bin/lt.js --port 8080 --local-host 127.0.0.1 --subdomain zoonoab-demo-ajifang 2>&1 | tee -a .runtime/logs/localtunnel-8080.log'`。若后台环境找不到 `node`，优先使用项目内 `.tools/node-v20.19.2-linux-x64/bin/node` 绝对路径；检查状态用 `tmux list-sessions`、`curl http://127.0.0.1:8080/api/health` 和 `curl https://zoonoab-demo-ajifang.loca.lt/api/health`。

GitHub 推送权限应使用仓库级 Deploy Key，并在本仓库本地 Git 配置中指定对应 SSH key；不要使用账号级 SSH key 扩大访问范围，也不要把私钥提交到仓库。
小诺语音默认必须支持 barge-in：用户开口应立即打断当前 TTS 播报并恢复 ASR 聆听；调参时优先保证现场响应灵敏。
手动点击打开快速设计时，快速设计弹窗应保持页面居中；只有通过小诺语音打开或进入快速设计语音向导时，才允许弹窗使用 `quick-design-voice-open` 这类语音专用状态给右侧语音助手让位。
首页输入框下方的自然语言设计提示词点击后应直接提交到工作流/自动路由链路，不要只填入主输入框等待用户再次点击发送。
语音唤醒词统一使用“小诺同学”，不要再用“小诺”“你好小诺”“小诺小诺”等其他唤醒入口或对外文案；进入快速设计语音向导后，每一步连续选择不需要重复唤醒词。
快速设计语音向导命中当前步骤选项后，必须先在当前页把选中框移动到该选项并展示短暂确认动画，再自动进入下一页并播报下一步问题；不要瞬间跳页导致观众看不清选择结果。
普通麦克风按钮录音后应支持模糊页面控制命令，例如“打开快速设计”可以直接打开快速设计；只有后台免手动唤醒监听才要求先说“小诺同学”。
语音“唤醒”按钮应放在顶部右侧操作区、New Session 图标左边，按钮文案使用“唤醒”而不是“免提”；同一顶部操作区统一放置 WebSocket 连接状态、通知入口、语言切换、唤醒按钮和 New Session 图标，这些全局工具不要放回左侧栏底部，避免占用任务/知识库区域。
悬浮语音面板展开时必须按当前视口边界夹紧位置，无论麦克风拖到左下角、右下角或其他边缘，都不得超出整体页面可见区域。
主页桌面布局应保持类似 ChatGPT/Gemini 的窄内容列和可收起左侧栏；Design、Batches、Agent Tasks、序列分析、结构分析、团队协作、知识库等主导航应放在顶部 header，不要放入左侧 Agent Tasks 抽屉；左侧 Agent Tasks 抽屉只承载当前任务进度和任务目标列表，并通过顶部 `Agent Tasks` 导航项展开/收起，不再显示独立的左侧展开按钮。Agent Tasks 进入页面默认收起，工作流开始并收到任务列表后默认自动展开一次；用户在本轮工作流中手动收起后，不要被后续任务更新反复展开。`New Session` 固定在页面右上角，构建版本号显示在空状态提示文字下方居中，首页自然语言提示词不得包含“演示”或末尾句号。用户在任务流运行中也必须能随时收起或展开左侧栏，任务更新和新建会话不得强制改变桌面端侧栏开合状态；快速设计弹窗必须按当前侧栏状态适配右侧可用工作区。

阿里云低成本部署优先使用 Linux ECS 或轻量应用服务器直跑当前 Node 单体服务，使用 nginx 反向代理 `PORT`，并保留 WebSocket `Upgrade`/`Connection` 转发；长期稳定运行语音能力时最低建议 2 vCPU / 2 GiB / 40 GB。
阿里云部署时不要依赖 `.env` 自动加载；`server.js` 直接读取系统环境变量，必须通过 `systemd`、PM2 ecosystem 或启动命令显式注入 `PORT`、`ASSISTANT_CHAT_*`、`LOCAL_ASR_*`、`VOICE_API_CONFIG_FILE`、`LOCAL_TTS_PROVIDER` 等变量。
阿里云部署的本地 ASR/TTS 运行目录应落在持久化路径，例如 `/var/data` 或项目内 `.runtime`；CPU 机器默认优先 `LOCAL_ASR_ENGINE=vosk`、`VOICE_TRANSCRIBE_MODEL=vosk-small-cn-0.22`，并继续使用 CPU-only PyTorch 源 `https://download.pytorch.org/whl/cpu`。
阿里云 ECS `47.121.139.140` 后续更新项目时，只有在用户明确要求“打包上传”或“部署到服务器”后，才使用本地打包上传而不是服务器直接 `git pull`，因为服务器直连 GitHub 曾出现 TLS 卡住；流程为本地提交并推送后执行 `git archive --format=tar.gz --output=/tmp/zoonoab-agent.tar.gz HEAD`，再 `scp -i ~/.ssh/id_ed25519 /tmp/zoonoab-agent.tar.gz root@47.121.139.140:/tmp/zoonoab-agent.tar.gz`，服务器解包到 `/opt/zoonoab-agent.new`、运行 `npm ci`、替换 `/opt/zoonoab-agent` 并 `systemctl restart zoonoab`。
阿里云 ECS 上本地 Vosk 模型如果从官方源下载卡住，应在本地先下载完整 `vosk-model-small-cn-0.22.zip`（可使用 Hugging Face `rhasspy/vosk-models` 镜像），再上传到服务器 `/var/data/zoonoab/local-asr-cache/downloads/vosk-model-small-cn-0.22.zip`，解压到 `/var/data/zoonoab/local-asr-cache/vosk/vosk-model-small-cn-0.22`，目录内必须包含 `conf/` 和 `am/`；完成后重启 `zoonoab` 并确认 `/api/voice/health` 返回 `status=ready`、`canTranscribe=true`。
阿里云中国内地节点要获得和本地一致的浏览器麦克风体验，必须使用浏览器信任的 HTTPS；`http://47.121.139.140` 可打开网页但通常无法稳定使用麦克风。正式方案是域名实名认证、ICP 备案、A 记录指向 `47.121.139.140`、nginx 配置 `server_name`、申请 HTTPS 证书并使用 `https://域名` 访问。
阿里云 ECS 正式域名为 `zoonoab.xyz`，同时配置 `www.zoonoab.xyz`；DNS A 记录均指向 `47.121.139.140`，nginx `server_name` 包含这两个域名，HTTPS 使用 Certbot/Let's Encrypt 证书 `/etc/letsencrypt/live/zoonoab.xyz/fullchain.pem` 和 `/etc/letsencrypt/live/zoonoab.xyz/privkey.pem`，HTTP 应 301 跳转到 HTTPS。域名部署后用 `https://zoonoab.xyz/api/health` 和 `https://zoonoab.xyz/api/voice/health` 验证网页版本和语音状态。
便宜域名后缀可以考虑 `.xyz`、`.top`、`.site`、`.club`、`.icu` 等，但首年低价不代表续费便宜；只要解析到阿里云中国内地 ECS，对外提供网站仍然需要 ICP 备案，备案要求与后缀价格无关。
`github.io` 只能作为 GitHub Pages 静态站或跳转页，不能直接作为当前 ECS 的 Node/WebSocket/ASR 后端 HTTPS 域名；若前端部署到 `github.io`，当前相对路径 `/api` 和 WebSocket 会指向 GitHub Pages 自身，不能直接控制阿里云后端，除非另行改造前后端地址和 HTTPS 后端入口。
Cloudflare Quick Tunnel 可作为临时 HTTPS 入口测试麦克风，建议优先把 `cloudflared` 跑在阿里云 ECS 上并转发到 `http://127.0.0.1:80`；涉及 GitHub/Cloudflare 外网二进制下载时，先在本地下载对应平台版本，再上传到阿里云，例如 Linux amd64 版上传为 `/usr/local/bin/cloudflared`。Quick Tunnel 链接随机且无稳定性保证，不写入正式对外文案；本机版 Tunnel 只适合调试，Mac 关机、休眠或本地服务停止后链接即失效。
