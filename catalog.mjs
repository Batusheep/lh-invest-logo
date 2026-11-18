const materialTypes = [
  ['identity', 'Название и знак'],
  ['dashboard', 'Кабинет платформы'],
  ['broadcast', 'Обложка трансляции'],
  ['mark', 'Компактный знак'],
  ['portfolio', 'Экран портфеля'],
  ['sales', 'Коммерческий материал'],
  ['endorsement', 'Связь с Landing Heroes'],
  ['rationale', 'Карточка защиты'],
]

function demoMaterials(id, backgrounds) {
  const images = materialTypes.map(([key, label], index) => ({
    key,
    label,
    file: id + '-' + String(index + 1).padStart(2, '0') + '.jpg',
    background: backgrounds[index],
  }))
  return [...images, {
    key: 'concept-description',
    label: 'Описание концепции',
    file: id + '.md',
    background: '#f8f6fc',
  }]
}

// Each concept has its own ordered list. More materials can be added to that list.
export const catalog = {
  a: {
    title: 'A · Модульная инвестиционная платформа для корпоративных клиентов',
    color: '#7651df',
    items: demoMaterials('a', ['#241b42', '#e6dcff', '#e9e3f4', '#f5f3ef', '#241b42', '#e6dcff', '#f4effd', '#e9e3f4']),
  },
  b: {
    title: 'B · Единая точка входа для запуска инвестиционных продуктов',
    color: '#267e6d',
    items: demoMaterials('b', ['#092e32', '#bfecdd', '#e0eee9', '#f5f3ef', '#092e32', '#bfecdd', '#edf8f3', '#e0eee9']),
  },
  c: {
    title: 'C · Инфраструктура для инвестиционного сервиса под собственным брендом',
    color: '#b85d47',
    items: demoMaterials('c', ['#412723', '#ffd8ca', '#f5e5dc', '#f5f3ef', '#412723', '#ffd8ca', '#fcf1ea', '#f5e5dc']),
  },
}
