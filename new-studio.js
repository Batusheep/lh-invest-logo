const groups=[...new Set(variants.map(v=>v.group))]
const namingFamilies=[{label:'Мост',names:['Bridge','Инвестобридж']},{label:'Узел',names:['Nodus','NodeInvest']}]
const allNames=[...new Set([...shortlistNames,...groups])]
const names=allNames.flatMap(n=>{const family=namingFamilies.find(f=>f.names.includes(n));return family?(family.names.find(x=>allNames.includes(x))===n?family.names.filter(x=>allNames.includes(x)):[]):[n]})
function nameOptions(selected){return names.map(n=>{const family=namingFamilies.find(f=>f.names.includes(n));if(family&&family.names.find(x=>names.includes(x))!==n)return '';const option=x=>'<option '+(x===selected?'selected':'')+'>'+esc(x)+'</option>';return family?'<optgroup label="'+esc(family.label)+'">'+family.names.filter(x=>names.includes(x)).map(option).join('')+'</optgroup>':option(n)}).join('')}
const rules={'Модус':'cds','Основа':'hds','Состав':'dgc','Aptus':'cds','Integrum':'hsc','Totum':'ghb','Nodus':'gcd','Stratum':'bcd','Unio':'hgd','Frame':'cgh','Core':'sdc','Foundry':'cbd','Bridge':'hsg','Launch':'dch','Стапель':'gcd','Свод':'ghs','Innesto':'ddd'}
const fonts={c:['RobotoLocal',650,'77%'],d:['RobotoLocal',730,'100%'],g:['RobotoLocal',540,'100%'],h:['Segoe UI',600,'100%'],s:['Georgia',400,'100%'],b:['Georgia',700,'100%']}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const icons = {
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.8a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
  compare: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="7" height="14" rx="1.5"/><rect x="14" y="5" width="7" height="14" rx="1.5"/></svg>',
  edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 20 4-.8L19 8.2 15.8 5 4.8 16 4 20ZM14.5 6.3l3.2 3.2M13 20h7"/></svg>',
  delete: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m-9 0 1 13h10l1-13M10 11v5m4-5v5"/></svg>'
}
const savedKey='lh-logo-favorites-v1'
let favorites=[]
try{favorites=JSON.parse(localStorage.getItem(savedKey)||'[]');if(!Array.isArray(favorites))favorites=[]}catch{}
try {
  const migrationKey = 'lh-logo-favorites-innesto-selection-v1'
  if (!localStorage.getItem(migrationKey)) {
    const retained = new Map([[97, 81], [98, 82], [105, 83], [106, 84], [93, 85], [94, 86]])
    favorites = favorites.filter(f => f.mark < 81 || retained.has(f.mark))
    favorites.forEach(f => { if (retained.has(f.mark)) f.mark = retained.get(f.mark) })
    localStorage.setItem(savedKey, JSON.stringify(favorites))
    localStorage.setItem(migrationKey, '1')
  }
} catch {}
try {
  const migrationKey = 'lh-logo-favorites-remove-letter-cubes-v1'
  if (!localStorage.getItem(migrationKey)) {
    favorites = favorites.filter(f => f.mark < 87 || f.mark >= 100)
    favorites.forEach(f => { if (f.mark >= 100) f.mark -= 13 })
    localStorage.setItem(savedKey, JSON.stringify(favorites))
    localStorage.setItem(migrationKey, '1')
  }
} catch {}
try {
  const migrationKey='lh-logo-favorites-remove-vertex-v1'
  if(!localStorage.getItem(migrationKey)){
    favorites=favorites.filter(f=>f.mark<42||f.mark>44)
    favorites.forEach(f=>{if(f.mark>44)f.mark-=3})
    localStorage.setItem(savedKey,JSON.stringify(favorites))
    localStorage.setItem(migrationKey,'1')
  }
} catch {}
let mode='edit', editing=null
const defaultMark = Math.max(0, variants.findIndex(v => v.id === 'innesto-1'))
let state={mark:defaultMark,name:'Innesto',language:'ru',invest:false,subtitle:'Инвестиционная платформа',colors:[...variants[defaultMark].palette],text:variants[defaultMark].textColor||'#262626',palette:'original'}
const app=document.querySelector('#app')
function save(){localStorage.setItem(savedKey,JSON.stringify(favorites))}
function visual(s){const v=variants[s.mark]||variants[0];let svg=v.svg;v.palette.forEach((color,i)=>{svg=svg.replace(new RegExp(color,'gi'),s.colors[i]||s.colors[0]||color)});const type=rules[v.group]?.[(Number(v.id.split('-').at(-1))-1)%3]||'d';return {v,img:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg),font:fonts[type]}}
function displayName(s){const c=Object.values(concepts).find(c=>c.title===s.name);const base=c&&s.language?c.spellings[s.language]:s.name;return base+(s.invest?(s.language==='latin'?' Invest':' Инвест'):'')}
function identity(s){const {img,font}=visual(s);return '<div class="identity"><img src="'+img+'" alt=""><strong style="font-family:'+font[0]+';font-weight:'+font[1]+';font-stretch:'+font[2]+';color:'+esc(s.text)+'">'+esc(displayName(s))+'</strong></div>'}
function history(name){const c=Object.values(concepts).find(c=>c.title===name);if(!c)return '<h1 class="history-title">'+esc(name)+'</h1><p>Описание для этого названия пока не добавлено.</p>';const d=new DOMParser().parseFromString(c.items.find(x=>x.document)?.document||'','text/html');let content='';for(const el of d.body.children){if(el.tagName==='H1')continue;if(el.tagName==='H2'&&el.textContent.trim()==='Идеи логотипов')break;content+=el.outerHTML}return '<h1 class="history-title">'+esc(name)+'</h1>'+content}

