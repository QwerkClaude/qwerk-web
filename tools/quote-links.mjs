export function quoteLinks(product, presentations) {
  const sizes = presentations.split(' · ').filter(size => /^\d+(?:[.,]\d+)? (?:L|g|kg)$/.test(size));
  if (!sizes.length) return '';
  const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
  const links = sizes.map(size => {
    const message = `Hola, vengo de qwerk.mx. Quiero cotizar ${product}, presentación de ${size}. ¿Me confirman precio y entrega?`;
    return `<a class="quote-size" href="https://wa.me/523222202407?text=${encodeURIComponent(message)}" target="_blank" rel="noopener" data-ev="product_whatsapp_click" data-ev-product="${escape(product)}" data-ev-size="${size}" aria-label="Cotizar ${escape(product)} de ${size} por WhatsApp">${size}</a>`;
  });
  return `<div class="quote-options"><strong>Cotizar por WhatsApp</strong><div>${links.join(' ')}</div></div>`;
}
