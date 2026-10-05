// Construction du chemin : un graphe qui monte de bas en haut, région par région, dans l'ordre d'Edmond.
// Module pur (aucun accès au DOM), testable sous Node.
//
// Chaque région alterne des fourches (deux branches portant des cartes, qui se rejoignent ; à chaque fourche,
// le joueur doit choisir à gauche ou à droite) et des cartes de tronc, que tout chemin traverse :
// les cartes fortes, La Destinée et les Étoiles. Une branche porte au plus trois cartes.
//
// Ajouts de jeu (signalés) :
//   - Les Étoiles quittent le préambule : chacune se dresse sur le tronc d'une région planétaire, pour
//     que la carte qui la précède soit une vraie carte, choisie par le joueur.
//   - Rendez-vous : dans chaque région, une règle de voisinage de Belline est préparée en plaçant ses deux
//     cartes l'une après l'autre (au besoin, une carte d'une autre famille vient en visiteuse). Sans cela,
//     les règles qui relient deux familles éloignées (Maladie et Grâce...) ne pourraient jamais se produire.
//   - Dilemmes : les cartes libres sont échangées entre branches pour qu'une fourche offre rarement un
//     choix évident (une branche bien meilleure que l'autre).
//   - Parcours progressif : `regions` limite le chemin aux premières planètes (chemin court, moyen, grand).
//
// Un nœud : { id, x (voie : -1, 0, 1), a (altitude), region, carte (numéro ou null), tronc, porte, depart,
//             arrivee, etat ('libre' | 'vecue' | 'fermee' | 'contournee' | 'sautee' | 'survolee') }
import { CONFIG, REGIONS } from "../config.js";
import { CARTES, CARTE_PAR_ID } from "../data/cartes.js";
import { VOISINAGE } from "../data/voisinage.js";
import { melanger, choisir } from "./hasard.js";
import { VALEURS } from "./valeurs.js";

const PROBA_RENDEZ_VOUS = 0.85;
const MAX_PAR_FOURCHE = 4;      // deux branches de deux, ou trois et une : jamais plus de trois par branche
export const ECART_EVIDENT = 15; // au-delà, une fourche est un choix évident

/** Cartes qui se dressent sur le tronc. */
export function estTronc(id) { const c = CARTE_PAR_ID[id]; return !!c.forte || id === 1 || !!c.etoile; }

/** Répartit les cartes entre les régions et prépare les rendez-vous. `n` : nombre de régions planétaires. */
function planifier(rng, n) {
  const planetes = Array.from({ length: n }, (_, i) => i + 1);
  const parRegion = REGIONS.map((r, i) => (i <= n ? CARTES.filter(c => c.famille === r.famille && !c.etoile).map(c => c.id) : []));
  const regionDe = {};
  parRegion.forEach((ids, i) => ids.forEach(id => { regionDe[id] = i; }));
  const deplacer = (id, i) => { parRegion[regionDe[id]] = parRegion[regionDe[id]].filter(x => x !== id); parRegion[i].push(id); regionDe[id] = i; };

  // Les Étoiles : deux régions planétaires distinctes
  const [r2, r3] = melanger(planetes, rng);
  parRegion[r2].push(2); regionDe[2] = r2;
  parRegion[r3].push(3); regionDe[3] = r3;

  const liens = REGIONS.map(() => []);
  const rendezVous = [];
  const utilises = new Set();
  for (const i of melanger(planetes, rng)) {
    if (rng() > PROBA_RENDEZ_VOUS) continue;
    const candidates = VOISINAGE.filter(r => {
      if (utilises.has(r.a) || utilises.has(r.b)) return false;
      const ra = regionDe[r.a], rb = regionDe[r.b];
      if (ra == null || rb == null) return false;   // carte hors du chemin court
      if (ra !== i && rb !== i) return false;
      const visiteuse = ra === i ? r.b : r.a;
      if (regionDe[visiteuse] === i) return true;
      return !estTronc(visiteuse) && regionDe[visiteuse] >= 1; // une carte de tronc reste dans sa région
    });
    if (!candidates.length) continue;
    const r = choisir(candidates, rng);
    for (const id of [r.a, r.b]) { if (regionDe[id] !== i) deplacer(id, i); utilises.add(id); }
    const [p, s] = r.ordre === "avant" || rng() < 0.5 ? [r.a, r.b] : [r.b, r.a];
    const tp = estTronc(p), ts = estTronc(s);
    if (!tp && !ts) liens[i].push({ type: "paire", ids: [p, s] });
    else if (!tp && ts) liens[i].push({ type: "avant", partenaire: p, tronc: s });
    else if (tp && !ts) liens[i].push({ type: "apres", tronc: p, partenaire: s });
    else liens[i].push({ type: "troncs", ids: [p, s] });
    rendezVous.push({ regle: r.id, cartes: [p, s], region: i });
  }

  // La Carte Bleue (hors jeu d'Edmond) apparaît une fois, dans une région planétaire
  parRegion[choisir(planetes, rng)].push(0);
  return { parRegion, liens, rendezVous };
}

