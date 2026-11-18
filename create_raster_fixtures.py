from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageColor, ImageDraw, ImageFont


SIZE = (1280, 800)
FONTS = Path('C:/Windows/Fonts')
DESTINATION = Path(__file__).parent / 'assets'


@dataclass(frozen=True)
class Theme:
    code: str
    dark: str
    panel: str
    ink: str
    accent: str
    strong: str
    light: str
    paper: str


THEMES = (
    Theme('A', '#241B42', '#38285E', '#211B34', '#C5ACFF', '#8050E8', '#E6DCFF', '#F4EFFD'),
    Theme('B', '#092E32', '#16494B', '#143635', '#8CEAD2', '#259E87', '#BFECDD', '#EDF8F3'),
    Theme('C', '#412723', '#5C3832', '#412823', '#FFA695', '#DB6C56', '#FFD8CA', '#FCF1EA'),
)


def font(size, weight='regular'):
    files = {'regular': 'segoeui.ttf', 'bold': 'segoeuib.ttf', 'serif': 'georgia.ttf'}
    return ImageFont.truetype(str(FONTS / files[weight]), size)


def text(draw, position, value, color, size, weight='regular', anchor='lt', spacing=8):
    x, y = position
    typeface = font(size, weight)
    for index, part in enumerate(value.split('\n')):
        draw.text((x, y + index * (size + spacing)), part, fill=color, font=typeface, anchor=anchor)


def label(draw, position, value, color, size=16):
    text(draw, position, value.upper(), color, size, 'bold')


def line(draw, points, color, width=1):
    draw.line(points, fill=color, width=width, joint='curve')


def box(draw, area, color, radius=0, outline=None, width=1):
    draw.rounded_rectangle(area, radius, fill=color, outline=outline, width=width)


def blend(first, second, ratio):
    return tuple(round(a + (b - a) * ratio) for a, b in zip(ImageColor.getrgb(first), ImageColor.getrgb(second)))


def base(color):
    image = Image.new('RGB', SIZE, color)
    return image, ImageDraw.Draw(image)


