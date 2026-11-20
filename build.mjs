import { readFile, writeFile, access } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { catalog } from './catalog.mjs'

const relative = (file) => new URL(file, import.meta.url)
const load = (file) => readFile(relative(file), 'utf8')
const [shell, styles, script, motion, morphicons] = await Promise.all(
  ['shell.html', 'studio.css', 'studio.js', 'icon-motion.js', 'vendor/morphicons.js'].map(load))

const mockupShell = await load('mockup.html')
const mockupStyles = await load('mockup.css')
const mockupScript = await load('mockup.js')
const interfaceSource = await load('prototype/lh-invest-interface.html')
const productDocument = await load('product-document.js')
const variants = await Promise.all(Object.entries(catalog).flatMap(([group, concept]) =>
  concept.items.filter(item => item.mark).map(async item => {
    const svg = await load('assets/' + item.mark)
    const palette = [...new Set(Array.from(svg.matchAll(/(?:fill|stop-color)="(#[\da-f]{6})"/gi), match => match[1]))]
    const neutral = palette.length === 1 && /^#(?:000000|242424|262626|1[0-9a-f]{5}|2[0-9a-f]{5})$/i.test(palette[0])
    const groupColors = { modus: '#274C82', osnova: '#245E50', sostav: '#687F50', aptus: '#285B72', integrum: '#57418B', totum: '#705188', nodus: '#365B94', stratum: '#655D50', unio: '#846283', frame: '#245E50', core: '#B2583A', foundry: '#805B47', bridge: '#315D84', launch: '#CA5D35', stapel: '#315B7B', svod: '#346457', 'svod-lh': '#4F5382', innesto: '#245347' }
    const ownColor = groupColors[group] || '#315D84'
    const brandPalette = neutral ? [ownColor] : palette
    const brandSvg = neutral ? svg.replace(new RegExp(palette[0], 'gi'), ownColor) : svg
    const textColor = neutral ? '#262626' : (group === 'innesto' ? '#294b62' : ownColor)
    return { id: item.key, group: concept.title, label: item.label, name: concept.title, textColor,
      sub: 'Инвестиционная платформа', svg, palette, brandSvg, brandPalette, series: item.series }
  })))

// Saved favorites refer to the index of a mark. Keep the first 57 slots stable.
const seriesOrder = item => item.series === 'aptus-reference' ? 7 : item.series === 'flat-chart' ? 6 : item.series === 'cube-reference' ? 5 : item.series === 'quarter-circle' ? 4 : item.series === 'innesto-study' ? 2 : item.series === 'box-study' ? 1 : 0
variants.sort((a, b) => seriesOrder(a) - seriesOrder(b))

