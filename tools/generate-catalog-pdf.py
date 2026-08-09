from pathlib import Path
from shutil import copyfile

from PIL import Image, ImageOps
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
WEB_OUTPUTS = {
    "general": ROOT / "assets/docs/catalogo-qwerk.pdf",
    "automotriz": ROOT / "assets/docs/catalogo-automotriz-qwerk.pdf",
    "lavanderia": ROOT / "assets/docs/catalogo-lavanderia-qwerk.pdf",
}
DELIVERY_OUTPUTS = {
    "general": ROOT / "output/pdf/catalogo-qwerk.pdf",
    "automotriz": ROOT / "output/pdf/catalogo-automotriz-qwerk.pdf",
    "lavanderia": ROOT / "output/pdf/catalogo-lavanderia-qwerk.pdf",
}
PAGE_W, PAGE_H = letter
LOGO_WHITE = ROOT / "assets/logo-white.png"
LOGO_ICON = ROOT / "assets/logo-icon.png"
CATALOG_IMAGE_CACHE = ROOT / "tmp/pdfs/catalog-assets"

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
        "category": "LIMPIEZA INTERIOR",
        "name": "APC",
        "description": "Limpiador concentrado de pH neutro para interiores y otras superficies lavables.",
        "performance": "1 L concentrado se diluye para obtener de 5 a 20 L de producto final listo para usar.",
        "prices": [("1 L", "$90"), ("5 L", "$350"), ("10 L", "$610"), ("20 L", "$1,100")],
        "note": "10 L y 20 L en envase retornable.",
        "url": "https://qwerk.mx/automotriz/apc-limpiador-multiusos/",
        "image": ROOT / "assets/products/apc-aplicacion.webp",
    },
    {
        "category": "LIMPIEZA PROFUNDA",
        "name": "Desengrasante de alta concentración",
        "description": "Concentrado para remover grasa y suciedad difícil en motores, piezas, rines y superficies lavables.",
        "performance": "1 L concentrado se diluye para obtener de 3 a 10 L de producto final listo para usar.",
        "prices": [("1 L", "$55"), ("5 L", "$250"), ("10 L", "$390"), ("20 L", "$700")],
        "note": "10 L y 20 L en envase retornable.",
        "url": "https://qwerk.mx/automotriz/desengrasante-concentrado/",
        "image": ROOT / "assets/products/desengrasante-aplicacion.webp",
    },
    {
        "category": "ACABADO INTERIOR",
        "name": "Crema RAP",
        "description": "Renueva, abrillanta y protege interiores. Seca al tacto, no deja sensación grasosa y no empaña cristales.",
        "prices": [("500 g", "$80"), ("4 kg", "$340"), ("19 kg", "$1,600")],
        "note": "Uso directo y alto rendimiento.",
        "url": "https://qwerk.mx/automotriz/crema-rap/",
        "image": ROOT / "assets/products/crema-rap-aplicacion.png",
    },
    {
        "category": "ACABADO DE LLANTAS",
        "name": "Abrillantador líquido de llantas",
        "description": "Aplicación rápida para dejar un brillo uniforme en el costado de la llanta.",
        "prices": [("10 L", "$350"), ("20 L", "$650")],
        "note": "Envases retornables.",
        "url": "https://qwerk.mx/automotriz/abrillantador-llantas/",
        "image": ROOT / "assets/products/abrillantador-llantas-liquido-aplicacion.webp",
    },
    {
        "category": "ACABADO DE LLANTAS",
        "name": "Abrillantador en gel de llantas",
        "description": "Textura en gel para dosificar con mayor control y obtener un brillo uniforme sin escurrimientos.",
        "prices": [("4 kg", "$200"), ("19 kg", "$650")],
        "note": "Aplicación controlada con esponja.",
        "url": "https://qwerk.mx/automotriz/abrillantador-llantas-gel/",
        "image": ROOT / "assets/products/abrillantador-llantas-gel-aplicacion.webp",
    },
    {
        "category": "MÁXIMO BRILLO PARA LLANTAS",
        "name": "Abrillantador hidrofóbico para llantas",
        "description": "Acabado wet look de máximo brillo, negro profundo y película que ayuda a repeler el agua.",
        "prices": [("250 g", "$99"), ("1 L", "$299")],
        "note": "Consistencia oleosa semiviscosa; se aplica con pad.",
        "url": "https://qwerk.mx/automotriz/abrillantador-hidrofobico-llantas/",
        "image": ROOT / "assets/products/abrillantador-hidrofobico-llantas-aplicacion.webp",
    },
    {
        "category": "ACABADO AROMÁTICO INTERIOR",
        "name": "Aromatizante básico automotriz",
        "description": "Acabado aromático final para el interior limpio del vehículo. Los aromas disponibles se confirman antes del pedido.",
        "prices": [("1 L", "$60"), ("5 L", "$285"), ("10 L", "$320"), ("20 L", "$550")],
        "note": "1 L y 5 L incluyen envase; 10 L y 20 L son retornables. Consulta aromas por WhatsApp.",
        "url": "https://qwerk.mx/automotriz/aromatizante-automotriz/",
        "placeholder_accent": HexColor("#7B4AA3"),
    },
    {
        "category": "LAVADO COTIDIANO",
        "name": "Shampoo básico automotriz",
        "description": "Opción práctica en presentación de volumen para el lavado automotriz cotidiano y el control del costo por servicio.",
        "prices": [("20 L", "$400")],
        "note": "Presentación única en envase retornable.",
        "url": "https://qwerk.mx/automotriz/shampoo-basico/",
        "placeholder_accent": HexColor("#167C82"),
    },
    {
        "category": "LAVADO EXTERIOR",
        "name": "Snow Foam",
        "description": "Shampoo concentrado de pH neutro que genera espuma densa para el lavado de contacto.",
        "performance": "Espumador de tanque: 1 L prepara hasta 100 L de mezcla. Cañón de espuma: usa 100 ml por cada 1 L de agua.",
        "prices": [("1 L", "$99"), ("5 L", "$499"), ("10 L", "$699"), ("20 L", "$1,200")],
        "note": "10 L y 20 L en envase retornable.",
        "url": "https://qwerk.mx/automotriz/snow-foam-ph-neutro/",
        "image": ROOT / "assets/products/snow-foam-aplicacion.webp",
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
        "image": ROOT / "assets/products/detergente-alto-desempeno-aplicacion.webp",
    },
    {
        "category": "DESODORIZACIÓN",
        "name": "Detergente con vinagre",
        "description": "Opción accesible para cargas con olores a sudor, humedad, encierro y otros malos aromas.",
        "prices": [("20 L", "$259")],
        "note": "Presentación única en envase retornable.",
        "url": "https://qwerk.mx/lavanderia/detergente-con-vinagre/",
        "image": ROOT / "assets/products/detergente-vinagre-aplicacion.webp",
    },
    {
        "category": "LAVADO DE ROPA DE COLOR",
        "name": "Detergente para ropa de color",
        "description": "Buen desempeño para el lavado cotidiano de ropa de color, uniformes y prendas de trabajo.",
        "prices": [("20 L", "$259")],
        "note": "Líquido azul; envase retornable.",
        "url": "https://qwerk.mx/lavanderia/detergente-ropa-color/",
        "image": ROOT / "assets/products/detergente-ropa-color-aplicacion.webp",
    },
    {
        "category": "APOYO DE LIMPIEZA",
        "name": "Detergente con bicarbonato",
        "description": "Detergente transparente enfocado en reforzar la limpieza de cargas con suciedad marcada.",
        "prices": [("20 L", "$259")],
        "note": "Presentación única en envase retornable.",
        "url": "https://qwerk.mx/lavanderia/detergente-con-bicarbonato/",
        "image": ROOT / "assets/products/detergente-bicarbonato-aplicacion.webp",
    },
    {
        "category": "AROMA A PINO",
        "name": "Detergente con pino",
        "description": "Detergente elaborado con aceite de pino para lavado cotidiano y un aroma característico.",
        "prices": [("20 L", "$259")],
        "note": "Líquido verde ligero; envase retornable.",
        "url": "https://qwerk.mx/lavanderia/detergente-con-pino/",
        "image": ROOT / "assets/products/detergente-pino-aplicacion.webp",
    },
    {
        "category": "SUCIEDAD EXTREMA",
        "name": "Desengrasante textil alcalino",
        "description": "Auxiliar alcalino para grasa, aceite y suciedad extrema. Trabaja junto con cualquiera de nuestros detergentes.",
        "prices": [("20 L", "$259")],
        "note": "Presentación única en envase retornable.",
        "url": "https://qwerk.mx/lavanderia/limpiador-textil-alcalino/",
        "image": ROOT / "assets/products/desengrasante-textil-alcalino-aplicacion.webp",
    },
    {
        "category": "ACABADO AROMÁTICO FINAL",
        "name": "Reforzador de aroma textil",
        "description": "Alta concentración. Se atomiza sin diluir sobre ropa limpia y completamente seca antes de entregar.",
        "prices": [("1 L", "$59"), ("5 L", "$295"), ("10 L", "$590"), ("20 L", "$1,180")],
        "note": "10 L y 20 L en envase retornable.",
        "url": "https://qwerk.mx/lavanderia/reforzador-aroma-textil/",
        "image": ROOT / "assets/products/reforzador-aroma-textil-aplicacion.webp",
    },
]