function markDescription(v){
  const c=Object.values(concepts).find(c=>c.title===v.group)
  const doc=c?.items.find(x=>x.document)?.document
  if(!doc)return ''
  const d=new DOMParser().parseFromString(doc,'text/html')
  const nodes=[...d.body.children]
  const descriptionLabel=v.id.startsWith('quarter-')?'Четверть круга — варианты 1–6':v.label
  let heading=nodes.findIndex(el=>el.tagName==='H3'&&el.textContent.replace(/^\s*\d+\.\s*/, '').trim()===descriptionLabel)
  if(heading>=0){let result='';for(let i=heading+1;i<nodes.length&&!/^H[123]$/.test(nodes[i].tagName);i++)result+=nodes[i].outerHTML;return result}
  if(v.group!=='Innesto')return ''
  const id=Number(v.id.match(/^innesto-(\d+)$/)?.[1]);let section=''
  if(id>=1&&id<=6)section='Идеи логотипов · слот и модуль'
  else if(id===7)return '<p>«Клавиша Enter» сохраняет форму клавиши и стрелку из эскиза. Отдельный квадрат обозначает модуль, входящий в платформу.</p>'
  else if(id>=8&&id<=11)section='Два блока с замком'
  else if(id>=12&&id<=15)section='Монета в прорези'
  else if(id>=16&&id<=21)section='Модульная композиция'
  else if([38,39,46,47].includes(id))section='Новые направления'
  if(!section)return ''
  heading=nodes.findIndex(el=>el.tagName==='H2'&&el.textContent.trim()===section)
  if(heading<0)return ''
  const next=nodes[heading+1];return next?.tagName==='P'?next.outerHTML:''
}
function mock(){return '<div class="mock-product"><iframe title="Предпросмотр продукта с выбранным логотипом" tabindex="-1"></iframe></div>'}
function mountProduct(s){
  const frame=app.querySelector('.mock-product iframe')
  if(!frame)return
  const {img}=visual(s)
  const payload={type:'logo-mockup',logo:img,brandColor:true,name:displayName(s),sub:s.subtitle}
  frame.addEventListener('load',()=>{frame.contentWindow.postMessage(payload,'*');setTimeout(()=>frame.contentWindow.postMessage(payload,'*'),180)})
  frame.srcdoc=productDocument(productInterface)
}
function chooseMark(index){const direction=index<state.mark?-1:1;index=(index+variants.length)%variants.length;while(!names.includes(variants[index].group))index=(index+direction+variants.length)%variants.length;state.mark=index;const v=variants[state.mark];state.colors=state.palette==='original'?[...v.palette]:v.palette.map((_,i)=>state.colors[i%state.colors.length]||'#262626');if(state.palette==='original')state.text=v.textColor||'#262626'}
const readyVariants=groups.filter(g=>names.includes(g)).flatMap(g=>variants.filter(v=>v.group===g))
const palettes=[{id:'original',label:'Исходная',colors:null},{id:'ink',label:'Графит',colors:['#262626']},{id:'blue',label:'Синий',colors:['#28528a']},{id:'forest',label:'Зелёный и терракота',colors:['#245e50','#c15e3b']},{id:'violet',label:'Фиолетовый и бирюза',colors:['#57418b','#168478']}]
function applyPreset(id){const i=variants.findIndex(v=>v.id===id);if(i<0)return;state.palette='original';chooseMark(i);state.name=variants[i].name;state.language=/[А-Яа-яЁё]/.test(state.name)?'ru':'latin';state.invest=false}
function applyPalette(id){const p=palettes.find(p=>p.id===id);if(!p)return;state.palette=id;const v=variants[state.mark], colors=p.colors||v.palette;state.colors=v.palette.map((_,i)=>colors[i%colors.length]);state.text=id==='original'?(v.textColor||'#262626'):colors[0]}
function render(){if(mode==='compare'){app.innerHTML='<div class="compare"><div class="compare-head"><div><div class="eyebrow">ВАША ПОДБОРКА</div><h1>Избранное</h1></div><button class="soft" data-act="back">← К редактированию</button></div>'+(favorites.length?'<div class="compare-grid">'+favorites.map((f,i)=>'<article class="glass fav">'+identity(f)+'<div class="fav-actions"><button class="soft icon-action" data-edit="'+i+'" aria-label="Редактировать" title="Редактировать">'+icons.edit+'</button><button class="soft icon-action" data-delete="'+i+'" aria-label="Удалить" title="Удалить">'+icons.delete+'</button></div></article>').join('')+'</div>':'<div class="glass empty">Пока нет сохранённых сочетаний. Добавьте понравившийся вариант в избранное.</div>')+'</div>';return}
const {v}=visual(state)
const presetOptions=groups.filter(g=>names.includes(g)).map(g=>'<optgroup label="'+esc(g)+'">'+readyVariants.filter(x=>x.group===g).map(x=>'<option value="'+esc(x.id)+'" '+(x===v&&state.name===x.name?'selected':'')+'>'+esc(x.name+' · '+x.label)+'</option>').join('')+'</optgroup>').join('')
const markOptions=groups.filter(g=>names.includes(g)).map(g=>'<optgroup label="'+esc(g)+'">'+variants.filter(x=>x.group===g).map(x=>'<option value="'+variants.indexOf(x)+'" '+(x===v?'selected':'')+'>'+esc(x.label)+'</option>').join('')+'</optgroup>').join('')
app.innerHTML='<div class="app"><section class="canvas"><div class="hero">'+(markDescription(v)?'<div class="mark-description">'+markDescription(v)+'</div>':'')+'<div class="size-previews" aria-label="Знак в разных размерах">'+[64,32,16].map(size=>'<img src="'+visual(state).img+'" width="'+size+'" height="'+size+'" alt="">').join('')+'</div>'+identity(state)+'<div class="arrows"><div class="arrow-group" role="group" aria-label="Смена знака"><button data-act="mark-prev" aria-label="Предыдущий знак"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg></button><button data-act="mark-next" aria-label="Следующий знак"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 6 6 6-6 6"/></svg></button></div><div class="arrow-group" role="group" aria-label="Смена названия"><button data-act="name-prev" aria-label="Предыдущее название"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg></button><button data-act="name-next" aria-label="Следующее название"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 6 6 6-6 6"/></svg></button><button class="language-toggle" data-act="toggle-language" aria-label="Переключить написание на '+(state.language==='latin'?'русское':'латиницу')+'" title="Переключить написание"><span aria-hidden="true">'+(state.language==='latin'?'EN':'РУ')+'</span></button><button class="invest-button" data-act="toggle-invest" aria-label="Добавить или убрать Инвест" aria-pressed="'+state.invest+'" title="Добавить или убрать Инвест">'+(state.language==='latin'?'INV':'ИНВ')+'</button></div></div></div><div class="under">'+mock(state)+'<div class="history">'+history(state.name)+'</div></div></section><aside class="glass panel"><div class="panel-head"><div><div class="eyebrow">КОНСТРУКТОР БРЕНДА</div><h1>Ваша комбинация</h1></div><button class="tour-help" data-act="tour-start" aria-label="Обучающий тур" title="Обучающий тур">?</button></div><p>Выберите знак, название и цвета. Сохраните сочетания, которые хотите сравнить.</p><div class="field">Готовое сочетание<div class="select-step"><select data-field="preset" aria-label="Готовое сочетание"><option value="">Выберите сочетание</option>'+presetOptions+'</select><button data-act="preset-prev" aria-label="Предыдущее сочетание"><svg viewBox="0 0 24 24"><path d="m14 6-6 6 6 6"/></svg></button><button data-act="preset-next" aria-label="Следующее сочетание"><svg viewBox="0 0 24 24"><path d="m10 6 6 6-6 6"/></svg></button></div></div><div class="field">Знак<div class="select-step"><select data-field="mark" aria-label="Знак">'+markOptions+'</select><button data-act="mark-prev" aria-label="Предыдущий знак"><svg viewBox="0 0 24 24"><path d="m14 6-6 6 6 6"/></svg></button><button data-act="mark-next" aria-label="Следующий знак"><svg viewBox="0 0 24 24"><path d="m10 6 6 6-6 6"/></svg></button></div></div><div class="field">Название<div class="select-step"><select data-field="name" aria-label="Название">'+nameOptions(state.name)+'</select><button data-act="name-prev" aria-label="Предыдущее название"><svg viewBox="0 0 24 24"><path d="m14 6-6 6 6 6"/></svg></button><button data-act="name-next" aria-label="Следующее название"><svg viewBox="0 0 24 24"><path d="m10 6 6 6-6 6"/></svg></button></div></div><label class="field">Написание<select data-field="language"><option value="ru" '+(state.language!=='latin'?'selected':'')+'>Русское</option><option value="latin" '+(state.language==='latin'?'selected':'')+'>Латиница</option></select></label><label class="field">Своё название<input data-field="custom" maxlength="32" value="'+esc(state.name)+'"></label><label class="field">Второстепенная подпись<input data-field="subtitle" maxlength="56" value="'+esc(state.subtitle)+'"></label><div class="field">Палитра<div class="palette-swatches" role="group" aria-label="Палитра">'+palettes.map(p=>'<button type="button" class="palette-swatch" data-palette="'+p.id+'" title="'+p.label+'" aria-label="'+p.label+'" aria-pressed="'+(state.palette===p.id)+'" style="background:'+(p.colors?(p.colors.length>1?'linear-gradient(135deg,'+p.colors.join(',')+')':p.colors[0]):'linear-gradient(135deg,'+variants[state.mark].palette.join(',')+')')+'"></button>').join('')+'</div></div><div class="colors">'+state.colors.map((c,i)=>'<label>Знак '+(i+1)+'<input type="color" data-field="color" data-index="'+i+'" value="'+esc(c)+'"></label>').join('')+'<label>Текст<input type="color" data-field="text" value="'+esc(state.text)+'"></label></div><div class="colors">'+[...new Set(['#262626',...state.colors])].map(c=>'<button class="soft" data-text="'+esc(c)+'" style="color:'+esc(c)+'">Аа</button>').join('')+'</div><div class="panel-actions"><button class="primary" data-act="save">'+icons.heart+'<span>'+(editing===null?'В избранное':'Сохранить изменения')+'</span></button><button class="soft" data-act="compare">'+icons.compare+'<span>Сравнить</span></button></div></aside></div>';mountProduct(state)}
app.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.edit!==undefined){editing=Number(b.dataset.edit);state=structuredClone(favorites[editing]);mode='edit'}else if(b.dataset.delete!==undefined){favorites.splice(Number(b.dataset.delete),1);save()}else if(b.dataset.text){state.text=b.dataset.text;state.palette='custom'}else if(b.dataset.palette){applyPalette(b.dataset.palette)}else{switch(b.dataset.act){case 'tour-start':startTour();return;case 'compare':mode='compare';break;case 'back':mode='edit';break;case 'preset-prev':case 'preset-next':{const i=readyVariants.findIndex(x=>x.id===variants[state.mark].id&&x.name===state.name);const step=b.dataset.act==='preset-next'?1:-1;applyPreset(readyVariants[(i<0?(step>0?0:readyVariants.length-1):(i+step+readyVariants.length)%readyVariants.length)].id);break}case 'mark-prev':case 'mark-next':{const i=readyVariants.findIndex(v=>v===variants[state.mark]);const step=b.dataset.act==='mark-next'?1:-1;chooseMark(variants.indexOf(readyVariants[(i+step+readyVariants.length)%readyVariants.length]));break}case 'name-prev':state.name=names[(Math.max(0,names.indexOf(state.name))-1+names.length)%names.length];break;case 'name-next':state.name=names[(Math.max(0,names.indexOf(state.name))+1)%names.length];break;case 'toggle-invest':state.invest=!state.invest;break;case 'toggle-language':state.language=state.language==='latin'?'ru':'latin';break;case 'save':if(editing===null)favorites.push(structuredClone(state));else favorites[editing]=structuredClone(state);save();editing=null;b.textContent='Сохранено';setTimeout(()=>render(),500);return}}render()})
app.addEventListener('change',e=>{const x=e.target,k=x.dataset.field;if(!k)return;if(k==='preset'){if(!x.value)return;applyPreset(x.value)}else if(k==='mark')chooseMark(Number(x.value));else if(k==='name'||k==='custom')state.name=x.value||names[0];else if(k==='language')state.language=x.value;else if(k==='invest')state.invest=x.checked;else if(k==='subtitle')state.subtitle=x.value;else if(k==='text')state.text=x.value;else if(k==='color'){state.colors[Number(x.dataset.index)]=x.value;state.palette='custom'}else if(k==='palette'){state.palette=x.value;const p={ink:['#262626'],blue:['#28528a'],forest:['#245e50','#c15e3b'],violet:['#57418b','#168478']};if(x.value!=='custom'){const colors=p[x.value]||variants[state.mark].palette;state.colors=variants[state.mark].palette.map((_,i)=>colors[i%colors.length]);state.text=x.value==='original'?'#262626':colors[0]}}render()})
const tourSteps=[
  {selector:'.hero .identity',title:'Предпросмотр логотипа',text:'Здесь отображается выбранное сочетание знака и названия. Кнопками под ним можно переключать варианты, написание и добавлять «Инвест».'},
  {selector:'.size-previews',title:'Знак в разных размерах',text:'Три размера помогают оценить, как знак выглядит в интерфейсе и в небольшом формате.'},
  {selector:'[data-field="preset"]',title:'Готовые сочетания',text:'Выберите готовый вариант с исходным названием и цветами. Стрелки рядом листают сочетания по порядку.'},
  {selector:'[data-field="mark"]',title:'Знак',text:'Выберите другой знак или переключайтесь стрелками. Его можно сочетать с любым названием.'},
  {selector:'[data-field="name"]',title:'Название',text:'Выберите название из списка или укажите своё в поле ниже.'},
  {selector:'.palette-swatches',title:'Палитра',text:'Выберите готовую палитру. Ниже можно отдельно изменить цвета элементов знака и текста.'},
  {selector:'.panel-actions',title:'Избранное и сравнение',text:'Сохраните понравившиеся сочетания, затем откройте сравнение, чтобы посмотреть их рядом.'},
  {selector:'.under',title:'Продукт и описание',text:'Внизу показано, как сочетание выглядит в интерфейсе продукта, и приведена идея выбранного названия.'}
]
let tourIndex=0,tourRoot=null,tourPreviousFocus=null
function startTour(){tourPreviousFocus=document.activeElement;tourIndex=0;tourRoot=document.createElement('div');tourRoot.className='tour-layer';tourRoot.innerHTML='<div class="tour-shade"></div><div class="tour-focus"></div><section class="tour-card" role="dialog" aria-modal="true" aria-labelledby="tour-title"><button class="tour-close" aria-label="Закрыть тур">×</button><div class="tour-count"></div><h2 id="tour-title"></h2><p></p><div class="tour-actions"><button data-tour="back">Назад</button><button data-tour="next">Далее</button></div></section>';document.body.append(tourRoot);tourRoot.addEventListener('click',e=>{if(e.target.closest('.tour-close')||e.target.classList.contains('tour-shade'))closeTour();const action=e.target.closest('[data-tour]')?.dataset.tour;if(action==='back'&&tourIndex>0){tourIndex--;showTourStep()}if(action==='next'){if(tourIndex===tourSteps.length-1)closeTour();else{tourIndex++;showTourStep()}}});window.addEventListener('resize',positionTour);window.addEventListener('keydown',tourKeys);showTourStep()}
function showTourStep(){const step=tourSteps[tourIndex],target=document.querySelector(step.selector);if(!target)return;target.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});tourRoot.querySelector('.tour-count').textContent=(tourIndex+1)+' / '+tourSteps.length;tourRoot.querySelector('h2').textContent=step.title;tourRoot.querySelector('p').textContent=step.text;tourRoot.querySelector('[data-tour="back"]').disabled=tourIndex===0;tourRoot.querySelector('[data-tour="next"]').textContent=tourIndex===tourSteps.length-1?'Готово':'Далее';positionTour();tourRoot.querySelector('[data-tour="next"]').focus({preventScroll:true})}
function positionTour(){if(!tourRoot)return;const target=document.querySelector(tourSteps[tourIndex].selector);if(!target)return;const r=target.getBoundingClientRect(),pad=6,focus=tourRoot.querySelector('.tour-focus'),card=tourRoot.querySelector('.tour-card');Object.assign(focus.style,{left:Math.max(0,r.left-pad)+'px',top:Math.max(0,r.top-pad)+'px',width:Math.min(innerWidth,r.width+pad*2)+'px',height:Math.min(innerHeight,r.height+pad*2)+'px'});const w=Math.min(340,innerWidth-24);card.style.width=w+'px';const h=card.offsetHeight;let left=r.right+18,top=r.top;if(left+w>innerWidth-12)left=r.left-w-18;if(left<12){left=Math.max(12,Math.min(innerWidth-w-12,r.left));top=r.bottom+18;if(top+h>innerHeight-12)top=r.top-h-18}top=Math.max(12,Math.min(innerHeight-h-12,top));card.style.left=left+'px';card.style.top=top+'px'}
function tourKeys(e){if(e.key==='Escape')closeTour()}
function closeTour(){tourRoot?.remove();tourRoot=null;window.removeEventListener('resize',positionTour);window.removeEventListener('keydown',tourKeys);tourPreviousFocus?.focus({preventScroll:true})}
render()

