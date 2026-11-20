const variants = mockupData.variants
const colors = [
  { id: 'black', label: 'Чёрный', value: '#242424' },
  { id: 'white', label: 'Белый', value: '#FFFFFF' },
  { id: 'blue', label: 'Светло-синий', value: '#B8D1FF' },
  { id: 'mint', label: 'Мятный', value: '#C9E4D6' },
  { id: 'gold', label: 'Золото', value: '#D6B46A' },
]
const frame = document.querySelector('iframe')
const viewport = document.querySelector('.viewport')
const scaledApp = document.querySelector('.scaled-app')
const zoom = document.querySelector('#zoom')
const zoomValue = document.querySelector('#zoom-value')
const nameInput = document.querySelector('#brand-name')
const subInput = document.querySelector('#brand-sub')
const variantSelect = document.querySelector('#variant-select')
const requestedId = location.hash.slice(1).replace(/^verf-([123])$/, (_, n) => 'stapel-' + (Number(n) + 3))
let activeVariant = variants.find(option => option.id === requestedId)?.id ?? variants.find(option => option.id === 'innesto-1')?.id ?? variants[0].id
let activeColor = 'brand'
let activeScreen = 'inv-overview'
let fitScale = 1

for (const name of [...new Set(variants.map(option => option.group))].sort((a,b) => Number(b === 'Innesto') - Number(a === 'Innesto'))) {
  const group = document.createElement('optgroup')
  group.label = name
  for (const variant of variants.filter(option => option.group === name)) {
    group.append(new Option(name + ' · ' + variant.label, variant.id))
  }
  variantSelect.append(group)
}

function selectVariant(id) {
  const variant = variants.find(option => option.id === id)
  activeVariant = variant.id
  variantSelect.value = variant.id
  nameInput.value = variant.name
  subInput.value = variant.sub
  renderColors()
}

function logoData(variantId = activeVariant) {
  const variant = variants.find(option => option.id === variantId)
  const ink = colors.find(color => color.id === activeColor)?.value ?? '#FFFFFF'
  let svg = activeColor === 'brand' ? variant.brandSvg : variant.svg
  if (activeColor !== 'brand') variant.palette.forEach(color => { svg = svg.replace(new RegExp(color, 'gi'), ink) })
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

function renderColors() {
  const palette = variants.find(option => option.id === activeVariant).brandPalette
  const choices = [{ id: 'brand', label: 'Цвет логотипа', value: palette.length > 1 ? 'linear-gradient(125deg,' + palette.join(',') + ')' : palette[0] }, ...colors]
  const shown = activeColor
  document.querySelector('.colors').innerHTML = choices.map(color =>
    `<button class="color-swatch" type="button" data-color="${color.id}" aria-label="${color.label}" title="${color.label}" aria-pressed="${color.id === shown}" style="--swatch:${color.value}"></button>`
  ).join('')
}


function syncBrand() {
  frame.contentWindow?.postMessage({
    type: 'logo-mockup', logo: logoData(), brandColor: activeColor === 'brand',
    name: nameInput.value, sub: subInput.value,
  }, '*')
}

function setScale(value) {
  const percent = Math.max(+zoom.min, Math.min(+zoom.max, value))
  zoom.value = percent
  zoomValue.value = percent + '%'
  const scale = fitScale * percent / 100
  scaledApp.style.transform = `scale(${scale})`
  scaledApp.style.width = `${1440 * scale}px`
  scaledApp.style.height = `${900 * scale}px`
}

function fit() {
  const availableWidth = Math.max(280, viewport.clientWidth - 48)
  const availableHeight = Math.max(300, viewport.clientHeight - 48)
  fitScale = Math.min(availableWidth / 1440, availableHeight / 900)
  setScale(+zoom.value)
}

function setScreen(screen) {
  activeScreen = screen
  document.querySelectorAll('[data-screen]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.screen === screen))
  })
  try { frame.contentWindow.location.hash = screen } catch { frame.contentWindow.postMessage({ type: 'navigate', screen }, '*') }
}

selectVariant(activeVariant)
frame.srcdoc = productDocument(mockupData.interfaceSource)
frame.addEventListener('load', () => {
  setScreen(activeScreen)
  syncBrand()
  setTimeout(syncBrand, 180)
})
document.querySelector('.variant-pager').addEventListener('click', event => {
  const button = event.target.closest('[data-step]')
  if (!button) return
  const index = variants.findIndex(option => option.id === activeVariant)
  selectVariant(variants[(index + Number(button.dataset.step) + variants.length) % variants.length].id)
  syncBrand()
})
variantSelect.addEventListener('change', () => {
  selectVariant(variantSelect.value)
  syncBrand()
})
document.querySelector('.screen-switch').addEventListener('click', event => {
  const button = event.target.closest('[data-screen]')
  if (button) setScreen(button.dataset.screen)
})
nameInput.addEventListener('input', syncBrand)
subInput.addEventListener('input', syncBrand)
nameInput.addEventListener('input', () => { variants.find(option => option.id === activeVariant).name = nameInput.value })
subInput.addEventListener('input', () => { variants.find(option => option.id === activeVariant).sub = subInput.value })
document.querySelector('.colors').addEventListener('click', event => {
  const button = event.target.closest('[data-color]')
  if (!button) return
  activeColor = button.dataset.color
  renderColors()
  syncBrand()
})
zoom.addEventListener('input', () => setScale(+zoom.value))
document.querySelectorAll('[data-zoom]').forEach(button => button.addEventListener('click', () => {
  setScale(+zoom.value + (button.dataset.zoom === 'in' ? 5 : -5))
}))
document.querySelector('#fit').addEventListener('click', () => { zoom.value = 100; fit() })
new ResizeObserver(fit).observe(viewport)
fit()
