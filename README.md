# 中州论坛 Supabase 中转代理

论坛的网页在 GitHub Pages 上（国内能打开），但数据存在 Supabase 上，Supabase 的地址在国内时好时坏。
这个小服务就是一个转发：论坛页面先找它（它在国内能打开），它再把请求转给 Supabase，数据原样返回。

- 只转发到固定的 Supabase 项目 `nfdnprdxzviyiyvuzyyu.supabase.co`，不代理其他地址
- 不存任何数据，不记日志，不碰密码
- 部署在 Zeabur（免费额度），区域选香港，不用备案

部署：把这个仓库连到 Zeabur，选 Node.js、香港区，启动命令 `npm start`，拿到 `*.zeabur.app` 的域名后，
把论坛页面的数据地址改成这个域名即可。
