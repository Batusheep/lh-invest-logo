import { readFile, writeFile } from 'node:fs/promises'
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
const variants = await Promise.all(Object.entries(catalog).flatMap(([group, concept]) =>
  concept.items.filter(item => item.mark).map(async item => {
    const svg = await load('assets/' + item.mark)
    const palette = [...new Set(Array.from(svg.matchAll(/fill="(#[\da-f]{6})"/gi), match => match[1]))]
    return { id: item.key, group: concept.title, label: item.label, name: concept.title,
      sub: 'Инвестиционная платформа', svg, palette, series: item.series }
  })))

// Saved favorites refer to the index of a mark. Keep the first 57 slots stable.
variants.sort((a, b) => Number(a.series === 'box-study') - Number(b.series === 'box-study'))

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
const concepts = Object.fromEntries(await Promise.all(Object.entries(catalog).map(async ([id, concept]) =>
  [id, { ...concept, items: await Promise.all(concept.items.map(embedMaterial)) }])))
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
const data = JSON.stringify(concepts).replaceAll('<', '\\u003c')
const studioVariants = JSON.stringify(variants).replaceAll('<', '\\u003c')
const font = await readFile(relative('../frontend/assets/fonts/Roboto-Variable.ttf'))
const [newShell, newStyles, newScript] = await Promise.all(['new-shell.html', 'new-studio.css', 'new-studio.js'].map(load))
const result = newShell
  .replace('<!-- STYLES -->', () => '<style>@font-face{font-family:RobotoLocal;src:url(data:font/ttf;base64,' + font.toString('base64') + ');font-weight:100 900;font-stretch:75% 100%}\n' + newStyles + '\n</style>')
  .replace('<!-- SCRIPTS -->', () => '<script>' + morphicons + '\nconst variants = ' + studioVariants + ';\nconst concepts = ' + data + ';\nconst shortlistNames = ' + JSON.stringify(shortlistNames).replaceAll('<', '\\u003c') + ';\n' + newScript + '\n' + motion.replace("if (control.id) return", "if (control.dataset.act && control.querySelector('svg')) return '[data-act=\"' + CSS.escape(control.dataset.act) + '\"]';\n    if (control.id) return") + '\n</script>')

await writeFile(relative('brand-review.html'), result, 'utf8')

const presentationData = JSON.stringify(Object.fromEntries(Object.entries(concepts).filter(([, c]) => shortlistNames.includes(c.title) && c.items.some(item => item.image)))).replaceAll('<', '\\u003c')
const presentation = shell
  .replace('<!-- STYLES -->', () => '<style>@font-face{font-family:RobotoLocal;src:url(data:font/ttf;base64,' + font.toString('base64') + ');font-weight:100 900;font-stretch:75% 100%}\n' + styles + '</style>')
  .replace('<!-- SCRIPTS -->', () => '<script>' + morphicons + '\nconst concepts = ' + presentationData + ';\nconst studioVariants = ' + studioVariants + ';\n' + script + '\n' + motion + '</script>')
await writeFile(relative('presentation.html'), presentation, 'utf8')

const mockupData = JSON.stringify({ interfaceSource, variants }).replaceAll('<', '\\u003c')
const mockup = mockupShell
  .replace('<!-- STYLES -->', () => '<style>\n' + mockupStyles + '\n</style>')
  .replace('<!-- SCRIPTS -->', () => '<script>\nconst mockupData = ' + mockupData + ';\n' + mockupScript + '\n</script>')
await writeFile(relative('logo-mockup.html'), mockup, 'utf8')

const constructorShell = await load('constructor.html')
const constructorStyles = await load('constructor.css')
const constructorScript = await load('constructor.js')
const constructorData = JSON.stringify({ variants, names: shortlistNames.map(title => { const c = Object.values(concepts).find(item => item.title === title); return { title, ...c.spellings } }) }).replaceAll('<', '\\u003c')
const constructor = constructorShell
  .replace('<!-- STYLES -->', () => '<style>@font-face{font-family:RobotoLocal;src:url(data:font/ttf;base64,' + font.toString('base64') + ');font-weight:100 900;font-stretch:75% 100%}' + constructorStyles + '</style>')
  .replace('<!-- SCRIPTS -->', () => '<script>const data = ' + constructorData + ';\n' + constructorScript + '</script>')
await writeFile(relative('logo-constructor.html'), constructor, 'utf8')
