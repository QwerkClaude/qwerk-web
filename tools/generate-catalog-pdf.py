from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets/docs/catalogo-automotriz-qwerk.pdf"
PAGE_W, PAGE_H = letter
TOTAL_PAGES = 4

REGULAR = "Arial-QWerk"
BOLD = "Arial-QWerk-Bold"
pdfmetrics.registerFont(TTFont(REGULAR, "/System/Library/Fonts/Supplemental/Arial.ttf"))
pdfmetrics.registerFont(TTFont(BOLD, "/System/Library/Fonts/Supplemental/Arial Bold.ttf"))

INK = HexColor("#10281B")
ORANGE = HexColor("#FF7A00")
GREEN = HexColor("#008C59")
BLUE = HexColor("#1976D2")
MUTED = HexColor("#5D655F")
LINE = HexColor("#D7D6CF")
CARD = HexColor("#FFFBF6")
NOTE = HexColor("#F6F5F1")

PRODUCTS = [
    {
        "category": "LAVADO EXTERIOR",
        "name": "Snow Foam pH neutro",
        "description": "Shampoo de alta espuma para lavado de contacto. pH neutro para limpieza frecuente.",
        "prices": ["1 L - $95", "5 L - $380", "10 L - $665", "20 L - $1,200"],
        "url": "https://qwerk.mx/automotriz/snow-foam-ph-neutro/",
    },
    {
        "category": "LIMPIEZA INTERIOR",
        "name": "APC",
        "description": "Limpiador multiusos para interiores, plásticos, viniles y superficies lavables.",
        "prices": ["1 L - $90", "5 L - $350", "10 L - $610", "20 L - $1,100"],
        "url": "https://qwerk.mx/automotriz/apc-limpiador-multiusos/",
    },
    {
        "category": "LIMPIEZA PROFUNDA",
        "name": "Desengrasante de alta concentración",
        "description": "Fórmula concentrada para remover grasa y suciedad difícil en superficies lavables.",
        "prices": ["1 L - $55", "5 L - $220", "10 L - $390", "20 L - $700"],
        "url": "https://qwerk.mx/automotriz/desengrasante-concentrado/",
    },
    {
        "category": "ACABADO INTERIOR",
        "name": "Crema RAP",
        "description": "Renueva, abrillanta y protege. Seca al tacto, no deja sensación grasosa ni empaña cristales.",
        "prices": ["500 g - $80", "4 kg - $340", "19 kg - $1,600"],
        "url": "https://qwerk.mx/automotriz/crema-rap/",
    },
    {
        "category": "ACABADO DE LLANTAS",
        "name": "Abrillantador líquido de llantas",
        "description": "Acabado uniforme y brillante para llantas, de aplicación rápida en operaciones de volumen.",
        "prices": ["10 L - $350", "20 L - $650"],
        "url": "https://qwerk.mx/automotriz/abrillantador-llantas/",
    },
    {
        "category": "ACABADO DE LLANTAS",
        "name": "Abrillantador en gel de llantas",
        "description": "Gel de mayor control para aplicar brillo uniforme sin escurrimientos.",
        "prices": ["4 kg - $160", "19 kg - $650"],
        "url": "https://qwerk.mx/automotriz/abrillantador-llantas-gel/",
    },
    {
        "category": "MÁXIMO BRILLO PARA LLANTAS",
        "name": "Abrillantador hidrofóbico para llantas",
        "description": "Acabado wet look de máximo brillo, negro profundo y película que ayuda a repeler el agua.",
        "prices": ["1 L - $299"],
        "url": "https://qwerk.mx/automotriz/abrillantador-hidrofobico-llantas/",
    },
]


def fit_size(value, max_size, min_size, max_width):
    size = max_size
    while size > min_size and pdfmetrics.stringWidth(value, BOLD, size) > max_width:
        size -= 0.25
    return size


def wrap_text(value, size, max_width):
    lines = []
    current = ""
    for word in value.split():
        candidate = f"{current} {word}".strip()
        if not current or pdfmetrics.stringWidth(candidate, REGULAR, size) <= max_width:
            current = candidate
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_text(c, x, y, value, size, color=INK, bold=False, align="left"):
    c.setFillColor(color)
    c.setFont(BOLD if bold else REGULAR, size)
    if align == "right":
        c.drawRightString(x, y, value)
    elif align == "center":
        c.drawCentredString(x, y, value)
    else:
        c.drawString(x, y, value)


def header(c, page_number):
    c.setFillColor(INK)
    c.rect(0, PAGE_H - 58, PAGE_W, 58, fill=1, stroke=0)
    draw_text(c, 40, PAGE_H - 36, "Q-WERK", 18, white, True)
    draw_text(c, PAGE_W - 40, PAGE_H - 34, f"Catálogo {page_number}/{TOTAL_PAGES}", 9.5, white, align="right")


def footer(c, page_number):
    draw_text(c, 40, 20, "Q-WERK  |  WhatsApp +52 322 220 2407  |  qwerk.mx", 8.5)
    draw_text(c, PAGE_W - 40, 20, f"Página {page_number}", 8.5, align="right")


