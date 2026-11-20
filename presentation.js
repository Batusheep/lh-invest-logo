const concepts = baseConcepts

const glyphs = {
  left: '<path d="m14 6-6 6 6 6"/>',
  right: '<path d="m10 6 6 6-6 6"/>',
  down: '<path d="m7 10 5 5 5-5"/>',
  check: '<path d="m5 12 4 4 10-9"/>',
  pin: '<path d="M15 4 20 9l-3 1-3 4v3l-1 1-7-7 1-1h3l4-3zM10 15l-5 5"/>',
  grid: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
  document: '<path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6m-6 4h6"/>',
  expand: '<path d="M14 5h5v5M10 19H5v-5m14-9-5 5M5 19l5-5"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  leftLayout: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M12 5v14M7.5 8.5v7"/>',
  rightLayout: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M12 5v14M16.5 8.5v7"/>',
}

function icon(name) {
  return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + glyphs[name] + '</svg>'
}

function html(value) {
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }
  return String(value).replace(/[&<>"]/g, character => entities[character])
}

function newLane(conceptId, count) {
  return { conceptId, count, positions: {} }
}

const [firstConcept, secondConcept] = Object.keys(concepts)
const lanes = { solo: newLane(firstConcept, 3), left: newLane(firstConcept, 1), right: newLane(secondConcept || firstConcept, 1) }
const laneTitles = { solo: 'Концепция', left: 'Слева', right: 'Справа' }
const stage = document.querySelector('#stage')
const globalControls = document.querySelector('#global-controls')
const dockLeft = document.querySelector('#dock-left')
const dockRight = document.querySelector('#dock-right')
const dockMiddle = document.querySelector('#dock-middle')
const dockEnd = document.querySelector('#dock-end')
const dockSettings = document.querySelector('#dock-settings')
const dockNavigation = document.querySelector('#dock-navigation')
const layoutToggle = document.querySelector('#layout-toggle')
const layoutMenu = document.querySelector('.layout-menu')
const catalog = document.querySelector('#catalog-dialog')
const zoom = document.querySelector('#zoom-dialog')
let fullscreenSurface
const announcement = document.querySelector('#announcement')
let mode = 'view'
let modeTransition
let compareStarted = false
let activeSide = 'left'

function positionFor(lane) {
  return lane.positions[lane.conceptId] ??= { pins: {}, offset: 0, held: null }
}

function describe(lane) {
  const concept = concepts[lane.conceptId]
  const position = positionFor(lane)
  const pinned = new Set(Object.values(position.pins))
  const available = concept.items.map((_, index) => index).filter(index => !pinned.has(index))
  const freeSlots = Array.from({ length: lane.count }, (_, slot) => slot).filter(slot => position.pins[slot] === undefined)
  const offset = available.length ? position.offset % available.length : 0
  const canPage = freeSlots.length > 0 && available.length > 1
  const displayed = Array.from({ length: lane.count }, (_, slot) => position.pins[slot] ?? null)
  freeSlots.forEach((slot, index) => {
    if (index < available.length) displayed[slot] = available[(offset + index) % available.length]
  })
  return { concept, position, available, freeSlots, canPage, offset, displayed: position.held ?? displayed }
}

function button({ action, lane, value, label, glyph, css = 'icon-button', pressed, disabled = false, body }) {
  const identifier = [action, lane, value].filter(part => part !== undefined).join('-')
  return '<button type="button" class="' + css + '" data-action="' + action + '"'
    + (lane ? ' data-lane="' + lane + '"' : '')
    + (value !== undefined ? ' data-value="' + value + '"' : '')
    + ' data-focus="' + identifier + '" aria-label="' + label + '" title="' + label + '"'
    + (pressed !== undefined ? ' aria-pressed="' + pressed + '"' : '')
    + (disabled ? ' disabled' : '') + '>' + (body ?? icon(glyph)) + '</button>'
}

function titleFor(laneId, action) {
  return laneId === 'solo' ? action : action + ' · ' + laneTitles[laneId]
}

function renderFrame(laneId, state, index, slot) {
  if (index === null) return '<div class="empty-slot" aria-hidden="true"></div>'
  const material = state.concept.items[index]
  const label = html(material.label)
  const pinned = state.position.pins[slot] === index
  const isDocument = 'document' in material
  const controls = `data-action="zoom" data-lane="${laneId}" data-value="${index}" data-focus="zoom-${laneId}-${index}" aria-label="Увеличить · ${label}"`
  const expand = `<span class="frame-expand">${icon('expand')}</span>`
  const visual = isDocument
    ? `<article class="markdown-copy document-preview" tabindex="0" aria-label="${label}">${material.document}</article>
        <button class="frame-expand document-expand" type="button" ${controls}>${icon('expand')}</button>`
    : `<button class="frame-open" type="button" ${controls}>
        <img src="${material.image}" alt="${label} · ${html(state.concept.title)}" draggable="false">
        ${expand}
      </button>`
  return `<figure class="frame" data-kind="${isDocument ? 'document' : 'image'}" data-key="${html(material.key)}" data-material="${index}" data-pinned="${pinned}" style="--media-bg:${html(material.background)}">
    <div class="frame-visual">
      ${visual}
    </div>
    <div class="frame-tools">${button({ action: 'pin', lane: laneId, value: slot, label: pinned ? 'Открепить кадр' : 'Закрепить кадр', glyph: 'pin', css: 'icon-button frame-pin', pressed: pinned })}</div>
  </figure>`
}

function renderLane(laneId) {
  const lane = lanes[laneId]
  const state = describe(lane)
  return `<section class="lane" data-lane="${laneId}" aria-label="${html(titleFor(laneId, state.concept.title))}">
    <div class="frame-grid" data-count="${lane.count}">${state.displayed.map((index, slot) => renderFrame(laneId, state, index, slot)).join('')}</div>
  </section>`
}

function renderLaneControls(laneId) {
  const lane = lanes[laneId]
  const { concept, freeSlots, canPage } = describe(lane)
  const options = Object.entries(concepts).map(([id, option]) => {
    const current = id === lane.conceptId
    return `<button type="button" class="concept-option" data-action="concept" data-lane="${laneId}" data-value="${html(id)}"${current ? ' aria-current="true"' : ''} style="--concept-accent:${html(option.color)}">
      <span class="accent-dot" aria-hidden="true"></span><span>${html(option.title)}</span>${current ? icon('check') : ''}
    </button>`
  }).join('')
  return {
    identity: `<div class="lane-identity" style="--concept-accent:${html(concept.color)}">
        <details class="concept-menu choice-menu">
          <summary class="concept-select" data-focus="concept-${laneId}" title="${html(concept.title)}" aria-label="${html(titleFor(laneId, 'Выбрать концепцию · ' + concept.title))}">
            <span class="accent-dot" aria-hidden="true"></span><span>${html(concept.title)}</span>${icon('down')}
          </summary>
          <div class="concept-options" role="group" aria-label="${titleFor(laneId, 'Концепции')}">${options}</div>
        </details>
      </div>`,
    actions: `<div class="pager" role="group" aria-label="${titleFor(laneId, freeSlots.length ? 'Листание материалов' : 'Все видимые кадры закреплены')}">
          ${button({ action: 'page', lane: laneId, value: -1, label: titleFor(laneId, 'Предыдущие материалы'), glyph: 'left', disabled: !canPage })}
          ${button({ action: 'catalog', lane: laneId, label: titleFor(laneId, 'Все материалы'), css: 'icon-button catalog-button', glyph: 'grid' })}
          ${button({ action: 'page', lane: laneId, value: 1, label: titleFor(laneId, 'Следующие материалы'), glyph: 'right', disabled: !canPage })}
      </div>`,
  }
}

function renderControls() {
  if (mode === 'view') {
    const options = Array.from({ length: 6 }, (_, index) => {
      const count = index + 1
      return button({ action: 'layout', lane: 'solo', value: count, label: 'Кадров на холсте: ' + count, css: 'layout-button', pressed: count === lanes.solo.count, body: count })
    })
    globalControls.innerHTML = '<div class="layout-actions" role="group" aria-label="Раскладка"><div class="layout-options">' + options.join('') + '</div></div>'
    return
  }
  const options = ['left', 'right'].map(laneId => {
    const other = laneId === 'left' ? 'right' : 'left'
    const choices = Array.from({ length: 6 - lanes[other].count }, (_, index) => {
      const count = index + 1
      return button({ action: 'layout', lane: laneId, value: count,
        label: 'Кадров ' + laneTitles[laneId].toLowerCase() + ': ' + count,
        css: 'layout-button', pressed: count === lanes[laneId].count, body: count })
    }).join('')
    const label = 'Кадров ' + laneTitles[laneId].toLowerCase()
    const count = lanes[laneId].count
    return `<details class="panel-select choice-menu" data-lane="${laneId}">
      <summary class="layout-trigger" data-focus="layout-${laneId}" aria-label="${label}: ${count}" title="${label}">
        ${icon(laneId + 'Layout')}<span>${count}</span>${icon('down')}
      </summary>
      <div class="layout-choices" role="group" aria-label="${label}">${choices}</div>
    </details>`
  })
  globalControls.innerHTML = '<div class="layout-actions" role="group" aria-label="Раскладка">' + options.join('') + '</div>'
}

function render() {
  const active = document.activeElement
  const focus = active?.dataset.focus
  stage.dataset.mode = mode
  const settingsParent = mode === 'view' ? dockEnd : dockMiddle
  if (dockSettings.parentElement !== settingsParent) {
    settingsParent.append(dockSettings)
    if (dockSettings.contains(active)) active.focus({ preventScroll: true })
  }
  dockRight.hidden = mode === 'view'
  stage.innerHTML = (mode === 'view' ? ['solo'] : ['left', 'right']).map(renderLane).join('')
  if (mode === 'view') {
    const { identity, actions } = renderLaneControls('solo')
    dockLeft.innerHTML = identity
    dockNavigation.innerHTML = actions
  } else {
    const left = renderLaneControls('left')
    const right = renderLaneControls('right')
    dockLeft.innerHTML = left.identity
    dockRight.innerHTML = right.identity
    dockNavigation.innerHTML = left.actions + right.actions
  }
  document.querySelectorAll('.dock [data-action="mode"]').forEach(control => {
    control.setAttribute('aria-pressed', String(control.dataset.value === mode))
  })
  renderControls()
  if (focus) document.querySelector('[data-focus="' + CSS.escape(focus) + '"]')?.focus({ preventScroll: true })
}

function openMode(value) {
  if (mode === value) return
  setLayoutMenu(false)
  if (value === 'compare' && !compareStarted) {
    const source = lanes.solo
    const { displayed, position } = describe(source)
    const firstPin = Object.values(position.pins)[0]
    const copy = { pins: firstPin === undefined ? {} : { 0: firstPin }, offset: position.offset, held: null }
    lanes.left = { conceptId: source.conceptId, count: 1, positions: { [source.conceptId]: copy } }
    if (copy.pins[0] === undefined && displayed[0] !== null) copy.offset = Math.max(0, describe(lanes.left).available.indexOf(displayed[0]))
    if (lanes.right.conceptId === source.conceptId) lanes.right.conceptId = Object.keys(concepts).find(id => id !== source.conceptId)
    compareStarted = true
  }
  mode = value
  if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    render()
    return
  }
  modeTransition?.skipTransition()
  const transition = document.startViewTransition(render)
  modeTransition = transition
  transition.finished.then(() => {
    if (modeTransition === transition) modeTransition = undefined
  })
}

