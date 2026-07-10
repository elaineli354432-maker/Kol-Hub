# Brandream 在线部署

当前项目已经改成可直接在浏览器里连接 Supabase。

## 第一步：打开浏览器直连权限

在 Supabase SQL Editor 中执行：

- [deploy/supabase_browser_access.sql](/C:/Users/HUAWEI/Documents/Codex/2026-07-09/kol-kol-kol-tiktok-instagram-facebook/deploy/supabase_browser_access.sql)

执行完成后，网页就可以用公开的 publishable key 直接读取和保存 `brandream-main` 这条共享数据。

## 第二步：确认本地网页已经读到云端数据

重新打开本地网页后，应看到：

- 顶部状态为“云端共享”
- 达人库里能看到之前导入的 40 个达人
- 竞品品牌库里能看到 5 个品牌

## 第三步：上传到静态托管

这套代码现在不再依赖本地 `/api` 才能工作，所以可以部署到：

- GitHub Pages
- Netlify
- Cloudflare Pages

最省事的路线是 GitHub Pages：

1. 新建一个 GitHub 仓库
2. 把当前整个项目推上去
3. 在 GitHub 仓库设置里开启 Pages
4. 选择 `main` 分支和根目录 `/`
5. 等待生成公网地址

以后所有电脑和手机都直接打开那个公网地址即可。

## 当前关键文件

- 浏览器直连配置：[site-config.js](/C:/Users/HUAWEI/Documents/Codex/2026-07-09/kol-kol-kol-tiktok-instagram-facebook/site-config.js)
- 页面入口：[index.html](/C:/Users/HUAWEI/Documents/Codex/2026-07-09/kol-kol-kol-tiktok-instagram-facebook/index.html)
- 前端逻辑：[app.js](/C:/Users/HUAWEI/Documents/Codex/2026-07-09/kol-kol-kol-tiktok-instagram-facebook/app.js)
- Supabase 权限 SQL：[deploy/supabase_browser_access.sql](/C:/Users/HUAWEI/Documents/Codex/2026-07-09/kol-kol-kol-tiktok-instagram-facebook/deploy/supabase_browser_access.sql)
