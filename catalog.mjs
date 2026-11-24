// Each name has its own studio section. Stems point to the symbol, lockup and board.
const groups = [
  ["modus", "Модус", "#ECEBE5", [
    ["Шаг меры", "round-02/modus/modus-1-color"],
    ["Складка М", "round-02/modus/modus-2"],
    ["Эксцентрик", "round-02/modus/modus-3"],
    ["Сгиб М", "box-study/modus", "box-study"],
  ]],
  ["osnova", "Основа", "#EDE7DF", [
    ["Пята опоры", "round-02/osnova/osnova-1"],
    ["Посадочное гнездо", "round-02/osnova/osnova-2-color"],
    ["Опорная О", "round-02/osnova/osnova-3"],
    ["Гнездо О", "box-study/osnova", "box-study"],
  ]],
  ["sostav", "Состав", "#E7EAE3", [
    ["Касса", "round-02/sostav/sostav-1-color"],
    ["Лигатура С", "round-02/sostav/sostav-2"],
    ["Шпонка", "round-02/sostav/sostav-3"],
  ]],
  ["aptus", "Aptus", "#E5EBE9", [
    ["Калибр", "round-02/aptus/aptus-1"],
    ["Косой стык", "round-02/aptus/aptus-2-color"],
    ["Лекало", "round-02/aptus/aptus-3"],
    ["Модульная рамка", "round-02/aptus/aptus-4", "aptus-reference"],
    ["Полосы и А", "round-02/aptus/aptus-5", "aptus-reference"],
    ["Узлы А", "round-02/aptus/aptus-6", "aptus-reference"],
    ["А в квадрате", "round-02/aptus/aptus-7", "aptus-reference"],
    ["А в квадрате · инверсия", "round-02/aptus/aptus-8", "aptus-reference"],
    ["Модульная рамка · крупная А", "round-02/aptus/aptus-9", "aptus-large-a"],
  ]],
  ["integrum", "Integrum", "#E8E7EF", [
    ["Замкнутый пояс", "round-02/integrum/integrum-1-color"],
    ["Интеграл", "round-02/integrum/integrum-2"],
    ["Общий корешок", "round-02/integrum/integrum-3"],
    ["Диаграмма со срезом", "new-marks/integrum-flat", "flat-chart"],
  ]],
  ["totum", "Totum", "#F0E8DF", [
    ["Полный оборот", "round-02/totum/totum-1"],
    ["Двойное Т", "round-02/totum/totum-2"],
    ["Круг из долей", "round-02/totum/totum-3-color"],
  ]],
  ["nodus", "Nodus", "#E5EAEF", [
    ["Переплёт", "round-02/nodus/nodus-1-color"],
    ["Тройник", "round-02/nodus/nodus-2"],
    ["Узловая N", "round-02/nodus/nodus-3"],
  ]],
  ["stratum", "Stratum", "#E9E5E0", [
    ["Срез породы", "round-02/stratum/stratum-1-color"],
    ["Уступ", "round-02/stratum/stratum-2"],
    ["Сдвиг S", "round-02/stratum/stratum-3"],
  ]],
  ["unio", "Unio", "#E9E8ED", [
    ["Слияние", "round-02/unio/unio-1"],
    ["Общее устье", "round-02/unio/unio-2"],
    ["Розетка", "round-02/unio/unio-3-color"],
  ]],
  ["frame", "Frame", "#E3E9E7", [
    ["Угольник F", "round-02/frame/frame-1-color"],
    ["Паспарту", "round-02/frame/frame-2"],
    ["Сгиб профиля", "round-02/frame/frame-3"],
    ["Клапан F", "box-study/frame", "box-study"],
  ]],
  ["core", "Core", "#EDE5E1", [
    ["Косточка", "round-02/core/core-1-color"],
    ["Сердечник", "round-02/core/core-2"],
    ["Внутренняя C", "round-02/core/core-3"],
  ]],
  ["foundry", "Foundry", "#EFE5DA", [
    ["Тигель", "round-02/foundry/foundry-1-color"],
    ["Отливка F", "round-02/foundry/foundry-2"],
    ["Две полуформы", "round-02/foundry/foundry-3"],
  ]],
  ["bridge", "Bridge", "#E4EAED", [
    ["Подвес", "round-02/bridge/bridge-1"],
    ["Сквозная B", "round-02/bridge/bridge-2"],
    ["Консоли", "round-02/bridge/bridge-3-color"],
  ]],
  ["launch", "Launch", "#EEE9DF", [
    ["Отрыв", "round-02/launch/launch-1-color"],
    ["Спусковая L", "round-02/launch/launch-2"],
    ["Выход на орбиту", "round-02/launch/launch-3"],
  ]],
  ["stapel", "Стапель", "#ECE9E2", [
    ["Киль в ложементе", "round-02/stapel/stapel-1-color"],
    ["Поперечный набор", "round-02/stapel/stapel-2"],
    ["Клиновые брусья", "round-02/stapel/stapel-3"],
    ["Спусковая дорожка", "round-02/stapel/stapel-4"],
    ["Портальный кран", "round-02/stapel/stapel-5"],
    ["Сухой док", "round-02/stapel/stapel-6"],
  ]],
  ["svod", "Свод", "#E6EAE6", [
    ["Встречная арка", "round-01/svod-1"],
    ["Замок кладки", "round-02/svod/svod-2-color"],
    ["Свод листов", "round-02/svod/svod-3"],
  ]],
  ["kilson", "Кильсон", "#ECEBE5", []],
  ["incastro", "Incastro", "#ECEBE5", []],
  ["bastidor", "Bastidor", "#ECEBE5", []],
  ["innesto", "Innesto", "#ECEBE5", [
    ["Точка сборки", "innesto/innesto-1", "innesto-study"],
    ["Вход в систему", "innesto/innesto-2", "innesto-study"],
    ["Боковой слот", "innesto/innesto-3", "innesto-study"],
    ["Верхний слот", "innesto/innesto-4", "innesto-study"],
    ["Модуль на стыке", "innesto/innesto-5", "innesto-study"],
    ["Скруглённое гнездо", "innesto/innesto-6", "innesto-study"],
    ["Клавиша Enter", "innesto/innesto-7", "innesto-study"],
    ["Вертикальный замок", "innesto/innesto-8", "innesto-study"],
    ["Замок вверх", "innesto/innesto-9", "innesto-study"],
    ["Замок вниз", "innesto/innesto-10", "innesto-study"],
    ["Прямой шип", "innesto/innesto-11", "innesto-study"],
    ["Монета в прорези", "innesto/innesto-12", "innesto-study"],
    ["Открытая копилка", "innesto/innesto-13", "innesto-study"],
    ["Коробка и монета", "innesto/innesto-14", "innesto-study"],
    ["Капсула и монета", "innesto/innesto-15", "innesto-study"],
    ["Модульная сетка", "innesto/innesto-16", "innesto-study"],
    ["Сетка с опорой", "innesto/innesto-17", "innesto-study"],
    ["Собранная сетка", "innesto/innesto-18", "innesto-study"],
    ["Три детали", "innesto/innesto-19", "innesto-study"],
    ["Диагональные модули", "innesto/innesto-20", "innesto-study"],
    ["Диагональная сборка", "innesto/innesto-21", "innesto-study"],
    ["Гнездо в кубе · цвет 1", "innesto/innesto-38", "innesto-study"],
    ["Гнездо в кубе · цвет 2", "innesto/innesto-39", "innesto-study"],
    ["Объёмная М · цвет 1", "innesto/innesto-46", "innesto-study"],
    ["Объёмная М · цвет 2", "innesto/innesto-47", "innesto-study"],
    ["Ромб с переходами", "innesto/innesto-34", "innesto-study"],
    ["Квадрат с переходами", "innesto/innesto-35", "innesto-study"],
    ["Пересечение модулей", "round-02/innesto/innesto-49", "innesto-intersection"],
    ["Соединённые блоки", "round-02/innesto/innesto-50", "innesto-blocks"],
    ["Кубическое кольцо", "round-02/innesto/innesto-52", "innesto-four-cubes"],
    ["Куб из отдельных модулей", "round-02/innesto/innesto-53", "innesto-four-cubes"],
    ["Скруглённый куб", "round-02/innesto/innesto-54", "innesto-four-cubes"],
    ["Куб с тремя выступами", "round-02/innesto/innesto-55", "innesto-modular-forms"],
    ["Арка и куб", "round-02/innesto/innesto-56", "innesto-modular-forms"],
    ["Двойная объёмная М", "round-02/innesto/innesto-57", "innesto-modular-forms"],
    ["Двойная М · синий и розовый", "round-02/innesto/innesto-58", "innesto-modular-forms"],
    ["Двойная М · графит и оранжевый", "round-02/innesto/innesto-59", "innesto-modular-forms"],
    ["Переплетённые скругления", "round-02/innesto/innesto-60", "innesto-reference-four"],
    ["М с квадратами", "round-02/innesto/innesto-61", "innesto-reference-four"],
    ["Составная D", "round-02/innesto/innesto-62", "innesto-reference-four"],
    ["Куб с просветом", "round-02/innesto/innesto-63", "innesto-reference-four"],
    ["Три соединённых узла", "round-02/innesto/innesto-64", "innesto-nodes-grid"],
    ["Три узла и точка", "round-02/innesto/innesto-65", "innesto-nodes-grid"],
    ["Сетка звёзд", "round-02/innesto/innesto-66", "innesto-nodes-grid"],
    ["Угловой модуль", "round-02/innesto/innesto-67", "innesto-angle-module"],
    ["Ступенчатые узлы", "round-02/innesto/innesto-68", "innesto-stepped-nodes"],
    ["Плавный контур · цельный", "round-02/innesto/innesto-69", "innesto-fluid-outline"],
    ["Плавный контур · стыки", "round-02/innesto/innesto-70", "innesto-fluid-outline"],
    ["Плавный контур · диагонали", "round-02/innesto/innesto-71", "innesto-fluid-outline"],
  ]],
  ["karamel", "Карамель", "#ECEBE5", [["Спираль роста", "round-02/karamel/karamel-1", "karamel-study"], ["Карамельная диаграмма", "round-02/karamel/karamel-2", "karamel-candy-chart"], ["Круглая карамельная диаграмма", "round-02/karamel/karamel-3", "karamel-candy-round"], ["Лента-леденец", "round-02/karamel/karamel-4", "karamel-candy-ribbon"]]],
  ["tessera", "Tessera", "#ECEBE5", [["Мозаичный узел", "round-02/tessera/tessera-1", "tessera-mosaic"]]],
  ["launvest", "Launvest", "#ECEBE5", []],
  ["investomika", "Инвестомика", "#ECEBE5", []],
  ["investport", "Инвестпорт", "#ECEBE5", []],
  ["investobridge", "Инвестобридж", "#ECEBE5", []],
  ["stackfin", "StackFin", "#ECEBE5", []],
  ["plugfin", "PlugFin", "#ECEBE5", []],
  ["nodeinvest", "NodeInvest", "#ECEBE5", []],
  ["investmesh", "InvestMesh", "#ECEBE5", []],
]