function updateLayout(laneId, count) {
  if (lanes[laneId].count === count) return
  const lane = lanes[laneId]
  const state = describe(lane)
  if (count < lane.count) {
    for (const position of Object.values(lane.positions)) {
      for (const slot of Object.keys(position.pins)) {
        if (Number(slot) >= count) delete position.pins[slot]
      }
      position.held = null
    }
  } else {
    state.position.held = null
  }
  lane.count = count
  render()
}

function changePage(laneId, direction) {
  const { position, available, canPage, offset } = describe(lanes[laneId])
  if (!canPage) return
  position.offset = (offset + direction + available.length) % available.length
  position.held = null
  render()
}

function togglePin(laneId, slot) {
  const lane = lanes[laneId]
  const state = describe(lane)
  const materialIndex = state.displayed[slot]
  const { position } = state
  if (materialIndex === null || materialIndex === undefined) return
  const removing = position.pins[slot] !== undefined
  if (removing) delete position.pins[slot]
  else position.pins[slot] = materialIndex
  position.held = [...state.displayed]
  const firstFree = describe(lane).freeSlots.find(freeSlot => state.displayed[freeSlot] !== null)
  if (firstFree !== undefined) position.offset = Math.max(0, describe(lane).available.indexOf(state.displayed[firstFree]))
  announcement.textContent = state.concept.items[materialIndex].label + (removing ? ' · кадр откреплён' : ' · кадр закреплён')
  render()
}