/** Suite de segments d'une région : { type: 'tronc', ids } ou { type: 'fourche', branches: [[ids], [ids]] }. */
function segmentsRegion(ids, liens, rng) {
  const lies = new Set();
  const groupes = [];      // groupes de cartes de tronc consécutives
  const parTronc = {};
  for (const l of liens) {
    if (l.type === "troncs") { const g = { ids: l.ids.slice() }; groupes.push(g); l.ids.forEach(id => { parTronc[id] = g; lies.add(id); }); }
  }
  for (const id of ids) if (estTronc(id) && !parTronc[id]) { const g = { ids: [id] }; groupes.push(g); parTronc[id] = g; lies.add(id); }
  for (const l of liens) {
    if (l.type === "avant") { parTronc[l.tronc].avant = l.partenaire; lies.add(l.partenaire); }
    if (l.type === "apres") { parTronc[l.tronc].apres = l.partenaire; lies.add(l.partenaire); }
  }
  const unites = liens.filter(l => l.type === "paire").map(l => { l.ids.forEach(id => lies.add(id)); return l.ids.slice(); });
  const libres = new Set(ids.filter(id => !lies.has(id)));
  for (const id of libres) unites.push([id]);

  const ordre = melanger(groupes, rng);
  const fourches = ordre.map(() => ({ unites: [], fin: null, debut: null }));
  fourches.push({ unites: [], fin: null, debut: null });
  ordre.forEach((g, k) => {
    if (g.avant != null) fourches[k].fin = g.avant;
    if (g.apres != null) fourches[k + 1].debut = g.apres;
  });
  const depart = Math.floor(rng() * fourches.length);
  melanger(unites, rng).forEach((u, k) => fourches[(depart + k) % fourches.length].unites.push(u));

  const segments = [];
  fourches.forEach((f, k) => {
    for (const morceau of decouper(f)) segments.push({ type: "fourche", branches: branches(morceau, rng) });
    if (k < ordre.length) segments.push({ type: "tronc", ids: ordre[k].ids });
  });
  ameliorerFourches(segments, libres, rng);
  return segments;
}

/** Une fourche trop chargée devient plusieurs fourches successives d'au plus MAX_PAR_FOURCHE cartes. */
function decouper(f) {
  const taille = m => m.unites.reduce((s, u) => s + u.length, 0) + (m.fin != null) + (m.debut != null);
  if (taille(f) === 0) return [];
  const morceaux = [{ unites: [], fin: null, debut: f.debut }];
  for (const u of f.unites) {
    let m = morceaux[morceaux.length - 1];
    if (taille(m) + u.length > MAX_PAR_FOURCHE) { m = { unites: [], fin: null, debut: null }; morceaux.push(m); }
    m.unites.push(u);
  }
  const dernier = morceaux[morceaux.length - 1];
  if (f.fin != null) {
    if (taille(dernier) + 1 > MAX_PAR_FOURCHE) morceaux.push({ unites: [], fin: f.fin, debut: null });
    else dernier.fin = f.fin;
  }
  return morceaux.filter(m => taille(m) > 0);
}

function branches(f, rng) {
  const b = [{ debut: [], unites: [], fin: [] }, { debut: [], unites: [], fin: [] }];
  if (f.fin != null) b[0].fin.push(f.fin);
  if (f.debut != null) b[1].debut.push(f.debut);
  const taille = x => x.debut.length + x.fin.length + x.unites.reduce((s, u) => s + u.length, 0);
  for (const u of f.unites) {
    const min = Math.min(...b.map(taille));
    choisir(b.filter(x => taille(x) === min), rng).unites.push(u);
  }
  return melanger(b.map(x => [...x.debut, ...x.unites.flat(), ...x.fin]), rng);
}

