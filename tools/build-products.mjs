#!/usr/bin/env node
/*  Generador de páginas de producto Q-WERK
    ─────────────────────────────────────────────────────────────
    Lee tools/products.content.json (contenido por slug) + META (abajo)
    y emite HTML estático indexable:
      /automotriz/<slug>/index.html   ·  /lavanderia/<slug>/index.html
      /automotriz/index.html          ·  /lavanderia/index.html   (hubs)
      sitemap.xml
    Estructura por ficha: A encabezado de conversión · B resumen rápido ·
    C información completa · D cierre comercial. + JSON-LD Product/Offer/
    BreadcrumbList/FAQPage. Contenido técnico = el que produjo el workflow
    (fiel a los modales). Reejecuta con: node tools/build-products.mjs
*/
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// Versión de assets (?v=<hash>) para forzar recarga tras cada deploy.
const assetV = f => createHash('sha256').update(readFileSync(join(ROOT, f))).digest('hex').slice(0, 8);
const V_JS = assetV('main.js'), V_CSS = assetV('style.css');
const SITE = 'https://qwerk.mx';
const PHONE = '523222202407';
const TODAY = '2026-07-13';
const POLICY_URL = `${SITE}/politica-de-envios-y-devoluciones/`;
const SHIPPING_POLICY_ID = `${POLICY_URL}#envios-nacionales`;

const offerPolicies = () => ({
  shippingDetails: {
    '@type': 'OfferShippingDetails',
    hasShippingService: { '@id': SHIPPING_POLICY_ID },
  },
  hasMerchantReturnPolicy: {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'MX',
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: 7,
    itemCondition: [
      'https://schema.org/NewCondition',
      'https://schema.org/UsedCondition',
    ],
  },
});

const CATS = {
  automotriz: { label: 'Automotriz', title: 'Línea Automotriz', hero: 'Productos para limpieza, cuidado y presentación de vehículos, desarrollados para autolavados y detalladores.', waMsg: 'Hola, quiero información sobre sus productos para autolavado y detallado. ¿Cuál es el proceso completo que recomiendas?' },
  lavanderia: { label: 'Lavandería', title: 'Línea de Lavandería', hero: 'Detergentes y auxiliares de lavado diseñados para controlar costos y mantener un desempeño constante.', waMsg: 'Hola, quiero información y precios de los productos QWERK para lavandería.' },
};

