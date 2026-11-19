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
  ]],
  ["integrum", "Integrum", "#E8E7EF", [
    ["Замкнутый пояс", "round-02/integrum/integrum-1-color"],
    ["Интеграл", "round-02/integrum/integrum-2"],
    ["Общий корешок", "round-02/integrum/integrum-3"],
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
  ["vertex", "Vertex", "#E8E7E4", [
    ["Одна вершина", "round-02/vertex/vertex-1"],
    ["Точка V", "round-02/vertex/vertex-2-color"],
    ["Изолиния", "round-02/vertex/vertex-3"],
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
  ["svod-lh", "Свод LH", "#E4E8EA", [
    ["С с замковым камнем", "round-01/svod-2"],
    ["Портал с перемычкой", "round-02/svod-lh/svod-lh-2"],
    ["Сигнатура в углу", "round-02/svod-lh/svod-lh-3-color"],
  ]],
  ["kilson", "Кильсон", "#ECEBE5", []],
  ["incastro", "Incastro", "#ECEBE5", []],
  ["bastidor", "Bastidor", "#ECEBE5", []],
  ["innesto", "Innesto", "#ECEBE5", []],
  ["tessera", "Tessera", "#ECEBE5", []],
  ["launvest", "Launvest", "#ECEBE5", []],
]

const spellings = {
  modus: ['Модус', 'Modus'], osnova: ['Основа', 'Osnova'], sostav: ['Состав', 'Sostav'],
  aptus: ['Аптус', 'Aptus'], integrum: ['Интегрум', 'Integrum'], totum: ['Тотум', 'Totum'],
  nodus: ['Нодус', 'Nodus'], stratum: ['Стратум', 'Stratum'], unio: ['Унио', 'Unio'],
  frame: ['Фрейм', 'Frame'], core: ['Кор', 'Core'], foundry: ['Фаундри', 'Foundry'],
  bridge: ['Бридж', 'Bridge'], launch: ['Лонч', 'Launch'], vertex: ['Вертекс', 'Vertex'],
  stapel: ['Стапель', 'Stapel'], svod: ['Свод', 'Svod'], 'svod-lh': ['Свод ЛХ', 'Svod LH'],
  kilson: ['Кильсон', 'Kilson'], incastro: ['Инкастро', 'Incastro'], bastidor: ['Бастидор', 'Bastidor'],
  innesto: ['Иннесто', 'Innesto'], tessera: ['Тессера', 'Tessera'], launvest: ['Лонвест', 'Launvest'],
}

export const catalog = Object.fromEntries(groups.map(([id, title, color, designs]) => [
  id, { title, spellings: { ru: spellings[id][0], latin: spellings[id][1] }, color, items: [
    ...designs.map(([label, stem, series], index) => ({
      key: id + '-' + (index + 1), label, file: stem + '-board.png',
      mark: stem + '.svg', background: color, series,
    })),
    { key: 'description', label: 'Идея названия и логотипов · ' + title,
      file: 'round-02/' + id + '.md', background: '#faf8f5' },
  ] },
]))
