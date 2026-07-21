from pathlib import Path
from shutil import copyfile

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
WEB_OUTPUT = ROOT / "assets/docs/catalogo-qwerk.pdf"
DELIVERY_OUTPUT = ROOT / "output/pdf/catalogo-qwerk.pdf"
PAGE_W, PAGE_H = letter

REGULAR = "Arial-QWerk"
BOLD = "Arial-QWerk-Bold"
pdfmetrics.registerFont(TTFont(REGULAR, "/System/Library/Fonts/Supplemental/Arial.ttf"))
pdfmetrics.registerFont(TTFont(BOLD, "/System/Library/Fonts/Supplemental/Arial Bold.ttf"))

INK = HexColor("#10281B")
GREEN = HexColor("#16734E")
GREEN_SOFT = HexColor("#EAF4EE")
ORANGE = HexColor("#E77719")
ORANGE_SOFT = HexColor("#FFF0E2")
TEAL = HexColor("#147C82")
TEAL_SOFT = HexColor("#E7F4F4")
GOLD = HexColor("#F2C94C")
PAPER = HexColor("#FCFBF7")
CARD = HexColor("#FFFFFF")
LINE = HexColor("#D7D9D2")
MUTED = HexColor("#5D655F")

AUTOMOTIVE = [
    {
        "category": "LAVADO EXTERIOR",
        "name": "Snow Foam",
        "description": "Shampoo concentrado de pH neutro que genera espuma densa para el lavado de contacto con guante o microfibra.",
        "prices": [("1 L", "$95"), ("5 L", "$380"), ("10 L", "$665"), ("20 L", "$1,200")],
        "note": "10 L y 20 L en envase retornable.",
        "url": "https://qwerk.mx/automotriz/snow-foam-ph-neutro/",
    },
    {
        "category": "LIMPIEZA INTERIOR",
        "name": "APC",
        "description": "Limpiador multiusos de pH neutro para plásticos, viniles, consolas, paneles y otras superficies lavables.",
        "prices": [("1 L", "$90"), ("5 L", "$350"), ("10 L", "$610"), ("20 L", "$1,100")],
        "note": "10 L y 20 L en envase retornable.",
        "url": "https://qwerk.mx/automotriz/apc-limpiador-multiusos/",
    },
    {
        "category": "LIMPIEZA PROFUNDA",
        "name": "Desengrasante de alta concentración",
        "description": "Fórmula concentrada para remover grasa y suciedad difícil en motores, piezas, rines y superficies lavables.",
        "prices": [("1 L", "$55"), ("5 L", "$220"), ("10 L", "$390"), ("20 L", "$700")],
        "note": "10 L y 20 L en envase retornable.",
        "url": "https://qwerk.mx/automotriz/desengrasante-concentrado/",
    },
    {
        "category": "ACABADO INTERIOR",
        "name": "Crema RAP",
        "description": "Renueva, abrillanta y protege interiores. Seca al tacto, no deja sensación grasosa y no empaña cristales.",
        "prices": [("500 g", "$80"), ("4 kg", "$340"), ("19 kg", "$1,600")],
        "note": "Uso directo y alto rendimiento.",
        "url": "https://qwerk.mx/automotriz/crema-rap/",
    },
    {
        "category": "ACABADO DE LLANTAS",
        "name": "Abrillantador líquido de llantas",
        "description": "Aplicación rápida para dejar un brillo uniforme en el costado de la llanta.",
        "prices": [("10 L", "$350"), ("20 L", "$650")],
        "note": "Envases retornables.",
        "url": "https://qwerk.mx/automotriz/abrillantador-llantas/",
    },
    {
        "category": "ACABADO DE LLANTAS",
        "name": "Abrillantador en gel de llantas",
        "description": "Textura en gel para dosificar con mayor control y obtener un brillo uniforme sin escurrimientos.",
        "prices": [("4 kg", "$160"), ("19 kg", "$650")],
        "note": "Aplicación controlada con esponja.",
        "url": "https://qwerk.mx/automotriz/abrillantador-llantas-gel/",
    },
    {
        "category": "MÁXIMO BRILLO PARA LLANTAS",
        "name": "Abrillantador hidrofóbico para llantas",
        "description": "Acabado wet look de máximo brillo, negro profundo y película que ayuda a repeler el agua.",
        "prices": [("1 L", "$299")],
        "note": "Consistencia oleosa semiviscosa; se aplica con pad.",
        "url": "https://qwerk.mx/automotriz/abrillantador-hidrofobico-llantas/",
    },
]