def product_card(c, product, y_top, height):
    x = 40
    width = PAGE_W - 80
    y = y_top - height

    c.setFillColor(CARD)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.8)
    c.roundRect(x, y, width, height, 8, fill=1, stroke=1)
    c.setFillColor(ORANGE)
    c.rect(x, y, 5, height, fill=1, stroke=0)

    left = x + 16
    right = x + width - 16
    content_width = right - left
    cursor = y_top - 22

    draw_text(c, left, cursor, product["category"], 8.5, ORANGE, True)
    cursor -= 25
    title_size = fit_size(product["name"], 17, 13, content_width)
    draw_text(c, left, cursor, product["name"], title_size, INK, True)
    cursor -= 20
    draw_text(c, left, cursor, "Uso principal", 9, GREEN, True)
    cursor -= 15

    for line in wrap_text(product["description"], 10.5, content_width):
        draw_text(c, left, cursor, line, 10.5)
        cursor -= 13

    cursor -= 5
    draw_text(c, left, cursor, "Presentaciones y precios", 9, BLUE, True)
    cursor -= 31

    gap = 10
    chip_width = (content_width - gap) / 2
    chip_height = 24
    for idx, price in enumerate(product["prices"]):
        col = idx % 2
        row = idx // 2
        chip_x = left + col * (chip_width + gap)
        chip_y = cursor - row * 31
        c.setFillColor(white)
        c.setStrokeColor(LINE)
        c.roundRect(chip_x, chip_y, chip_width, chip_height, 5, fill=1, stroke=1)
        draw_text(c, chip_x + 8, chip_y + 8, price, 10, INK, True)

    button_width = 84
    button_height = 28
    button_x = right - button_width
    button_y = y + 14
    c.setFillColor(ORANGE)
    c.roundRect(button_x, button_y, button_width, button_height, 7, fill=1, stroke=0)
    draw_text(c, button_x + button_width / 2, button_y + 9, "Más info", 10, white, True, "center")
    c.linkURL(product["url"], (button_x, button_y, button_x + button_width, button_y + button_height), relative=0)


def page_one(c):
    header(c, 1)
    draw_text(c, 40, 706, "CATÁLOGO AUTOMOTRIZ", 9.5, ORANGE, True)
    draw_text(c, 40, 672, "Productos para autolavados", 27, INK, True)
    draw_text(c, 40, 651, "Productos, usos, presentaciones y precios claros desde el teléfono.", 12)

    c.setFillColor(NOTE)
    c.setStrokeColor(LINE)
    c.roundRect(40, 590, PAGE_W - 80, 45, 7, fill=1, stroke=1)
    draw_text(c, 52, 615, 'Cada botón "Más info" abre la ficha del producto en qwerk.mx.', 10, INK, True)
    draw_text(c, 52, 599, "Precios en MXN con IVA incluido. Sujetos a vigencia y disponibilidad.", 9.5, MUTED)

    product_card(c, PRODUCTS[0], 574, 215)
    product_card(c, PRODUCTS[1], 342, 215)
    footer(c, 1)


def standard_page(c, page_number, first, second, contact=False):
    header(c, page_number)
    draw_text(c, 40, 706, "CATÁLOGO AUTOMOTRIZ", 9.5, ORANGE, True)
    draw_text(c, 40, 676, "Soluciones para cada etapa", 23, INK, True)
    draw_text(c, 40, 656, "Consulta la ficha de cada producto desde el botón visible.", 11, MUTED)

    product_card(c, first, 636, 225)
    product_card(c, second, 394, 225)

    if contact:
        x, y, width, height = 40, 102, PAGE_W - 80, 48
        c.setFillColor(INK)
        c.roundRect(x, y, width, height, 7, fill=1, stroke=0)
        draw_text(c, x + 15, y + 28, "Cotiza o recibe recomendación personalizada", 11, white, True)
        draw_text(c, x + 15, y + 13, "WhatsApp +52 322 220 2407", 9.5, white)
        c.linkURL("https://wa.me/523222202407", (x, y, x + width, y + height), relative=0)

    footer(c, page_number)


def final_page(c, page_number, product):
    header(c, page_number)
    draw_text(c, 40, 706, "CATÁLOGO AUTOMOTRIZ", 9.5, ORANGE, True)
    draw_text(c, 40, 676, "Máximo brillo y protección", 23, INK, True)
    draw_text(c, 40, 656, "Consulta la ficha del producto desde el botón visible.", 11, MUTED)

    product_card(c, product, 636, 245)

    x, y, width, height = 40, 294, PAGE_W - 80, 76
    c.setFillColor(NOTE)
    c.setStrokeColor(LINE)
    c.roundRect(x, y, width, height, 7, fill=1, stroke=1)
    draw_text(c, x + 15, y + 48, "Precio en MXN con IVA incluido", 11, INK, True)
    draw_text(c, x + 15, y + 29, "Sujeto a vigencia y disponibilidad. Para pedidos de mayor volumen, solicita cotización.", 9.5, MUTED)

    x, y, width, height = 40, 190, PAGE_W - 80, 72
    c.setFillColor(INK)
    c.roundRect(x, y, width, height, 7, fill=1, stroke=0)
    draw_text(c, x + 15, y + 43, "Cotiza o recibe recomendación personalizada", 11, white, True)
    draw_text(c, x + 15, y + 23, "WhatsApp +52 322 220 2407", 9.5, white)
    c.linkURL("https://wa.me/523222202407", (x, y, x + width, y + height), relative=0)

    footer(c, page_number)


def build():
    c = canvas.Canvas(str(OUTPUT), pagesize=letter, pageCompression=1)
    c.setTitle("Catálogo automotriz Q-WERK")
    c.setAuthor("Q-WERK")
    c.setSubject("Productos para autolavados")
    page_one(c)
    c.showPage()
    standard_page(c, 2, PRODUCTS[2], PRODUCTS[3])
    c.showPage()
    standard_page(c, 3, PRODUCTS[4], PRODUCTS[5], True)
    c.showPage()
    final_page(c, 4, PRODUCTS[6])
    c.save()


if __name__ == "__main__":
    build()
