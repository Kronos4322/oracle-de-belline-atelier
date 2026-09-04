/* Généré par tools/gen-sw.js — ne pas éditer à la main.
 * Mise en cache de l'app (code + images de cartes) pour un lancement
 * hors-ligne. Stratégie : cache d'abord pour les fichiers de l'app,
 * réseau d'abord (avec repli sur le cache) pour tout le reste. */
var CACHE = 'belline-v52';
var PRECACHE = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "css/styles.css?v=52",
  "js/app.js?v=52",
  "js/data/card-dossier.js?v=52",
  "js/data/card-images.js?v=52",
  "js/data/card-planche.js?v=52",
  "js/data/card-reference.js?v=52",
  "js/data/cards.js?v=52",
  "js/data/combos.js?v=52",
  "js/data/spreads.js?v=52",
  "js/storage.js?v=52",
  "js/views/associations.js?v=52",
  "js/views/entrainement.js?v=52",
  "js/views/grimoire.js?v=52",
  "js/views/journal.js?v=52",
  "js/views/journalier.js?v=52",
  "js/views/methode.js?v=52",
  "js/views/progression.js?v=52",
  "js/views/tirages.js?v=52",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512-maskable.png",
  "assets/icons/icon-512.png",
  "assets/cartes/00%20CARTE%20BLEUE.jpg",
  "assets/cartes/01%20DESTINEE.jpg",
  "assets/cartes/02%20ETOILE%20DE%20L'HOMME.jpg",
  "assets/cartes/03%20ETOILE%20DE%20LA%20FEMME.jpg",
  "assets/cartes/04.%20NATIVITE.jpg",
  "assets/cartes/05%20REUSSITE.jpg",
  "assets/cartes/06%20ELEVATION.jpg",
  "assets/cartes/07.%20HONNEURS.jpg",
  "assets/cartes/08%20PENSEE%20AMITIE.jpg",
  "assets/cartes/09%20CAMPAGNE%20SANTE.jpg",
  "assets/cartes/10%20PRESENTS.jpg",
  "assets/cartes/11%20TRAHISON.jpg",
  "assets/cartes/12.%20DEPART.jpg",
  "assets/cartes/13.%20INCONSTANCE.jpg",
  "assets/cartes/14.%20DECOUVERTE.jpg",
  "assets/cartes/15.%20L'EAU.jpg",
  "assets/cartes/16.%20LES%20PENATES.jpg",
  "assets/cartes/17.%20MALADIE.jpg",
  "assets/cartes/18.%20CHANGEMENT.jpg",
  "assets/cartes/19.%20ARGENT.jpg",
  "assets/cartes/20.%20INTELLIGENCE.jpg",
  "assets/cartes/21.%20VOL%20PERTE.jpg",
  "assets/cartes/22.%20ENTREPRISES.jpg",
  "assets/cartes/23.%20TRAFIC.jpg",
  "assets/cartes/24.%20NOUVELLE.jpg",
  "assets/cartes/25.%20PLAISIRS.jpg",
  "assets/cartes/26.%20LA%20PAIX.jpg",
  "assets/cartes/27.%20UNION.jpg",
  "assets/cartes/28.%20FAMILLE.jpg",
  "assets/cartes/29.%20AMOR.jpg",
  "assets/cartes/30.%20LA%20TABLE.jpg",
  "assets/cartes/31.%20PASSIONS.jpg",
  "assets/cartes/32.%20MECHANCETE.jpg",
  "assets/cartes/33.%20PROCES.jpg",
  "assets/cartes/34.%20DESPOTISME.jpg",
  "assets/cartes/35.%20ENNEMIS.jpg",
  "assets/cartes/36.%20POURPARLERS.jpg",
  "assets/cartes/37.%20FEU.jpg",
  "assets/cartes/38.%20ACCIDENT.jpg",
  "assets/cartes/39.%20APPUI.jpg",
  "assets/cartes/40.%20BEAUTE.jpg",
  "assets/cartes/41.%20HERITAGE.jpg",
  "assets/cartes/42.%20SAGESSE.jpg",
  "assets/cartes/43.%20LA%20RENOMEE.jpg",
  "assets/cartes/44.%20LE%20HASARD.jpg",
  "assets/cartes/45.%20LE%20BONHEUR.jpg",
  "assets/cartes/46.%20INFORTUNE.jpg",
  "assets/cartes/47.%20STERILITE.jpg",
  "assets/cartes/48.%20FATALITE.jpg",
  "assets/cartes/49.%20GRACE.jpg",
  "assets/cartes/50.%20RUINE.jpg",
  "assets/cartes/51.%20RETARD.jpg",
  "assets/cartes/52.%20CLOITRE.jpg",
  "assets/cartes/JUPITER.jpg",
  "assets/cartes/LUNE.jpg",
  "assets/cartes/MARS.jpg",
  "assets/cartes/MERCURE.jpg",
  "assets/cartes/SATURNE.jpg",
  "assets/cartes/SOLEIL.jpg",
  "assets/cartes/VENUS.jpg"
];

self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return Promise.all(PRECACHE.map(function (url) {
        return cache.add(url).catch(function () { /* une police ou une carte manquante ne bloque pas l'install */ });
      }));
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(names.filter(function (n) { return n !== CACHE; }).map(function (n) { return caches.delete(n); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return; // polices Google : laissées au réseau/cache du navigateur
  event.respondWith(
    caches.match(req, { ignoreSearch: false }).then(function (cached) {
      var network = fetch(req).then(function (res) {
        if (res && res.ok) caches.open(CACHE).then(function (c) { c.put(req, res.clone()); });
        return res;
      }).catch(function () { return cached; });
      return cached || network;
    })
  );
});