def marker(draw, x, y, span, code, main, negative):
    half = span // 2
    gap = max(2, span // 11)
    if code == 'A':
        draw.pieslice((x, y, x + 2 * half - gap, y + 2 * half - gap), 180, 270, fill=main)
        draw.pieslice((x + gap, y + gap, x + span, y + span), 0, 90, fill=main)
        box(draw, (x + half + gap, y, x + span, y + half - gap), main, span // 9)
        box(draw, (x, y + half + gap, x + half - gap, y + span), main, span // 9)
    elif code == 'B':
        draw.ellipse((x, y, x + span, y + span), fill=main)
        draw.ellipse((x + span // 5, y + span // 5, x + span * 4 // 5, y + span * 4 // 5), fill=negative)
        draw.polygon([(x + half, y), (x + span, y), (x + span, y + half)], fill=negative)
        draw.polygon([(x + 2 * gap, y + span), (x + span, y + 2 * gap), (x + span, y + 4 * gap), (x + 4 * gap, y + span)], fill=main)
    else:
        for dx, dy in ((0, 0), (half + gap, 0), (0, half + gap), (half + gap, half + gap)):
            tile = half - gap
            draw.ellipse((x + dx, y + dy, x + dx + tile, y + dy + tile), fill=main)
        draw.ellipse((x + half - gap * 2, y + half - gap * 2, x + half + gap * 2, y + half + gap * 2), fill=negative)


def decorative_pattern(draw, theme, area):
    left, top, right, bottom = area
    width = right - left
    height = bottom - top
    rule = blend(theme.dark, theme.accent, 0.23)
    for step in range(7):
        distance = 24 + step * 30
        if theme.code == 'A':
            draw.arc((left + distance // 2, top + distance, right - distance // 2, bottom - distance), 195, 350, fill=rule, width=1)
            draw.arc((left + distance // 2, top + distance, right - distance // 2, bottom - distance), 17, 162, fill=rule, width=1)
        elif theme.code == 'B':
            offset = distance * 2
            line(draw, [(left + offset, top), (left, top + offset)], rule)
            line(draw, [(right, top + offset), (left + offset, bottom)], rule)
            line(draw, [(right, bottom - offset), (right - offset, bottom)], rule)
        else:
            draw.ellipse((left + distance, top + distance, left + width - distance, top + height - distance), outline=rule, width=1)


def identity(theme):
    image, draw = base(theme.dark)
    muted = blend(theme.dark, theme.light, 0.74)
    rule = blend(theme.dark, theme.accent, 0.20)
    for x in [680, 755, 830, 905, 980, 1055, 1130, 1205]:
        line(draw, [(x, 110), (x, 690)], rule)
    for y in [102, 183, 264, 345, 426, 507, 588, 669]:
        line(draw, [(666, y), (1216, y)], rule)
    decorative_pattern(draw, theme, (665, 94, 1200, 690))
    size = 228
    marker(draw, 820, 275, size, theme.code, theme.accent, theme.dark)
    label(draw, (72, 74), 'Тестовый комплект бренда', muted, 18)
    text(draw, (69, 294), f'Концепция {theme.code}', 'white', 78, 'bold')
    text(draw, (74, 395), 'Инвестиционная платформа', theme.accent, 33)
    line(draw, [(72, 699), (1208, 699)], rule)
    label(draw, (72, 729), 'Название и знак', muted, 16)
    label(draw, (1078, 729), 'Материал 01', muted, 16)
    return image


def window(draw, theme):
    line_color = '#E3E4EA'
    box(draw, (70, 103, 1210, 740), '#D7D8E5', 26)
    box(draw, (70, 73, 1210, 710), '#FFFFFF', 24)
    box(draw, (70, 74, 1210, 140), theme.dark, 20)
    box(draw, (70, 112, 1210, 139), theme.dark)
    marker(draw, 105, 91, 29, theme.code, theme.accent, theme.dark)
    text(draw, (147, 94), f'Концепция {theme.code}', '#FFFFFF', 20, 'bold')
    text(draw, (991, 96), 'Демо-данные', theme.light, 15)
    draw.ellipse((1147, 90, 1181, 124), fill=theme.panel)
    text(draw, (1164, 108), 'И', theme.accent, 16, 'bold', 'mm')
    box(draw, (70, 139, 264, 709), '#F8F8FB')
    line(draw, [(264, 140), (264, 709)], line_color)
    return line_color


def sidebar(draw, theme, selected):
    for index, value in enumerate(['Обзор', 'Портфель', 'Операции', 'Отчёты']):
        top = 182 + index * 53
        if selected == index:
            box(draw, (85, top - 12, 248, top + 29), theme.light, 8)
        stroke = theme.strong if selected == index else '#7A7B8A'
        box(draw, (100, top + 1, 113, top + 14), None, 3, stroke, 2)
        text(draw, (128, top), value, theme.ink if selected == index else '#5D5E73', 16, 'bold' if selected == index else 'regular')


def dashboard(theme):
    image, draw = base(theme.light)
    border = window(draw, theme)
    sidebar(draw, theme, 0)
    text(draw, (301, 177), 'Обзор платформы', '#1F2131', 35, 'bold')
    text(draw, (303, 231), 'Показатели за последние 30 дней', '#666A7E', 18)
    cards = [('Активы под управлением', '₽ 48,2 млн'), ('Активные клиенты', '124'), ('Новые операции', '36')]
    for index, (caption, metrics) in enumerate(cards):
        x = 300 + index * 286
        box(draw, (x, 280, x + 270, 392), '#FFFFFF', 13, border)
        text(draw, (x + 20, 301), caption, '#5D6276', 15)
        text(draw, (x + 19, 336), metrics, '#26263C', 29, 'bold')
    box(draw, (300, 417, 1143, 674), '#FFFFFF', 13, border)
    text(draw, (320, 438), 'Динамика активов', '#272538', 21, 'bold')
    box(draw, (1026, 435, 1120, 465), theme.paper, 5)
    text(draw, (1041, 441), '30 дней', theme.ink, 15)
    chart_y = [582, 570, 578, 548, 561, 542, 545, 528, 541, 515, 523, 503, 510]
    for y in (505, 540, 575, 610):
        line(draw, [(320, y), (1121, y)], border)
    points = [(326 + 65 * i, y) for i, y in enumerate(chart_y)]
    draw.polygon(points + [(points[-1][0], 612), (points[0][0], 612)], fill=theme.paper)
    line(draw, points, theme.strong, 4)
    for i, caption in enumerate(['1 июня', '8 июня', '15 июня', '22 июня', '30 июня']):
        text(draw, (324 + i * 184, 632), caption, '#666A7E', 14)
    return image


def livestream(theme):
    image, draw = base(theme.paper)
    tight = (760, 0, 1280, 800)
    box(draw, tight, theme.dark)
    border = blend(theme.dark, theme.accent, 0.31)
    decorative_pattern(draw, theme, (783, 130, 1227, 662))
    marker(draw, 891, 290, 240, theme.code, theme.accent, theme.dark)
    line(draw, [(808, 700), (1231, 700)], border)
    label(draw, (809, 731), f'Концепция {theme.code}', theme.accent, 18)
    label(draw, (74, 85), 'Тестовая обложка эфира', theme.strong, 19)
    text(draw, (71, 254), 'Демонстрация\nплатформы', theme.ink, 73, 'bold', spacing=15)
    text(draw, (76, 476), 'Инвестиционный сервис\nпод брендом вашего бизнеса', theme.ink, 30, spacing=10)
    line(draw, [(75, 700), (682, 700)], blend(theme.light, theme.ink, 0.21))
    label(draw, (75, 731), 'Landing Heroes', theme.ink, 17)
    return image


def small_mark(theme):
    image, draw = base('#F7F5F1')
    label(draw, (78, 80), f'Концепция {theme.code}', theme.strong, 18)
    text(draw, (74, 139), 'Компактный знак', theme.ink, 67, 'bold')
    panels = [(78, 305, 388, 621), (485, 305, 795, 621), (892, 305, 1202, 621)]
    samples = (
        (theme.dark, theme.accent, 126, 'На тёмном фоне'),
        (theme.light, theme.dark, 84, 'На светлом фоне'),
        ('#FFFFFF', theme.strong, 38, 'В компактном размере'),
    )
    for panel, (bg, fg, scale, caption) in zip(panels, samples):
        x, y, right, bottom = panel
        box(draw, panel, bg, 16)
        marker(draw, (x + right - scale) // 2, (y + bottom - scale) // 2, scale, theme.code, fg, bg)
        text(draw, (x, 654), caption, theme.ink, 23)
    return image


def portfolio(theme):
    image, draw = base(theme.dark)
    border = window(draw, theme)
    sidebar(draw, theme, 1)
    text(draw, (300, 175), 'Портфель', '#212130', 37, 'bold')
    text(draw, (302, 232), 'Распределение активов', '#5D6276', 18)
    totals = [('Биржевые фонды', '46%', '₽ 2 070 000'), ('Облигации', '32%', '₽ 1 440 000'), ('Акции', '16%', '₽ 720 000'), ('Денежные средства', '6%', '₽ 270 000')]
    shades = [theme.dark, theme.strong, theme.accent, theme.light]
    start = 302
    for fraction, shade in zip((0.46, 0.32, 0.16, 0.06), shades):
        width = round(834 * fraction)
        box(draw, (start, 281, start + width - 4, 322), shade, 5)
        start += width
    label(draw, (325, 367), 'Категория', '#5D6276', 15)
    label(draw, (815, 367), 'Доля', '#5D6276', 15)
    label(draw, (958, 367), 'Стоимость', '#5D6276', 15)
    for index, (caption, share, value) in enumerate(totals):
        y = 426 + index * 61
        line(draw, [(302, y - 14), (1138, y - 14)], border)
        draw.ellipse((325, y + 3, 338, y + 16), fill=shades[index])
        text(draw, (351, y), caption, '#24263A', 18, 'bold')
        text(draw, (815, y), share, '#34384D', 18)
        text(draw, (957, y), value, '#34384D', 18)
    return image


def sales(theme):
    image, draw = base(theme.light)
    page_one = Image.new('RGB', (438, 532), theme.dark)
    first = ImageDraw.Draw(page_one)
    label(first, (34, 34), 'Landing Heroes', theme.accent, 16)
    text(first, (34, 129), 'Платформа\nпод вашим\nбрендом', 'white', 54, 'bold')
    marker(first, 289, 377, 107, theme.code, theme.accent, theme.dark)
    label(first, (34, 471), f'Концепция {theme.code}', theme.accent, 15)
    page_two = Image.new('RGB', (418, 500), '#FFFFFF')
    second = ImageDraw.Draw(page_two)
    marker(second, 34, 39, 34, theme.code, theme.strong, '#FFFFFF')
    text(second, (34, 108), 'Демонстрация\nдля покупателей', theme.ink, 38, 'bold')
    for index, name in enumerate(['Свой бренд', 'Модули платформы', 'Поддержка']):
        y = 258 + index * 50
        line(second, [(36, y - 11), (381, y - 11)], '#DCDCE2')
        text(second, (35, y), name, '#565569', 20)
    for pos, page, angle in [((248, 184), page_one, 9), ((635, 187), page_two, -9)]:
        rotated = page.convert('RGBA').rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
        image.paste(rotated, pos, rotated)
    label(draw, (76, 78), 'Коммерческие материалы', theme.ink, 18)
    return image


def relationship(theme):
    image, draw = base(theme.paper)
    label(draw, (72, 76), f'Концепция {theme.code}', theme.strong, 17)
    text(draw, (70, 137), 'Связь с основным брендом', theme.ink, 59, 'bold')
    rule = blend(theme.light, theme.ink, 0.24)
    box(draw, (72, 303, 546, 592), '#FFFFFF', 14, rule)
    box(draw, (734, 303, 1208, 592), theme.dark, 14)
    text(draw, (309, 437), 'Landing Heroes', theme.ink, 45, 'bold', 'mm')
    text(draw, (309, 502), 'Бренд компании', theme.ink, 21, anchor='mm')
    marker(draw, 940, 352, 62, theme.code, theme.accent, theme.dark)
    text(draw, (971, 467), f'Концепция {theme.code}', 'white', 42, 'bold', 'mm')
    text(draw, (971, 518), 'Бренд платформы', theme.accent, 21, anchor='mm')
    line(draw, [(577, 446), (703, 446)], rule, 2)
    draw.ellipse((575, 442, 583, 450), fill=theme.strong)
    draw.ellipse((697, 442, 705, 450), fill=theme.strong)
    text(draw, (72, 680), 'Тестовое размещение подписей для презентации.', theme.ink, 25)
    return image


def rationale(theme):
    image, draw = base(theme.paper)
    box(draw, (0, 0, 395, 800), theme.dark)
    marker(draw, 78, 73, 64, theme.code, theme.accent, theme.dark)
    label(draw, (77, 185), f'Концепция {theme.code}', theme.accent, 17)
    text(draw, (75, 235), 'Карточка\nзащиты', 'white', 55, 'bold', spacing=14)
    label(draw, (77, 727), 'Тестовый материал', theme.accent, 16)
    sections = [
        ('Название', 'Здесь будет аргумент выбора названия.'),
        ('Визуальная идея', 'Здесь будет объяснение формы и цвета.'),
        ('Связь с Landing Heroes', 'Здесь будет решение о связи двух брендов.'),
    ]
    rule = blend(theme.light, theme.ink, 0.20)
    for index, (title, caption) in enumerate(sections):
        top = 133 + index * 182
        line(draw, [(473, top - 26), (1197, top - 26)], rule)
        text(draw, (473, top), title, theme.ink, 34, 'bold')
        text(draw, (475, top + 64), caption, theme.ink, 24)
    return image


def main():
    DESTINATION.mkdir(parents=True, exist_ok=True)
    generators = (identity, dashboard, livestream, small_mark, portfolio, sales, relationship, rationale)
    previews = Image.new('RGB', (1280, 1224), '#E9E6E3')
    for concept, theme in enumerate(THEMES):
        for index, render in enumerate(generators, start=1):
            image = render(theme)
            name = f'{theme.code.lower()}-{index:02}.jpg'
            target = DESTINATION / name
            image.save(target, quality=89, optimize=True, progressive=True)
            with Image.open(target) as encoded:
                assert encoded.format == 'JPEG' and encoded.size == SIZE, name
                encoded.verify()
            print(f'{name} {target.stat().st_size // 1024} KB')
            thumbnail = image.resize((304, 190), Image.Resampling.LANCZOS)
            previews.paste(thumbnail, (8 + (index - 1) % 4 * 320, 7 + (concept * 2 + (index - 1) // 4) * 204))
    previews.save(Path(__file__).parent / 'raster-fixtures-preview.jpg', quality=93)


if __name__ == '__main__':
    main()
