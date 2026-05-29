在项目开始之前，第一件事就是将项目 git 初始化，然后在项目文件夹创建 AGENTS.md 文件。

重大功能修改完成并验证通过后，创建一个本地 Git commit 作为回滚点；不要自动 push 到 GitHub，除非用户明确要求。
提交前排除运行环境、日志、PID、密钥和后端私有配置文件，例如 `.node/`、`.tools/`、`.server.log`、`.server.pid`、`.runtime/`。

快速设计弹窗面向路演、展会和产品展示，应保持 guided demo/wizard 体验，而不是一次性专家参数表。快速设计 UI 和聊天可见内容不得暴露“白名单、后端、写死、固定工作流、quick_design、演示路线、大模型 API”等内部实现词；观众只应看到正式的分子设计流程话术。
快速设计必须映射到已准备好的固定设计路径：IL-33/ST2、PD-1/PD-L1、HER2、TNF；默认推荐路径为：肿瘤 → PD-L1 → 阻断 PD-1/PD-L1 → 自动选择表位 → Fab → 10 个候选。提交给系统时使用固定触发句，例如默认 PD-L1 路径发送“阻断 PD-1/PD-L1 通路，设计 10 个高亲和力 Fab”，而不是发送弹窗生成的长参数说明。
快速设计提交必须使用 WebSocket `quick_design` 消息类型，并由后端直接调用已准备好的设计 workflow；不要把快速设计塞进普通输入框再走 `user_msg`/聊天 API。普通聊天继续走 `user_msg`，只有 `detectIntent` 能映射到已写好的工具或 workflow 时才执行工作流，否则才允许进入兜底聊天 API。
快速设计必须在未配置语音、聊天或大模型 API Key 时仍可使用；后端接收 `quick_design` 后应立即返回工作流确认，前端应在无响应或断线时恢复操作状态并给出面向现场人员的清晰提示，避免现场展示卡在等待动画。
本地 PDB 文件名可能包含小数点分数（例如 `iptm-0.7953`）；`/api/pdb/local/:filename` 需要在防目录穿越的前提下允许这种文件名，避免 Binders/3D viewer 弹窗因 PDB 请求 400 而空白。
3D 结果区要对 `show_3d` 的 `binderData/allPDBs` 做前端归一化；如果后端 payload 为空或缺字段，必须用本地 4KC3/IL33 PDB 清单兜底渲染 Binders、Sequence、CDR strip 和结构缩略图，避免展会 demo 出现空白面板。
同级目录 `zoonoab,click.mab 2` 是当前 3D 结果展示的参照实现，可用于对比 Binders、Sequence、CDR strip、gallery 和 viewer modal 的预期交互。

Render 部署使用仓库根目录的 `render.yaml` Blueprint：Web Service 名称 `zoonoab-agent`，Node 运行时，`buildCommand: npm ci`，`startCommand: npm start`，健康检查 `/api/health`，并挂载 1GB 磁盘到 `/var/data` 保存 `VOICE_API_CONFIG_FILE=/var/data/voice-api-config.json`。`VOICE_ASR_API_KEY` 与 `ASSISTANT_CHAT_API_KEY` 在 Render Dashboard 中填写，不能写入仓库。