// Metadatos autoritativos (yo los controlo; el contenido viene del JSON)
const META = {
  'snow-foam-ph-neutro':       { cat:'automotriz', code:'Snow Foam',  name:'Snow Foam',                              sku:'SNF7',    img:'/assets/products/snow-foam-aplicacion.webp', schemaImg:'/assets/products/snf7.png',    accent:'#176bb2', price:{low:95,high:1200}, pres:'1 L · 5 L · 10 L · 20 L', wa:'Hola, me interesa Snow Foam. Quiero saber qué presentación y dilución me convienen.' },
  'apc-limpiador-multiusos':   { cat:'automotriz', code:'APC',        name:'APC',                                      sku:'APC7',    img:'/assets/products/apc-aplicacion.webp',       schemaImg:'/assets/products/apc7.png',    accent:'#3aaa35', price:{low:90,high:1100},  pres:'1 L · 5 L · 10 L · 20 L', wa:'Hola, me interesa APC. Quiero saber qué presentación y dilución me convienen.' },
  'desengrasante-concentrado': { cat:'automotriz', code:'Desengrasante',   name:'Desengrasante de alta concentración',    sku:'DSGT250', img:'/assets/products/desengrasante-aplicacion.webp', schemaImg:'/assets/products/dsgt250.png', accent:'#c0392b', price:{low:55,high:700},   pres:'1 L · 5 L · 10 L · 20 L', wa:'Hola, me interesa el Desengrasante de alta concentración. Quiero saber qué presentación y dilución me convienen.' },
  'limpiador-textil-alcalino': { cat:'lavanderia', code:'Refuerzo alcalino', name:'Desengrasante textil alcalino', img:'/assets/products/desengrasante-textil-alcalino-aplicacion.png', accent:'#285f46', price:null, priceFrom:259, retornable:true, pres:'20 L', wa:'Hola, me interesa el Desengrasante textil alcalino de 20 L por $259 MXN. Quiero saber cómo usarlo junto con mi detergente.' },
  'crema-rap':                  { cat:'automotriz', code:'RAP',        name:'Crema RAP',                              img:'/assets/products/crema-rap-aplicacion.png', accent:'#1f5fbf', price:{low:80,high:1600}, pres:'500 g · 4 kg · 19 kg', wa:'Hola, me interesa Crema RAP. Quiero saber qué presentación me conviene y cómo hacer mi pedido.' },
  'abrillantador-llantas':     { cat:'automotriz', code:'Uso directo', name:'Abrillantador líquido de llantas', img:'/assets/products/abrillantador-llantas-liquido-aplicacion.png', accent:'#f47c14', price:{low:350,high:650},  pres:'10 L · 20 L',             wa:'Hola, me interesa el Abrillantador líquido de llantas. Quiero saber presentación, precio y forma de aplicación.' },
  'abrillantador-llantas-gel': { cat:'automotriz', code:'Gel', name:'Abrillantador en gel de llantas', img:'/assets/products/abrillantador-llantas-gel-aplicacion.png', accent:'#f47c14', price:{low:160,high:650},  pres:'4 kg · 19 kg',            wa:'Hola, me interesa el Abrillantador en gel de llantas. Quiero saber presentación, precio y forma de aplicación.' },
  'abrillantador-hidrofobico-llantas':{cat:'automotriz',code:'Hidrofóbico', name:'Abrillantador hidrofóbico para llantas', img:'/assets/products/abrillantador-hidrofobico-llantas-aplicacion.png', accent:'#b5122b', price:null, priceFrom:299, pres:'1 L', wa:'Hola, quiero pedir 1 litro del Abrillantador hidrofóbico para llantas por $299 MXN.', star:true },
  'jabon-liquido-lavanderia':  { cat:'lavanderia', code:'Alto desempeño', name:'Detergente de alto desempeño', img:'/assets/products/detergente-alto-desempeno-aplicacion.png', accent:'#0097a7', price:null, priceFrom:490, retornable:true, pres:'20 L', wa:'Hola, me interesa el Detergente de alto desempeño de 20 L por $490 MXN.' },
  'detergente-con-vinagre':    { cat:'lavanderia', code:'Con vinagre', name:'Detergente con vinagre', img:'/assets/products/detergente-vinagre-aplicacion.png', accent:'#d66c18', price:null, priceFrom:259, retornable:true, pres:'20 L', wa:'Hola, me interesa el Detergente con vinagre de 20 L por $259 MXN.' },
  'reforzador-aroma-textil':   { cat:'lavanderia', code:'Reforzador', name:'Reforzador de aroma textil', img:'/assets/products/reforzador-aroma-textil-aplicacion.png', accent:'#b63d65', price:{low:59,high:1180}, pres:'1 L · 5 L · 10 L · 20 L', wa:'Hola, me interesa el Reforzador de aroma textil. Quiero saber qué presentación me conviene y cómo atomizarlo sobre ropa limpia y seca.' },
  'detergente-ropa-color':     { cat:'lavanderia', code:'Ropa de color', name:'Detergente para ropa de color', img:'/assets/products/detergente-ropa-color-aplicacion.png', accent:'#1768ad', price:null, priceFrom:259, retornable:true, pres:'20 L', wa:'Hola, me interesa el Detergente para ropa de color de 20 L por $259 MXN.' },
  'detergente-con-bicarbonato':{ cat:'lavanderia', code:'Bicarbonato', name:'Detergente con bicarbonato', img:'/assets/products/detergente-bicarbonato-aplicacion.png', accent:'#3d6277', price:null, priceFrom:259, retornable:true, pres:'20 L', wa:'Hola, me interesa el Detergente con bicarbonato de 20 L por $259 MXN.' },
  'detergente-con-pino':       { cat:'lavanderia', code:'Aceite de pino', name:'Detergente con pino',                img:'/assets/products/detergente-pino-aplicacion.png', accent:'#2e6f3b', price:null, priceFrom:259, retornable:true, pres:'20 L', wa:'Hola, me interesa el Detergente con pino de 20 L por $259 MXN.' },
};

