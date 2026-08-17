// dsh-glass-wall · host 半边
// 注册 wallpaper 工具（控制 Wallpaper Engine）+ /glass-wall-video 视频路由
// 使用：作为 DSH 动态插件的 code.host（cordis_define → cordis_run）
return {
  inject: ['shell'],
  apply(ctx) {
    // Wallpaper Engine 安装路径，按本机修改
    const WPE = 'E:/SteamLibrary/steamapps/common/wallpaper_engine/wallpaper64.exe'
    const CMDS = {
      next: 'nextWallpaper',
      prev: 'prevWallpaper',
      pause: 'pause',
      play: 'play',
      stop: 'stop',
      mute: 'mute',
      unmute: 'unmute'
    }
    harness.registerTool(ctx, harness.defineTool({
      name: 'wallpaper',
      description: '控制 Wallpaper Engine 桌面壁纸引擎。action 取值: next(下一张) / prev(上一张) / pause(暂停) / play(继续) / stop(停止) / mute(静音) / unmute(取消静音)。',
      parameters: {
        action: { type: 'string', required: true, description: '操作: next / prev / pause / play / stop / mute / unmute' }
      },
      output: { schema: { type: 'string' }, render(_a, v) { return [{ type: 'text', text: v }] } },
      async execute(args) {
        const action = String(args.action ?? '').toLowerCase().trim()
        const cmd = CMDS[action]
        if (cmd === undefined) return '未知操作: ' + action + '（可用: ' + Object.keys(CMDS).join(' / ') + '）'
        const spec = ctx.shell.resolve({ command: '"' + WPE + '" -control ' + cmd, timeoutMs: 20000 })
        const result = await ctx.shell.run(spec)
        if (result.exitCode === 0) return '壁纸引擎已执行: ' + action
        return '执行失败 (exit ' + result.exitCode + '): ' + String(result.stderr ?? '').slice(0, 400)
      }
    }))
    // 视频壁纸路由：把本地 mp4 提供给浏览器当背景
    const fs = ctx.get('fs')
    const webServer = ctx.get('webServer')
    if (fs !== undefined && webServer !== undefined) {
      ctx.effect(() => webServer.register({
        kind: 'exact',
        path: '/glass-wall-video',
        handler: async (req, res) => {
          try {
            const target = await fs.resolve('C:/Users/Administrator/.dsh/glass-wall.mp4')
            const bytes = await fs.readBytes(target, undefined, 64 * 1024 * 1024)
            res.writeHead(200, { 'content-type': 'video/mp4', 'content-length': String(bytes.length), 'cache-control': 'no-store' })
            res.end(bytes)
          } catch (error) {
            res.writeHead(404)
            res.end('not found')
          }
        }
      }), 'glass-wall video route')
    }
  }
}
