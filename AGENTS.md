在项目开始之前，第一件事就是将项目 git 初始化，然后在项目文件夹创建 AGENTS.md 文件。

重大功能修改完成并验证通过后，创建一个本地 Git commit 作为回滚点；不要自动 push 到 GitHub，除非用户明确要求。
提交前排除运行环境、日志、PID、密钥和后端私有配置文件，例如 `.node/`、`.tools/`、`.server.log`、`.server.pid`、`.runtime/`。