LAUNDRY = [
    {
        "category": "MAYOR DESEMPEÑO Y FRAGANCIA",
        "name": "Detergente de alto desempeño",
        "description": "Mayor carga activa, alto poder de limpieza y fragancia duradera que permanece después del secado.",
        "prices": [("20 L", "$490")],
        "note": "Presentación única en envase retornable.",
        "url": "https://qwerk.mx/lavanderia/jabon-liquido-lavanderia/",
    },
    {
        "category": "DESODORIZACIÓN",
        "name": "Detergente con vinagre",
        "description": "Opción accesible para cargas con olores a sudor, humedad, encierro y otros malos aromas.",
        "prices": [("20 L", "$259")],
        "note": "Presentación única en envase retornable.",
        "url": "https://qwerk.mx/lavanderia/detergente-con-vinagre/",
    },
    {
        "category": "LAVADO DE ROPA DE COLOR",
        "name": "Detergente para ropa de color",
        "description": "Buen desempeño para el lavado cotidiano de ropa de color, uniformes y prendas de trabajo.",
        "prices": [("20 L", "$259")],
        "note": "Líquido azul; envase retornable.",
        "url": "https://qwerk.mx/lavanderia/detergente-ropa-color/",
    },
    {
        "category": "APOYO DE LIMPIEZA",
        "name": "Detergente con bicarbonato",
        "description": "Detergente transparente enfocado en reforzar la limpieza de cargas con suciedad marcada.",
        "prices": [("20 L", "$269")],
        "note": "Presentación única en envase retornable.",
        "url": "https://qwerk.mx/lavanderia/detergente-con-bicarbonato/",
    },
    {
        "category": "AROMA A PINO",
        "name": "Detergente con pino",
        "description": "Detergente elaborado con aceite de pino para lavado cotidiano y un aroma característico.",
        "prices": [("20 L", "$269")],
        "note": "Líquido verde ligero; envase retornable.",
        "url": "https://qwerk.mx/lavanderia/detergente-con-pino/",
    },
    {
        "category": "SUCIEDAD EXTREMA",
        "name": "Desengrasante textil alcalino",
        "description": "Auxiliar alcalino para grasa, aceite y suciedad extrema. Trabaja junto con cualquiera de nuestros detergentes.",
        "prices": [("20 L", "$259")],
        "note": "Presentación única en envase retornable.",
        "url": "https://qwerk.mx/lavanderia/limpiador-textil-alcalino/",
    },
    {
        "category": "ACABADO AROMÁTICO FINAL",
        "name": "Reforzador de aroma textil",
        "description": "Alta concentración. Se atomiza sin diluir sobre ropa limpia y completamente seca antes de entregar.",
        "prices": [("1 L", "$59"), ("5 L", "$295"), ("10 L", "$590"), ("20 L", "$1,180")],
        "note": "10 L y 20 L en envase retornable.",
        "url": "https://qwerk.mx/lavanderia/reforzador-aroma-textil/",
    },
]