SECTIONS = [
    ("AUTOMOTRIZ", AUTOMOTIVE, ORANGE, ORANGE_SOFT, "Productos para autolavados y detallado"),
    ("LAVANDERÍA", LAUNDRY, TEAL, TEAL_SOFT, "Detergentes y auxiliares para lavanderías"),
]


def page_count(sections):
    return 1 + sum((len(products) + 1) // 2 for _, products, _, _, _ in sections)


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


def draw_logo(c, x, y, width):
    logo = ImageReader(str(LOGO_WHITE))
    logo_width, logo_height = logo.getSize()
    height = width * logo_height / logo_width
    c.drawImage(logo, x, y, width, height, mask="auto")


def prepared_catalog_image(source):
    CATALOG_IMAGE_CACHE.mkdir(parents=True, exist_ok=True)
    output = CATALOG_IMAGE_CACHE / f"{source.stem}.jpg"
    if not output.exists() or output.stat().st_mtime < source.stat().st_mtime:
        with Image.open(source) as image:
            image = ImageOps.fit(image.convert("RGB"), (580, 352), Image.Resampling.LANCZOS)
            image.save(output, "JPEG", quality=84, optimize=True, progressive=True)
    return output


def draw_product_image(c, product, x, y, width, height, accent, soft):
    c.saveState()
    clip = c.beginPath()
    clip.roundRect(x, y, width, height, 5)
    c.clipPath(clip, stroke=0, fill=0)

    if product.get("image"):
        image_path = prepared_catalog_image(product["image"])
        c.drawImage(str(image_path), x, y, width, height)
    else:
        placeholder_accent = product.get("placeholder_accent", accent)
        c.setFillColor(placeholder_accent)
        c.rect(x, y, width, height, fill=1, stroke=0)
        icon = ImageReader(str(LOGO_ICON))
        c.setFillAlpha(0.18)
        c.drawImage(icon, x + 8, y + 7, 48, 52, mask="auto")
        c.setFillAlpha(1)
        draw_text(c, x + 12, y + height - 18, "NUEVO", 7.5, white, True)
        for index, line in enumerate(wrap_text(product["name"], BOLD, 11, width - 24, 2)):
            draw_text(c, x + 12, y + 30 - index * 13, line, 11, white, True)

    c.restoreState()
    c.setStrokeColor(soft)
    c.setLineWidth(1)
    c.roundRect(x, y, width, height, 5, fill=0, stroke=1)


def header(c, page_number, total_pages, section, accent):
    c.setFillColor(INK)
    c.rect(0, PAGE_H - 58, PAGE_W, 58, fill=1, stroke=0)
    draw_logo(c, 40, PAGE_H - 45, 92)
    draw_text(c, PAGE_W - 40, PAGE_H - 34, f"{section}  |  {page_number}/{total_pages}", 9, white, True, "right")
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

    image_width = 145
    image_height = 88
    image_y = y_top - 141
    draw_product_image(c, product, left, image_y, image_width, image_height, accent, soft)

    content_left = left + image_width + 15
    cursor = y_top - 21
    draw_text(c, content_left, cursor, product["category"], 8.1, accent, True)
    cursor -= 23
    title_size = fit_size(product["name"], 16.5, 11.5, right - content_left)
    for line in wrap_text(product["name"], BOLD, title_size, right - content_left, 2):
        draw_text(c, content_left, cursor, line, title_size, INK, True)
        cursor -= title_size + 2
    cursor -= 3

    description_lines = 2 if product.get("performance") else 3
    for line in wrap_text(product["description"], REGULAR, 9.3, right - content_left, description_lines):
        draw_text(c, content_left, cursor, line, 9.3, MUTED)
        cursor -= 12

    if product.get("performance"):
        cursor -= 1
        draw_text(c, content_left, cursor, "ALTO RENDIMIENTO", 7.7, accent, True)
        cursor -= 11
        for line in wrap_text(product["performance"], BOLD, 8.4, right - content_left, 4):
            draw_text(c, content_left, cursor, line, 8.4, INK, True)
            cursor -= 11

    price_top = y_top - 157
    draw_text(c, left, price_top, "PRESENTACIÓN", 8.1, accent, True)
    draw_text(c, right, price_top, "PRECIO", 8.1, accent, True, "right")
    price_width = (right - left - 8) / 2
    for index, (presentation, price) in enumerate(product["prices"]):
        column = index % 2
        row = index // 2
        row_x = left + column * (price_width + 8)
        row_y = price_top - 27 - row * 25
        c.setFillColor(soft)
        c.roundRect(row_x, row_y, price_width, 20, 4, fill=1, stroke=0)
        draw_text(c, row_x + 8, row_y + 6, presentation, 9.4, INK, True)
        draw_text(c, row_x + price_width - 8, row_y + 6, price, 9.8, INK, True, "right")

    note_width = right - left - 184
    for index, line in enumerate(wrap_text(product["note"], REGULAR, 7.7, note_width, 2)):
        draw_text(c, left, y + 27 - index * 9, line, 7.7, MUTED)
    draw_button(c, right - 168, y + 13, 168, 28, "ABRIR FICHA EN QWERK.MX", product["url"], accent)


def general_cover(c):
    c.setFillColor(PAPER)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(INK)
    c.rect(0, PAGE_H - 325, PAGE_W, 325, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.rect(0, PAGE_H - 331, PAGE_W, 6, fill=1, stroke=0)

    draw_logo(c, 48, 704, 130)
    draw_text(c, 48, 671, "CATÁLOGO GENERAL", 10, GOLD, True)
    draw_text(c, 48, 626, "Productos para negocios", 29, white, True)
    draw_text(c, 48, 592, "Automotriz y lavandería", 24, white, True)
    total_products = sum(len(products) for _, products, _, _, _ in SECTIONS)
    draw_text(c, 48, 556, f"{total_products} productos con función, presentación y precio claros.", 12, white)

    draw_text(c, 48, 415, "ELIGE TU LÍNEA", 9, GREEN, True)

    c.setFillColor(ORANGE_SOFT)
    c.roundRect(48, 314, PAGE_W - 96, 78, 7, fill=1, stroke=0)
    draw_text(c, 64, 363, "AUTOMOTRIZ", 10, ORANGE, True)
    draw_text(c, 64, 339, f"{len(AUTOMOTIVE)} productos para autolavados y detallado", 14, INK, True)
    draw_button(c, PAGE_W - 204, 326, 140, 28, "VER LÍNEA EN LÍNEA", "https://qwerk.mx/automotriz/", ORANGE)

    c.setFillColor(TEAL_SOFT)
    c.roundRect(48, 215, PAGE_W - 96, 78, 7, fill=1, stroke=0)
    draw_text(c, 64, 264, "LAVANDERÍA", 10, TEAL, True)
    draw_text(c, 64, 240, f"{len(LAUNDRY)} detergentes y auxiliares de lavado", 14, INK, True)
    draw_button(c, PAGE_W - 204, 227, 140, 28, "VER LÍNEA EN LÍNEA", "https://qwerk.mx/lavanderia/", TEAL)

    draw_text(c, 48, 161, "Precios en MXN con IVA incluido.", 10, INK, True)
    draw_text(c, 48, 143, "Las presentaciones de 10 L y 20 L se manejan en envase retornable.", 9.5, MUTED)
    draw_text(c, 48, 125, "Sujetos a vigencia y disponibilidad.", 9.5, MUTED)

    c.setFillColor(INK)
    c.roundRect(48, 51, PAGE_W - 96, 49, 7, fill=1, stroke=0)
    draw_text(c, 64, 80, "Cotiza o recibe una recomendación personalizada", 11, white, True)
    draw_text(c, 64, 64, "WhatsApp +52 322 220 2407", 9.2, white)
    c.linkURL("https://wa.me/523222202407", (48, 51, PAGE_W - 48, 100), relative=0)


def line_cover(c, section, products, accent, soft, subtitle):
    c.setFillColor(PAPER)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(INK)
    c.rect(0, PAGE_H - 325, PAGE_W, 325, fill=1, stroke=0)
    c.setFillColor(accent)
    c.rect(0, PAGE_H - 331, PAGE_W, 6, fill=1, stroke=0)

    draw_logo(c, 48, 704, 130)
    draw_text(c, 48, 671, f"CATÁLOGO {section}", 10, accent, True)
    for index, line in enumerate(wrap_text(subtitle, BOLD, 28, PAGE_W - 96, 2)):
        draw_text(c, 48, 626 - index * 34, line, 28, white, True)
    draw_text(c, 48, 545, f"{len(products)} productos con función, presentación y precio claros.", 12, white)

    draw_text(c, 48, 415, "PRODUCTOS DE LA LÍNEA", 9, accent, True)
    c.setFillColor(soft)
    c.roundRect(48, 201, PAGE_W - 96, 190, 7, fill=1, stroke=0)
    list_y = 362
    list_step = min(24, 145 / max(1, len(products) - 1))
    for product in products:
        c.setFillColor(accent)
        c.circle(66, list_y + 3, 2.5, fill=1, stroke=0)
        name_size = fit_size(product["name"], 11.5, 9.5, PAGE_W - 150)
        draw_text(c, 78, list_y, product["name"], name_size, INK, True)
        list_y -= list_step

    draw_text(c, 48, 164, "Precios en MXN con IVA incluido.", 10, INK, True)
    draw_text(c, 48, 146, "Las presentaciones de 10 L y 20 L se manejan en envase retornable.", 9.5, MUTED)
    draw_text(c, 48, 128, "Sujetos a vigencia y disponibilidad.", 9.5, MUTED)

    c.setFillColor(INK)
    c.roundRect(48, 51, PAGE_W - 96, 49, 7, fill=1, stroke=0)
    draw_text(c, 64, 80, "Cotiza o recibe una recomendación personalizada", 11, white, True)
    draw_text(c, 64, 64, "WhatsApp +52 322 220 2407", 9.2, white)
    c.linkURL("https://wa.me/523222202407", (48, 51, PAGE_W - 48, 100), relative=0)


def section_page(c, page_number, total_pages, section, subtitle, products, accent, soft):
    header(c, page_number, total_pages, section, accent)
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


def build_catalog(output, title, subject, sections, is_general=False):
    total_pages = page_count(sections)
    output.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(output), pagesize=letter, pageCompression=1)
    c.setTitle(title)
    c.setAuthor("Q-WERK")
    c.setSubject(subject)
    c.setKeywords("Q-WERK, automotriz, lavandería, catálogo, precios")

    if is_general:
        general_cover(c)
    else:
        section, products, accent, soft, subtitle = sections[0]
        line_cover(c, section, products, accent, soft, subtitle)

    page_number = 2
    for section, products, accent, soft, subtitle in sections:
        for start in range(0, len(products), 2):
            c.showPage()
            section_page(c, page_number, total_pages, section, subtitle, products[start:start + 2], accent, soft)
            page_number += 1
    c.save()


def build():
    catalogs = [
        ("general", "Catálogo general Q-WERK", "Productos automotrices y para lavandería", SECTIONS, True),
        ("automotriz", "Catálogo automotriz Q-WERK", "Productos para autolavados y detallado", [SECTIONS[0]], False),
        ("lavanderia", "Catálogo de lavandería Q-WERK", "Detergentes y auxiliares para lavanderías", [SECTIONS[1]], False),
    ]
    for key, title, subject, sections, is_general in catalogs:
        web_output = WEB_OUTPUTS[key]
        delivery_output = DELIVERY_OUTPUTS[key]
        delivery_output.parent.mkdir(parents=True, exist_ok=True)
        build_catalog(web_output, title, subject, sections, is_general)
        copyfile(web_output, delivery_output)
        print(web_output)
        print(delivery_output)


if __name__ == "__main__":
    build()