const valeurBranche = ids => ids.reduce((s, id) => s + VALEURS[id], 0);
const penalite = segs => segs.filter(s => s.type === "fourche").reduce((p, s) => {
  const ecart = Math.abs(valeurBranche(s.branches[0]) - valeurBranche(s.branches[1]));
  return p + Math.max(0, ecart - 8);
}, 0);

/** Échange des cartes libres entre branches pour que les fourches soient des dilemmes. */
function ameliorerFourches(segments, libres, rng) {
  const places = [];
  segments.forEach((s, i) => { if (s.type === "fourche") s.branches.forEach((b, j) => b.forEach((id, k) => { if (libres.has(id)) places.push([i, j, k]); })); });
  if (places.length < 2) return;
  let actuelle = penalite(segments);
  for (let essai = 0; essai < 120 && actuelle > 0; essai++) {
    const [p, q] = [choisir(places, rng), choisir(places, rng)];
    if (p[0] === q[0] && p[1] === q[1]) continue;
    const bp = segments[p[0]].branches[p[1]], bq = segments[q[0]].branches[q[1]];
    [bp[p[2]], bq[q[2]]] = [bq[q[2]], bp[p[2]]];
    const nouvelle = penalite(segments);
    if (nouvelle <= actuelle) actuelle = nouvelle;
    else [bp[p[2]], bq[q[2]]] = [bq[q[2]], bp[p[2]]];
  }
}

/** Construit le chemin. `options.regions` : nombre de régions planétaires (2 à 7 ; 7 par défaut). */
export function construireChemin(rng, options = {}) {
  const nRegions = Math.max(2, Math.min(7, options.regions ?? 7));
  const { parRegion, liens, rendezVous } = planifier(rng, nRegions);
  const noeuds = [], suivants = [];
  const ajouter = n => { n.id = noeuds.length; n.etat = "libre"; if (n.carte === undefined) n.carte = null; noeuds.push(n); suivants.push([]); return n.id; };
  const lier = (a, b) => suivants[a].push(b);
  const regions = REGIONS.slice(0, nRegions + 1).map((r, i) => ({ index: i, aDebut: 0, aFin: 0 }));

  let a = 0;
  let cur = ajouter({ x: 0, a, region: 0, depart: true });
  regions[0].aDebut = -600;
  a += CONFIG.rang;
  const dest = ajouter({ x: 0, a, region: 0, carte: 1, tronc: true }); lier(cur, dest); cur = dest;

  const fourches = [];
  for (let i = 1; i <= nRegions; i++) {
    a += 170;
    const porte = ajouter({ x: 0, a, region: i, porte: i }); lier(cur, porte); cur = porte;
    regions[i].aDebut = a; regions[i - 1].aFin = a;
    for (const seg of segmentsRegion(parRegion[i], liens[i], rng)) {
      if (seg.type === "tronc") {
        for (const id of seg.ids) { a += CONFIG.rang; const n = ajouter({ x: 0, a, region: i, carte: id, tronc: true }); lier(cur, n); cur = n; }
        continue;
      }
      let split = cur;
      if (noeuds[cur].carte != null || noeuds[cur].porte != null) { a += 110; split = ajouter({ x: 0, a, region: i }); lier(cur, split); }
      const L = Math.max(1, ...seg.branches.map(b => b.length));
      const S = CONFIG.ecartFourche * 2 + (L - 1) * CONFIG.rang;
      const fins = [];
      fourches.push(seg.branches.map(b => b.slice()));
      seg.branches.forEach((ids, k) => {
        const x = k === 0 ? -1 : 1;
        let prev = split;
        if (!ids.length) { const w = ajouter({ x, a: a + S / 2, region: i }); lier(prev, w); prev = w; }
        ids.forEach((id, j) => {
          const aj = ids.length === L ? a + CONFIG.ecartFourche + j * CONFIG.rang : a + S * (j + 1) / (ids.length + 1);
          const n = ajouter({ x, a: aj, region: i, carte: id }); lier(prev, n); prev = n;
        });
        fins.push(prev);
      });
      a += S;
      const merge = ajouter({ x: 0, a, region: i });
      fins.forEach(f => lier(f, merge));
      cur = merge;
    }
  }
  a += 230;
  const arrivee = ajouter({ x: 0, a, region: nRegions, arrivee: true }); lier(cur, arrivee);
  regions[nRegions].aFin = a + 600;

  const ordre = noeuds.map(n => n.id).sort((p, q) => noeuds[p].a - noeuds[q].a);
  return { noeuds, suivants, ordre, depart: 0, arrivee, regions, rendezVous, fourches, nRegions };
}