const GUIDES = {
  automotriz: [{ href:'/blog/productos-de-limpieza-para-autolavados-puerto-vallarta/', label:'Productos de limpieza para autolavados en Puerto Vallarta' }],
  lavanderia: [
    { href:'/blog/que-detergente-conviene-para-una-lavanderia/', label:'¿Qué detergente conviene para una lavandería?' },
    { href:'/blog/como-bajar-el-costo-por-lavada/', label:'Cómo bajar el costo por lavada' },
  ],
};

// ── utilidades ──
const htmlEsc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
const waHref = msg => `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
const jsonld = obj => `<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n</script>`;

const NAV = cat => `
  <nav id="navbar">
    <div class="container nav-inner">
      <a href="/" class="nav-logo"><img src="/assets/logo-white.png" alt="Q-WERK" height="32"></a>
      <button class="nav-toggle" aria-label="Menú"><span></span><span></span><span></span></button>
      <ul class="nav-links" id="navLinks">
        <li><a href="/">Inicio</a></li>
        <li><a href="/automotriz/">Automotriz</a></li>
        <li><a href="/lavanderia/">Lavandería</a></li>
        <li><a href="/blog/">Blog</a></li>
        <li><a href="/#contacto">Contacto</a></li>
      </ul>
    </div>
  </nav>`;

const FOOTER = `
  <footer>
    <div class="container footer-inner">
      <img src="/assets/logo-white.png" alt="Q-WERK" height="22" class="footer-logo">
      <span class="footer-copy">© 2026 Q-WERK · Hecho en México</span>
      <span class="footer-domain">qwerk.mx</span>
      <a class="footer-policy" href="/politica-de-envios-y-devoluciones/">Envíos y devoluciones</a>
    </div>
  </footer>`;

const WA_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';
const WA_FIXED = msg => `\n  <a href="${waHref(msg)}" target="_blank" rel="noopener" class="wa-fixed" aria-label="WhatsApp">${WA_SVG}</a>\n`;

const head = ({ title, desc, canonical, ogImg, ld, waMsg }) => `<!DOCTYPE html>
<html lang="es">
<head>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-B85SSWMQB7"></script>
  <script src="/gtag-init.js"></script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${htmlEsc(desc)}">
  <meta name="theme-color" content="#0b2013">
  ${waMsg ? `<meta name="wa-message" content="${htmlEsc(waMsg)}">` : ''}
  <title>${htmlEsc(title)}</title>
  <link rel="icon" type="image/png" href="/assets/favicon.png">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:title" content="${htmlEsc(title)}">
  <meta property="og:description" content="${htmlEsc(desc)}">
  <meta property="og:image" content="${SITE}${ogImg}">
  <meta property="og:locale" content="es_MX">
  <meta property="og:site_name" content="Q-WERK">
${ld.map(jsonld).join('\n')}
  <link rel="stylesheet" href="/style.css?v=${V_CSS}">
  <script src="/main.js?v=${V_JS}" defer></script>
