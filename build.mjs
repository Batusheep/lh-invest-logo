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
const data = JSON.stringify(concepts).replaceAll('<', '\\u003c')
const result = shell
  .replace('<!-- STYLES -->', () => '<style>\n' + styles + '\n</style>')
  .replace('<!-- SCRIPTS -->', () => '<script>\n' + morphicons + '\nconst baseConcepts = ' + data
    + '\n' + script + '\n;\n' + motion + '\n</script>')

await writeFile(relative('brand-review.html'), result, 'utf8')