const spellings = {
  modus: ['Модус', 'Modus'], osnova: ['Основа', 'Osnova'], sostav: ['Состав', 'Sostav'],
  aptus: ['Аптус', 'Aptus'], integrum: ['Интегрум', 'Integrum'], totum: ['Тотум', 'Totum'],
  nodus: ['Нодус', 'Nodus'], stratum: ['Стратум', 'Stratum'], unio: ['Унио', 'Unio'],
  frame: ['Фрейм', 'Frame'], core: ['Кор', 'Core'], foundry: ['Фаундри', 'Foundry'],
  bridge: ['Бридж', 'Bridge'], launch: ['Лонч', 'Launch'],
  stapel: ['Стапель', 'Stapel'], svod: ['Свод', 'Svod'],
  kilson: ['Кильсон', 'Kilson'], incastro: ['Инкастро', 'Incastro'], bastidor: ['Бастидор', 'Bastidor'],
  investomika: ['Инвестомика', 'Investomika'],
  investport: ['Инвестпорт', 'Investport'],
  investobridge: ['Инвестобридж', 'Investobridge'],
  stackfin: ['Стэкфин', 'StackFin'],
  plugfin: ['Плагфин', 'PlugFin'],
  nodeinvest: ['Нодинвест', 'NodeInvest'],
  investmesh: ['Инвестмеш', 'InvestMesh'],
  karamel: ['Карамель', 'Karamel'], innesto: ['Иннесто', 'Innesto'], tessera: ['Тессера', 'Tessera'], launvest: ['Лонвест', 'Launvest'],
}