function renderDialogHeading(title, description = '') {
  return '<div class="dialog-heading"><div><h2>' + html(title) + '</h2>' + (description ? '<p>' + html(description) + '</p>' : '') + '</div>'
    + button({ action: 'close', label: 'Закрыть', glyph: 'close' }) + '</div>'
}

function openCatalog(laneId) {
  const { concept, position, displayed } = describe(lanes[laneId])
  const pinned = Object.values(position.pins)
  const contents = concept.items.map((item, index) => {
    const status = pinned.includes(index) ? 'Закреплён' : (displayed.includes(index) ? 'На холсте' : '')
    const label = html(status ? item.label + ' · ' + status : item.label)
    return `<button type="button" class="catalog-item" data-action="pick" data-lane="${laneId}" data-value="${index}" aria-label="${label}" title="${label}">
      ${'document' in item ? `<span class="catalog-document">${icon('document')}</span>` : `<img src="${item.image}" alt="">`}
    </button>`
  })
  catalog.innerHTML = renderDialogHeading('Материалы', titleFor(laneId, concept.title)) + '<div class="catalog-grid">' + contents.join('') + '</div>'
  catalog.showModal()
}

function openZoom(laneId, index) {
  if (zoom.open) return
  const concept = concepts[lanes[laneId].conceptId]
  const item = concept.items[index]
  const isDocument = 'document' in item
  zoom.dataset.kind = isDocument ? 'document' : 'image'
  zoom.setAttribute('aria-label', item.label + ' · ' + concept.title)
  zoom.innerHTML = '<div class="zoom-surface">'
    + button({ action: 'close', label: 'Закрыть полноэкранный просмотр', glyph: 'close', css: 'icon-button zoom-close' })
    + (isDocument
      ? `<div class="document-reader-scroll" tabindex="0"><article class="markdown-copy document-reader">${item.document}</article></div>`
      : `<div class="zoom-content" style="--media-bg:${html(item.background)}"><img class="zoom-image" src="${item.image}" alt="${html(item.label)}"></div>`)
    + '</div>'
  zoom.showModal()
  const surface = zoom.firstElementChild
  if (!document.fullscreenEnabled || document.fullscreenElement || !navigator.userActivation?.isActive) return
  surface.requestFullscreen().then(() => {
    if (document.fullscreenElement !== surface) return
    if (!zoom.open || zoom.firstElementChild !== surface) {
      return document.exitFullscreen()
    }
    fullscreenSurface = surface
  }).catch(() => {
    // Embedded previews may deny browser fullscreen; the viewer is already open.
  })
}

