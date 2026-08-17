# DSH 玻璃主题 · 动态壁纸（glass-wall）

DeepSeek Harness 网页端插件：**透明毛玻璃主题 + 动态视频壁纸背景 + Wallpaper Engine 桌面壁纸控制工具**。

## 功能

| 能力 | 说明 |
|---|---|
| 透明毛玻璃 | 顶部栏 / 侧边栏 / 输入框半透明 + `backdrop-filter` 模糊（明暗双模式） |
| 动态视频壁纸 | 本地 mp4 铺满页面背景，静音循环播放，置于所有 UI 之下 |
| wallpaper 工具 | 让 AI 直接控制 Wallpaper Engine：下一张 / 上一张 / 暂停 / 继续 / 停止 / 静音 / 取消静音 |

## 文件

- `host.js` —— Host 半边：`wallpaper` 工具（调 `wallpaper64.exe -control`）+ `/glass-wall-video` 视频路由
- `client.js` —— Client 半边：主题 token 半透明覆盖 + 毛玻璃 CSS + 全屏 `<video>` 背景

## 使用（DSH 动态插件方式）

1. 把 `host.js` 内容作为 `code.host`、`client.js` 内容作为 `code.client`，通过 DSH 的 `cordis_define` / `cordis_run` 激活；
2. 准备视频：把任意 mp4 复制到 `C:\Users\Administrator\.dsh\glass-wall.mp4`；
3. Wallpaper Engine 路径按本机修改 `host.js` 里的 `WPE` 常量（默认 `E:\SteamLibrary\steamapps\common\wallpaper_engine\wallpaper64.exe`）。

## 换壁纸

- **动态**：把目标视频复制为 `glass-wall.mp4`，并把 `client.js` 里 `video.src` 的 `?v=N` 版本号 +1（避免浏览器缓存）；
- **控制桌面壁纸引擎**：对 AI 说「切下一张壁纸」「暂停壁纸」等，`wallpaper` 工具会执行对应命令。

## 注意

- 动态插件为会话级临时能力，进程重启后需重新激活；若要持久化，可把两个半边的代码封装成 profile 插件；
- 视频壁纸用 H.264（avc1）编码的 mp4 兼容性最好。
