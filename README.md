# Brandream KOL Hub

这是一个用于整理达人合作资料、截图资料、联系记录和竞品品牌信息的网页工具。

当前项目支持两种运行模式：

- 本地模式：`Python + SQLite`
- 云端模式：`Vercel + Supabase`

如果你的目标是“每个手机、每台电脑都能打开同一个网址并继续保存进度”，请使用云端模式。

## GitHub 在这里的作用

GitHub 只用来放代码，不用来存业务数据。

- 代码：适合放 GitHub，方便连接 Vercel 自动部署
- 数据：应该放 Supabase 数据库
- 密钥：只能放 Vercel 环境变量，不能提交到 GitHub

## 本地模式

本地模式适合你自己电脑开着时，在同一局域网里给手机或同事访问。

启动命令：

```powershell
python .\server.py
```

启动后可访问：

- 本机：`http://127.0.0.1:4173/index.html`
- 局域网：`http://你的电脑局域网IP:4173/index.html`

本地数据库文件在：

- [work/app.db](/C:/Users/HUAWEI/Documents/Codex/2026-07-09/kol-kol-kol-tiktok-instagram-facebook/work/app.db)

## 云端模式

云端模式适合多手机、多电脑长期共用同一份数据。

当前项目已经准备好了这些文件：

- 前端页面：[index.html](/C:/Users/HUAWEI/Documents/Codex/2026-07-09/kol-kol-kol-tiktok-instagram-facebook/index.html)
- 前端逻辑：[app.js](/C:/Users/HUAWEI/Documents/Codex/2026-07-09/kol-kol-kol-tiktok-instagram-facebook/app.js)
- 本地后端：[server.py](/C:/Users/HUAWEI/Documents/Codex/2026-07-09/kol-kol-kol-tiktok-instagram-facebook/server.py)
- Vercel 云函数：[api/data.js](/C:/Users/HUAWEI/Documents/Codex/2026-07-09/kol-kol-kol-tiktok-instagram-facebook/api/data.js)
- 健康检查：[api/health.js](/C:/Users/HUAWEI/Documents/Codex/2026-07-09/kol-kol-kol-tiktok-instagram-facebook/api/health.js)
- Supabase SQL：[deploy/supabase.sql](/C:/Users/HUAWEI/Documents/Codex/2026-07-09/kol-kol-kol-tiktok-instagram-facebook/deploy/supabase.sql)
- 环境变量模板：[.env.example](/C:/Users/HUAWEI/Documents/Codex/2026-07-09/kol-kol-kol-tiktok-instagram-facebook/.env.example)
- 本地数据导入脚本：[scripts/import_local_state_to_supabase.py](/C:/Users/HUAWEI/Documents/Codex/2026-07-09/kol-kol-kol-tiktok-instagram-facebook/scripts/import_local_state_to_supabase.py)

### 上线步骤

1. 新建一个 Supabase 项目
2. 打开 Supabase 的 SQL Editor，执行 [deploy/supabase.sql](/C:/Users/HUAWEI/Documents/Codex/2026-07-09/kol-kol-kol-tiktok-instagram-facebook/deploy/supabase.sql)
3. 在 Supabase 里拿到：
   - `SUPABASE_URL`
   - `SUPABASE_SECRET_KEY`
4. 把当前项目代码上传到 GitHub
5. 在 Vercel 中导入这个 GitHub 仓库
6. 在 Vercel 项目里配置环境变量：
   - `SUPABASE_URL`
   - `SUPABASE_SECRET_KEY`
   - `SUPABASE_STATE_TABLE=app_state`
   - `SUPABASE_STATE_KEY=brandream-main`
7. 部署完成后，Vercel 会给你一个公网网址
8. 以后所有手机和电脑都访问这个公网网址，保存的是同一份数据

## 本地数据如何带到云端

当前本地版的数据主要在：

- [work/app.db](/C:/Users/HUAWEI/Documents/Codex/2026-07-09/kol-kol-kol-tiktok-instagram-facebook/work/app.db)
- [work/generated_data.json](/C:/Users/HUAWEI/Documents/Codex/2026-07-09/kol-kol-kol-tiktok-instagram-facebook/work/generated_data.json)

如果你要，我下一步可以继续帮你做“本地 SQLite 数据一键导入 Supabase”的脚本，这样上线时不用手工重新录入。

现在这个脚本已经补好了，推荐这样用：

```powershell
Copy-Item .\.env.example .\.env.local
```

把 `.env.local` 里的 `SUPABASE_URL` 和 `SUPABASE_SECRET_KEY` 填好以后，先预览：

```powershell
python .\scripts\import_local_state_to_supabase.py --dry-run
```

确认数量没问题后正式导入：

```powershell
python .\scripts\import_local_state_to_supabase.py
```

如果你想强制从种子 JSON 导入，而不是从本地 SQLite 导入，可以加：

```powershell
python .\scripts\import_local_state_to_supabase.py --source json
```

## 不要上传的内容

这些内容不要推到 GitHub：

- `work/app.db`
- `.env`
- `.env.local`
- 任何 Supabase 密钥

项目里已经加了 [.gitignore](/C:/Users/HUAWEI/Documents/Codex/2026-07-09/kol-kol-kol-tiktok-instagram-facebook/.gitignore) 来帮你避开这些文件。