zoom.addEventListener('close', () => {
  if (zoom.open) return
  const shouldExit = fullscreenSurface && document.fullscreenElement === fullscreenSurface
  fullscreenSurface = undefined
  if (shouldExit) document.exitFullscreen().catch(() => {})
})

document.addEventListener('fullscreenchange', () => {
  if (fullscreenSurface && document.fullscreenElement !== fullscreenSurface && zoom.open) zoom.close()
})

function pickItem(laneId, index) {
  catalog.close()
  const { position, displayed, available, freeSlots } = describe(lanes[laneId])
  if (displayed.includes(index)) {
    document.querySelector('[data-focus="zoom-' + laneId + '-' + index + '"]')?.focus()
    return
  }
  const target = available.indexOf(index)
  if (!freeSlots.length || target === -1) {
    openZoom(laneId, index)
    return
  }
  position.offset = target
  position.held = null
  render()
  document.querySelector('[data-focus="zoom-' + laneId + '-' + index + '"]')?.focus()
}

function setLayoutMenu(open) {
  globalControls.hidden = !open
  layoutToggle.setAttribute('aria-expanded', String(open))
  if (!open) globalControls.querySelectorAll('details[open]').forEach(menu => { menu.open = false })
}

layoutMenu.addEventListener('pointerenter', event => {
  if (event.pointerType === 'mouse') setLayoutMenu(true)
})
layoutMenu.addEventListener('pointerleave', event => {
  if (event.pointerType === 'mouse' && !layoutMenu.querySelector(':focus-visible')) setLayoutMenu(false)
})
layoutToggle.addEventListener('click', event => {
  const mouseClick = event.detail > 0 && matchMedia('(hover: hover) and (pointer: fine)').matches
  setLayoutMenu(mouseClick || globalControls.hidden)
})
layoutMenu.addEventListener('focusout', event => {
  if (event.relatedTarget && !layoutMenu.contains(event.relatedTarget) && !layoutMenu.matches(':hover')) setLayoutMenu(false)
})

