#!/usr/bin/env node
/* ---------------------------------------------------------------------------
 * Régénère sw.js à la racine du projet : liste explicitement tous les
 * fichiers de l'app (code, images de cartes, icônes) pour un vrai
 * fonctionnement hors-ligne une fois l'app ouverte au moins une fois en
 * ligne. Le nom du cache est versionné sur le même `?v=` que index.html,
 * pour que les caches périmés soient nettoyés automatiquement.
 *
 * Usage : node tools/gen-sw.js
 * (relit le numéro de version dans index.html, pas besoin de le répéter)
 * ------------------------------------------------------------------------- */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function walk(dir, exts) {
  var out = [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (e) {
    var p = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walk(p, exts));
    else if (!exts || exts.indexOf(path.extname(e.name).toLowerCase()) !== -1) out.push(p);
  });
  return out;
}

function rel(p) { return path.relative(ROOT, p).split(path.sep).join('/'); }

var indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
var vMatch = indexHtml.match(/\?v=(\d+)/);
var V = vMatch ? vMatch[1] : '1';

var jsFiles = walk(path.join(ROOT, 'js'), ['.js']).map(rel);
var cardImages = walk(path.join(ROOT, 'assets', 'cartes'), ['.jpg', '.jpeg', '.png', '.webp']).map(rel);
var icons = walk(path.join(ROOT, 'assets', 'icons'), ['.png']).map(rel);

var precache = ['./', 'index.html', 'manifest.webmanifest', 'css/styles.css?v=' + V]
  .concat(jsFiles.map(function (f) { return f + '?v=' + V; }))
  .concat(icons)
  .concat(cardImages.map(function (f) { return encodeURI(f); }));

var sw =
"/* Généré par tools/gen-sw.js — ne pas éditer à la main.\n" +
" * Mise en cache de l'app (code + images de cartes) pour un lancement\n" +
" * hors-ligne. Stratégie : cache d'abord pour les fichiers de l'app,\n" +
" * réseau d'abord (avec repli sur le cache) pour tout le reste. */\n" +
"var CACHE = 'belline-v" + V + "';\n" +
"var PRECACHE = " + JSON.stringify(precache, null, 2) + ";\n\n" +
"self.addEventListener('install', function (event) {\n" +
"  self.skipWaiting();\n" +
"  event.waitUntil(\n" +
"    caches.open(CACHE).then(function (cache) {\n" +
"      return Promise.all(PRECACHE.map(function (url) {\n" +
"        return cache.add(url).catch(function () { /* une police ou une carte manquante ne bloque pas l'install */ });\n" +
"      }));\n" +
"    })\n" +
"  );\n" +
"});\n\n" +
"self.addEventListener('activate', function (event) {\n" +
"  event.waitUntil(\n" +
"    caches.keys().then(function (names) {\n" +
"      return Promise.all(names.filter(function (n) { return n !== CACHE; }).map(function (n) { return caches.delete(n); }));\n" +
"    }).then(function () { return self.clients.claim(); })\n" +
"  );\n" +
"});\n\n" +
"self.addEventListener('fetch', function (event) {\n" +
"  var req = event.request;\n" +
"  if (req.method !== 'GET') return;\n" +
"  var url = new URL(req.url);\n" +
"  if (url.origin !== location.origin) return; // polices Google : laissées au réseau/cache du navigateur\n" +
"  event.respondWith(\n" +
"    caches.match(req, { ignoreSearch: false }).then(function (cached) {\n" +
"      var network = fetch(req).then(function (res) {\n" +
"        if (res && res.ok) caches.open(CACHE).then(function (c) { c.put(req, res.clone()); });\n" +
"        return res;\n" +
"      }).catch(function () { return cached; });\n" +
"      return cached || network;\n" +
"    })\n" +
"  );\n" +
"});\n";

fs.writeFileSync(path.join(ROOT, 'sw.js'), sw);
console.log('sw.js régénéré — cache belline-v' + V + ', ' + precache.length + ' fichiers.');
