#!/usr/bin/env node
/*  Generador de guías educativas Q-WERK (blog)
    Lee tools/guides.content.json + GUIDE_META y emite /blog/<slug>/index.html
    con Article + BreadcrumbList + FAQPage (JSON-LD), autor/entidad, fechas,
    caja de "respuesta rápida", CTA al producto y enlaces internos.
    Reejecuta con: node tools/build-guides.mjs
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
const PUB = '2026-07-13', MOD = '2026-07-13', PUB_H = '13 de julio de 2026';

const GUIDE_META = {
  'como-diluir-apc-correctamente':               { h1:'Cómo diluir un APC (limpiador multiusos) correctamente', product:{ href:'/automotriz/apc-limpiador-multiusos/', name:'APC · Limpiador Multiusos' }, wa:'Hola, quiero información del APC QWERK, sus diluciones y precio.' },
  'que-es-ph-neutro-en-un-shampoo':              { h1:'¿Qué significa que un shampoo tenga pH neutro y por qué importa?', product:{ href:'/automotriz/snow-foam-ph-neutro/', name:'Snow Foam' }, wa:'Hola, me interesa Snow Foam. Quiero saber qué presentación y dilución me convienen.' },
  'como-usar-snow-foam-en-autolavado':           { h1:'Cómo usar Snow Foam en un autolavado (paso a paso)', product:{ href:'/automotriz/snow-foam-ph-neutro/', name:'Snow Foam' }, wa:'Hola, me interesa Snow Foam. Quiero saber qué presentación y dilución me convienen.' },
  'limpiar-interiores-sin-sensacion-grasosa':    { h1:'Cómo limpiar interiores de auto sin dejar sensación grasosa', product:{ href:'/automotriz/crema-rap/', name:'Crema RAP' }, wa:'Hola, me interesa Crema RAP y quiero saber cómo aplicarla correctamente.' },
  'como-aplicar-abrillantador-de-llantas':       { h1:'Cómo aplicar abrillantador de llantas paso a paso', product:{ href:'/automotriz/abrillantador-llantas/', name:'Abrillantador de Llantas' }, wa:'Hola, me interesa el abrillantador de llantas. ¿Cuál me conviene: líquido, gel o hidrofóbico?' },
  'abrillantador-de-llantas-base-agua-vs-mayor-duracion': { h1:'Abrillantador de llantas: base agua vs. de mayor duración (hidrofóbico)', product:{ href:'/automotriz/abrillantador-hidrofobico-llantas/', name:'Abrillantador hidrofóbico para llantas' }, wa:'Hola, quiero información y precio del Abrillantador hidrofóbico para llantas.' },
  'calcular-rendimiento-de-un-producto-concentrado': { h1:'Cómo calcular el rendimiento (y el costo real) de un producto concentrado', product:{ href:'/automotriz/desengrasante-concentrado/', name:'Desengrasante de alta concentración' }, wa:'Hola, me interesa el Desengrasante de alta concentración. Quiero saber qué presentación y dilución me convienen.' },
};

const htmlEsc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
const waHref = msg => `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
const jsonld = obj => `<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n</script>`;

const NAV = `
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
    </div>
  </footer>`;
const WA_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

function guidePage(slug, c) {
  const g = GUIDE_META[slug];
  const url = `${SITE}/blog/${slug}/`;
  const article = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: g.h1, description: c.metaDesc,
    author: { '@type': 'Organization', name: 'Q-WERK', url: SITE + '/' },
    publisher: { '@type': 'Organization', name: 'Q-WERK', logo: { '@type': 'ImageObject', url: SITE + '/assets/logo-dark.png' } },
    datePublished: PUB, dateModified: MOD,
    image: SITE + '/assets/banner.png',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url }, inLanguage: 'es-MX',
  };
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: SITE + '/blog/' },
      { '@type': 'ListItem', position: 3, name: g.h1, item: url },
    ],
  };
  const faqLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: c.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-B85SSWMQB7"></script>
  <script src="/gtag-init.js"></script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${htmlEsc(c.metaDesc)}">
  <meta name="theme-color" content="#0b2013">
  <meta name="wa-message" content="${htmlEsc(g.wa)}">
  <title>${htmlEsc(c.title)} | Q-WERK</title>
  <link rel="icon" type="image/png" href="/assets/favicon.png">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${htmlEsc(c.title)} | Q-WERK">
  <meta property="og:description" content="${htmlEsc(c.metaDesc)}">
  <meta property="og:image" content="${SITE}/assets/banner.png">
  <meta property="og:locale" content="es_MX">
  <meta property="og:site_name" content="Q-WERK">
${[article, breadcrumb, faqLd].map(jsonld).join('\n')}
  <link rel="stylesheet" href="/style.css?v=${V_CSS}">
  <script src="/main.js?v=${V_JS}" defer></script>
</head>
<body>
${NAV}
  <header class="page-hero">
    <div class="container">
      <p class="breadcrumbs"><a href="/">Inicio</a> / <a href="/blog/">Blog</a> / ${htmlEsc(g.h1)}</p>
      <h1>${htmlEsc(g.h1)}</h1>
      <p class="lead">${htmlEsc(c.dek)}</p>
      <p class="article-meta">Por <strong>Q-WERK</strong> · Publicado el ${PUB_H} · Actualizado el ${PUB_H}</p>
    </div>
  </header>

  <section class="section">
    <div class="container page-content">
      <article>
        <aside class="takeaways">
          <h2>Respuesta rápida</h2>
          <ul>${c.takeaways.map(t => `<li>${htmlEsc(t)}</li>`).join('')}</ul>
        </aside>
        ${c.bodyHtml}
        <div class="product-callout">
          <div>
            <span class="label">Producto relacionado</span>
            <h3>${htmlEsc(g.product.name)}</h3>
            <p>Consulta la ficha completa con usos, diluciones y presentaciones, o pide tu cotización por WhatsApp.</p>
          </div>
          <div class="product-callout-actions">
            <a href="${g.product.href}" class="btn btn-green" data-ev="view_product_details" data-ev-product="${htmlEsc(g.product.name)}">Ver ficha del producto</a>
            <a href="${waHref(g.wa)}" target="_blank" rel="noopener" class="btn-text" data-wa-msg="${htmlEsc(g.wa)}" data-ev="product_whatsapp_click" data-ev-product="${htmlEsc(g.product.name)}">Cotizar por WhatsApp</a>
          </div>
        </div>
      </article>
    </div>
  </section>

  <section class="section section-gray">
    <div class="container">
      <span class="label">Preguntas frecuentes</span>
      <h2>Preguntas frecuentes</h2>
      <div class="faq-list">
        ${c.faq.map(f => `<details class="faq-item"><summary>${htmlEsc(f.q)}</summary><p>${htmlEsc(f.a)}</p></details>`).join('\n        ')}
      </div>
    </div>
  </section>
${FOOTER}
  <a href="${waHref(g.wa)}" target="_blank" rel="noopener" class="wa-fixed" aria-label="WhatsApp">${WA_SVG}</a>
</body>
</html>`;
}

const content = JSON.parse(readFileSync(join(ROOT, 'tools/guides.content.json'), 'utf8'));
let n = 0;
for (const slug of Object.keys(GUIDE_META)) {
  const c = content[slug];
  if (!c) { console.warn('⚠ sin contenido:', slug); continue; }
  const dir = join(ROOT, 'blog', slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), guidePage(slug, c));
  n++;
}
console.log(`✓ ${n} guías generadas`);
