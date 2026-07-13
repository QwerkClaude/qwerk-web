// ═══ MODAL ═══
document.addEventListener('click', function(e) {
  const btn = e.target.closest('[data-modal]');
  if (btn) {
    const id = btn.dataset.modal;
    document.getElementById('modal-' + id).classList.add('active');
    document.getElementById('modal-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
    return;
  }
  if (e.target.id === 'modal-overlay' || e.target.closest('.modal-close')) {
    closeModal();
  }
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeModal();
});

function closeModal() {
  document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ═══ NAV ═══
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.getElementById('navLinks');

if (navToggle) {
  navToggle.addEventListener('click', function() {
    navLinks.classList.toggle('open');
  });
}

document.querySelectorAll('.nav-links a').forEach(function(link) {
  link.addEventListener('click', function() {
    navLinks.classList.remove('open');
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
    ['abrillantador',                            'Hola, me interesa el abrillantador de llantas. ¿Cuál me recomiendas, el normal o el premium?'],
    ['desengrasante',                            'Hola, tengo suciedad o grasa pesada. ¿Me recomiendas el desengrasante y cómo se usa?'],
    ['/blog',                                    'Hola, leí una de sus guías y tengo una duda sobre sus productos. ¿Me pueden asesorar?']
  ];

  // Mensaje cuando el usuario abre la ficha técnica de un producto (alta intención)
  function productMessage(name) {
    return 'Hola, vi el producto ' + name + ' en su página y quiero más información. ¿Me pasas precio y presentaciones?';
  }

  function baseMessage() {
    var path = (location.pathname || '').toLowerCase();
    for (var i = 0; i < WA_RULES.length; i++) {
      if (path.indexOf(WA_RULES[i][0]) !== -1) return WA_RULES[i][1];
    }
    return WA_DEFAULT;
  }

  // Nombre del producto de la ficha (modal) abierta, si la hay
  function openModalProduct() {
    var m = document.querySelector('.modal.active');
    if (!m) return null;
    var title = m.querySelector('.modal-title');
    if (!title) return null;
    var name = title.textContent.trim();
    var code = m.querySelector('.modal-code');
    if (code && code.textContent.trim()) name = code.textContent.trim() + ' — ' + name;
    return name;
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

  function refresh() {
    var btn = ensureButton();
    var prod = openModalProduct();
    btn.href = buildHref(prod ? productMessage(prod) : baseMessage());
  }

  function init() {
    refresh();
    // Recalcular cuando se abre/cierra una ficha técnica (corre tras el handler de modales)
    document.addEventListener('click', function () { setTimeout(refresh, 50); }, false);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setTimeout(refresh, 50); }, false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