document.addEventListener('toggle', event => {
  const menu = event.target
  if (!menu.matches('.concept-menu[open]')) return
  const options = menu.querySelector('.concept-options')
  const selected = options.querySelector('[aria-current="true"]')
  options.scrollTop = Math.max(0, selected.offsetTop - (options.clientHeight - selected.offsetHeight) / 2)
}, true)

document.addEventListener('click', event => {
  document.querySelectorAll('.choice-menu[open]').forEach(menu => {
    if (!menu.contains(event.target)) menu.open = false
  })
  if (!layoutMenu.contains(event.target)) setLayoutMenu(false)
  if (event.target instanceof HTMLDialogElement) {
    event.target.close()
    return
  }
  const control = event.target.closest('button[data-action]')
  if (!control || control.disabled) return
  const { action, lane, value } = control.dataset
  if (lane === 'left' || lane === 'right') activeSide = lane
  switch (action) {
    case 'mode': openMode(value); break
    case 'concept':
      lanes[lane].conceptId = value
      render()
      document.querySelector('[data-focus="concept-' + lane + '"]').focus({ preventScroll: true })
      break
    case 'layout': {
      const menu = control.closest('.panel-select')
      if (menu) menu.open = false
      updateLayout(lane, Number(value))
      if (menu) globalControls.querySelector('[data-focus="layout-' + lane + '"]')?.focus({ preventScroll: true })
      break
    }
    case 'page': changePage(lane, Number(value)); break
    case 'pin': togglePin(lane, Number(value)); break
    case 'catalog': openCatalog(lane); break
    case 'zoom': openZoom(lane, Number(value)); break
    case 'pick': pickItem(lane, Number(value)); break
    case 'close': control.closest('dialog').close(); break
  }
})

document.addEventListener('keydown', event => {
  if (catalog.open || zoom.open || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
  const choiceMenu = event.target.closest('.choice-menu[open]') ?? document.querySelector('.choice-menu[open]')
  if (event.key === 'Escape' && choiceMenu) {
    choiceMenu.open = false
    choiceMenu.querySelector('summary').focus({ preventScroll: true })
    return
  }
  if (choiceMenu?.contains(event.target) && ['ArrowUp', 'ArrowDown'].includes(event.key)) {
    const choices = [...choiceMenu.querySelectorAll('button')]
    const current = choices.indexOf(event.target)
    const next = current === -1 ? (event.key === 'ArrowDown' ? 0 : choices.length - 1)
      : (current + (event.key === 'ArrowDown' ? 1 : -1) + choices.length) % choices.length
    event.preventDefault()
    choices[next].focus()
    return
  }
  if (event.key === 'Escape' && !globalControls.hidden) {
    setLayoutMenu(false)
    layoutToggle.focus()
    return
  }
  if (event.target.matches('select, input, textarea') || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return
  const lane = mode === 'view' ? 'solo' : (event.target.closest('.lane')?.dataset.lane ?? activeSide)
  event.preventDefault()
  changePage(lane, event.key === 'ArrowLeft' ? -1 : 1)
})

render()
