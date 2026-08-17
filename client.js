// dsh-glass-wall · client 半边
// 透明毛玻璃（主题 token 覆盖 + backdrop-filter 模糊）+ 动态视频背景
// 使用：作为 DSH 动态插件的 code.client（cordis_define → cordis_run）
return {
  async apply(ctx) {
    const theme = ctx.get('theme')
    if (theme !== undefined) {
      ctx.effect(() => theme.overrideTokens('glass-wall', {
        '--dsw-alias-bg-base': { light: 'rgba(245,247,250,0.38)', dark: 'rgba(10,12,15,0.38)' },
        '--dsw-alias-bg-layer-1': { light: 'rgba(255,255,255,0.36)', dark: 'rgba(20,22,27,0.36)' },
        '--dsw-alias-bg-layer-2': { light: 'rgba(243,245,248,0.34)', dark: 'rgba(26,28,34,0.34)' },
        '--dsw-alias-bg-overlay': { light: 'rgba(255,255,255,0.50)', dark: 'rgba(17,19,23,0.50)' },
        '--dsw-specific-sidebar-fill': { light: 'rgba(242,244,248,0.38)', dark: 'rgba(15,17,21,0.38)' }
      }), 'glass-wall tokens')
    }
    const baseCss = [
      'html, body { background: transparent !important; }',
      '[data-slot="sidebar"], [data-slot="conversation.composer.bar"], [data-slot="conversation.session.header"], [data-slot="details"] {',
      '  backdrop-filter: blur(10px) saturate(1.3);',
      '  -webkit-backdrop-filter: blur(10px) saturate(1.3);',
      '}'
    ].join('\n')
    ctx.effect(() => styles.insert(baseCss), 'glass-wall css')
    // 动态视频背景：铺满全屏、静音循环，置于所有 UI 之下
    if (typeof document !== 'undefined' && document.body !== null) {
      const video = document.createElement('video')
      video.src = '/glass-wall-video?v=2'
      video.autoplay = true
      video.loop = true
      video.muted = true
      video.setAttribute('playsinline', '')
      video.setAttribute('muted', '')
      video.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;object-fit:cover;z-index:-9999;pointer-events:none;background:#000;'
      document.body.appendChild(video)
      video.play().catch(() => {})
      ctx.effect(() => () => {
        video.pause()
        video.remove()
      }, 'glass-wall video')
    }
  }
}
