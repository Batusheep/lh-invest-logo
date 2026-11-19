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

const [firstName, secondName] = Object.keys(concepts)
const lanes = { solo: newLane(firstName, 2), left: newLane(firstName, 1), right: newLane(secondName, 1) }
const laneTitles = { solo: 'Концепция', left: 'Слева', right: 'Справа' }
const stage = document.querySelector('#stage')
const globalControls = document.querySelector('#global-controls')
const dockLeft = document.querySelector('#dock-left')
const dockRight = document.querySelector('#dock-right')
const dockMiddle = document.querySelector('#dock-middle')
const dockEnd = document.querySelector('#dock-end')
const dockSettings = document.querySelector('#dock-settings')
const dockNavigation = document.querySelector('#dock-navigation')
const layoutMenu = document.querySelector('.layout-menu')
const catalog = document.querySelector('#catalog-dialog')
const zoom = document.querySelector('#zoom-dialog')
let fullscreenSurface
const announcement = document.querySelector('#announcement')
let mode = 'view'
let modeTransition
let compareStarted = false
let activeSide = 'left'
const names = Object.values(concepts).map(c => c.title)
const markGroups = [...new Set(studioVariants.map(v => v.group))]
const typeRules = ['cds','hds','dgc','cds','hsc','ghb','gcd','bcd','hgd','cgh','sdc','cbd','hsg','dch','gcs','gcd','ghs','gds']
const fonts = {
  c: ['RobotoLocal, sans-serif',650,'77%'], d:['RobotoLocal, sans-serif',730,'100%'],
  g:['RobotoLocal, sans-serif',540,'100%'], h:['Segoe UI, sans-serif',600,'100%'],
  s:['Georgia, serif',400,'100%'], b:['Georgia, serif',700,'100%'],
}
const assemblies = new Map()
const selectedNames = {}
function namingDocument(laneId, selectedName) {
  const name = selectedName ?? selectedNames[laneId] ?? concepts[lanes[laneId].conceptId].title
  const concept = Object.values(concepts).find(c => c.title === name)
  if (!concept) return '<h1>' + html(name) + '</h1><p>Для этого названия пока нет описания.</p>'
  const source = concept.items.find(item => item.document)?.document || ''
  const parsed = new DOMParser().parseFromString(source, 'text/html')
  const firstSection = []
  for (const element of parsed.body.children) {
    if (element.tagName === 'H2' && firstSection.some(e => e.tagName === 'H2')) break
    firstSection.push(element)
  }
  return firstSection.map(element => element.outerHTML).join('')
}
function refreshNaming(laneId, name) {
  selectedNames[laneId] = name
  document.querySelectorAll('.lane[data-lane="'+laneId+'"] .document-preview').forEach(el => { el.innerHTML = namingDocument(laneId) })
}
function assemblyFor(laneId, concept, item) {
  const key = laneId + '/' + concept.title + '/' + item.key
  if (!assemblies.has(key)) {
    const mark = studioVariants.findIndex(v => v.id === item.key)
    const variant = studioVariants[mark]
    assemblies.set(key, { mark, name:concept.title, subtitle:'Инвестиционная платформа', colors:[...variant.palette], text:'#262626', palette:'original' })
  }
  return assemblies.get(key)
}
function assemblyVisual(state) {
  const variant = studioVariants[state.mark]
  let svg = variant.svg
  variant.palette.forEach((color, i) => {
    svg = svg.replace(new RegExp(color, 'gi'), state.colors[i] || state.colors[0] || color)
  })
  const img = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  const group = markGroups.indexOf(variant.group)
  const index = Number(variant.id.split('-').at(-1)) - 1
  const font = fonts[typeRules[group]?.[index % 3] || 'd']
  return { variant, img, font }
}
function renderAssembly(laneId, state, item, index) {
  const assembly = assemblyFor(laneId, state.concept, item)
  const { variant, img, font } = assemblyVisual(assembly)
  const markOptions = markGroups.map(group => '<optgroup label="' + html(group) + '">' + studioVariants.filter(v => v.group === group).map(v => '<option value="'+html(v.id)+'"'+(v.id===variant.id?' selected':'')+'>'+html(v.label)+'</option>').join('')+'</optgroup>').join('')
  const nameOptions = names.map(name => '<option value="'+html(name)+'"'+(name===assembly.name?' selected':'')+'>'+html(name)+'</option>').join('')
  const controls = 'data-lane="'+laneId+'" data-index="'+index+'"'
  return `<div class="live-slide" ${controls}>
    <div class="live-header"><span>${html(variant.group.toUpperCase())}</span><span>LANDING<br>HEROES</span></div>
    <div class="naming-popover"><button class="naming-trigger" type="button" aria-label="Идея названия ${html(assembly.name)}" aria-describedby="naming-${laneId}-${index}">Аа</button><div class="naming-tip markdown-copy" id="naming-${laneId}-${index}" role="tooltip">${namingDocument(laneId, assembly.name)}</div></div>
    <div class="live-main">
      <div class="live-mark"><img src="${img}" alt=""></div>
      <div class="live-name"><span style="font-family:${font[0]};font-weight:${font[1]};font-stretch:${font[2]};color:${html(assembly.text)}">${html(assembly.name)}</span></div>
    </div>
    <div class="live-sub">${html(assembly.subtitle ?? 'Инвестиционная платформа')}</div>
    <div class="live-switches"><div><span>Знак</span><button data-live="mark-prev" aria-label="Предыдущий знак">←</button><button data-live="mark-next" aria-label="Следующий знак">→</button></div><div><span>Название</span><button data-live="name-prev" aria-label="Предыдущее название">←</button><button data-live="name-next" aria-label="Следующее название">→</button></div></div>
    <div class="live-app" aria-label="Пример в интерфейсе">
      <div class="live-app-side">
        <div class="live-app-brand"><img src="${img}" alt=""><div><strong style="font-family:${font[0]};font-weight:${font[1]};font-stretch:${font[2]};color:${html(assembly.text)}">${html(assembly.name)}</strong><span>${html(assembly.subtitle ?? 'Инвестиционная платформа')}</span></div></div>
        <div class="live-app-caption">Инвестиции</div>
        <div class="live-app-link"><span>⌂</span>Обзор</div><div class="live-app-link"><span>⊞</span>Инвестиции</div><div class="live-app-link selected"><span>♙</span>Профиль</div><div class="live-app-link"><span>♧</span>Уведомления</div>
        <div class="live-app-caption">Ещё</div><div class="live-app-link"><span>▱</span>Баланс</div><div class="live-app-link"><span>▥</span>Аналитика</div>
      </div>
      <div class="live-app-content"><div class="live-app-breadcrumb">Личный кабинет&nbsp; / &nbsp;<b>Профиль</b></div><strong class="live-app-title">Ваш профиль</strong><div class="live-app-description">Личные данные, документы и реквизиты</div><div class="live-app-card"><strong>Подтвердите личность</strong><p>Это нужно, чтобы инвестировать.</p><div class="live-app-steps"><span>✓</span><i></i><span>2</span></div><div class="live-app-columns"><div><b>Телефон</b><small>Подтверждено</small></div><div><b>Персональные данные</b><small>Следующий шаг</small></div></div><div class="live-app-action">Заполнить данные</div></div></div>
    </div>
    <div class="live-settings"><div class="live-panel">
      <label>Знак<select data-live-input="mark">${markOptions}</select></label>
      <label>Название<select data-live-input="name">${nameOptions}</select></label>
      <label>Своё название<input data-live-input="custom" maxlength="32" value="${html(assembly.name)}"></label>
      <label>Подпись<input data-live-input="subtitle" maxlength="56" value="${html(assembly.subtitle ?? 'Инвестиционная платформа')}"></label>
      <label>Палитра<select data-live-input="palette">${[['original','Исходная'],['ink','Графит'],['blue','Синий'],['forest','Зелёный и терракота'],['violet','Фиолетовый и бирюза'],['custom','Своя']].map(([value,label])=>'<option value="'+value+'"'+(assembly.palette===value?' selected':'')+'>'+label+'</option>').join('')}</select></label>
      <div class="live-colors">${assembly.colors.map((color,i)=>'<label>Знак '+(i+1)+'<input type="color" data-live-input="color" data-color-index="'+i+'" value="'+html(color)+'"></label>').join('')}<label>Текст<input type="color" data-live-input="text" value="${html(assembly.text)}"></label></div>
      <div class="text-swatches" aria-label="Цвет текста из логотипа"><span>Текст из знака</span><div>${[...new Set(['#262626', ...assembly.colors])].map(color=>'<button type="button" data-live="text-color" data-color="'+html(color)+'" style="--swatch:'+html(color)+'" aria-label="Цвет текста '+html(color)+'" aria-pressed="'+(assembly.text.toLowerCase()===color.toLowerCase())+'"></button>').join('')}</div></div>
      <label>Пресет<select data-live-input="preset"><option value="">Выберите сочетание</option><option value="modus-1">Модус · шаг меры</option><option value="osnova-2">Основа · гнездо</option><option value="frame-1">Frame · угольник</option><option value="stapel-1">Стапель · киль</option></select></label>
    </div></div>
  </div>`
}

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
    ? `<article class="markdown-copy document-preview" aria-label="Описание названия">${namingDocument(laneId)}</article>
        <button class="frame-expand document-expand" type="button" ${controls}>${icon('expand')}</button>`
    : renderAssembly(laneId, state, material, index)
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
    const maxCount = Math.min(6, concepts[lanes.solo.conceptId].items.length)
    const options = Array.from({ length: maxCount }, (_, index) => {
      const count = index + 1
      return button({ action: 'layout', lane: 'solo', value: count, label: 'Кадров на холсте: ' + count, css: 'layout-button', pressed: count === lanes.solo.count, body: count })
    })
    globalControls.innerHTML = '<div class="layout-actions" role="group" aria-label="Раскладка"><div class="layout-options">' + options.join('') + '</div></div>'
    return
  }
  const options = ['left', 'right'].map(laneId => {
    const other = laneId === 'left' ? 'right' : 'left'
    const maxCount = Math.min(6 - lanes[other].count, concepts[lanes[laneId].conceptId].items.length)
    const choices = Array.from({ length: maxCount }, (_, index) => {
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
  dockRight.hidden = mode === 'view'
  stage.innerHTML = (mode === 'view' ? ['solo'] : ['left', 'right']).map(renderLane).join('')
  const preview = describe(lanes[mode === 'view' ? 'solo' : activeSide])
  const mark = preview.displayed.map(i => preview.concept.items[i]).find(item => item?.mark)
    ?? preview.concept.items.find(item => item.mark)
  document.querySelector('.mockup-launch').href = 'logo-mockup.html#' + mark.key
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
    const sourceTitle = concepts[source.conceptId].title
    for (const [key, value] of assemblies) {
      const prefix = 'solo/' + sourceTitle + '/'
      if (key.startsWith(prefix)) assemblies.set('left/' + sourceTitle + '/' + key.slice(prefix.length), structuredClone(value))
    }
    selectedNames.left = selectedNames.solo || sourceTitle
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
      ? `<div class="document-reader-scroll" tabindex="0"><article class="markdown-copy document-reader">${namingDocument(laneId)}</article></div>`
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
  if (!open) globalControls.querySelectorAll('details[open]').forEach(menu => { menu.open = false })
}

document.addEventListener('toggle', event => {
  const menu = event.target
  if (!menu.matches('.concept-menu[open]')) return
  const options = menu.querySelector('.concept-options')
  const selected = options.querySelector('[aria-current="true"]')
  options.scrollTop = Math.max(0, selected.offsetTop - (options.clientHeight - selected.offsetHeight) / 2)
}, true)

document.addEventListener('click', event => {
  const liveButton = event.target.closest('[data-live]')
  if (liveButton) {
    const slide = liveButton.closest('.live-slide')
    const lane = lanes[slide.dataset.lane]
    const concept = concepts[lane.conceptId]
    const item = concept.items[Number(slide.dataset.index)]
    const state = assemblyFor(slide.dataset.lane, concept, item)
    const action = liveButton.dataset.live
    if (action === 'text-color') {
      state.text = liveButton.dataset.color
    } else if (action.startsWith('mark')) {
      state.mark = (state.mark + (action.endsWith('next') ? 1 : -1) + studioVariants.length) % studioVariants.length
      const palette = studioVariants[state.mark].palette
      state.colors = state.palette === 'original' ? [...palette] : palette.map((_,i) => state.colors[i % state.colors.length])
    } else {
      const i = names.indexOf(state.name)
      state.name = names[(Math.max(0,i) + (action.endsWith('next') ? 1 : -1) + names.length) % names.length]
      refreshNaming(slide.dataset.lane, state.name)
    }
    slide.outerHTML = renderAssembly(slide.dataset.lane, {concept}, item, Number(slide.dataset.index))
    return
  }
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
      selectedNames[lane] = concepts[value].title
      lanes[lane].count = Math.min(lanes[lane].count, concepts[value].items.length)
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

document.addEventListener('change', event => {
  const input = event.target.closest('[data-live-input]')
  if (!input) return
  const slide = input.closest('.live-slide')
  const laneId = slide.dataset.lane
  const concept = concepts[lanes[laneId].conceptId]
  const item = concept.items[Number(slide.dataset.index)]
  const state = assemblyFor(laneId, concept, item)
  const change = input.dataset.liveInput
  if (change === 'mark' || change === 'preset') {
    if (!input.value) return
    state.mark = studioVariants.findIndex(v => v.id === input.value)
    const v = studioVariants[state.mark]
    if (change === 'preset') { state.name = v.name; state.palette = 'original'; state.text = '#262626' }
    state.colors = state.palette === 'original' ? [...v.palette] : v.palette.map((_,i) => state.colors[i % state.colors.length])
  } else if (change === 'name' || change === 'custom') state.name = input.value || concept.title
  else if (change === 'subtitle') state.subtitle = input.value
  else if (change === 'color') { state.colors[Number(input.dataset.colorIndex)] = input.value; state.palette = 'custom' }
  else if (change === 'text') { state.text = input.value; state.palette = 'custom' }
  else if (change === 'palette') {
    const palettes = { ink:['#262626'], blue:['#28528a'], forest:['#245e50','#c15e3b'], violet:['#57418b','#168478'] }
    if (input.value === 'custom') return
    const colors = change && (palettes[input.value] || studioVariants[state.mark].palette)
    state.colors = studioVariants[state.mark].palette.map((_,i) => colors[i % colors.length])
    state.text = input.value === 'original' ? '#262626' : colors[0]
    state.palette = input.value
  }
  const index = Number(slide.dataset.index)
  if (change === 'name' || change === 'custom' || change === 'preset') refreshNaming(laneId, state.name)
  slide.outerHTML = renderAssembly(laneId, {concept}, item, index)
})

document.addEventListener('input', event => {
  const input = event.target.closest('[data-live-input="subtitle"]')
  if (!input) return
  const slide = input.closest('.live-slide')
  const concept = concepts[lanes[slide.dataset.lane].conceptId]
  const item = concept.items[Number(slide.dataset.index)]
  assemblyFor(slide.dataset.lane, concept, item).subtitle = input.value
  slide.querySelector('.live-sub').textContent = input.value
  slide.querySelector('.live-app-brand span').textContent = input.value
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
  if (event.target.matches('select, input, textarea') || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return
  const lane = mode === 'view' ? 'solo' : (event.target.closest('.lane')?.dataset.lane ?? activeSide)
  event.preventDefault()
  changePage(lane, event.key === 'ArrowLeft' ? -1 : 1)
})

render()
