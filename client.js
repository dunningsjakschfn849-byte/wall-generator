// dsh-glass-wall · client 半边
// 透明毛玻璃（主题 token 覆盖 + backdrop-filter 模糊）+ 动态视频背景 + 「玻璃主题」设置面板
// 使用：作为 DSH 动态插件的 code.client（cordis_define → cordis_run）
return {
  apply(ctx) {
    const theme = ctx.get('theme')
    const slots = ctx.get('slots')
    const state = { alpha: 0.38, blur: 10, videoOn: true }
    let video = null

    const buildTokens = (alpha) => ({
      '--dsw-alias-bg-base': { light: 'rgba(245,247,250,' + alpha + ')', dark: 'rgba(10,12,15,' + alpha + ')' },
      '--dsw-alias-bg-layer-1': { light: 'rgba(255,255,255,' + alpha + ')', dark: 'rgba(20,22,27,' + alpha + ')' },
      '--dsw-alias-bg-layer-2': { light: 'rgba(243,245,248,' + alpha + ')', dark: 'rgba(26,28,34,' + alpha + ')' },
      '--dsw-alias-bg-overlay': { light: 'rgba(255,255,255,' + Math.min(1, alpha + 0.12) + ')', dark: 'rgba(17,19,23,' + Math.min(1, alpha + 0.12) + ')' },
      '--dsw-specific-sidebar-fill': { light: 'rgba(242,244,248,' + alpha + ')', dark: 'rgba(15,17,21,' + alpha + ')' }
    })
    const applyTokens = () => {
      if (theme !== undefined) theme.overrideTokens('glass-wall', buildTokens(state.alpha))
    }
    const applyBlur = () => {
      if (typeof document !== 'undefined') document.documentElement.style.setProperty('--glass-blur', state.blur + 'px')
    }
    const applyVideo = () => {
      if (video !== null) video.style.display = state.videoOn ? '' : 'none'
    }

    applyTokens()
    const css = [
      'html, body { background: transparent !important; }',
      '[data-slot="sidebar"], [data-slot="conversation.composer.bar"], [data-slot="conversation.session.header"], [data-slot="details"] {',
      '  backdrop-filter: blur(var(--glass-blur, 10px)) saturate(1.3);',
      '  -webkit-backdrop-filter: blur(var(--glass-blur, 10px)) saturate(1.3);',
      '}'
    ].join('\n')
    ctx.effect(() => styles.insert(css), 'glass-wall css')
    applyBlur()

    if (typeof document !== 'undefined' && document.body !== null) {
      video = document.createElement('video')
      video.src = '/glass-wall-video?v=2'
      video.autoplay = true
      video.loop = true
      video.muted = true
      video.setAttribute('playsinline', '')
      video.setAttribute('muted', '')
      video.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;object-fit:cover;z-index:-9999;pointer-events:none;background:#000;'
      document.body.appendChild(video)
      video.play().catch(() => {})
      applyVideo()
      ctx.effect(() => () => {
        video.pause()
        video.remove()
      }, 'glass-wall video')
    }

    // 设置面板：设置 → 玻璃主题（透明度/模糊度/视频开关，实时生效）
    if (slots !== undefined) {
      const row = (label, value, min, max, step, display, onChange) =>
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, padding: '2px 0' } },
          React.createElement('span', { style: { minWidth: 92, fontSize: 13 } }, label),
          React.createElement('input', {
            type: 'range', min, max, step, value,
            onChange: (e) => onChange(Number(e.target.value)),
            style: { flex: 1 }
          }),
          React.createElement('span', { style: { minWidth: 46, fontSize: 12, textAlign: 'right', fontVariantNumeric: 'tabular-nums' } }, display(value))
        )
      const GlassPanel = (props) => {
        const [alpha, setAlpha] = React.useState(state.alpha)
        const [blur, setBlur] = React.useState(state.blur)
        const [videoOn, setVideoOn] = React.useState(state.videoOn)
        React.useEffect(() => {
          state.alpha = alpha
          state.blur = blur
          state.videoOn = videoOn
          applyTokens()
          applyBlur()
          applyVideo()
        }, [alpha, blur, videoOn])
        return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
          row('界面透明度', alpha, 0.2, 0.9, 0.02, (v) => Math.round(v * 100) + '%', setAlpha),
          row('毛玻璃模糊', blur, 0, 30, 1, (v) => v + 'px', setBlur),
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } },
            React.createElement('span', { style: { minWidth: 92, fontSize: 13 } }, '动态视频背景'),
            React.createElement('input', { type: 'checkbox', checked: videoOn, onChange: (e) => setVideoOn(e.target.checked) })
          ),
          React.createElement('div', { style: { fontSize: 12, opacity: 0.6, marginTop: 4 } }, '调整实时生效；插件重启后恢复默认值（动态插件为临时能力）。')
        )
      }
      slots.inject('settings.section', () => slots.register(
        { name: 'settings.section', id: 'glass-wall', order: 110, label: '玻璃主题' },
        GlassPanel
      ))
    }
  }
}