export const catalog = Object.fromEntries(groups.map(([id, title, color, designs]) => [
  id, { title, spellings: { ru: spellings[id][0], latin: spellings[id][1] }, color, items: [
    ...designs.map(([label, stem, series], index) => ({
      key: id + '-' + (id === 'innesto' ? Number(stem.split('-').at(-1)) : index + 1), label, file: stem + '-board.png',
      mark: stem + '.svg', background: color, series,
    })),
    { key: 'description', label: 'Идея названия и логотипов · ' + title,
      file: 'round-02/' + id + '.md', background: '#faf8f5' },
  ] },
]))

for (let i = 1; i <= 6; i++) {
  catalog.innesto.items.unshift({ key: 'quarter-' + i, label: 'Четверть круга · ' + i, file: 'new-marks/quarter-' + i + '-board.png', mark: 'new-marks/quarter-' + i + '.svg', background: '#ECEBE5', series: 'quarter-circle' })
}
catalog.innesto.items.unshift({ key: 'cube-reference-p', unassigned: true, label: 'Куб Р · 6 · 9', file: 'new-marks/cube-p-board.png', mark: 'new-marks/cube-p.svg', background: '#ECEBE5', series: 'cube-reference' })

// Самостоятельные знаки F: сочетаются с названиями, содержащими F.
catalog.innesto.items.push({ key: 'f-rounded-black', unassigned: true, markGroup: 'Знаки F', label: 'Мягкая F · чёрная', mark: 'round-02/f-marks/f-rounded-black.svg', file: 'round-02/f-marks/f-rounded-black-board.png', series: 'f-marks' })
catalog.innesto.items.push({ key: 'f-rounded-color', unassigned: true, markGroup: 'Знаки F', label: 'Мягкая F · цветная', mark: 'round-02/f-marks/f-rounded-color.svg', file: 'round-02/f-marks/f-rounded-color-board.png', series: 'f-marks' })
catalog.innesto.items.push({ key: 'f-block-black', unassigned: true, markGroup: 'Знаки F', label: 'Модульная F · чёрная', mark: 'round-02/f-marks/f-block-black.svg', file: 'round-02/f-marks/f-block-black-board.png', series: 'f-marks' })
catalog.innesto.items.push({ key: 'f-block-color', unassigned: true, markGroup: 'Знаки F', label: 'Модульная F · цветная', mark: 'round-02/f-marks/f-block-color.svg', file: 'round-02/f-marks/f-block-color-board.png', series: 'f-marks' })