SECTIONS = [
    ("AUTOMOTRIZ", AUTOMOTIVE, ORANGE, ORANGE_SOFT, "Productos para autolavados y detallado"),
    ("LAVANDERÍA", LAUNDRY, TEAL, TEAL_SOFT, "Detergentes y auxiliares para lavanderías"),
]
TOTAL_PAGES = 1 + sum((len(products) + 1) // 2 for _, products, _, _, _ in SECTIONS)


def fit_size(value, max_size, min_size, max_width):
    size = max_size
    while size > min_size and pdfmetrics.stringWidth(value, BOLD, size) > max_width:
        size -= 0.25
    return size


def wrap_text(value, font, size, max_width, max_lines=None):
    lines = []
    current = ""
    for word in value.split():
        candidate = f"{current} {word}".strip()
        if not current or pdfmetrics.stringWidth(candidate, font, size) <= max_width:
            current = candidate
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    if max_lines and len(lines) > max_lines:
        lines = lines[:max_lines]
        while pdfmetrics.stringWidth(lines[-1] + "...", font, size) > max_width:
            lines[-1] = lines[-1][:-1].rstrip()
        lines[-1] += "..."
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


def draw_button(c, x, y, width, height, label, url, color=GREEN):
    c.setFillColor(color)
    c.roundRect(x, y, width, height, 5, fill=1, stroke=0)
    draw_text(c, x + width / 2, y + 9, label, 9, white, True, "center")
    c.linkURL(url, (x, y, x + width, y + height), relative=0)


def header(c, page_number, section, accent):
    c.setFillColor(INK)
    c.rect(0, PAGE_H - 58, PAGE_W, 58, fill=1, stroke=0)
    draw_text(c, 40, PAGE_H - 36, "Q-WERK", 18, white, True)
    draw_text(c, PAGE_W - 40, PAGE_H - 34, f"{section}  |  {page_number}/{TOTAL_PAGES}", 9, white, True, "right")
    c.setFillColor(accent)
    c.rect(0, PAGE_H - 62, PAGE_W, 4, fill=1, stroke=0)


def footer(c, page_number):
    draw_text(c, 40, 20, "Q-WERK  |  WhatsApp +52 322 220 2407  |  qwerk.mx", 8.5, MUTED)
    draw_text(c, PAGE_W - 40, 20, f"Página {page_number}", 8.5, MUTED, align="right")
    c.linkURL("https://qwerk.mx/", (40, 12, 285, 30), relative=0)


def product_card(c, product, y_top, height, accent, soft):
    x = 40
    width = PAGE_W - 80
    y = y_top - height
    left = x + 18
    right = x + width - 18

    c.setFillColor(CARD)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.8)
    c.roundRect(x, y, width, height, 7, fill=1, stroke=1)
    c.setFillColor(accent)
    c.roundRect(x, y, 6, height, 3, fill=1, stroke=0)

    cursor = y_top - 22
    draw_text(c, left, cursor, product["category"], 8.3, accent, True)
    cursor -= 25
    title_size = fit_size(product["name"], 17.5, 12.5, right - left)
    draw_text(c, left, cursor, product["name"], title_size, INK, True)
    cursor -= 20

    for line in wrap_text(product["description"], REGULAR, 10.3, right - left, 2):
        draw_text(c, left, cursor, line, 10.3, MUTED)
        cursor -= 14

    cursor -= 4
    draw_text(c, left, cursor, "PRESENTACIÓN", 8.2, accent, True)
    draw_text(c, right, cursor, "PRECIO", 8.2, accent, True, "right")
    cursor -= 9

    for presentation, price in product["prices"]:
        row_y = cursor - 22
        c.setFillColor(soft)
        c.roundRect(left, row_y, right - left, 20, 4, fill=1, stroke=0)
        draw_text(c, left + 9, row_y + 6, presentation, 10, INK, True)
        draw_text(c, right - 9, row_y + 6, price, 10.5, INK, True, "right")
        cursor -= 24

    draw_text(c, left, y + 24, product["note"], 8.2, MUTED)
    draw_button(c, right - 168, y + 13, 168, 28, "ABRIR FICHA EN QWERK.MX", product["url"], accent)


