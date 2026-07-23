# Brandream 在线部署说明

## 先说结论

`http://127.0.0.1:4274/index.html` 这一类地址只是你当前电脑上的本地临时地址。

它有几个天然限制：

- 只有这台电脑自己能访问
- 本地服务一停，地址就失效
- 电脑重启、窗口关闭、端口变化后，旧地址就可能打不开

如果你要的是“每台电脑、每个手机都能打开同一个网址，并继续保存同一份进度”，正确路线是：

- GitHub：放代码
- Vercel：放网页和后端接口
- Supabase：放真实业务数据

## 当前项目现在的默认模式

项目已经调整为更稳的默认方式：

- 前端默认走 `/api` 接口
- 本地运行时：`server.py` 提供 `/api/data` 和 `/api/health`
- 线上运行时：Vercel 提供同样的 `/api/data` 和 `/api/health`
- Supabase 只在后端使用，不再默认让浏览器直接连数据库

这意味着：

- 本地调试和线上正式版的行为会更一致
- 不需要把数据库 publishable key 暴露给浏览器
- 更适合达人资料、品牌资料这类需要长期保存的业务数据

## 上线步骤

1. 把当前项目代码上传到 GitHub
2. 在 Supabase 中创建项目
3. 在 Supabase SQL Editor 执行 [deploy/supabase.sql](/C:/Users/HUAWEI/Documents/Codex/2026-07-09/kol-kol-kol-tiktok-instagram-facebook/deploy/supabase.sql)
4. 在本地把 [.env.example](/C:/Users/HUAWEI/Documents/Codex/2026-07-09/kol-kol-kol-tiktok-instagram-facebook/.env.example) 复制成 `.env.local`
5. 填好：
   - `SUPABASE_URL`
   - `SUPABASE_SECRET_KEY`
   - `SUPABASE_STATE_TABLE=app_state`
   - `SUPABASE_STATE_KEY=brandream-main`
6. 运行本地导入脚本，把已有 SQLite 数据导入 Supabase
7. 在 Vercel 中导入 GitHub 仓库
8. 在 Vercel 项目里配置同样的环境变量
9. 部署完成后，用 Vercel 给出的公网网址访问

## 本地已有数据如何带上去

当前项目已经有导入脚本：

- [scripts/import_local_state_to_supabase.py](/C:/Users/HUAWEI/Documents/Codex/2026-07-09/kol-kol-kol-tiktok-instagram-facebook/scripts/import_local_state_to_supabase.py)

推荐流程：

```powershell
Copy-Item .\.env.example .\.env.local
python .\scripts\import_local_state_to_supabase.py --dry-run
python .\scripts\import_local_state_to_supabase.py
```

本地数据来源通常是：

- [work/app.db](/C:/Users/HUAWEI/Documents/Codex/2026-07-09/kol-kol-kol-tiktok-instagram-facebook/work/app.db)
- [work/generated_data.json](/C:/Users/HUAWEI/Documents/Codex/2026-07-09/kol-kol-kol-tiktok-instagram-facebook/work/generated_data.json)

## 上线后怎么验证

部署完成后，建议这样验证：

1. 打开 `https://你的域名/api/health`
2. 确认返回里有：
   - `storageMode: "cloud-supabase"`
3. 再打开主页面
4. 用两台不同设备分别新增或修改一条记录
5. 刷新后确认两边看到的是同一份数据

## 相关文件

- 前端入口：[index.html](/C:/Users/HUAWEI/Documents/Codex/2026-07-09/kol-kol-kol-tiktok-instagram-facebook/index.html)
- 前端逻辑：[app.js](/C:/Users/HUAWEI/Documents/Codex/2026-07-09/kol-kol-kol-tiktok-instagram-facebook/app.js)
- 默认站点配置：[site-config.js](/C:/Users/HUAWEI/Documents/Codex/2026-07-09/kol-kol-kol-tiktok-instagram-facebook/site-config.js)
- 本地服务：[server.py](/C:/Users/HUAWEI/Documents/Codex/2026-07-09/kol-kol-kol-tiktok-instagram-facebook/server.py)
- Vercel 接口：[api/data.js](/C:/Users/HUAWEI/Documents/Codex/2026-07-09/kol-kol-kol-tiktok-instagram-facebook/api/data.js)
- 健康检查：[api/health.js](/C:/Users/HUAWEI/Documents/Codex/2026-07-09/kol-kol-kol-tiktok-instagram-facebook/api/health.js)
- Supabase SQL：[deploy/supabase.sql](/C:/Users/HUAWEI/Documents/Codex/2026-07-09/kol-kol-kol-tiktok-instagram-facebook/deploy/supabase.sql)

## 不再推荐的方式

现在不再推荐默认使用“浏览器直接连接 Supabase”的公开读写模式，因为它会让前端直接接触数据库访问凭据和共享数据入口。

对于这个项目，更合适的长期方案是：

- 浏览器只访问网页
- 网页只请求 `/api`
- `/api` 再由后端去读写 Supabase