catalog.innesto.items.push({ key: 'f-flow', unassigned: true, markGroup: 'Знаки F', label: 'Плавная F', mark: 'round-02/f-marks/f-flow.svg', file: 'round-02/f-marks/f-flow-board.png', series: 'f-flow' })
catalog.innesto.items.push({ key: 'p-modular', unassigned: true, markGroup: 'Знаки P', label: 'Модульная P', mark: 'round-02/p-marks/p-modular.svg', file: 'round-02/p-marks/p-modular-board.png', series: 'p-modular' })

// Алфавитные знаки доступны независимо от выбранного названия.
for (const [label, letter] of [
  ['A · Черепаха', 'a'],
  ['B · Бобр', 'b'],
  ['C · Крокодил', 'c'],
  ['D · Калла', 'd'],
  ['E · Медуза', 'e'],
  ['F · Попугай', 'f'],
  ['G · Хамелеон', 'g'],
  ['H · Слон', 'h'],
  ['I · Пингвин', 'i'],
  ['J · Морской конёк', 'j'],
  ['K · Жук-олень', 'k'],
  ['L · Фламинго', 'l'],
  ['M · Летучая мышь', 'm'],
  ['N · Змея', 'n'],
  ['O · Карпы кои', 'o'],
  ['P · Пеликан', 'p'],
  ['Q · Головастик', 'q'],
  ['R · Заяц', 'r'],
  ['S · Угорь', 's'],
  ['T · Гриб', 't'],
  ['U · Тюльпан', 'u'],
  ['V · Ласточка', 'v'],
  ['W · Волк', 'w'],
  ['X · Бабочка', 'x'],
  ['Y · Росток', 'y'],
  ['Z · Зебра', 'z'],
]) {
  catalog.innesto.items.push({ key: `animal-letter-${letter}`, unassigned: true, markGroup: "Живой алфавит", label, mark: `round-02/animal-alphabet/${letter}.svg`, file: `round-02/animal-alphabet/${letter}-board.png`, series: "animal-alphabet" })
}


// Векторные варианты, предоставленные пользователем.
for (let n = 31; n <= 41; n++) {
  catalog.innesto.items.push({ key: `frame-vector-${n}`, unassigned: true, markGroup: "Векторные варианты", label: `Frame ${n}`, mark: `round-02/frame-vectors/frame-${n}.svg`, file: `round-02/frame-vectors/frame-${n}-board.png`, series: "frame-vectors" })
}
