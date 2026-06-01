在项目开始之前，第一件事就是将项目 git 初始化，然后在项目文件夹创建 AGENTS.md 文件。

重大功能修改完成并验证通过后，创建一个本地 Git commit 作为回滚点，并推送当前工作分支到 GitHub 远端。
每次完成会影响网页展示、交互、后端行为或部署行为的功能修改时，必须同步更新 `public/index.html` 中的 `APP_BUILD_VERSION` 纯数字版本号；版本号不得包含日期或语义化文字，方便现场通过页面底部标识确认是否已更新到目标版本。
提交前排除运行环境、日志、PID、密钥和后端私有配置文件，例如 `.node/`、`.tools/`、`.server.log`、`.server.pid`、`.runtime/`。

快速设计弹窗面向路演、展会和产品展示，应保持 guided demo/wizard 体验，而不是一次性专家参数表。快速设计 UI 和聊天可见内容不得暴露“白名单、后端、写死、固定工作流、quick_design、演示路线、大模型 API”等内部实现词；观众只应看到正式的分子设计流程话术。
快速设计必须映射到已准备好的固定设计路径：IL-33/ST2、PD-1/PD-L1、HER2、TNF；默认推荐路径为：肿瘤 → PD-L1 → 阻断 PD-1/PD-L1 → 自动选择表位 → Fab → 10 个候选。提交给系统时使用固定触发句，例如默认 PD-L1 路径发送“阻断 PD-1/PD-L1 通路，设计 10 个高亲和力 Fab”，而不是发送弹窗生成的长参数说明。
快速设计向导中的选项卡片只负责选中和高亮，不能自动跳转到下一步；现场 demo 默认隐藏其他靶点、精确表位、高级参数和候选数量自定义入口，候选数量跟随固定设计路径。
快速设计弹窗应避免现场误触关闭：点击遮罩层或窗口外区域不得关闭弹窗，只能通过显式关闭按钮、Esc 或提交流程关闭；快速设计各步骤弹窗尺寸、底部按钮区和主按钮位置应保持稳定，正文超出时在弹窗内部滚动。
快速设计提交必须使用 WebSocket `quick_design` 消息类型，并由后端直接调用已准备好的设计 workflow；不要把快速设计塞进普通输入框再走 `user_msg`/聊天 API。普通聊天继续走 `user_msg`，只有 `detectIntent` 能映射到已写好的工具或 workflow 时才执行工作流，否则才允许进入兜底聊天 API。
自然语言自动路由到抗体设计工作流必须有生物医学上下文；含电脑、手机、网络、账号、软件、服务器、黑客、木马、勒索软件等非生物/IT 场景的请求，即使出现“设计抗体/生成抗体模型”等字样，也应进入助手聊天兜底，不得启动 quick design 或 workflow。
快速设计必须在未配置语音、聊天或大模型 API Key 时仍可使用；后端接收 `quick_design` 后应立即返回工作流确认，前端应在无响应或断线时恢复操作状态并给出面向现场人员的清晰提示，避免现场展示卡在等待动画。
固定四条快速设计路线的观众可见正文、日志、tool_call/tool_result 和 fallback 文案必须按路线 profile 生成：IL-33/ST2、PD-1/PD-L1、HER2、TNF 的疾病方向、靶点结构域、抗体背景、作用机制和表位策略不得互相混用。
快速设计和断线 fallback 的可见 Agent 数量、设计阶段数、证据条目数应由展示层动态元信息生成；同一次运行内保持一致，连续运行可变化。UniProt/靶点注释必须来自当前路线 profile，不能混用固定编号或伪实时数据库检索文案。
工作流展示支持“跳过思考”按钮：点击后只能跳过当前阶段的冗长思考/日志展示，并在短暂收束提示后输出该阶段结果；不得取消工作流，也不得直接跳到最终结果。连续点击应能分别跳过后续阶段，并保证最终 `done`、结果区和 3D 展示正常渲染。
小诺同学语音链路应分层实现：前端录音/VAD 只负责采集和端点检测，ASR 只负责转写，后端 `/api/voice/intent` 先做确定性意图解析；命中抗体设计时必须返回固定 quick design 路线并由前端发送 WebSocket `quick_design`，不要让语音设计请求直接进入普通聊天兜底。
小诺语音识别只使用本机/服务器本地 ASR sidecar：默认地址 `LOCAL_ASR_BASE_URL=http://127.0.0.1:8765/v1/audio/transcriptions`，启动命令 `npm run asr:local`，首次安装命令 `npm run asr:setup`；前端 API 面板不得展示或要求填写云端语音识别 Base URL、API Key 或 Model。
本机离线 ASR 依赖安装到项目内 `.runtime/local-asr-venv`，不要污染系统 Python；默认使用 Paraformer 中文识别模型处理前端 16k WAV 短命令，`fsmn-vad` 和 `ct-punc` 默认关闭，只有需要长音频切分或标点时才通过 `LOCAL_ASR_VAD_MODEL`、`LOCAL_ASR_PUNC_MODEL` 手动开启，避免首次启动额外下载大模型并拖慢现场 demo。
网页后端在本机 local ASR 配置下应自动拉起 sidecar（可用 `LOCAL_ASR_AUTO_START=0` 关闭），前端普通语音和“小诺同学”唤醒监听都应发送 16k WAV；本机 ASR 应配置小诺、PD-1/PD-L1、IL-33/ST2、HER2、TNF、Fab/VHH 等领域热词，提高现场短命令识别稳定性。
语音现场可用性需要可诊断：后端 `/api/voice/health` 应返回 ASR 安装状态、sidecar/模型状态、是否可转写和现场人员可读消息；前端 API 面板应展示该状态，并在录音/唤醒时显示麦克风授权与输入音量，低音量录音应先提示用户而不是直接送 ASR。
普通语音按钮只负责把识别结果填入输入框并等待用户手动发送；不得在转写完成后自动发送聊天或启动设计工作流。只有“小诺同学”语音唤醒模式可以继续自动执行明确的语音控制、页面操作或 quick design 路线。
本地 PDB 文件名可能包含小数点分数（例如 `iptm-0.7953`）；`/api/pdb/local/:filename` 需要在防目录穿越的前提下允许这种文件名，避免 Binders/3D viewer 弹窗因 PDB 请求 400 而空白。
快速设计的 3D 展示可以对外使用 `PDL1-candidate-01.pdb` 这类产品化候选别名，由服务端内部映射到真实本地 PDB 文件；观众可见的候选名称和结构 URL 不应暴露本地 4KC3/IL33 文件名前缀，除非当前路线本身就是 IL-33/ST2。
3D 结果区要对 `show_3d` 的 `binderData/allPDBs` 做前端归一化；如果后端 payload 为空或缺字段，必须用本地 4KC3/IL33 PDB 清单兜底渲染 Binders、Sequence、CDR strip 和结构缩略图，避免展会 demo 出现空白面板。
连续多次渲染 3D 结果时，前端必须按当前 `.section-3d` 作用域查找 Binders、Sequence、Gallery、Chain strip 等固定 id 元素，并重置 `galleryViewers`、`currentGalleryViewer`、`activeBinderIdx`，避免 `document.getElementById` 命中旧结果卡片导致新结果空白。
连续多次渲染 `Designed Binders` 结果区时，前端必须按当前 `.results-section` 作用域使用 `data-role`/scoped selectors 查找序列列表、雷达图、直方图、CDR 组成图和对比栏；不要在重复结果区内使用全局重复 id 或 `document.getElementById` 查找这些节点。
同级目录 `zoonoab,click.mab 2` 是当前 3D 结果展示的参照实现，可用于对比 Binders、Sequence、CDR strip、gallery 和 viewer modal 的预期交互。

