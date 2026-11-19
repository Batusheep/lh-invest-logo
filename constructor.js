const typeRules = ['cds','hds','dgc','cds','hsc','ghb','gcd','bcd','hgd','cgh','sdc','cbd','hsg','dch','gcs','gcd','ghs','gds']
const groups = [...new Set(data.variants.map(v => v.group))]
const fonts = {
  c: { family:'RobotoLocal, sans-serif', weight:650, stretch:'77%', label:'Roboto Condensed · 650' },
  d: { family:'RobotoLocal, sans-serif', weight:730, stretch:'100%', label:'Roboto · 730' },
  g: { family:'RobotoLocal, sans-serif', weight:540, stretch:'100%', label:'Roboto · 540' },
  h: { family:'Segoe UI, sans-serif', weight:600, stretch:'100%', label:'Segoe UI · Semibold' },
  s: { family:'Georgia, serif', weight:400, stretch:'100%', label:'Georgia · Regular' },
  b: { family:'Georgia, serif', weight:700, stretch:'100%', label:'Georgia · Bold' },
}
for (const variant of data.variants) {
  const groupIndex = groups.indexOf(variant.group)
  const index = Number(variant.id.split('-').at(-1)) - 1
  variant.type = fonts[typeRules[groupIndex]?.[index % 3] || 'd']
}
const markSelect = document.querySelector('#mark-select')
const nameSelect = document.querySelector('#name-select')
for (const groupName of groups) {
  const group = document.createElement('optgroup')
  group.label = groupName
  for (const v of data.variants.filter(item => item.group === groupName)) group.append(new Option(v.label, v.id))
  markSelect.append(group)
}
for (const name of data.names) nameSelect.add(new Option(name.title, name.title))
const presets = [
  { title:'Модус · шаг меры', description:'Ритм и точность · синий и оранжевый', mark:'modus-1', name:'Модус' },
  { title:'Основа · посадочное гнездо', description:'Опора для продукта · зелёный и медный', mark:'osnova-2', name:'Основа' },
  { title:'Frame · угольник', description:'Структура и пространство · зелёный и оранжевый', mark:'frame-1', name:'Frame' },
  { title:'Стапель · киль', description:'Сборка и запуск · синий и терракота', mark:'stapel-1', name:'Стапель' },
]
const state = { mark:0, name:0, custom:'', language:'ru', invest:false, colors:[], text:'#262626', palette:'original' }
function displayName() {
  const name = state.custom || data.names[state.name][state.language]
  return name + (state.invest ? (state.language === 'ru' ? ' Инвест' : ' Invest') : '')
}
const mark = () => data.variants[state.mark]
function original() { return mark().palette.length ? mark().palette : ['#262626'] }
function setMark(index) {
  const previousColors = state.colors
  state.mark = (index + data.variants.length) % data.variants.length
  state.colors = state.palette === 'original' || !previousColors.length
    ? [...original()]
    : original().map((_, i) => previousColors[i % previousColors.length])
  render()
}
function setName(index) {
  state.name = (index + data.names.length) % data.names.length
  state.custom = ''
  render()
}
function fitWord() {
  const word = document.querySelector('#word')
  word.style.fontSize = ''
  let size = parseFloat(getComputedStyle(word).fontSize)
  while (word.scrollWidth > word.clientWidth + 1 && size > 18) {
    size -= 1
    word.style.fontSize = size + 'px'
  }
}
function render() {
  const v = mark()
  markSelect.value = v.id
  nameSelect.value = data.names[state.name].title
  for (let i = 0; i < data.names.length; i++) nameSelect.options[i].text = data.names[i][state.language]
  document.querySelector('#name-language').value = state.language
  document.querySelector('#add-invest').checked = state.invest
  document.querySelector('#custom-name').value = state.custom
  const name = displayName()
  const word = document.querySelector('#word')
  word.textContent = name
  Object.assign(word.style, {fontFamily:v.type.family,fontWeight:v.type.weight,fontStretch:v.type.stretch,color:state.text})
  requestAnimationFrame(fitWord)
  document.querySelector('#type-info').textContent = 'Начертание знака · ' + v.type.label
  document.querySelector('#preview-label').textContent = v.group + ' / ' + v.label
  let svg = v.svg
  original().forEach((color, index) => { svg = svg.replace(new RegExp(color, 'gi'), state.colors[index]) })
  document.querySelector('#mark').innerHTML = svg
  const palettes = [
    {id:'original', label:'Исходные цвета знака', colors:original(), text:'#262626'},
    {id:'ink', label:'Графит', colors:['#262626'], text:'#262626'},
    {id:'blue', label:'Синий', colors:['#28528a'], text:'#28528a'},
    {id:'forest', label:'Зелёный и терракота', colors:['#245e50','#c15e3b'], text:'#245e50'},
    {id:'violet', label:'Фиолетовый и бирюза', colors:['#57418b','#168478'], text:'#44366a'},
  ]
  document.querySelector('#palettes').innerHTML = palettes.map(p => '<button class="palette" type="button" data-palette="'+p.id+'" title="'+p.label+'" aria-label="'+p.label+'" aria-pressed="'+(state.palette===p.id)+'" style="background:'+ (p.colors.length>1?'linear-gradient(135deg,'+p.colors.join(',')+')':p.colors[0]) +'"></button>').join('')
  const fields = document.querySelector('#color-fields')
  fields.replaceChildren()
  state.colors.forEach((color, i) => {
    const label = document.createElement('label')
    label.textContent = state.colors.length > 1 ? 'Знак ' + (i+1) : 'Знак'
    const input = document.createElement('input')
    input.type='color'; input.value=color; input.setAttribute('aria-label',label.textContent)
    input.addEventListener('input', () => { state.colors[i]=input.value; state.palette='custom'; render() })
    label.append(input); fields.append(label)
  })
  const label = document.createElement('label')
  label.textContent='Текст'
  const input=document.createElement('input')
  input.type='color'; input.value=state.text; input.setAttribute('aria-label','Цвет текста')
  input.addEventListener('input',()=>{state.text=input.value;state.palette='custom';render()})
  label.append(input);fields.append(label)
  document.querySelector('#palettes').onclick = event => {
    const p = palettes.find(p => p.id === event.target.dataset.palette)
    if (!p) return
    state.colors = original().map((_,i)=>p.colors[i%p.colors.length])
    state.text = p.text; state.palette=p.id; render()
  }
}
markSelect.addEventListener('change',()=>setMark(data.variants.findIndex(v=>v.id===markSelect.value)))
nameSelect.addEventListener('change',()=>setName(data.names.findIndex(name=>name.title===nameSelect.value)))
document.querySelector('#name-language').addEventListener('change',event=>{state.language=event.target.value;render()})
document.querySelector('#add-invest').addEventListener('change',event=>{state.invest=event.target.checked;render()})
document.querySelector('#custom-name').addEventListener('input',event=>{state.custom=event.target.value;document.querySelector('#word').textContent=displayName();fitWord()})
window.addEventListener('resize',fitWord)
document.fonts.ready.then(fitWord)
document.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>{
  const [part,step]=button.dataset.step.split(':')
  if(part==='mark')setMark(state.mark+Number(step));else setName(state.name+Number(step))
}))
document.querySelector('#reset').addEventListener('click',()=>{state.name=0;state.custom='';state.language='ru';state.invest=false;state.text='#262626';state.palette='original';setMark(0)})
const presetBox=document.querySelector('#presets')
for(const preset of presets.filter(preset => data.names.some(name => name.title === preset.name))){
  const button=document.createElement('button');button.className='preset'
  const title=document.createElement('strong');title.textContent=preset.title
  const description=document.createElement('span');description.textContent=preset.description
  button.append(title,description)
  button.addEventListener('click',()=>{state.name=data.names.findIndex(name=>name.title===preset.name);state.custom='';state.text='#262626';state.palette='original';setMark(data.variants.findIndex(v=>v.id===preset.mark));document.querySelector('.workspace').scrollIntoView({behavior:'smooth',block:'start'})})
  presetBox.append(button)
}
render()