</head>`;

function specTable(s) {
  const rows = [
    ['Tipo de producto', s.tipo], ['Uso principal', s.usoPrincipal], ['Nivel de concentración', s.concentracion],
    ['Forma de aplicación', s.aplicacion], ['Superficies compatibles', s.superficies],
    ['Presentaciones', s._pres], ['Cliente recomendado', s.cliente],
  ];
  return `<table class="spec-table"><tbody>${rows.map(([k, v]) => `<tr><th scope="row">${htmlEsc(k)}</th><td>${htmlEsc(v)}</td></tr>`).join('')}</tbody></table>`;
}

function productPage(slug, c) {
  const m = META[slug];
  const cat = CATS[m.cat];
  const url = `${SITE}/${m.cat}/${slug}/`;
  const ogImg = m.img || '/assets/banner.png';
  const media = m.img
    ? `<div class="product-hero-media" style="--accent:${m.accent}"><img src="${m.img}" alt="${htmlEsc(m.name)} Q-WERK" width="360" height="360"></div>`
    : `<div class="product-hero-media is-placeholder" style="--accent:${m.accent}"><span class="featured-badge">Nuevo</span><span class="ph-code">${htmlEsc(m.name)}</span></div>`;

  // JSON-LD
  const product = {
    '@context': 'https://schema.org', '@type': 'Product',
    name: m.name, description: c.metaDesc,
    brand: { '@type': 'Brand', name: 'Q-WERK' },
    category: cat.title, url,
    manufacturer: { '@type': 'Organization', name: 'Q-WERK', url: SITE + '/' },
  };
  if (m.sku) product.sku = m.sku;
  const productImages = [m.schemaImg, m.img].filter(Boolean).map(img => SITE + img);
  if (productImages.length) product.image = productImages.length === 1 ? productImages[0] : productImages;
  if (m.price) product.offers = { '@type': 'AggregateOffer', priceCurrency: 'MXN', lowPrice: m.price.low, highPrice: m.price.high, seller: { '@type': 'Organization', name: 'Q-WERK' }, ...offerPolicies() };
  else if (m.priceFrom) product.offers = { '@type': 'Offer', priceCurrency: 'MXN', price: m.priceFrom, availability: 'https://schema.org/InStock', seller: { '@type': 'Organization', name: 'Q-WERK' }, ...offerPolicies() };
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: cat.title, item: `${SITE}/${m.cat}/` },
      { '@type': 'ListItem', position: 3, name: m.name, item: url },
    ],
  };
  const faqLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: c.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  // enlaces internos: 3 hermanos de la misma categoría
  const siblings = Object.keys(META).filter(s => META[s].cat === m.cat && s !== slug).slice(0, 3);
  const related = siblings.map(s => `<li><a href="/${META[s].cat}/${s}/">${htmlEsc(META[s].name)}</a></li>`).join('');
  const guides = (GUIDES[m.cat] || []).map(g => `<li><a href="${g.href}">${htmlEsc(g.label)}</a></li>`).join('');

  const s = { ...c.summary, _pres: m.pres };

  return head({ title: c.title, desc: c.metaDesc, canonical: url, ogImg, ld: [breadcrumb, product, faqLd], waMsg: m.wa }) + `
<body>
${NAV(m.cat)}

  <!-- A · encabezado de conversión -->
  <header class="page-hero">
    <div class="container">
      <p class="breadcrumbs"><a href="/">Inicio</a> / <a href="/${m.cat}/">${cat.label}</a> / ${htmlEsc(m.name)}</p>
      <div class="product-hero">
        ${media}
        <div class="product-hero-info">
          <span class="ph-badge">${htmlEsc(m.code)}</span>
          <h1>${htmlEsc(m.name)}</h1>
          <p class="lead">${htmlEsc(c.mainBenefit)}</p>
          <ul class="hero-benefits">${c.benefits.map(b => `<li>${htmlEsc(b)}</li>`).join('')}</ul>
          <p class="hero-sizes"><strong>Presentaciones:</strong> ${htmlEsc(m.pres)}${m.priceFrom ? ` — <strong>desde $${m.priceFrom} MXN</strong>` : ''}${m.retornable ? ' · envase retornable' : ''}</p>
          <div class="hero-cta">
            <a href="${waHref(m.wa)}" target="_blank" rel="noopener" class="btn btn-green" data-wa-msg="${htmlEsc(m.wa)}" data-ev="product_whatsapp_click" data-ev-product="${htmlEsc(m.name)}">Consultar precio y presentación</a>
            <a href="#ficha" class="btn-text">Ver ficha técnica</a>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- B · resumen rápido -->
  <section class="section section-gray">
    <div class="container page-content">
      <h2>Resumen rápido</h2>
      <p class="lead-intro">${htmlEsc(c.intro)}</p>
      ${specTable(s)}
    </div>
  </section>

  <!-- C · información completa -->
  <section class="section" id="ficha">
    <div class="container page-content">
      ${c.fullContentHtml}
      <h2>Productos relacionados</h2>
      <ul class="related-links">${related}</ul>
      <h2>Guías relacionadas</h2>
      <ul class="related-links">${guides}<li><a href="/${m.cat}/">Ver toda la ${cat.title.toLowerCase()}</a></li></ul>
    </div>
  </section>

  <!-- FAQ -->
  <section class="section">
    <div class="container">
      <span class="label">Preguntas frecuentes</span>
      <h2>${htmlEsc(m.name)}: preguntas frecuentes</h2>
      <div class="faq-list">
        ${c.faq.map(f => `<details class="faq-item"><summary>${htmlEsc(f.q)}</summary><p>${htmlEsc(f.a)}</p></details>`).join('\n        ')}
      </div>
    </div>
  </section>

  <!-- D · cierre comercial -->
  <section class="section section-green">
    <div class="container">
      <span class="label label-light">¿Listo para tu pedido?</span>
      <h2 class="light">¿Necesitas saber qué presentación o dilución conviene para tu negocio?</h2>
      <p style="color:rgba(255,255,255,0.8);max-width:640px;margin-top:1rem">${htmlEsc(c.differentiator)}</p>
      <a href="${waHref(m.wa)}" target="_blank" rel="noopener" class="btn btn-white" style="margin-top:1.5rem;display:inline-block" data-wa-msg="${htmlEsc(m.wa)}" data-ev="product_whatsapp_click" data-ev-product="${htmlEsc(m.name)}">Hablar con QWERK por WhatsApp</a>
    </div>
  </section>
