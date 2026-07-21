#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)));
const POLICY_URL = 'https://qwerk.mx/politica-de-envios-y-devoluciones/';
const SHIPPING_POLICY_ID = `${POLICY_URL}#envios-nacionales`;
const PRODUCT_FILES = [
  'automotriz/abrillantador-hidrofobico-llantas/index.html',
  'automotriz/abrillantador-llantas/index.html',
  'automotriz/abrillantador-llantas-gel/index.html',
  'automotriz/apc-limpiador-multiusos/index.html',
  'automotriz/crema-rap/index.html',
  'automotriz/desengrasante-concentrado/index.html',
  'automotriz/snow-foam-ph-neutro/index.html',
  'lavanderia/detergente-con-bicarbonato/index.html',
  'lavanderia/detergente-con-pino/index.html',
  'lavanderia/detergente-con-vinagre/index.html',
  'lavanderia/detergente-ropa-color/index.html',
  'lavanderia/jabon-liquido-lavanderia/index.html',
  'lavanderia/limpiador-textil-alcalino/index.html',
  'lavanderia/reforzador-aroma-textil/index.html',
];

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

function addPoliciesToOffer(offer) {
  if (!offer || !['Offer', 'AggregateOffer'].includes(offer['@type'])) return;
  Object.assign(offer, offerPolicies());
}

for (const relativePath of PRODUCT_FILES) {
  const file = join(ROOT, relativePath);
  let html = readFileSync(file, 'utf8');
  let productFound = false;

  html = html.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g, (block, open, body, close) => {
    let data;
    try { data = JSON.parse(body.trim()); } catch { return block; }
    if (data['@type'] !== 'Product') return block;

    productFound = true;
    const offers = Array.isArray(data.offers) ? data.offers : [data.offers];
    offers.forEach(addPoliciesToOffer);
    const formatted = JSON.stringify(data, null, 2).replace(/\n/g, '\n  ');
    return `${open}\n  ${formatted}\n  ${close}`;
  });

  if (!productFound) throw new Error(`No se encontró Product JSON-LD en ${relativePath}`);

  if (!html.includes('class="footer-policy"')) {
    html = html.replace(
      /(<span class="footer-domain">qwerk\.mx<\/span>)/,
      '$1\n      <a class="footer-policy" href="/politica-de-envios-y-devoluciones/">Envíos y devoluciones</a>',
    );
  }

  writeFileSync(file, html);
}

console.log(`Políticas aplicadas a ${PRODUCT_FILES.length} fichas de producto.`);