Render 部署使用仓库根目录的 `render.yaml` Blueprint：Web Service 名称 `zoonoab-agent`，Node 运行时，`buildCommand: npm ci`，`startCommand: npm start`，健康检查 `/api/health`。Render 稳定运行服务端本地 ASR 应使用至少 `pro` 规格、20GB 持久磁盘挂载到 `/var/data`，并使用当前演示分支自动部署。Render 默认使用服务端本地 ASR：`LOCAL_ASR_BASE_URL=http://127.0.0.1:8765/v1/audio/transcriptions`、`LOCAL_ASR_AUTO_START=1`、`LOCAL_ASR_BOOTSTRAP=1`、`LOCAL_ASR_PRELOAD=1`，并将 `LOCAL_ASR_VENV_DIR`、`LOCAL_ASR_CACHE_DIR`、`MODELSCOPE_CACHE`、`HF_HOME`、`TORCH_HOME`、`PIP_CACHE_DIR` 指向 `/var/data`；首次部署或磁盘为空时允许运行时自动安装 ASR 依赖和下载模型，后续复用持久磁盘。`ASSISTANT_CHAT_API_KEY` 在 Render Dashboard 中填写，不能写入仓库。

本机临时公网 demo 可用 tmux 保活：在 `zoonoab-agent` 中启动 `tmux new-session -d -s zoonoab-demo-server -c /home/ajifang/zoonoab/zoonoab-agent 'PORT=8080 /home/ajifang/zoonoab/zoonoab-agent/.tools/node-v20.19.2-linux-x64/bin/node server.js 2>&1 | tee -a .runtime/logs/server-8080.log'`，再启动 `tmux new-session -d -s zoonoab-demo-tunnel -c /home/ajifang/zoonoab/zoonoab-agent '/home/ajifang/zoonoab/zoonoab-agent/.tools/node-v20.19.2-linux-x64/bin/node node_modules/localtunnel/bin/lt.js --port 8080 --local-host 127.0.0.1 --subdomain zoonoab-demo-ajifang 2>&1 | tee -a .runtime/logs/localtunnel-8080.log'`。若后台环境找不到 `node`，优先使用项目内 `.tools/node-v20.19.2-linux-x64/bin/node` 绝对路径；检查状态用 `tmux list-sessions`、`curl http://127.0.0.1:8080/api/health` 和 `curl https://zoonoab-demo-ajifang.loca.lt/api/health`。

GitHub 推送权限应使用仓库级 Deploy Key，并在本仓库本地 Git 配置中指定对应 SSH key；不要使用账号级 SSH key 扩大访问范围，也不要把私钥提交到仓库。
