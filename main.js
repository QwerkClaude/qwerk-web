// ═══ NAV ═══
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.getElementById('navLinks');

if (navToggle) {
  navToggle.addEventListener('click', function() {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  });
}

document.querySelectorAll('.nav-links a').forEach(function(link) {
  link.addEventListener('click', function() {
    navLinks.classList.remove('open');
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Abrir menú');
    }
  });
});

// ═══ SCROLL ═══
window.addEventListener('scroll', function() {
  const navbar = document.getElementById('navbar');
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 60);
});

/* ═══════════════════════════════════════════════════════════════════
   WHATSAPP CONTEXTUAL · Q-WERK
   El botón flotante cambia su mensaje prellenado según la página o el
   producto que ve el usuario, para generar conversaciones con intención
   de compra (no un "Hola" genérico).

   ► PARA EDITAR LOS MENSAJES: cambia los textos de WA_DEFAULT y WA_RULES.
     - WA_RULES: si la URL contiene la "clave" (izquierda), usa ese mensaje.
       La primera regla que coincide gana (ordena de más específica a más
       general). Para una página nueva, agrega una línea con su slug.
   ► PARA CAMBIAR EL NÚMERO: edita WA_PHONE (formato internacional, sin +).
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  var WA_PHONE = '523222202407';

  // Mensaje por defecto (home, blog y cualquier página sin regla propia)
  var WA_DEFAULT = 'Hola, quiero información sobre los productos de Q-WERK. ¿Me pasan precios y presentaciones por volumen?';

  // Reglas por RUTA (substring del pathname → mensaje). Orden = prioridad.
  var WA_RULES = [
    ['jabon-liquido-20-litros',                  'Hola, me interesa el jabón líquido de 20 litros para lavandería. ¿Me pasas precio y presentaciones?'],
    ['detergente-para-lavanderias',              'Hola, quiero más información sobre sus detergentes para lavandería. ¿Cuál me recomiendas para mi negocio?'],
    ['proveedor-productos-limpieza-lavanderias', 'Hola, quiero más información sobre sus detergentes para lavandería. ¿Cuál me recomiendas para mi negocio?'],
    ['reforzador-de-aroma',                      'Hola, me interesa el reforzador de aroma. ¿Cómo se usa y cuánto rinde?'],
    ['productos-para-autolavado',                'Hola, quiero información sobre sus productos para autolavado y detallado. ¿Cuál es el proceso completo que recomiendas?'],
    ['abrillantador',                            'Hola, me interesa el abrillantador de llantas. ¿Cuál me conviene: líquido, gel o hidrofóbico?'],
    ['desengrasante',                            'Hola, tengo suciedad o grasa pesada. ¿Me recomiendas el desengrasante y cómo se usa?'],
    ['/blog',                                    'Hola, leí una de sus guías y tengo una duda sobre sus productos. ¿Me pueden asesorar?']
  ];

  function baseMessage() {
    // Una página puede fijar su propio mensaje con <meta name="wa-message" content="...">
    var meta = document.querySelector('meta[name="wa-message"]');
    if (meta && meta.content) return meta.content;
    var path = (location.pathname || '').toLowerCase();
    for (var i = 0; i < WA_RULES.length; i++) {
      if (path.indexOf(WA_RULES[i][0]) !== -1) return WA_RULES[i][1];
    }
    return WA_DEFAULT;
  }

  function buildHref(msg) {
    return 'https://wa.me/' + WA_PHONE + '?text=' + encodeURIComponent(msg);
  }

  // Ícono para inyectar el botón en páginas que no lo traen (ej. blog)
  var WA_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

  function ensureButton() {
    var btn = document.querySelector('.wa-fixed');
    if (!btn) {
      btn = document.createElement('a');
      btn.className = 'wa-fixed';
      btn.target = '_blank';
      btn.rel = 'noopener';
      btn.setAttribute('aria-label', 'Escríbenos por WhatsApp');
      btn.innerHTML = WA_SVG;
      document.body.appendChild(btn);
    }
    return btn;
  }

  // ── Analítica (GA4 vía gtag, si está presente) ──
  function track(name, params) {
    if (typeof window.gtag === 'function') { try { window.gtag('event', name, params || {}); } catch (e) {} }
  }
  window.qwerkTrack = track;
  function trackFromEl(el) {
    var name = el.getAttribute('data-ev'); if (!name) return;
    var p = { page_path: location.pathname };
    if (el.getAttribute('data-ev-cat')) p.category = el.getAttribute('data-ev-cat');
    if (el.getAttribute('data-ev-product')) p.product = el.getAttribute('data-ev-product');
    if (el.getAttribute('data-ev-ctx')) p.context = el.getAttribute('data-ev-ctx');
    track(name, p);
  }

  // ── Copia contextual de la ventana ──
  var COPY_AUTO = { g: '¿Tienes un autolavado o haces detallado? Te ayudamos a elegir los productos adecuados.', c: 'Recibir recomendación' };
  var COPY_LAV  = { g: '¿Buscas controlar el costo por carga? Conoce nuestras opciones para lavandería.', c: 'Solicitar información' };
  var COPY_DEF  = { g: '¿Tienes dudas? Te ayudamos a elegir el producto adecuado para tu negocio.', c: 'Recibir asesoría' };
  function panelCopy() {
    var path = (location.pathname || '').toLowerCase();
    if (/autolavado|automotriz|abrillantador|snow-foam|silicones|desengrasante/.test(path)) return COPY_AUTO;
    if (/lavander|detergente|reforzador|jabon|proveedor/.test(path)) return COPY_LAV;
    return COPY_DEF;
  }

  // ── Ventana flotante contextual ──
  var panelToggled = false;
  // Al cerrar con la X, la ventana se vuelve a abrir sola tras unos segundos.
  var REOPEN_MS = 20000;
  var reopenTimer = null;
  function clearReopen() { if (reopenTimer) { clearTimeout(reopenTimer); reopenTimer = null; } }
  function scheduleReopen() {
    clearReopen();
    reopenTimer = setTimeout(function () { togglePanel(true); setTimeout(refresh, 0); }, REOPEN_MS);
  }
  function ensurePanel() {
    var p = document.querySelector('.wa-panel');
    if (!p) {
      p = document.createElement('div');
      p.className = 'wa-panel';
      p.innerHTML =
        '<div class="wa-panel-head"><span class="wa-avatar">' + WA_SVG + '</span>' +
        '<div><strong>QWERK</strong><br><span>Normalmente responde en minutos</span></div>' +
        '<button class="wa-close" type="button" aria-label="Cerrar ventana">✕</button></div>' +
        '<div class="wa-panel-body"><div class="wa-greeting"></div>' +
        '<a class="wa-panel-cta" target="_blank" rel="noopener" data-ev="whatsapp_click" data-ev-ctx="ventana">' + WA_SVG + '<span></span></a></div>';
      document.body.appendChild(p);
    }
    return p;
  }
  function togglePanel(open) {
    var p = ensurePanel();
    var willOpen = (open === undefined) ? !p.classList.contains('open') : open;
    p.classList.toggle('open', willOpen);
    panelToggled = true;
    if (willOpen) clearReopen(); // si ya está abierta, no hay reapertura pendiente
    try { sessionStorage.setItem('waPanelSeen', '1'); } catch (e) {}
  }

  function refresh() {
    var href = buildHref(baseMessage());
    ensureButton().href = href;
    var p = ensurePanel();
    var copy = panelCopy();
    p.querySelector('.wa-greeting').textContent = copy.g;
    var cta = p.querySelector('.wa-panel-cta');
    cta.href = href;
    cta.querySelector('span').textContent = copy.c;
    cta.removeAttribute('data-ev-product');
  }

  // ── Enlaces contextuales en contenido (tarjetas, CTAs, hero) ──
  function wireDataWa() {
    var links = document.querySelectorAll('a[data-wa-msg]');
    for (var i = 0; i < links.length; i++) {
      links[i].href = buildHref(links[i].getAttribute('data-wa-msg'));
    }
  }

  function onClick(e) {
    var fab = e.target.closest('.wa-fixed');
    if (fab) { e.preventDefault(); togglePanel(); return; }
    if (e.target.closest('.wa-close')) { togglePanel(false); scheduleReopen(); return; }
    var ev = e.target.closest('[data-ev]');
    if (ev) trackFromEl(ev);
    setTimeout(refresh, 50);
  }

  function init() {
    wireDataWa();
    refresh();
    document.addEventListener('click', onClick, false);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { togglePanel(false); setTimeout(refresh, 50); } }, false);
    // Teaser: abre la ventana una vez por sesión en escritorio (no invasivo en móvil)
    try {
      if (!sessionStorage.getItem('waPanelSeen') && window.innerWidth > 640) {
        setTimeout(function () { if (!panelToggled) togglePanel(true); }, 3200);
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* ═══════════════════════════════════════════════════════════════════
   SELECTOR RÁPIDO · ¿qué necesitas limpiar?
   Recomienda producto(s) + abre WhatsApp con el contexto elegido.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  var opts = document.querySelectorAll('.selector-opt');
  var out = document.getElementById('selectorResult');
  if (!opts.length || !out) return;
  var WA = 'https://wa.me/523222202407?text=';
  var SEL = {
    exterior: { t: 'Exterior del vehículo', chips: ['Snow Foam', 'APC', 'Abrillantador de llantas', 'Desengrasante'], p: 'Todo el exterior: lava la carrocería con Snow Foam y guante limpio, usa APC diluido según la superficie, da brillo a las llantas con el Abrillantador y corta la grasa pesada con el Desengrasante.', msg: 'Hola, quiero limpiar el exterior de vehículos. ¿Qué productos me recomiendas?', cat: 'automotriz' },
    interior: { t: 'Interior del vehículo', chips: ['APC', 'Crema RAP'], p: 'Limpia plásticos, viniles y tableros con APC, y termina con Crema RAP: brillo agradable, acabado seco al tacto y sin sensación grasosa.', msg: 'Hola, quiero limpiar interiores de vehículos y conocer Crema RAP. ¿Qué me recomiendas?', cat: 'automotriz' },
    llantas: { t: 'Llantas', chips: ['Abrillantador líquido', 'Abrillantador en gel', 'Abrillantador hidrofóbico'], p: 'Elige aplicación rápida con el líquido, mayor control con el gel o máximo brillo wet look y repelencia al agua con el hidrofóbico.', msg: 'Hola, me interesa el abrillantador de llantas. ¿Cuál me conviene: líquido, gel o hidrofóbico?', cat: 'automotriz' },
    motor: { t: 'Motor o grasa pesada', chips: ['Desengrasante concentrado'], p: 'El desengrasante concentrado corta grasa de motores, rines, chasis y piso; se diluye según la suciedad para rendir más.', msg: 'Hola, tengo suciedad o grasa pesada. ¿Me recomiendas el desengrasante y cómo se usa?', cat: 'automotriz' },
    ropa: { t: 'Ropa', chips: ['Detergente de alto desempeño', 'Detergente con vinagre', 'Detergente con pino', 'Detergente para ropa de color', 'Detergente con bicarbonato', 'Desengrasante textil alcalino', 'Reforzador de aroma textil'], p: 'Elige según la necesidad de la carga: mayor desempeño y fragancia duradera, desodorización, apoyo de limpieza, aroma a pino, refuerzo alcalino o acabado aromático final.', msg: 'Hola, quiero información y precios de los productos Q-WERK para lavandería.', cat: 'lavanderia' },
    duda: { t: 'No estoy seguro', chips: [], p: 'Cuéntanos qué hace tu negocio y te recomendamos el proceso completo, con producto y dilución adecuados.', msg: 'Hola, quiero ayuda para elegir los productos adecuados para mi negocio.', cat: 'general' }
  };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function render(key) {
    var d = SEL[key]; if (!d) return;
    var chips = d.chips.map(function (c) { return '<span class="selector-chip">' + esc(c) + '</span>'; }).join('');
    out.innerHTML =
      '<h3>' + esc(d.t) + '</h3>' +
      (chips ? '<div class="selector-rec">' + chips + '</div>' : '') +
      '<p>' + esc(d.p) + '</p>' +
      '<a class="btn btn-green btn-sm" target="_blank" rel="noopener" href="' + WA + encodeURIComponent(d.msg) + '" data-ev="whatsapp_click" data-ev-ctx="selector:' + key + '">Preguntar por WhatsApp</a>';
    out.hidden = false;
    if (window.qwerkTrack) window.qwerkTrack('select_product_category', { category: d.cat, context: 'selector:' + key });
  }
  for (var i = 0; i < opts.length; i++) {
    opts[i].addEventListener('click', function () {
      for (var j = 0; j < opts.length; j++) opts[j].classList.remove('active');
      this.classList.add('active');
      render(this.getAttribute('data-sel'));
      out.scrollIntoView({ block: 'nearest' });
    });
  }
})();