const formats = { '.jpg': 'jpeg', '.jpeg': 'jpeg', '.png': 'png', '.webp': 'webp', '.avif': 'avif' }
const run = promisify(execFile)
async function embedMaterial({ file, ...material }) {
  const extension = extname(file).toLowerCase()
  if (extension === '.md') {
    const source = fileURLToPath(relative('descriptions/' + file))
    const converter = fileURLToPath(relative('render-markdown.py'))
    const { stdout } = await run('python', [converter, source], { encoding: 'utf8' })
    return { ...material, document: stdout }
  }
  const format = formats[extension]
  if (!format) throw new Error('Unsupported raster format: ' + file)
  const image = await readFile(relative('assets/' + file))
  return { ...material, image: 'data:image/' + format + ';base64,' + image.toString('base64') }
}
const concepts = Object.fromEntries(await Promise.all(Object.entries(catalog).map(async ([id, concept]) => {
  const available = await Promise.all(concept.items.map(async item => {
    if (!item.file.endsWith('.md')) return true
    try { await access(relative('descriptions/' + item.file)); return true }
    catch { console.warn('Missing description:', item.file); return false }
  }))
  return [id, { ...concept, items: await Promise.all(concept.items.filter((_, index) => available[index]).map(embedMaterial)) }]
})))
const shortlist = await load('NAMING-SHORTLIST.md')
const shortlistNames = shortlist.split(/\r?\n/).filter(line => /^\|\s*\d+\s*\|/.test(line)).map(line => {
  const columns = line.split('|').slice(1, -1).map(value => value.trim())
  const title = columns[1].replaceAll('*', '')
  const existing = Object.values(concepts).find(c => c.title === title)
  const ru = /[А-Яа-яЁё]/.test(title) ? title : columns[2].replace(/[\u0300-\u036f]/g, '')
  const latin = columns[3]
  if (!existing) {
    const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    concepts['shortlist-' + latin.toLowerCase().replace(/[^a-z0-9]+/g, '-')] = {
      title, spellings: { ru, latin }, color: '#ECEBE5',
      items: [{ key: 'description', label: 'Идея названия · ' + title, document: '<p>' + escape(columns[4] + ' ' + columns[5]) + '</p>' }],
    }
  } else {
    existing.spellings = { ru, latin }
  }
  return title
})
shortlistNames.sort((a, b) => Number(b === 'Innesto') - Number(a === 'Innesto'))
const data = JSON.stringify(concepts).replaceAll('<', '\\u003c')
const studioVariants = JSON.stringify(variants).replaceAll('<', '\\u003c')
const font = await readFile(relative('../frontend/assets/fonts/Roboto-Variable.ttf'))
const [newShell, newStyles, newScript] = await Promise.all(['new-shell.html', 'new-studio.css', 'new-studio.js'].map(load))
const result = newShell
  .replace('<!-- STYLES -->', () => '<style>@font-face{font-family:RobotoLocal;src:url(data:font/ttf;base64,' + font.toString('base64') + ');font-weight:100 900;font-stretch:75% 100%}\n' + newStyles + '\n</style>')
  .replace('<!-- SCRIPTS -->', () => '<script>' + morphicons + '\nconst variants = ' + studioVariants + ';\nconst concepts = ' + data + ';\nconst productInterface = ' + JSON.stringify(interfaceSource).replaceAll('<', '\\u003c') + ';\n' + productDocument + '\nconst shortlistNames = ' + JSON.stringify(shortlistNames).replaceAll('<', '\\u003c') + ';\n' + newScript + '\n;\n' + motion.replace("if (control.id) return", "if (control.dataset.act && control.querySelector('svg')) return '[data-act=\"' + CSS.escape(control.dataset.act) + '\"]';\n    if (control.id) return") + '\n</script>')

await writeFile(relative('brand-review.html'), result, 'utf8')

const presentationEntries = Object.entries(concepts).filter(([, c]) => shortlistNames.includes(c.title) && c.items.some(item => item.image))
presentationEntries.sort((a, b) => Number(b[1].title === 'Innesto') - Number(a[1].title === 'Innesto'))
const presentationData = JSON.stringify(Object.fromEntries(presentationEntries)).replaceAll('<', '\\u003c')
const [presentationShell, presentationStyles, presentationScript, presentationMotion] = await Promise.all(
  ['presentation-shell.html', 'presentation.css', 'presentation.js', 'presentation-motion.js'].map(load))
const presentation = presentationShell
  .replace('<!-- STYLES -->', () => '<style>\n' + presentationStyles + '\n</style>')
  .replace('<!-- SCRIPTS -->', () => '<script>\n' + morphicons + '\nconst baseConcepts = ' + presentationData + ';\n' + presentationScript + '\n;\n' + presentationMotion + '\n</script>')
await writeFile(relative('presentation.html'), presentation, 'utf8')

const mockupData = JSON.stringify({ interfaceSource, variants }).replaceAll('<', '\\u003c')
const mockup = mockupShell
  .replace('<!-- STYLES -->', () => '<style>\n' + mockupStyles + '\n</style>')
  .replace('<!-- SCRIPTS -->', () => '<script>\nconst mockupData = ' + mockupData + ';\n' + productDocument + '\n' + mockupScript + '\n</script>')
await writeFile(relative('logo-mockup.html'), mockup, 'utf8')

const constructorShell = await load('constructor.html')
const constructorStyles = await load('constructor.css')
const constructorScript = await load('constructor.js')
const constructorData = JSON.stringify({ variants, names: shortlistNames.map(title => { const c = Object.values(concepts).find(item => item.title === title); return { title, ...c.spellings } }) }).replaceAll('<', '\\u003c')
const constructor = constructorShell
  .replace('<!-- STYLES -->', () => '<style>@font-face{font-family:RobotoLocal;src:url(data:font/ttf;base64,' + font.toString('base64') + ');font-weight:100 900;font-stretch:75% 100%}' + constructorStyles + '</style>')
  .replace('<!-- SCRIPTS -->', () => '<script>const data = ' + constructorData + ';\n' + constructorScript + '</script>')
await writeFile(relative('logo-constructor.html'), constructor, 'utf8')
