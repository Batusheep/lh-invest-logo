(() => {
  const { createMorph, svgToIcon } = globalThis.studioMorph
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
  const animatedControls = 'button, summary'
  const players = new Map()
  const geometries = new Map()

  function identity(control) {
    if (control.id) return '#' + CSS.escape(control.id)
    const { focus, action, lane, value } = control.dataset
    if (focus) return '[data-focus="' + CSS.escape(focus) + '"]'
    return action && ['action', 'lane', 'value'].filter(key => control.dataset[key] !== undefined)
      .map(key => '[data-' + key + '="' + CSS.escape(control.dataset[key]) + '"]').join('')
  }

  function geometry(control, svg) {
    const { action, value } = control.dataset
    const direction = action === 'page' ? Number(value) * 2 : 0
    const angle = action === 'pin' ? -16 : action === 'close' ? 12 : 0
    const transform = `translate(${direction} 0) rotate(${angle} 12 12) translate(-1.44 -1.44) scale(1.12)`
    const markup = svg.innerHTML
    const key = transform + '|' + markup
    if (!geometries.has(key)) {
      const outline = '<svg viewBox="0 0 24 24" fill="none">'
      geometries.set(key, {
        base: svgToIcon(outline + markup + '</svg>'),
        peak: svgToIcon(outline + '<g transform="' + transform + '">' + markup + '</g></svg>'),
      })
    }
    return geometries.get(key)
  }

  function bind(player, control) {
    const svg = control?.querySelector('svg')
    if (!svg || svg === player.svg) return
    player.svg = svg
    player.markup = svg.innerHTML
    player.path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    svg.replaceChildren(player.path)
    if (player.pathData) player.path.setAttribute('d', player.pathData)
  }

  function play(control) {
    if (!control || control.disabled || reducedMotion.matches) return
    const svg = control.querySelector('svg')
    const key = identity(control)
    if (!svg || !key || players.has(key)) return
    const { base, peak } = geometry(control, svg)
    const player = {}
    bind(player, control)
    const morph = createMorph({
      setAttribute(name, value) {
        if (name === 'd') player.pathData = value
        player.path.setAttribute(name, value)
      },
    }, base, { reducedMotion: 'user' })
    players.set(key, player)
    morph.morphTo(peak, 'snappy')
    setTimeout(() => morph.morphTo(base, 'snappy'), 145)
    setTimeout(() => {
      morph.destroy()
      player.svg.innerHTML = player.markup
      players.delete(key)
    }, 560)
  }

  new MutationObserver(() => {
    for (const [key, player] of players) bind(player, document.querySelector(key))
  }).observe(document.body, { childList: true, subtree: true })

  document.addEventListener('pointerover', event => {
    if (event.pointerType !== 'mouse') return
    const control = event.target.closest(animatedControls)
    if (control && !control.contains(event.relatedTarget)) play(control)
  })
  document.addEventListener('click', event => play(event.target.closest(animatedControls)), true)
})()
