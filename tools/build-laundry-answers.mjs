#!/usr/bin/env node
/* Construye el centro de respuestas desde el banco editorial. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(ROOT, 'blog/banco-consultas-lavanderias.md'), 'utf8');
const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sections = [];
let current;
for (const line of source.split('\n')) {
  const heading = line.match(/^## (\d+(?:\.\d+)?)\. (.+)$/);
  if (heading) {
    current = { id: heading[1], title: heading[2], questions: [] };
    sections.push(current);
    continue;
  }
  const question = line.match(/^\d+\. (¿.+?\?)(?: \*\*FAQ\*\*)?$/);
  if (current && question) current.questions.push(question[1]);
}

const guidance = {
  '1': {
    intro: 'Elegir un detergente profesional no empieza por la marca ni por el precio del envase. Empieza por el textil, la suciedad, el tipo de lavadora, la calidad del agua y el costo que debe sostener cada carga.',
    links: '<a href="/blog/que-detergente-conviene-para-una-lavanderia/">Guía para elegir detergente</a> · <a href="/lavanderia/">Línea de lavandería</a>',
    answer: 'Compáralo por compatibilidad con tu equipo, comportamiento en tu agua y costo por carga. Si cambias de fórmula, pruébala en una carga controlada antes de adoptarla para toda la operación.'
  },
  '2': {
    intro: 'La dosis correcta no se adivina: se mide, se registra y se ajusta después de evaluar limpieza, enjuague y costo por carga. Sobredosificar puede dejar residuo y aumentar el gasto; subdosificar puede obligar a relavar.',
    links: '<a href="/blog/como-bajar-el-costo-por-lavada/">Cómo bajar el costo por lavada</a> · <a href="/blog/calcular-rendimiento-de-un-producto-concentrado/">Cómo calcular rendimiento</a>',
    answer: 'Toma como referencia la etiqueta o ficha técnica y ajusta según peso, suciedad, volumen de agua y equipo. Una bomba o vaso medidor permite repetir el resultado y conocer el costo real.'
  },
  '3': {
    intro: 'Las manchas, el percudido y los olores no se resuelven siempre con más detergente. La clasificación previa, el tratamiento correcto, el tiempo y la temperatura compatible con el textil son parte del resultado.',
    links: '<a href="/lavanderia/limpiador-textil-alcalino/">Desengrasante textil alcalino</a> · <a href="/lavanderia/detergente-abrillantador-blancos/">Detergente con abrillantador óptico</a>',
    answer: 'Primero identifica el tipo de suciedad y revisa la etiqueta de cuidado. Haz una prueba en una zona discreta, separa la carga y evita aplicar calor antes de confirmar que la mancha salió.'
  },
  '4': {
    intro: 'El aroma y la suavidad son parte de la experiencia de entrega, pero deben lograrse sin sobrecargar la prenda ni comprometer su absorción. La dosis, el punto del ciclo y el secado influyen tanto como el producto.',
    links: '<a href="/lavanderia/reforzador-aroma-textil/">Reforzador de aroma textil</a> · <a href="/lavanderia/suavizante-de-telas/">Suavizante de telas</a>',
    answer: 'Usa cada auxiliar en la etapa indicada por su ficha y mide la dosis. Si hay residuo, tacto pesado o pérdida de absorción, revisa la sobredosificación, el enjuague y la compatibilidad del textil.'
  },
  '5': {
    intro: 'El agua, el equipo y el programa de lavado modifican el resultado de cualquier químico. Un proceso repetible parte de separar textiles, medir insumos y registrar qué combinación funciona en cada máquina.',
    links: '<a href="/blog/que-detergente-conviene-para-una-lavanderia/">Elegir detergente para lavandería</a> · <a href="/lavanderia/">Productos para lavandería</a>',
    answer: 'Revisa el manual de la lavadora, la dureza del agua y la etiqueta del textil. Antes de cambiar todo el proceso, haz una prueba controlada y compara limpieza, enjuague, tiempo y costo.'
  },
  '6': {
    intro: 'Hoteles, Airbnb, restaurantes y lavanderías industriales no deben tratarse como una carga doméstica. El programa debe partir de volumen, textiles, manchas frecuentes, rotación, agua, equipo y nivel de servicio esperado.',
    links: '<a href="/hoteleria-lavanderias-industriales/">Soluciones para hotelería y lavandería industrial</a> · <a href="/lavanderia/detergente-abrillantador-blancos/">Ropa blanca con abrillantador óptico</a>',
    answer: 'Documenta kilos por día, tipos de prendas, equipo, agua y problema a resolver. Con esos datos se puede probar un proceso y medir blancura, relavado, vida útil textil y costo por kilo.'
  },
  '7': {
    intro: 'Un proveedor útil no se limita a vender un bidón. Debe facilitar información de uso, presentación, ruta de entrega, cotización y documentación técnica aplicable para que el negocio pueda comprar y operar con consistencia.',
    links: '<a href="/proveedor-productos-limpieza-lavanderias/">Proveedor de productos para lavandería</a> · <a href="/detergente-para-lavanderias-puerto-vallarta/">Detergente para lavanderías en Puerto Vallarta</a>',
    answer: 'Solicita ficha técnica, indicaciones de uso, presentación, precio por volumen y condiciones de entrega. La comparación útil se hace por costo de solución o costo por carga, no solo por precio del envase.'
  },
  '8': {
    intro: 'La cobertura, disponibilidad y condiciones comerciales deben comunicarse de forma precisa. Antes de publicar o prometer una entrega, confirma la zona, día de ruta, pedido mínimo, existencias, presentación y facturación.',
    links: '<a href="/proveedor-productos-limpieza-lavanderias/">Atención a lavanderías</a> · <a href="/politica-de-envios-y-devoluciones/">Política de envíos y devoluciones</a>',
    answer: 'Confirma directamente con Q-WERK la disponibilidad, ruta, presentación, precio y tiempos aplicables a tu negocio. Al solicitar una recomendación, comparte ubicación, consumo aproximado y tipo de operación.'
  },
  '9': {
    intro: 'El uso responsable de químicos exige leer etiqueta y hoja de datos de seguridad, mantener los envases identificados y nunca improvisar mezclas. Una formulación responsable no elimina la necesidad de capacitación y protección.',
    links: '<a href="/formulacion-responsable/">Criterio de formulación responsable</a> · <a href="/politica-de-envios-y-devoluciones/">Información comercial</a>',
    answer: 'No mezcles productos salvo que su ficha técnica lo indique expresamente. Conserva el producto en su envase identificado, consulta la hoja de seguridad y sigue las medidas de protección indicadas para su uso.'
  },
  '9.1': {
    intro: 'Q-WERK considera información disponible sobre ingredientes, incluidos los criterios de la Proposición 65 de California, al desarrollar y revisar formulaciones. Esto debe comunicarse con precisión: es un criterio de revisión, no una certificación general de seguridad.',
    links: '<a href="/formulacion-responsable/">Formulación responsable Q-WERK</a> · <a href="https://oehha.ca.gov/proposition-65/about-proposition-65" target="_blank" rel="noopener noreferrer">Información oficial de OEHHA</a>',
    answer: 'La evaluación aplicable depende de fórmula, concentración, uso previsto y exposición. Para un producto concreto, solicita su ficha técnica y hoja de datos de seguridad; evita interpretar este criterio como certificación o garantía universal.'
  },
  '10': {
    intro: 'Una lavandería rentable mide procesos: kilos procesados, relavados, químicos, energía, tiempo, quejas y entregas. Las mejoras más sostenibles provienen de estandarizar tareas y detectar variaciones antes de que lleguen al cliente.',
    links: '<a href="/blog/como-bajar-el-costo-por-lavada/">Costo por lavada</a> · <a href="/blog/que-productos-basicos-necesita-una-lavanderia/">Productos básicos para una lavandería</a>',
    answer: 'Convierte la consulta en un indicador y mídelo por turno: peso, consumo, retrabajo, tiempo y calidad de salida. Un cambio de precio o proceso se debe probar en pequeño antes de hacerlo permanente.'
  }
};

function tailoredAnswer(question, base) {
  const q = question.toLowerCase();
  if (q.includes('dónde comprar') || q.includes('quién vende') || q.includes('quién entrega')) return 'Q-WERK atiende negocios de lavandería en Puerto Vallarta, Bahía de Banderas y zonas cercanas. Confirma por WhatsApp la cobertura de tu ubicación, existencias, presentación y condiciones de entrega antes de realizar el pedido.';
  if (q.includes('cuánto') && (q.includes('detergente') || q.includes('suavizante') || q.includes('reforzador'))) return 'La cantidad depende del peso real de la carga, nivel de suciedad, agua, máquina y producto. Empieza con la dosis indicada en la ficha técnica, mídela y ajusta tras comprobar limpieza y enjuague; no se recomienda calcularla a ojo.';
  if (q.includes('abrillantador óptico')) return 'El abrillantador óptico ayuda a realzar visualmente la luminosidad de los textiles blancos. No sustituye el pretratamiento ni el proceso necesario para manchas, amarillamiento o percudido; úsalo solo en cargas de ropa blanca compatibles.';
  if (q.includes('proposición 65')) return 'La Proposición 65 de California es un esquema de advertencias sobre exposiciones significativas a sustancias de su lista. Considerarla en una formulación no es una certificación de seguridad ni una afirmación de cumplimiento universal.';
  if (q.includes('mezclar') || q.includes('cloro')) return 'No mezcles productos de limpieza salvo que la etiqueta o ficha técnica lo indique expresamente. En especial, evita mezclar cloro con otros productos: conserva envases identificados y consulta la hoja de datos de seguridad.';
  if (q.startsWith('¿por qué')) return `${base} Si el problema persiste, registra la carga, dosis, programa, temperatura y agua para localizar la causa antes de aumentar químico.`;
  return base;
}

const renderedSections = sections.map(section => {
  const info = guidance[section.id];
  if (!info || !section.questions.length) return '';
  return `<section class="section faq-topic" id="tema-${section.id.replace('.', '-')}"><div class="container page-content"><span class="label">Tema ${esc(section.id)}</span><h2>${esc(section.title)}</h2><p class="lead-intro">${esc(info.intro)}</p><p class="topic-links">${info.links}</p><div class="faq-list">${section.questions.map(q => `<details class="faq-item"><summary>${esc(q)}</summary><p>${esc(tailoredAnswer(q, info.answer))}</p></details>`).join('')}</div></div></section>`;
}).join('\n');

const questions = sections.flatMap(s => s.questions);
const page = `<!DOCTYPE html>
<html lang="es"><head>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-B85SSWMQB7"></script><script src="/gtag-init.js"></script>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Centro de respuestas Q-WERK para lavanderías: detergentes, dosis, blancos, manchas, aroma, hotelería, seguridad, compras y operación.">
  <meta name="theme-color" content="#0b2013"><title>Preguntas frecuentes para lavanderías | Q-WERK</title>
  <link rel="icon" type="image/png" href="/assets/favicon.png"><link rel="canonical" href="https://qwerk.mx/blog/preguntas-frecuentes-lavanderias/">
  <meta property="og:type" content="article"><meta property="og:url" content="https://qwerk.mx/blog/preguntas-frecuentes-lavanderias/"><meta property="og:title" content="Preguntas frecuentes para lavanderías | Q-WERK"><meta property="og:description" content="Respuestas prácticas sobre operación, productos y compra para lavanderías."><meta property="og:image" content="https://qwerk.mx/assets/banner.png"><meta property="og:locale" content="es_MX">
  <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: 'Preguntas frecuentes para lavanderías', description: 'Centro de respuestas Q-WERK para lavanderías.', datePublished: '2026-10-14', dateModified: '2026-10-14', inLanguage: 'es-MX', author: { '@type': 'Organization', name: 'Q-WERK', url: 'https://qwerk.mx/' }, publisher: { '@type': 'Organization', name: 'Q-WERK', logo: { '@type': 'ImageObject', url: 'https://qwerk.mx/assets/logo-dark.png' } }, mainEntityOfPage: 'https://qwerk.mx/blog/preguntas-frecuentes-lavanderias/' })}</script>
  <link rel="stylesheet" href="/style.css?v=40a91117"><script src="/main.js?v=9ec92403" defer></script>
</head><body>
<nav id="navbar"><div class="container nav-inner"><a href="/" class="nav-logo"><img src="/assets/logo-white.png" alt="Q-WERK" height="32"></a><button class="nav-toggle" aria-label="Menú"><span></span><span></span><span></span></button><ul class="nav-links" id="navLinks"><li><a href="/">Inicio</a></li><li><a href="/hogar/">Hogar</a></li><li><a href="/automotriz/">Automotriz</a></li><li><a href="/lavanderia/">Lavandería</a></li><li><a href="/blog/">Blog</a></li><li><a href="/#contacto">Contacto</a></li></ul></div></nav>
<header class="page-hero"><div class="container"><p class="breadcrumbs"><a href="/">Inicio</a> / <a href="/blog/">Blog</a> / Preguntas frecuentes para lavanderías</p><h1>Preguntas frecuentes para lavanderías</h1><p class="lead">Respuestas prácticas a ${questions.length} consultas sobre detergentes, blancos, dosificación, hotelería, seguridad, compras y operación.</p><p class="article-meta">Por <strong>Q-WERK</strong> · Actualizado el 14 de octubre de 2026</p></div></header>
<section class="section section-gray"><div class="container page-content"><h2>Cómo usar este centro de respuestas</h2><p>Las consultas se consolidan por tema para que encuentres el contexto necesario antes de tomar una decisión. Las respuestas no sustituyen la etiqueta, ficha técnica, hoja de datos de seguridad ni las instrucciones de cuidado del textil.</p><ul class="related-links"><li><a href="#tema-1">Elegir detergente</a></li><li><a href="#tema-2">Dosis y costo</a></li><li><a href="#tema-3">Blancos y manchas</a></li><li><a href="#tema-6">Hotelería e industria</a></li><li><a href="#tema-7">Compras y proveedor</a></li><li><a href="#tema-9">Seguridad</a></li><li><a href="#tema-10">Operación</a></li></ul></div></section>
${renderedSections}
<section class="section section-green"><div class="container"><span class="label label-light">Asesoría</span><h2 class="light">¿Tu caso necesita una recomendación específica?</h2><p style="color:rgba(255,255,255,.85);max-width:680px">Comparte tipo de negocio, volumen, textiles, máquina, agua y problema a resolver. Con esos datos se puede orientar una prueba y una cotización pertinentes.</p><a href="https://wa.me/523222202407?text=Hola%2C%20quiero%20una%20recomendaci%C3%B3n%20para%20mi%20lavander%C3%ADa.%20Mi%20negocio%20es%3A%20____.%20Mi%20consulta%20es%3A%20____." target="_blank" rel="noopener" class="btn btn-white" style="margin-top:1.5rem;display:inline-block">Solicitar orientación</a></div></section>
<footer><div class="container footer-inner"><img src="/assets/logo-white.png" alt="Q-WERK" height="22" class="footer-logo"><span class="footer-copy">© 2026 Q-WERK · Hecho en México</span><span class="footer-domain">qwerk.mx</span></div></footer>
</body></html>`;

const dir = join(ROOT, 'blog/preguntas-frecuentes-lavanderias');
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, 'index.html'), page);
console.log(`✓ Centro de respuestas creado con ${questions.length} consultas.`);