${FOOTER}
${WA_FIXED(m.wa)}
</body>
</html>`;
}

function hubPage(cat) {
  const info = CATS[cat];
  const url = `${SITE}/${cat}/`;
  const slugs = Object.keys(META).filter(s => META[s].cat === cat);
  const cards = slugs.map(slug => {
    const m = META[slug];
    const media = m.img
      ? `<div class="featured-img" style="--accent:${m.accent}"><img src="${m.img}" alt="${htmlEsc(m.name)} Q-WERK" loading="lazy"></div>`
      : `<div class="featured-img is-placeholder" style="--accent:${m.accent}"><span class="featured-badge">Nuevo</span><span class="ph-code">${htmlEsc(m.name)}</span></div>`;
    return `
        <article class="featured-card">
          ${media}
          <div class="featured-body">
            <h3>${htmlEsc(m.name)}</h3>
            <p class="featured-sizes"><strong>Presentaciones:</strong> ${htmlEsc(m.pres)}${m.priceFrom ? ` · desde $${m.priceFrom}` : ''}${m.retornable ? ' · retornable' : ''}</p>
            <div class="featured-actions">
              <a href="/${cat}/${slug}/" class="btn btn-green btn-sm" data-ev="view_product_details" data-ev-product="${htmlEsc(m.name)}">Ver ficha</a>
              <a href="${waHref(m.wa)}" target="_blank" rel="noopener" class="btn-text" data-wa-msg="${htmlEsc(m.wa)}" data-ev="product_whatsapp_click" data-ev-product="${htmlEsc(m.name)}">Cotizar</a>
            </div>
          </div>
        </article>`;
  }).join('');

  const itemList = {
    '@context': 'https://schema.org', '@type': 'ItemList',
    name: info.title,
    itemListElement: slugs.map((slug, i) => ({ '@type': 'ListItem', position: i + 1, name: META[slug].name, url: `${SITE}/${cat}/${slug}/` })),
  };
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: info.title, item: url },
    ],
  };
  const desc = `${info.title} de Q-WERK: ${info.hero} Consulta presentaciones y precios por WhatsApp.`;

  return head({ title: `${info.title} | Q-WERK`, desc, canonical: url, ogImg: '/assets/banner.png', ld: [breadcrumb, itemList], waMsg: info.waMsg }) + `
<body>
${NAV(cat)}
  <header class="page-hero">
    <div class="container">
      <p class="breadcrumbs"><a href="/">Inicio</a> / ${info.label}</p>
      <h1>${info.title}</h1>
      <p class="lead">${info.hero}</p>
      <div class="page-hero-actions">
        <a href="${waHref(info.waMsg)}" target="_blank" rel="noopener" class="btn btn-green" data-wa-msg="${htmlEsc(info.waMsg)}" data-ev="whatsapp_click" data-ev-ctx="hub-${cat}">Pedir recomendación por WhatsApp</a>
        ${cat === 'automotriz'
          ? '<a href="/assets/docs/catalogo-automotriz-qwerk.pdf" target="_blank" rel="noopener" class="btn-text" data-ev="download_catalog" data-ev-ctx="hub-automotriz">Descargar catálogo PDF</a>'
          : '<a href="/assets/docs/catalogo-lavanderia-qwerk.pdf" target="_blank" rel="noopener" class="btn-text" data-ev="download_catalog" data-ev-ctx="hub-lavanderia">Descargar catálogo PDF</a>'}
      </div>
    </div>
  </header>
  <section class="section section-gray">
    <div class="container">
      <span class="label">Catálogo</span>
      <h2>Productos de la ${info.title.toLowerCase()}</h2>
      <div class="featured-grid">${cards}
      </div>
    </div>
  </section>