const cout = n => (n.carte != null && n.etat === "libre" ? 1 : 0);

/**
 * Rangs des nœuds atteignables depuis une position du mage ({ noeud, vers }).
 * Le rang d'une carte libre est le nombre de cartes libres qu'il faut vivre pour l'atteindre, elle comprise :
 * rang 1 = les cartes de la prochaine fourche (ou la prochaine carte du tronc).
 */
export function rangs(chemin, noeud, vers = null) {
  const { noeuds, suivants, ordre } = chemin;
  const dist = new Map();
  if (vers != null) dist.set(vers, cout(noeuds[vers]));
  else for (const s of suivants[noeud]) dist.set(s, Math.min(dist.get(s) ?? Infinity, cout(noeuds[s])));
  for (const n of ordre) {
    if (!dist.has(n)) continue;
    for (const s of suivants[n]) {
      const d = dist.get(n) + cout(noeuds[s]);
      if (d < (dist.get(s) ?? Infinity)) dist.set(s, d);
    }
  }
  return dist;
}

/** Longueur d'une arête (unités du monde). */
export function longueurArete(chemin, p, q) {
  const A = chemin.noeuds[p], B = chemin.noeuds[q];
  return Math.hypot((B.x - A.x) * CONFIG.ecartVoies, B.a - A.a);
}

/** Plus court trajet (distance) d'un nœud jusqu'au premier nœud qui vérifie `but`. */
export function distanceJusqua(chemin, depuis, but) {
  const dist = new Map([[depuis, 0]]);
  for (const n of chemin.ordre) {
    if (!dist.has(n)) continue;
    if (n !== depuis && but(chemin.noeuds[n])) return dist.get(n);
    for (const s of chemin.suivants[n]) {
      const d = dist.get(n) + longueurArete(chemin, n, s);
      if (d < (dist.get(s) ?? Infinity)) dist.set(s, d);
    }
  }
  return null;
}

/** Cartes encore libres que le mage ne peut plus atteindre depuis le nœud où il se tient. */
export function injoignables(chemin, noeud) {
  const atteints = rangs(chemin, noeud);
  return chemin.noeuds.filter(n => n.carte != null && n.etat === "libre" && n.id !== noeud && !atteints.has(n.id)).map(n => n.id);
}

/** Suite de nœuds de `depuis` (exclu) à `cible` (inclus), ou null. */
export function cheminVers(chemin, depuis, cible) {
  const prec = new Map([[depuis, null]]);
  const file = [depuis];
  while (file.length) {
    const n = file.shift();
    if (n === cible) break;
    for (const s of chemin.suivants[n]) if (!prec.has(s)) { prec.set(s, n); file.push(s); }
  }
  if (!prec.has(cible)) return null;
  const route = [];
  for (let n = cible; n !== depuis; n = prec.get(n)) route.unshift(n);
  return route;
}

/** Accident : rebat les cartes encore libres des branches de la région, devant le mage. Renvoie leur nombre. */
export function bouleverser(chemin, region, depuis, rng) {
  const atteints = rangs(chemin, depuis);
  const cibles = chemin.noeuds.filter(n => n.region === region && n.carte != null && n.etat === "libre" && !n.tronc && atteints.has(n.id));
  const ids = melanger(cibles.map(n => n.carte), rng);
  cibles.forEach((n, k) => { n.carte = ids[k]; });
  return cibles.length;
}

/** Nœud portant une carte donnée. */
export function noeudDeCarte(chemin, id) { return chemin.noeuds.find(n => n.carte === id); }

/** Part des fourches où une branche vaut nettement plus que l'autre (mesure des dilemmes). */
export function partEvidente(chemin) {
  const f = chemin.fourches;
  return f.length ? f.filter(b => Math.abs(valeurBranche(b[0]) - valeurBranche(b[1])) >= ECART_EVIDENT).length / f.length : 0;
}