def cover(c):
    c.setFillColor(PAPER)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(INK)
    c.rect(0, PAGE_H - 325, PAGE_W, 325, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.rect(0, PAGE_H - 331, PAGE_W, 6, fill=1, stroke=0)

    draw_text(c, 48, 730, "Q-WERK", 25, white, True)
    draw_text(c, 48, 671, "CATÁLOGO GENERAL", 10, GOLD, True)
    draw_text(c, 48, 626, "Productos para negocios", 29, white, True)
    draw_text(c, 48, 592, "Automotriz y lavandería", 24, white, True)
    draw_text(c, 48, 556, "14 productos con función, presentación y precio claros.", 12, white)

    draw_text(c, 48, 415, "ELIGE TU LÍNEA", 9, GREEN, True)

    c.setFillColor(ORANGE_SOFT)
    c.roundRect(48, 314, PAGE_W - 96, 78, 7, fill=1, stroke=0)
    draw_text(c, 64, 363, "AUTOMOTRIZ", 10, ORANGE, True)
    draw_text(c, 64, 339, "7 productos para autolavados y detallado", 14, INK, True)
    draw_button(c, PAGE_W - 204, 326, 140, 28, "VER LÍNEA EN LÍNEA", "https://qwerk.mx/automotriz/", ORANGE)

    c.setFillColor(TEAL_SOFT)
    c.roundRect(48, 215, PAGE_W - 96, 78, 7, fill=1, stroke=0)
    draw_text(c, 64, 264, "LAVANDERÍA", 10, TEAL, True)
    draw_text(c, 64, 240, "7 detergentes y auxiliares de lavado", 14, INK, True)
    draw_button(c, PAGE_W - 204, 227, 140, 28, "VER LÍNEA EN LÍNEA", "https://qwerk.mx/lavanderia/", TEAL)

    draw_text(c, 48, 161, "Precios en MXN con IVA incluido.", 10, INK, True)
    draw_text(c, 48, 143, "Las presentaciones de 10 L y 20 L se manejan en envase retornable.", 9.5, MUTED)
    draw_text(c, 48, 125, "Sujetos a vigencia y disponibilidad.", 9.5, MUTED)

    c.setFillColor(INK)
    c.roundRect(48, 51, PAGE_W - 96, 49, 7, fill=1, stroke=0)
    draw_text(c, 64, 80, "Cotiza o recibe una recomendación personalizada", 11, white, True)
    draw_text(c, 64, 64, "WhatsApp +52 322 220 2407", 9.2, white)
    c.linkURL("https://wa.me/523222202407", (48, 51, PAGE_W - 48, 100), relative=0)


def section_page(c, page_number, section, subtitle, products, accent, soft):
    header(c, page_number, section, accent)
    draw_text(c, 40, 697, section, 9, accent, True)
    draw_text(c, 40, 670, subtitle, 21, INK, True)
    draw_text(c, 40, 651, "Cada botón visible abre la ficha completa del producto en qwerk.mx.", 10, MUTED)

    if len(products) == 2:
        product_card(c, products[0], 631, 246, accent, soft)
        product_card(c, products[1], 373, 246, accent, soft)
    else:
        product_card(c, products[0], 631, 294, accent, soft)
        c.setFillColor(INK)
        c.roundRect(40, 198, PAGE_W - 80, 78, 7, fill=1, stroke=0)
        draw_text(c, 56, 250, "¿No sabes cuál producto elegir?", 12, white, True)
        draw_text(c, 56, 230, "Cuéntanos tu proceso y te recomendamos la opción adecuada.", 9.5, white)
        draw_button(c, PAGE_W - 214, 221, 158, 30, "PREGUNTAR POR WHATSAPP", "https://wa.me/523222202407", GREEN)

    footer(c, page_number)


def build():
    WEB_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    DELIVERY_OUTPUT.parent.mkdir(parents=True, exist_ok=True)

    c = canvas.Canvas(str(WEB_OUTPUT), pagesize=letter, pageCompression=1)
    c.setTitle("Catálogo general Q-WERK")
    c.setAuthor("Q-WERK")
    c.setSubject("Productos automotrices y para lavandería")
    c.setKeywords("Q-WERK, automotriz, lavandería, catálogo, precios")

    cover(c)
    c.showPage()
    page_number = 2

    for section, products, accent, soft, subtitle in SECTIONS:
        for start in range(0, len(products), 2):
            section_page(c, page_number, section, subtitle, products[start:start + 2], accent, soft)
            page_number += 1
            if page_number <= TOTAL_PAGES:
                c.showPage()

    c.save()
    copyfile(WEB_OUTPUT, DELIVERY_OUTPUT)
    print(WEB_OUTPUT)
    print(DELIVERY_OUTPUT)


if __name__ == "__main__":
    build()