${FOOTER}
${WA_FIXED(info.waMsg)}
</body>
</html>`;
}

function sitemap() {
  const staticUrls = [
    ['/', '1.0', 'monthly'],
    ['/automotriz/', '0.9', 'monthly'], ['/lavanderia/', '0.9', 'monthly'],
    ['/politica-de-envios-y-devoluciones/', '0.5', 'yearly'],
    ['/detergente-para-lavanderias-puerto-vallarta/', '0.8', 'monthly'],
    ['/jabon-liquido-20-litros-bahia-de-banderas/', '0.8', 'monthly'],
    ['/productos-para-autolavado-puerto-vallarta/', '0.8', 'monthly'],
    ['/proveedor-productos-limpieza-lavanderias/', '0.8', 'monthly'],
    ['/reforzador-de-aroma-para-lavanderias/', '0.7', 'monthly'],
    ['/blog/', '0.7', 'weekly'],
  ];
  const blog = [
    'que-detergente-conviene-para-una-lavanderia', 'como-bajar-el-costo-por-lavada',
    'jabon-con-vinagre-jabon-con-pino-y-detergente-para-color', 'que-productos-basicos-necesita-una-lavanderia',
    'reforzador-de-aroma-como-lo-usan-las-lavanderias', 'productos-de-limpieza-para-autolavados-puerto-vallarta',
    // Guías nuevas (Fase 3)
    'como-diluir-apc-correctamente', 'que-es-ph-neutro-en-un-shampoo', 'como-usar-snow-foam-en-autolavado',
    'limpiar-interiores-sin-sensacion-grasosa', 'como-aplicar-abrillantador-de-llantas',
    'abrillantador-de-llantas-base-agua-vs-mayor-duracion', 'calcular-rendimiento-de-un-producto-concentrado',
  ].map(s => [`/blog/${s}/`, '0.6', 'monthly']);
  const products = Object.keys(META).map(slug => [`/${META[slug].cat}/${slug}/`, '0.8', 'monthly']);
  const all = [...staticUrls, ...products, ...blog];
  const body = all.map(([loc, pr, cf]) =>
    `  <url>\n    <loc>${SITE}${loc}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${cf}</changefreq>\n    <priority>${pr}</priority>\n  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

// ── build ──
const content = JSON.parse(readFileSync(join(ROOT, 'tools/products.content.json'), 'utf8'));
const customProductPages = new Set([
  'crema-rap',
  'snow-foam-ph-neutro',
  'apc-limpiador-multiusos',
  'desengrasante-concentrado',
  'abrillantador-llantas',
  'abrillantador-llantas-gel',
  'abrillantador-hidrofobico-llantas',
  'jabon-liquido-lavanderia',
  'detergente-con-vinagre',
  'detergente-ropa-color',
  'detergente-con-bicarbonato',
  'detergente-con-pino',
  'limpiador-textil-alcalino',
  'reforzador-aroma-textil',
]);
let n = 0;
for (const slug of Object.keys(META)) {
  const c = content[slug];
  if (!c) { console.warn('⚠ sin contenido:', slug); continue; }
  const dir = join(ROOT, META[slug].cat, slug);
  mkdirSync(dir, { recursive: true });
  if (!customProductPages.has(slug)) writeFileSync(join(dir, 'index.html'), productPage(slug, c));
  n++;
}
for (const cat of Object.keys(CATS)) {
  mkdirSync(join(ROOT, cat), { recursive: true });
  writeFileSync(join(ROOT, cat, 'index.html'), hubPage(cat));
}
writeFileSync(join(ROOT, 'sitemap.xml'), sitemap());
console.log(`✓ ${n} fichas + ${Object.keys(CATS).length} hubs + sitemap generados`);
