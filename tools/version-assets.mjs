#!/usr/bin/env node
/*  Versiona las URLs de main.js y style.css en TODO el HTML con ?v=<hash>.
    ─────────────────────────────────────────────────────────────
    Por qué: Cloudflare Pages ignora Cache-Control puesto en _headers para
    assets estáticos (los sirve con max-age=14400 fijo). El HTML, en cambio,
    se sirve siempre revalidado, así que basta cambiar la URL del asset
    (?v=<hash de contenido>) para que un deploy llegue de inmediato a
    visitantes recurrentes: al cambiar main.js/style.css cambia el hash,
    cambia la URL y el navegador descarta la copia cacheada.

    Idempotente: reemplaza cualquier ?v= previo por el hash actual, así que
    correrlo sin cambios no toca nada. Los generadores (build-*.mjs) ya emiten
    la versión; este script cubre además las páginas escritas a mano (index,
    hubs, landings) y re-normaliza todo.

    Ejecuta tras cambiar main.js o style.css, antes de commitear:
      node tools/version-assets.mjs
*/
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const hash = f => createHash('sha256').update(readFileSync(join(ROOT, f))).digest('hex').slice(0, 8);
const V_JS = hash('main.js');
const V_CSS = hash('style.css');

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === '.git' || name === 'node_modules' || name === '.claude') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

let changed = 0;
for (const file of walk(ROOT)) {
  const src = readFileSync(file, 'utf8');
  const out = src
    .replace(/(\bsrc=)(["'])(\/?main\.js)(?:\?v=[a-f0-9]+)?\2/g, `$1$2$3?v=${V_JS}$2`)
    .replace(/(\bhref=)(["'])(\/?style\.css)(?:\?v=[a-f0-9]+)?\2/g, `$1$2$3?v=${V_CSS}$2`);
  if (out !== src) { writeFileSync(file, out); changed++; }
}
console.log(`main.js?v=${V_JS}  ·  style.css?v=${V_CSS}  →  ${changed} archivo(s) actualizado(s)`);
