// Le Duel des Apparitions : moteur pur (aucun accès au DOM), testable sous Node.
//
// À la manière des jeux de cartes à duel. Chacun a 8000 points de vie et un deck de Belline (53 cartes, ou un
// deck composé), plus une réserve de figures d'accord. On tire 6 cartes ; pile ou face désigne qui commence.
// Le tour : pioche (le premier joueur ne pioche pas au premier tour), phase principale (une invocation normale
// ou une pose ; une figure d'accord ; influences ; présages posés ; changements de position), combat (pas au
// premier tour du duel), seconde phase principale, fin (main limitée à 7). On pioche 2 cartes par tour, sans dépasser 7.
//
// Combat : l'ATK de l'attaquant contre l'ATK de la cible (la plus faible est détruite, son joueur perd la
// différence ; égalité : les deux), ou contre sa DEF si elle défend (détruite sans dégâts, sauf « perçant » ;
// si la DEF tient, l'attaquant perd la différence). Plus d'apparition adverse : attaque directe.
// Les valeurs comptent l'affinité planétaire (+200 ATK par autre apparition face recto de même planète)
// et le terrain (+300 ATK et DEF aux apparitions de la planète du duel).
//
// Ajouts de jeu (signalés) : accords de Belline (deux cartes révélées à la suite qui forment une règle :
// favorable, +800 points de vie et une carte ; néfaste, 800 points de dégâts à l'adversaire) ; figures d'accord ;
// influences posées face cachée (révélées à partir du tour suivant) ; techniques : alignements planétaires et
// associations (js/data/techniques.js) ; sorts de Belline (chaque règle de la notice a son effet, js/data/sorts.js) ;
// évolution (Digimon, Pokémon : une apparition évolue en une plus haute de sa planète) ; états (poison, brûlure,
// sommeil, confusion) ; affinités entre planètes (chacune domine la suivante dans l'ordre d'Edmond : +500 ATK) ;
// combos (plusieurs accords dans un même tour) ; fin au 40e tour (la Fatalité : l'échéance inéluctable) ;
// mécaniques dévoilées pas à pas dans la campagne (`d.mec`).
import { CARTE_PAR_ID } from "../data/cartes.js";
import { DUEL, sacrificesRequis } from "../data/duel.js";
import { FIGURES } from "../data/accords.js";
import { ALIGNEMENTS, ASSOCIATIONS } from "../data/techniques.js";
import { accordDeLecture } from "../data/lectures.js";
import { SORTS, grandAccord } from "../data/sorts.js";
import { ASTRES, ASTRE_DE } from "../data/astres.js";
import { VOISINAGE, reglesDeclenchees } from "../data/voisinage.js";
import { melanger } from "./hasard.js";

export const OFFRANDE = 1500;
export const LP = 8000, MAIN_INITIALE = 6, ZONES = 5, MAIN_MAX = 7, PIOCHE_TOUR = 2, ACCORD = 1000, LIMITE = 40, AVANTAGE = 500, AFFINITE = 200, TERRAIN = 300;
const TOUS = Object.keys(DUEL).map(Number);
const REGLE = Object.fromEntries(VOISINAGE.map(r => [r.id, r]));
const adversaire = j => 1 - j;
const PLANETES = ["soleil", "lune", "mercure", "venus", "mars", "jupiter", "saturne"];
/** Les mécaniques avancées ; la campagne les dévoile une à une (toutes en duel libre). */
export const MECANIQUES = ["poseInfluence", "evolution", "techniques", "figures", "accordsTerrain", "superInvocations"];
let compteurUid = 1;

/** Définition de duel d'une carte ou d'une figure d'accord. */
export const def = id => (id >= 200 ? ASTRES[id] : id >= 100 ? FIGURES[id] : DUEL[id]);
/** Nom d'une carte ou d'une figure. */
export const nomDe = id => (id >= 200 ? ASTRES[id].nom : id >= 100 ? FIGURES[id].nom : CARTE_PAR_ID[id].nom);
/** Planète d'une carte (les figures n'en ont pas). */
export const familleDe = id => (id >= 200 ? ASTRES[id].famille : id >= 100 ? null : CARTE_PAR_ID[id].famille);
/** Un astre (super-invocation, n° 200 à 206) ? */
export const estAstre = id => id >= 200;

function joueur(nom, consultant, deck, reserve, profil, rng) {
  const pioche = melanger(deck, rng);
  return {
    nom, consultant, lp: LP, pioche, main: pioche.splice(0, MAIN_INITIALE), reserve: [...reserve], profil,
    monstres: Array(ZONES).fill(null), presages: Array(ZONES).fill(null), cimetiere: [],
    invocationFaite: false, fusionFaite: false, derniere: null, doubler: false, annuleProchaine: false,
    sterile: false, voitMain: false, differes: [], reveles: [], techniques: [], techniqueFaite: false,
    accordsFaits: [], accordTerrainFait: false, terrainCarte: null, combo: 0, evolutionFaite: false, astres: [], superFaite: false
  };
}

/**
 * Nouveau duel. options : { premier (0 | 1 ; sinon pile ou face), decks: [ids, ids], reserves: [[figures], [figures]],
 * terrain (une famille ou null), profils: [null, profil] }.
 */
export function creerDuel(rng, consultant = "homme", options = {}) {
  const decks = options.decks || [TOUS, TOUS];
  const reserves = options.reserves || [[], []];
  const premier = options.premier ?? (rng() < 0.5 ? 0 : 1);
  return {
    joueurs: [
      joueur("Vous", consultant, decks[0], reserves[0], null, rng),
      joueur(options.nomAdverse || "L’Ombre", consultant === "homme" ? "femme" : "homme", decks[1], reserves[1], options.profils?.[1] || null, rng)
    ],
    actif: premier, premier, tour: 1, phase: "principale1", fini: false, gagnant: null, terrain: options.terrain ?? null,
    mec: Object.fromEntries(MECANIQUES.map(k => [k, options.mecaniques ? options.mecaniques.includes(k) : true])), limite: options.limite ?? LIMITE,
    // la douceur (premier duel) : l'Ombre ne pose aucun présage pendant ses `douceur` premiers tours
    douceur: options.douceur ?? 0
  };
}

export function apparitionDe(id, d = null) {
  const x = def(id);
  return {
    uid: compteurUid++, id, niveau: x.niveau, atk: x.atk, def: x.def,
    position: "attaque", faceCachee: false, aAttaque: false, changeFait: false, invoqueTour: d ? d.tour : 0,
    bloque: 0, protege: !!x.protege, attaqueCeTour: false, equipements: []
  };
}

const monstres = J => J.monstres.map((m, place) => ({ m, place })).filter(x => x.m);
const placeLibre = zone => zone.findIndex(x => !x);
const capacite = (m, nom) => !m.faceCachee && !!def(m.id)[nom];

/** ATK et DEF en jeu : valeurs propres, affinité planétaire, terrain. */
export function atkEffectif(d, j, m) {
  if (!m) return 0;
  const f = familleDe(m.id);
  let v = m.atk + (terrainDe(d.joueurs[j])?.atk || 0) * (m.faceCachee ? 0 : 1);
  if (!m.faceCachee && f) {
    v += AFFINITE * monstres(d.joueurs[j]).filter(x => x.m !== m && !x.m.faceCachee && familleDe(x.m.id) === f).length;
    if (d.terrain === f) v += TERRAIN;
  }
  if (m.statut === "brulure" && !m.faceCachee) v -= 500;
  return Math.max(0, v);
}

/** L'affinité entre planètes : chacune domine la suivante dans l'ordre d'Edmond (Saturne domine le Soleil). */
export function domine(idA, idB) {
  const a = PLANETES.indexOf(familleDe(idA)), b = PLANETES.indexOf(familleDe(idB));
  return a >= 0 && b >= 0 && b === (a + 1) % 7;
}
/** L'ATK d'un attaquant contre une cible : avec l'avantage de planète si la cible est visible. */
function atkContre(d, j, A, T) { return atkEffectif(d, j, A) + (T && !T.faceCachee && domine(A.id, T.id) ? AVANTAGE : 0); }
export function defEffectif(d, j, m) {
  if (!m) return 0;
  const t = terrainDe(d.joueurs[j]);
  const lieu = (t?.def || 0) + (m.position === "defense" ? t?.defDefense || 0 : 0);
  return Math.max(0, m.def + lieu + (!m.faceCachee && d.terrain && familleDe(m.id) === d.terrain ? TERRAIN : 0));
}

/** Le terrain qu'un joueur a posé de son côté : ses valeurs ({ atk, def, defDefense, lp, sansAttaque }) ou null. */
export function terrainDe(J) { return J.terrainCarte != null ? def(J.terrainCarte).terrain : null; }

function casserTerrain(d, k, ev, versMainAussi = false) {
  const K = d.joueurs[k], id = K.terrainCarte;
  if (id == null) return;
  K.terrainCarte = null;
  if (versMainAussi) { K.main.push(id); ev.push({ type: "terrainRetour", j: k, id }); }
  else { K.cimetiere.push(id); ev.push({ type: "terrainCasse", j: k, id }); }
}

function finSiBesoin(d, ev) {
  if (d.fini) return;
  const [a, b] = d.joueurs;
  if (a.lp <= 0 || b.lp <= 0) {
    d.fini = true;
    d.gagnant = a.lp <= 0 && b.lp <= 0 ? null : a.lp <= 0 ? 1 : 0;
    ev.push({ type: "fin", gagnant: d.gagnant });
  }
}

function changerLP(d, j, v, ev, pourquoi = "") {
  v = Math.round(v);
  if (!v) return;
  const J = d.joueurs[j];
  J.lp = Math.max(0, J.lp + v);
  ev.push({ type: "lp", j, v, lp: J.lp, pourquoi });
}

function piocher(d, j, n, ev) {
  const J = d.joueurs[j];
  for (let k = 0; k < n; k++) {
    if (!J.pioche.length) { ev.push({ type: "texte", j, texte: `${J.nom} ne peut plus piocher : le jeu est épuisé.` }); J.lp = 0; finSiBesoin(d, ev); return; }
    const id = J.pioche.shift();
    J.main.push(id);
    ev.push({ type: "pioche", j, id });
  }
}

/** Une carte quitte le terrain pour le cimetière (une figure retourne dans la réserve ; ses équipements suivent). */
function auCimetiere(d, j, zone, place, ev, pourquoi = "detruite") {
  const J = d.joueurs[j], x = J[zone][place];
  if (!x) return;
  J[zone][place] = null;
  if (estAstre(x.id)) { /* un astre retourne au ciel */ } else if (x.id >= 100) J.reserve.push(x.id); else J.cimetiere.push(x.id);
  for (const e of x.equipements || []) J.cimetiere.push(e);
  ev.push({ type: pourquoi, j, place, zone, id: x.id });
  if (estAstre(x.id)) ev.push({ type: "texte", j, texte: `${nomDe(x.id)} retourne au ciel.` });
}

function versMain(d, j, zone, place, ev) {
  const J = d.joueurs[j], x = J[zone][place];
  J[zone][place] = null;
  if (estAstre(x.id)) { /* un astre retourne au ciel */ } else if (x.id >= 100) J.reserve.push(x.id); else J.main.push(x.id);
  for (const e of x.equipements || []) J.cimetiere.push(e);
  ev.push({ type: "renvoi", j, place, id: x.id });
}

function choisirCibles(d, k, liste, cible, rng, nouvelle = null) {
  if (!liste.length) return [];
  if (cible === "toutes") return liste;
  if (cible === "nouvelle") return liste.filter(x => x.place === nouvelle);
  if (cible === "autres") return liste.filter(x => x.place !== nouvelle);
  if (cible === "aleatoire") return [liste[Math.floor(rng() * liste.length)]];
  if (cible === "defense") {
    const def = liste.filter(x => x.m.position === "defense" || x.m.faceCachee);
    if (!def.length) return [];
    return [def.sort((u, v) => defEffectif(d, k, v.m) - defEffectif(d, k, u.m))[0]];
  }
  const force = x => (x.m.position === "attaque" ? atkEffectif(d, k, x.m) : defEffectif(d, k, x.m)) + x.m.atk * 0.01;
  const tri = [...liste].sort((u, v) => force(v) - force(u));
  return [cible === "plusFaible" ? tri[tri.length - 1] : tri[0]];
}

/** Révèle une apparition (invocation face recto, ou retournement) : ses effets s'appliquent. */
/** Une carte révélée compte pour les associations. */
function noterRevelee(J, id) { if (id < 100 && !J.reveles.includes(id)) J.reveles.push(id); }

function reveler(d, j, place, ev, rng, mult = 1) {
  const m = d.joueurs[j].monstres[place];
  if (!m) return;
  m.faceCachee = false;
  noterRevelee(d.joueurs[j], m.id);
  for (const e of def(m.id).effets) { appliquer({ d, j, rng, ev, mult, nouvelle: place, prec: null, idCarte: m.id }, e); if (d.fini) return; }
}

/** Applique un effet. ctx : { d, j, rng, ev, mult, nouvelle (emplacement), prec ({ id, choix }), idCarte }. */
function appliquer(ctx, e) {
  const { d, j, rng, ev } = ctx;
  const J = d.joueurs[j], o = adversaire(j), O = d.joueurs[o];
  const n = x => Math.round(x * ctx.mult);
  const camp = c => (c === "soi" ? j : o);
  switch (e.t) {
    case "lp": changerLP(d, j, e.v > 0 ? n(e.v) : e.v, ev); break;
    case "degats": changerLP(d, o, -n(e.v), ev); break;
    case "degatsParAllie": changerLP(d, o, -n(e.v * monstres(J).length), ev, "l’opinion"); break;
    case "reussite": changerLP(d, j, n(300 + 50 * J.cimetiere.length), ev, "récompense"); break;
    case "stat": {
      const k = camp(e.camp);
      for (const x of choisirCibles(d, k, monstres(d.joueurs[k]), e.cible, rng, k === j ? ctx.nouvelle : null)) {
        x.m.atk = Math.max(0, x.m.atk + n(e.atk)); x.m.def = Math.max(0, x.m.def + n(e.def));
        if (e.equipement) x.m.equipements.push(ctx.idCarte);
        ev.push({ type: e.atk + e.def >= 0 ? "renfort" : "affaibli", j: k, place: x.place, equipement: !!e.equipement });
      }
      break;
    }
    case "retablir":
      for (const x of monstres(J)) {
        const base = def(x.m.id);
        if (x.m.atk < base.atk || x.m.def < base.def) { x.m.atk = Math.max(x.m.atk, base.atk); x.m.def = Math.max(x.m.def, base.def); ev.push({ type: "renfort", j, place: x.place }); }
      }
      break;
    case "defense": {
      const k = camp(e.camp);
      for (const x of monstres(d.joueurs[k])) if (x.m.position === "attaque") { x.m.position = "defense"; ev.push({ type: "position", j: k, place: x.place }); }
      break;
    }
    case "bloquer": {
      const k = camp(e.camp);
      for (const x of choisirCibles(d, k, monstres(d.joueurs[k]), e.cible, rng)) { x.m.bloque = Math.max(x.m.bloque, e.tours); ev.push({ type: "bloque", j: k, place: x.place }); }
      break;
    }
    case "detruire": { const k = camp(e.camp); for (const x of choisirCibles(d, k, monstres(d.joueurs[k]), e.cible, rng)) auCimetiere(d, k, "monstres", x.place, ev); break; }
    case "renvoyer": { const k = camp(e.camp); for (const x of choisirCibles(d, k, monstres(d.joueurs[k]), e.cible, rng)) versMain(d, k, "monstres", x.place, ev); break; }
    case "detruireDefense":
      for (const k of e.camp ? [camp(e.camp)] : [j, o]) for (const x of monstres(d.joueurs[k])) if ((x.m.position === "defense" || x.m.faceCachee) && !(k === j && x.place === ctx.nouvelle)) auCimetiere(d, k, "monstres", x.place, ev);
      break;
    case "detruireFaibles":
      for (const x of monstres(O)) if (x.m.position === "attaque" && !x.m.faceCachee && atkEffectif(d, o, x.m) <= e.seuil) auCimetiere(d, o, "monstres", x.place, ev);
      break;
    case "detruirePresages":
      O.presages.forEach((p, place) => { if (p && !p.continue) auCimetiere(d, o, "presages", place, ev); });
      break;
    case "lunaison":
      for (const k of [j, o]) for (const x of monstres(d.joueurs[k])) versMain(d, k, "monstres", x.place, ev);
      for (const k of [j, o]) casserTerrain(d, k, ev, true);
      break;
    case "piocher": piocher(d, j, n(e.n), ev); break;
    case "voir": J.voitMain = true; ev.push({ type: "texte", j, texte: `${J.nom} voit la main adverse.` }); break;
    case "voler": {
      if (!O.main.length) break;
      const id = O.main.splice(Math.floor(rng() * O.main.length), 1)[0];
      J.main.push(id); ev.push({ type: "vol", j, id });
      break;
    }
    case "defausser": case "defausserSoi": {
      const k = e.t === "defausser" ? o : j, K = d.joueurs[k];
      for (let i = 0; i < n(e.n) && K.main.length; i++) { const id = K.main.splice(Math.floor(rng() * K.main.length), 1)[0]; K.cimetiere.push(id); ev.push({ type: "defausse", j: k, id }); }
      break;
    }
    case "sterilite": O.sterile = true; ev.push({ type: "texte", j, texte: `${O.nom} ne piochera pas à son prochain tour.` }); break;
    case "differe": J.differes.push({ tours: e.tours, effets: e.effets, mult: ctx.mult }); ev.push({ type: "texte", j, texte: "Une espérance se réalisera par la suite." }); break;
    case "retourMain": {
      const id = J.cimetiere.pop();
      if (id == null) ev.push({ type: "texte", j, texte: "Le cimetière est vide : rien ne revient." });
      else { J.main.push(id); ev.push({ type: "retour", j, id }); }
      break;
    }
    case "heritage": {
      const place = placeLibre(J.monstres);
      const ids = J.cimetiere.filter(id => def(id).type === "apparition");
      if (!ids.length || place < 0) { ev.push({ type: "texte", j, texte: "Le passé n’a rien à transmettre." }); break; }
      const id = ids.sort((u, v) => def(v).atk - def(u).atk)[0];
      J.cimetiere.splice(J.cimetiere.lastIndexOf(id), 1);
      J.monstres[place] = apparitionDe(id, d);
      ev.push({ type: "invocation", j, place, id, speciale: true });
      break;
    }
    case "doubler": J.doubler = true; ev.push({ type: "texte", j, texte: "La prochaine carte comptera double." }); break;
    case "annuler": O.annuleProchaine = true; ev.push({ type: "texte", j, texte: `La prochaine carte de ${O.nom} sera sans effet.` }); break;
    case "hasard": if (rng() < 0.5) changerLP(d, o, -n(e.v), ev, "le sort"); else changerLP(d, j, -n(e.v), ev, "le sort"); break;
    case "remede":
      if (J.lp < e.seuil) changerLP(d, j, n(e.v), ev, "le remède");
      else { appliquer(ctx, { t: "stat", atk: -500, def: 0, camp: "adverse", cible: "toutes" }); appliquer(ctx, { t: "statut", etat: "poison", camp: "adverse", cible: "plusForte" }); }
      break;
    case "rejouer": {
      const prec = ctx.prec;
      if (!prec || prec.id >= 100 || def(prec.id).type === "presage") { ev.push({ type: "texte", j, texte: "Aucune carte ne précède : l’Étoile n’a rien à recevoir." }); break; }
      const x = def(prec.id);
      const effets = x.choix ? x.choix[prec.choix ?? 0].effets : x.effets;
      const mienne = (ctx.idCarte === 2 ? "homme" : "femme") === J.consultant;
      const m2 = mienne ? ctx.mult : ctx.mult / 2;
      ev.push({ type: "texte", j, texte: `${nomDe(prec.id)} se rejoue${mienne ? "" : " à moitié (une influence)"}.` });
      // un effet rejoué ne déplace pas de carte : un équipement rejoué donne son bonus sans s'attacher une seconde fois
      for (const f of effets) if (f.t !== "rejouer" && f.t !== "remplacer") appliquer({ ...ctx, mult: m2, nouvelle: null, idCarte: prec.id }, { ...f, equipement: false });
      break;
    }
    case "casserTerrain": casserTerrain(d, camp(e.camp), ev); break;
    case "statut": {
      const k = camp(e.camp);
      for (const x of choisirCibles(d, k, monstres(d.joueurs[k]).filter(y => !y.m.faceCachee), e.cible, rng)) {
        x.m.statut = e.etat; ev.push({ type: "statut", j: k, place: x.place, id: x.m.id, etat: e.etat });
      }
      break;
    }
    case "guerir":
      for (const x of monstres(d.joueurs[camp(e.camp)])) if (x.m.statut) { x.m.statut = null; ev.push({ type: "gueri", j: camp(e.camp), place: x.place, id: x.m.id }); }
      break;
    case "terrain": d.terrain = e.famille; ev.push({ type: "terrain", j, famille: e.famille }); break;
    case "revelerAdverses":
      for (const x of monstres(O)) if (x.m.faceCachee) { x.m.faceCachee = false; noterRevelee(O, x.m.id); ev.push({ type: "retournee", j: o, place: x.place, id: x.m.id }); }
      break;
    case "proteger":
      for (const x of monstres(d.joueurs[camp(e.camp)])) if (!x.m.protege) { x.m.protege = true; ev.push({ type: "renfort", j: camp(e.camp), place: x.place }); }
      break;
    case "remplacer": {
      const id = [...J.cimetiere].reverse().find(k => def(k).type === "influence" && k !== 0 && !def(k).sousType);
      if (id == null) { ev.push({ type: "texte", j, texte: "Aucune influence à remplacer." }); break; }
      ev.push({ type: "texte", j, texte: `La Carte Bleue prend la place de ${nomDe(id)}.` });
      const x = def(id);
      for (const f of (x.choix ? x.choix[0].effets : x.effets)) if (f.t !== "remplacer" && f.t !== "rejouer") appliquer({ ...ctx, idCarte: id }, f);
      break;
    }
  }
}

/**
 * Accords entre la carte révélée et la précédente du même joueur. D'abord les règles de la notice (800 points) ;
 * sinon un écho, un accord d'accompagnement ou une lecture moderne (js/data/lectures.js).
 */
function accorder(d, j, prec, courante, ev) {
  if (courante.id >= 100) return;
  const a = prec && prec.id < 100 ? accordEntre(prec, courante) : null;
  if (a) { accomplir(d, j, a, ev, false); return; }
  // la résonance (ajout de jeu) : sans accord avec la carte révélée avant, la nouvelle carte se lit avec une de vos
  // cartes face visible en jeu (celle-ci puis la nouvelle) ; échos, accompagnement et lectures seulement, une fois par carte révélée
  if (!d.mec.accordsTerrain) return;
  const r = resonance(d.joueurs[j], courante.id);
  if (r) accomplir(d, j, r, ev, false);
}

/** La résonance d'une carte qu'on révèle avec les cartes face visible de son joueur : un accord hors notice, ou null. */
function resonance(J, id) {
  const enJeu = [...J.monstres.filter(m => m && !m.faceCachee).map(m => m.id), ...J.presages.filter(p => p?.continue).map(p => p.id)];
  for (const autre of enJeu) {
    if (autre >= 100 || autre === id) continue;
    const l = accordDeLecture(autre, id, nomDe);
    if (l) return { texte: l.texte, favorable: l.sens > 0, sorte: l.sorte, cle: l.cle, valeur: l.valeur, pioche: false, ids: [autre, id], resonance: true };
  }
  return null;
}

/** L'accord que forment deux cartes (`prec` puis `courante`, { id, choix }), ou null. Les règles de la notice d'abord. */
function accordEntre(prec, courante) {
  const r = reglesDeclenchees(prec, courante)[0];
  const ids = [prec.id, courante.id];
  if (r) return { texte: r.texte, favorable: r.effets.reduce((s, f) => s + (f.valeur ?? 0), 0) >= 0, regle: r.id, sorte: "belline", valeur: ACCORD, pioche: true, ids, sort: SORTS[r.id] || [] };
  const g = grandAccord(prec.id, courante.id);
  if (g) return { texte: `${g.nom} : ${g.texte}`, nom: g.nom, favorable: g.sens > 0, sorte: "majeur", valeur: 1500, pioche: g.sens > 0, ids, sort: g.effets };
  const l = accordDeLecture(prec.id, courante.id, nomDe);
  return l ? { texte: l.texte, favorable: l.sens > 0, sorte: l.sorte, cle: l.cle, valeur: l.valeur, pioche: l.sorte !== "lecture", ids } : null;
}

function accomplir(d, j, a, ev, terrain = false, rng = Math.random) {
  const J = d.joueurs[j];
  // les lectures (si fréquentes) ne comptent pas dans les combos et n'en reçoivent pas le bonus
  const lecture = a.sorte === "lecture";
  if (!lecture) J.combo++;
  const bonus = lecture ? 0 : 200 * Math.max(0, J.combo - 1), valeur = a.valeur + bonus;
  ev.push({ type: "accord", j, texte: a.texte, favorable: a.favorable, regle: a.regle, sorte: a.sorte, cle: a.cle, terrain, resonance: !!a.resonance, ids: a.ids, combo: lecture ? 1 : J.combo, valeur });
  if (a.favorable) { changerLP(d, j, valeur, ev, !lecture && J.combo > 1 ? `combo ×${J.combo}` : lecture ? "lecture" : "accord"); if (a.pioche) piocher(d, j, 1, ev); }
  else changerLP(d, adversaire(j), -valeur, ev, !lecture && J.combo > 1 ? `combo ×${J.combo}` : lecture ? "lecture" : "accord");
  // le sort de Belline : l'effet propre de la règle
  for (const e of a.sort || []) { if (d.fini) break; appliquer({ d, j, rng, ev, mult: 1, nouvelle: null, prec: null, idCarte: null }, e); }
  // une règle accomplie fait entrer sa figure dans la réserve
  if (a.regle && d.mec.figures) {
    const f = Object.keys(FIGURES).map(Number).find(k => FIGURES[k].regles.includes(a.regle));
    if (f != null && !J.reserve.includes(f) && !J.monstres.some(m => m?.id === f)) { J.reserve.push(f); ev.push({ type: "figureDebloquee", j, id: f }); }
  }
}

/**
 * Accords sur le terrain (ajout de jeu) : deux de vos cartes face visible en jeu (apparitions, influences continues)
 * qui forment un accord peuvent l'accomplir sans être rejouées. Une fois par paire et par duel, un par tour.
 * Renvoie [{ cle, a, b, texte, favorable, sorte, valeur }].
 */
export function accordsTerrain(d, j) {
  const J = d.joueurs[j];
  if (d.fini || d.actif !== j || !enPrincipale(d) || J.accordTerrainFait || !d.mec.accordsTerrain) return [];
  const ids = [...new Set([...J.monstres.filter(m => m && !m.faceCachee).map(m => m.id), ...J.presages.filter(p => p?.continue).map(p => p.id)])].filter(id => id < 100);
  const res = [];
  for (let x = 0; x < ids.length; x++) for (let y = x + 1; y < ids.length; y++) {
    const [a, b] = [ids[x], ids[y]].sort((u, v) => u - v), cle = `${a}-${b}`;
    if (J.accordsFaits.includes(cle)) continue;
    const t = accordEntre({ id: a, choix: 0 }, { id: b, choix: 0 }) || accordEntre({ id: b, choix: 0 }, { id: a, choix: 0 });
    if (t) res.push({ ...t, cle, a, b });
  }
  return res;
}

export function accomplirAccordTerrain(d, j, cle) {
  const t = accordsTerrain(d, j).find(x => x.cle === cle);
  if (!t) return [{ type: "refus", j, raison: "Cet accord n’est pas possible maintenant." }];
  const J = d.joueurs[j], ev = [];
  J.accordsFaits.push(cle); J.accordTerrainFait = true;
  accomplir(d, j, t, ev, true);
  finSiBesoin(d, ev);
  return ev;
}

// ---------- Phase principale ----------

const enPrincipale = d => d.phase === "principale1" || d.phase === "principale2";

/** Peut-on invoquer (ou poser, si `pose`) l'apparition `index` de la main ? { ok, raison, sacrifices } */
export function peutInvoquer(d, j, index, pose = false) {
  const J = d.joueurs[j], id = J.main[index];
  if (d.fini || d.actif !== j || !enPrincipale(d)) return { ok: false, raison: "Pas maintenant." };
  if (id == null || def(id).type !== "apparition") return { ok: false, raison: "Ce n’est pas une apparition." };
  if (J.invocationFaite) return { ok: false, raison: "Une seule invocation normale par tour." };
  if (pose && def(id).declaree) return { ok: false, raison: "Ennemis déclarés : elle ne peut pas être posée face cachée." };
  const s = sacrificesRequis(id), n = monstres(J).length;
  // l'offrande (ajout de jeu) : un sacrifice qui manque se remplace par des points de vie ; on n'est jamais bloqué
  const offrande = Math.max(0, s - n);
  if (offrande && J.lp <= offrande * OFFRANDE) return { ok: false, raison: `Il faut ${s} apparition${s > 1 ? "s" : ""} à sacrifier, ou ${offrande * OFFRANDE} points de vie d’offrande.`, sacrifices: s };
  if (s === 0 && placeLibre(J.monstres) < 0) return { ok: false, raison: "Vos cinq zones sont occupées." };
  return { ok: true, sacrifices: s - offrande, offrande };
}

/** Invocation normale (face recto, en attaque) ou pose (face cachée, en défense). options : { pose, sacrifices: [places] } */
export function invoquer(d, j, index, options = {}, rng = Math.random) {
  const v = peutInvoquer(d, j, index, !!options.pose);
  if (!v.ok) return [{ type: "refus", j, raison: v.raison }];
  const ev = [], J = d.joueurs[j];
  let sacrifices = (options.sacrifices || []).filter(p => J.monstres[p]).slice(0, v.sacrifices);
  if (sacrifices.length < v.sacrifices) {
    const restants = monstres(J).filter(x => !sacrifices.includes(x.place)).sort((a, b) => (a.m.atk + a.m.def) - (b.m.atk + b.m.def));
    sacrifices = [...sacrifices, ...restants.slice(0, v.sacrifices - sacrifices.length).map(x => x.place)];
  }
  for (const p of sacrifices) { ev.push({ type: "sacrifice", j, place: p, id: J.monstres[p].id }); auCimetiere(d, j, "monstres", p, ev, "sacrifiee"); }
  if (v.offrande) changerLP(d, j, -v.offrande * OFFRANDE, ev, "offrande");
  const id = J.main.splice(index, 1)[0];
  const place = placeLibre(J.monstres);
  const m = apparitionDe(id, d);
  J.monstres[place] = m;
  J.invocationFaite = true;
  if (options.pose) { m.faceCachee = true; m.position = "defense"; ev.push({ type: "pose", j, place, id }); return ev; }
  ev.push({ type: "invocation", j, place, id });
  revelerJouee(d, j, place, ev, rng);
  return ev;
}

/** Révélation d'une apparition jouée face recto : Destinée (annulation, doublement), effets, accords. */
function revelerJouee(d, j, place, ev, rng) {
  const J = d.joueurs[j], m = J.monstres[place], prec = J.derniere;
  if (J.annuleProchaine) { J.annuleProchaine = false; m.faceCachee = false; ev.push({ type: "texte", j, texte: `La porte est fermée : l’effet de ${nomDe(m.id)} est annulé.` }); }
  else {
    let mult = 1;
    if (J.doubler) { J.doubler = false; mult = 2; ev.push({ type: "texte", j, texte: "Mise au premier plan : effet doublé." }); }
    reveler(d, j, place, ev, rng, mult);
    if (!d.fini) accorder(d, j, prec, { id: m.id, choix: null }, ev);
  }
  J.derniere = { id: m.id, choix: null };
  finSiBesoin(d, ev);
}

/** Peut-on activer l'influence `index` ? */
/** Un terrain se pose aussi pendant votre phase de combat, au moment d'attaquer (ajout de jeu). */
const momentTerrain = d => enPrincipale(d) || d.phase === "combat";

export function peutActiver(d, j, index, horsTour = false) {
  const J = d.joueurs[j], id = J.main[index];
  const terrain = id != null && def(id)?.sousType === "terrain";
  if (d.fini || (!horsTour && (d.actif !== j || !(terrain ? momentTerrain(d) : enPrincipale(d))))) return { ok: false, raison: "Pas maintenant." };
  if (id == null || def(id).type !== "influence") return { ok: false, raison: "Ce n’est pas une influence." };
  const x = def(id);
  if (x.sousType === "equipement" && !monstres(J).length) return { ok: false, raison: "Équipement : il faut une apparition à équiper." };
  if (x.sousType === "continue" && placeLibre(J.presages) < 0) return { ok: false, raison: "Il faut une zone de présage libre." };
  return { ok: true };
}

/**
 * Active une influence depuis la main. options : { choix, contre } ; `contre` : emplacement du présage
 * (déclencheur 'influence') que l'adversaire active en réponse : c'est une chaîne.
 */
export function activer(d, j, index, options = {}, rng = Math.random) {
  const v = peutActiver(d, j, index, !!options.horsTour);
  if (!v.ok) return [{ type: "refus", j, raison: v.raison }];
  const ev = [], J = d.joueurs[j], o = adversaire(j);
  const id = J.main.splice(index, 1)[0], x = def(id);
  const choix = x.choix ? Math.max(0, Math.min(x.choix.length - 1, options.choix ?? 0)) : null;
  const prec = J.derniere;
  ev.push({ type: "influence", j, id, choix, maillon: 1, revelee: !!options.revelee });
  noterRevelee(J, id);
  J.derniere = { id, choix };
  if (options.contre != null && presagesActivables(d, o, "influence").includes(options.contre)) {
    const e = activerPresage(d, o, options.contre, ev, 2);
    if (e && e.t === "annulerInfluence") {
      ev.push({ type: "texte", j: o, texte: `Tentatives vaines : ${nomDe(id)} ne produit rien.` });
      J.cimetiere.push(id); finSiBesoin(d, ev); return ev;
    }
  }
  if (J.annuleProchaine) {
    J.annuleProchaine = false;
    ev.push({ type: "texte", j, texte: `La porte est fermée : ${nomDe(id)} reste sans effet.` });
    J.cimetiere.push(id); return ev;
  }
  let mult = 1;
  if (J.doubler && id !== 1) { J.doubler = false; mult = 2; ev.push({ type: "texte", j, texte: "Mise au premier plan : effet doublé." }); }
  if (x.sousType === "terrain") {
    if (J.terrainCarte != null) casserTerrain(d, j, ev);
    J.terrainCarte = id; J.terrainTours = x.terrain.duree;
    ev.push({ type: "terrainPose", j, id });
  } else if (x.sousType === "continue") {
    const place = placeLibre(J.presages);
    J.presages[place] = { uid: compteurUid++, id, continue: true, tours: x.tours, mult, poseTour: d.tour };
    ev.push({ type: "continue", j, place, id });
  } else {
    for (const e of (x.choix ? x.choix[choix].effets : x.effets)) { appliquer({ d, j, rng, ev, mult, nouvelle: null, prec, idCarte: id }, e); if (d.fini) break; }
    if (x.sousType !== "equipement") J.cimetiere.push(id);
  }
  if (!d.fini) accorder(d, j, prec, { id, choix }, ev);
  finSiBesoin(d, ev);
  return ev;
}

/** Pose un présage face cachée. */
export function peutPoser(d, j, index) {
  const J = d.joueurs[j], id = J.main[index];
  if (d.fini || d.actif !== j || !enPrincipale(d)) return { ok: false, raison: "Pas maintenant." };
  if (id == null || def(id).type !== "presage") return { ok: false, raison: "Ce n’est pas un présage." };
  if (placeLibre(J.presages) < 0) return { ok: false, raison: "Vos cinq zones de présage sont occupées." };
  return { ok: true };
}
export function poser(d, j, index) {
  const v = peutPoser(d, j, index);
  if (!v.ok) return [{ type: "refus", j, raison: v.raison }];
  const J = d.joueurs[j], id = J.main.splice(index, 1)[0], place = placeLibre(J.presages);
  J.presages[place] = { uid: compteurUid++, id, poseTour: d.tour };
  return [{ type: "posePresage", j, place, id }];
}

/**
 * Poser une influence face cachée dans une zone de présage (ajout de jeu) : l'adversaire ne sait pas si c'est
 * un présage ou une influence. Elle se révèle pendant une de vos phases principales, à partir du tour suivant.
 */
export function peutPoserInfluence(d, j, index) {
  const J = d.joueurs[j], id = J.main[index];
  if (d.fini || d.actif !== j || !enPrincipale(d)) return { ok: false, raison: "Pas maintenant." };
  if (id == null || def(id).type !== "influence") return { ok: false, raison: "Ce n’est pas une influence." };
  if (!d.mec.poseInfluence) return { ok: false, raison: "Pas encore : un Gardien vous l’enseignera." };
  if (placeLibre(J.presages) < 0) return { ok: false, raison: "Vos cinq zones de présage sont occupées." };
  return { ok: true };
}
export function poserInfluence(d, j, index) {
  const v = peutPoserInfluence(d, j, index);
  if (!v.ok) return [{ type: "refus", j, raison: v.raison }];
  const J = d.joueurs[j], id = J.main.splice(index, 1)[0], place = placeLibre(J.presages);
  J.presages[place] = { uid: compteurUid++, id, influence: true, poseTour: d.tour };
  return [{ type: "posePresage", j, place, id, influence: true }];
}
export function peutRevelerInfluence(d, j, place) {
  const J = d.joueurs[j], p = J.presages[place];
  const terrain = p && def(p.id)?.sousType === "terrain";
  if (d.fini || d.actif !== j || !(terrain ? momentTerrain(d) : enPrincipale(d))) return { ok: false, raison: "Pas maintenant." };
  if (!p || !p.influence) return { ok: false, raison: "Ce n’est pas une influence posée." };
  if (p.poseTour >= d.tour) return { ok: false, raison: "Posée ce tour : elle se révélera à partir de votre prochain tour." };
  const x = def(p.id);
  if (x.sousType === "equipement" && !monstres(J).length) return { ok: false, raison: "Équipement : il faut une apparition à équiper." };
  return { ok: true };
}
/** Révèle une influence posée : elle s'active comme depuis la main (options : { choix, contre }). */
export function revelerInfluence(d, j, place, options = {}, rng = Math.random) {
  const v = peutRevelerInfluence(d, j, place);
  if (!v.ok) return [{ type: "refus", j, raison: v.raison }];
  const J = d.joueurs[j], p = J.presages[place];
  J.presages[place] = null;
  J.main.push(p.id);
  const ev = activer(d, j, J.main.length - 1, { ...options, revelee: true }, rng);
  if (ev.length === 1 && ev[0].type === "refus") { J.main.pop(); J.presages[place] = p; }
  return ev;
}

/**
 * Magies en réponse (ajout de jeu, comme les magies jeu-rapide) : pendant le tour adverse, une influence posée
 * face cachée depuis au moins un tour peut être révélée en réponse (à une attaque, avant le choc). Les terrains
 * ne se révèlent qu'à son tour.
 */
export function influencesEnReponse(d, k) {
  const K = d.joueurs[k];
  if (d.fini || d.actif === k) return [];
  return K.presages.map((p, place) => ({ p, place }))
    .filter(x => x.p?.influence && x.p.poseTour < d.tour)
    .filter(x => def(x.p.id).sousType !== "equipement" || monstres(K).length)
    .map(x => x.place);
}
export function revelerEnReponse(d, k, place, options = {}, rng = Math.random) {
  if (!influencesEnReponse(d, k).includes(place)) return [{ type: "refus", j: k, raison: "Cette carte ne peut pas répondre maintenant." }];
  const K = d.joueurs[k], p = K.presages[place];
  K.presages[place] = null;
  K.main.push(p.id);
  const ev = activer(d, k, K.main.length - 1, { choix: options.choix, revelee: true, horsTour: true }, rng);
  if (ev.length === 1 && ev[0].type === "refus") { K.main.pop(); K.presages[place] = p; }
  else ev.unshift({ type: "texte", j: k, texte: `${K.nom} répond par une influence posée.` });
  return ev;
}

/**
 * Terrains en réponse (ajout de jeu) : pendant l'attaque adverse, un terrain de votre main peut être posé avant le
 * choc (les Pénates abritent vos défenseurs, le Cloître…) ; un terrain posé face cachée se révèle aussi
 * (`influencesEnReponse`). Renvoie les index de la main.
 */
export function terrainsEnReponse(d, k) {
  if (d.fini || d.actif === k) return [];
  return d.joueurs[k].main.map((id, index) => ({ id, index })).filter(x => def(x.id).sousType === "terrain").map(x => x.index);
}
export function poserTerrainEnReponse(d, k, index, rng = Math.random) {
  if (!terrainsEnReponse(d, k).includes(index)) return [{ type: "refus", j: k, raison: "Ce terrain ne peut pas être posé maintenant." }];
  const ev = activer(d, k, index, { horsTour: true }, rng);
  if (!(ev.length === 1 && ev[0].type === "refus")) ev.unshift({ type: "texte", j: k, texte: `${d.joueurs[k].nom} pose un terrain en réponse.` });
  return ev;
}

/** Après une reprise (duel enregistré) : les nouveaux identifiants ne doivent pas croiser les anciens. */
export function preparerReprise(d) {
  let max = 0;
  for (const J of d.joueurs) for (const x of [...J.monstres, ...J.presages]) if (x?.uid > max) max = x.uid;
  compteurUid = Math.max(compteurUid, max + 1);
  return d;
}

/**
 * L'Ombre répond-elle à une attaque par une influence posée ? Renvoie { place, choix } ou null.
 * Elle compare la suite de l'attaque avec et sans sa réponse.
 */
export function influenceOmbre(d, k, contexte, profil = d.joueurs[k].profil) {
  const dispo = influencesEnReponse(d, k), terrains = terrainsEnReponse(d, k);
  if ((!dispo.length && !terrains.length) || (profil?.hasard ?? 0) > 0.5) return null;
  const j = adversaire(k);
  const apres = s => { if (ciblesAttaque(s, j, contexte.place).includes(contexte.cible)) attaquer(s, j, contexte.place, contexte.cible, neutre, null); return evaluer(s, k); };
  const base = apres(copie(d));
  let meilleur = null, gain = 2;
  for (const place of dispo) {
    const x = def(d.joueurs[k].presages[place].id);
    for (const choix of (x.choix ? x.choix.map((_, i) => i) : [null])) {
      const s = copie(d);
      revelerEnReponse(s, k, place, { choix }, neutre);
      const v = apres(s) - base;
      if (v > gain) { gain = v; meilleur = { place, choix }; }
    }
  }
  for (const index of terrains) {
    const s = copie(d);
    poserTerrainEnReponse(s, k, index, neutre);
    const v = apres(s) - base;
    if (v > gain) { gain = v; meilleur = { main: index }; }
  }
  return meilleur;
}

// ---------- Techniques : alignements et associations ----------

const planetesRevelees = J => new Set(J.reveles.map(familleDe).filter(f => PLANETES.includes(f))).size;

/** Avancement d'une association : [cartes révélées, cartes requises]. */
export function avancementAssociation(J, a) {
  if (a.planetes) return [planetesRevelees(J), a.planetes];
  return [a.cartes.filter(id => J.reveles.includes(id)).length, a.parmi ?? a.cartes.length];
}
export function associationComplete(J, a) { const [n, requis] = avancementAssociation(J, a); return n >= requis; }

/** Techniques utilisables maintenant : [{ cle, sorte: 'alignement' | 'association', nom, texte, famille?, places? }]. */
export function techniquesPossibles(d, j) {
  const J = d.joueurs[j];
  if (d.fini || d.actif !== j || !enPrincipale(d) || J.techniqueFaite || !d.mec.techniques) return [];
  const res = [];
  for (const f of PLANETES) {
    const places = monstres(J).filter(x => !x.m.faceCachee && familleDe(x.m.id) === f).map(x => x.place);
    if (places.length >= 3) res.push({ cle: `alignement:${f}`, sorte: "alignement", famille: f, places, ...ALIGNEMENTS[f] });
  }
  for (const a of ASSOCIATIONS) if (!J.techniques.includes(a.id) && associationComplete(J, a)) res.push({ cle: `association:${a.id}`, sorte: "association", ...a });
  return res;
}

/** Utilise une technique (`cle` : 'alignement:soleil', 'association:freins'...). */
export function utiliserTechnique(d, j, cle, rng = Math.random) {
  const t = techniquesPossibles(d, j).find(x => x.cle === cle);
  if (!t) return [{ type: "refus", j, raison: "Cette technique n’est pas possible maintenant." }];
  const J = d.joueurs[j], ev = [];
  J.techniqueFaite = true;
  if (t.sorte === "association") J.techniques.push(t.id);
  ev.push({ type: "technique", j, cle, sorte: t.sorte, nom: t.nom, texte: t.texte, famille: t.famille ?? null, places: t.places ?? [], cartes: t.cartes ?? [] });
  const effets = t.sorte === "alignement" ? [{ t: "terrain", famille: t.famille }, ...t.effets] : t.effets;
  for (const e of effets) { appliquer({ d, j, rng, ev, mult: 1, nouvelle: null, prec: null, idCarte: null }, e); if (d.fini) break; }
  finSiBesoin(d, ev);
  return ev;
}

// ---------- Invocation céleste : les astres (ajout de jeu, js/data/astres.js) ----------

/**
 * Les invocations célestes possibles : trois cartes d'une même planète, dont deux apparitions face recto en jeu ;
 * la troisième est une autre apparition en jeu, ou une carte de cette planète dans la main.
 */
export function superInvocationsPossibles(d, j) {
  const J = d.joueurs[j];
  if (d.fini || d.actif !== j || !enPrincipale(d) || !d.mec.superInvocations || J.superFaite) return [];
  const res = [];
  for (const f of PLANETES) {
    if (J.astres.includes(f)) continue;
    const siennes = monstres(J).filter(x => !x.m.faceCachee && x.m.id < 100 && familleDe(x.m.id) === f)
      .sort((a, b) => atkEffectif(d, j, a.m) - atkEffectif(d, j, b.m));
    if (siennes.length < 2) continue;
    if (siennes.length >= 3) { res.push({ famille: f, id: ASTRE_DE[f], places: siennes.slice(0, 3).map(x => x.place), main: null }); continue; }
    const index = J.main.findIndex(id => id < 100 && familleDe(id) === f);
    if (index >= 0) res.push({ famille: f, id: ASTRE_DE[f], places: siennes.map(x => x.place), main: index });
  }
  return res;
}
export function superInvoquer(d, j, famille, rng = Math.random) {
  const o = superInvocationsPossibles(d, j).find(x => x.famille === famille);
  if (!o) return [{ type: "refus", j, raison: "L’invocation céleste n’est pas possible maintenant." }];
  const J = d.joueurs[j], ev = [];
  ev.push({ type: "celeste", j, id: o.id, famille, materiaux: [...o.places.map(p => J.monstres[p].id), ...(o.main != null ? [J.main[o.main]] : [])] });
  for (const p of o.places) { ev.push({ type: "sacrifice", j, place: p, id: J.monstres[p].id }); auCimetiere(d, j, "monstres", p, ev, "sacrifiee"); }
  if (o.main != null) { const id = J.main.splice(o.main, 1)[0]; J.cimetiere.push(id); ev.push({ type: "defausse", j, id, materiau: true }); }
  const place = placeLibre(J.monstres);
  J.monstres[place] = apparitionDe(o.id, d);
  J.astres.push(famille); J.superFaite = true;
  ev.push({ type: "invocation", j, place, id: o.id, speciale: true, astre: true });
  reveler(d, j, place, ev, rng);
  J.derniere = { id: o.id, choix: null };
  finSiBesoin(d, ev);
  return ev;
}

// ---------- Évolution (ajout de jeu, à la manière de Digimon et Pokémon) ----------

/**
 * Une apparition face recto, en jeu depuis un tour au moins, peut évoluer en une apparition de votre main de la même
 * planète et de niveau plus haut (au plus trois de plus), sans sacrifice. Elle garde ses équipements, gagne 300 ATK
 * d'élan, perd ses états ; l'ancienne forme va au cimetière. Une évolution par tour.
 */
export function evolutionsPossibles(d, j) {
  const J = d.joueurs[j];
  if (d.fini || d.actif !== j || !enPrincipale(d) || !d.mec.evolution || J.evolutionFaite) return [];
  const res = [];
  J.main.forEach((id, index) => {
    const x = def(id);
    if (x.type !== "apparition") return;
    J.monstres.forEach((m, place) => {
      if (!m || m.faceCachee || m.id >= 100 || m.invoqueTour >= d.tour) return;
      if (familleDe(m.id) !== familleDe(id) || x.niveau <= m.niveau || x.niveau > m.niveau + 3) return;
      res.push({ index, place, id, de: m.id });
    });
  });
  return res;
}
export function evoluer(d, j, index, place, rng = Math.random) {
  if (!evolutionsPossibles(d, j).some(e => e.index === index && e.place === place)) return [{ type: "refus", j, raison: "Cette évolution n’est pas possible." }];
  const J = d.joueurs[j], ancien = J.monstres[place], id = J.main.splice(index, 1)[0], ev = [];
  const m = apparitionDe(id, d);
  m.equipements = ancien.equipements; m.atk += 300; m.invoqueTour = ancien.invoqueTour; m.aAttaque = ancien.aAttaque; m.attaqueCeTour = ancien.attaqueCeTour;
  J.cimetiere.push(ancien.id);
  J.monstres[place] = m; J.evolutionFaite = true;
  ev.push({ type: "evolution", j, place, id, de: ancien.id });
  revelerJouee(d, j, place, ev, rng);
  return ev;
}

/** Changer de position (ou retourner une apparition face cachée : elle passe en attaque et se révèle). */
export function peutChanger(d, j, place) {
  const m = d.joueurs[j].monstres[place];
  if (d.fini || d.actif !== j || !enPrincipale(d) || !m) return { ok: false, raison: "Pas maintenant." };
  if (m.invoqueTour === d.tour) return { ok: false, raison: "Elle vient d’arriver : elle ne change pas de position ce tour." };
  if (m.changeFait || m.attaqueCeTour) return { ok: false, raison: "Une seule fois par tour, et pas après avoir attaqué." };
  return { ok: true };
}
export function changerPosition(d, j, place, rng = Math.random) {
  const v = peutChanger(d, j, place);
  if (!v.ok) return [{ type: "refus", j, raison: v.raison }];
  const m = d.joueurs[j].monstres[place], ev = [];
  m.changeFait = true;
  if (m.faceCachee) { m.position = "attaque"; ev.push({ type: "retournee", j, place, id: m.id }); revelerJouee(d, j, place, ev, rng); }
  else { m.position = m.position === "attaque" ? "defense" : "attaque"; ev.push({ type: "position", j, place }); }
  return ev;
}

// ---------- Figures d'accord ----------

function trouverMateriau(J, voulu, pris) {
  const ids = Array.isArray(voulu) ? voulu : [voulu];
  for (const id of ids) {
    const i = J.main.findIndex((x, k) => x === id && !pris.some(p => p.ou === "main" && p.index === k));
    if (i >= 0) return { ou: "main", index: i, id };
    const p = J.monstres.findIndex((m, k) => m && m.id === id && !pris.some(q => q.ou === "monstres" && q.place === k));
    if (p >= 0) return { ou: "monstres", place: p, id };
  }
  return null;
}

/** Figures d'accord invocables maintenant : [{ figure, materiaux: [{ ou, index | place, id }] }]. */
export function fusionsPossibles(d, j) {
  const J = d.joueurs[j];
  if (d.fini || d.actif !== j || !enPrincipale(d) || J.fusionFaite || !d.mec.figures) return [];
  const res = [];
  for (const f of J.reserve) {
    const pris = [];
    for (const voulu of FIGURES[f].materiaux) { const m = trouverMateriau(J, voulu, pris); if (!m) break; pris.push(m); }
    if (pris.length < 2) continue;
    const libere = pris.filter(p => p.ou === "monstres").length;
    if (placeLibre(J.monstres) < 0 && !libere) continue;
    res.push({ figure: f, materiaux: pris });
  }
  return res;
}

/** Invoque une figure d'accord : ses deux cartes vont au cimetière, elle apparaît en attaque. */
export function fusionner(d, j, figure, rng = Math.random) {
  const option = fusionsPossibles(d, j).find(f => f.figure === figure);
  if (!option) return [{ type: "refus", j, raison: "Cet accord n’est pas possible maintenant." }];
  const ev = [], J = d.joueurs[j], F = FIGURES[figure];
  ev.push({ type: "fusion", j, id: figure, materiaux: option.materiaux.map(m => m.id), texte: REGLE[F.regles[0]].texte, regle: F.regles[0] });
  for (const m of option.materiaux.filter(m => m.ou === "monstres")) auCimetiere(d, j, "monstres", m.place, ev, "materiau");
  for (const m of option.materiaux.filter(m => m.ou === "main").sort((a, b) => b.index - a.index)) { J.main.splice(m.index, 1); J.cimetiere.push(m.id); ev.push({ type: "defausse", j, id: m.id, materiau: true }); }
  J.reserve = J.reserve.filter(x => x !== figure);
  J.fusionFaite = true;
  const place = placeLibre(J.monstres);
  J.monstres[place] = apparitionDe(figure, d);
  ev.push({ type: "invocation", j, place, id: figure, speciale: true, figure: true });
  reveler(d, j, place, ev, rng);
  J.derniere = { id: figure, choix: null };
  finSiBesoin(d, ev);
  return ev;
}

// ---------- Combat ----------

export function passerAuCombat(d) {
  if (d.fini || d.phase !== "principale1") return [];
  d.phase = "combat";
  return [{ type: "phase", phase: "combat" }];
}
export function passerPrincipale2(d) {
  if (d.fini || d.phase !== "combat") return [];
  d.phase = "principale2";
  return [{ type: "phase", phase: "principale2" }];
}

/** Cibles d'une attaque : emplacements adverses (les gardiens d'abord), ou 'direct' si l'adversaire n'a plus d'apparition. */
export function ciblesAttaque(d, j, place) {
  const m = d.joueurs[j].monstres[place];
  if (d.fini || d.actif !== j || d.phase !== "combat" || !m || d.tour === 1) return [];
  if (m.position !== "attaque" || m.faceCachee || m.aAttaque || m.bloque > 0 || m.statut === "sommeil" || terrainDe(d.joueurs[j])?.sansAttaque) return [];
  const ennemies = monstres(d.joueurs[adversaire(j)]);
  if (!ennemies.length) return ["direct"];
  const gardes = ennemies.filter(x => capacite(x.m, "garde"));
  return (gardes.length ? gardes : ennemies).map(x => x.place);
}

/** Ce que donnerait une attaque (pour l'afficher avant le choc) : { atk, contre, valeur, position }. */
export function calculCombat(d, j, place, cible) {
  const A = d.joueurs[j].monstres[place], o = adversaire(j);
  if (!A) return null;
  if (cible === "direct") return { atk: atkEffectif(d, j, A), contre: null, valeur: 0, position: "direct" };
  const T = d.joueurs[o].monstres[cible];
  if (!T) return null;
  if (T.faceCachee) return { atk: atkEffectif(d, j, A), contre: "?", valeur: null, position: "cachee" };
  const avantage = domine(A.id, T.id);
  return T.position === "attaque"
    ? { atk: atkContre(d, j, A, T), contre: "ATK", valeur: atkContre(d, o, T, A), position: "attaque", avantage, desavantage: domine(T.id, A.id) }
    : { atk: atkContre(d, j, A, T), contre: "DEF", valeur: defEffectif(d, o, T), position: "defense", avantage };
}

/** Présages que le joueur k peut activer en réponse (`declencheur` : 'attaque' | 'invocation' | 'influence'). */
export function presagesActivables(d, k, declencheur) {
  const K = d.joueurs[k];
  if (d.actif === k) return [];
  return K.presages.map((p, place) => ({ p, place }))
    .filter(x => x.p && !x.p.continue && x.p.poseTour < d.tour && def(x.p.id).declencheur === declencheur)
    .filter(x => def(x.p.id).effets[0].t !== "renfortSurprise" || K.main.some(id => def(id).type === "apparition" && (def(id).niveau || 0) <= 4))
    .map(x => x.place);
}

function activerPresage(d, k, place, ev, maillon = null) {
  const K = d.joueurs[k], p = K.presages[place];
  K.presages[place] = null; K.cimetiere.push(p.id);
  const prec = K.derniere;
  ev.push({ type: "presage", j: k, place, id: p.id, maillon });
  noterRevelee(K, p.id);
  K.derniere = { id: p.id, choix: null };
  if (K.annuleProchaine) { K.annuleProchaine = false; ev.push({ type: "texte", j: k, texte: `La porte est fermée : ${nomDe(p.id)} reste sans effet.` }); return null; }
  accorder(d, k, prec, { id: p.id, choix: null }, ev);
  return def(p.id).effets[0];
}

/** Attaque. `presage` : emplacement du présage que le défenseur active en réponse (ou null). */
export function attaquer(d, j, place, cible, rng = Math.random, presage = null) {
  if (!ciblesAttaque(d, j, place).includes(cible)) return [{ type: "refus", j, raison: "Cette attaque n’est pas possible." }];
  const ev = [], o = adversaire(j), J = d.joueurs[j], O = d.joueurs[o];
  const A = J.monstres[place];
  A.aAttaque = true; A.attaqueCeTour = true;
  ev.push({ type: "attaque", j, place, cible, id: A.id, idCible: cible === "direct" ? null : O.monstres[cible].id, calcul: calculCombat(d, j, place, cible) });
  if (A.statut === "confusion" && rng() < 0.5) {
    ev.push({ type: "texte", j, texte: `${nomDe(A.id)} est confuse : l’attaque échoue et la blesse.` });
    changerLP(d, j, -300, ev, "confusion"); finSiBesoin(d, ev); return ev;
  }

  if (presage != null && presagesActivables(d, o, "attaque").includes(presage)) {
    const e = activerPresage(d, o, presage, ev);
    if (e) switch (e.t) {
      case "renvoyerAttaquant": versMain(d, j, "monstres", place, ev); finSiBesoin(d, ev); return ev;
      case "detruireAttaquant": auCimetiere(d, j, "monstres", place, ev); finSiBesoin(d, ev); return ev;
      case "litige":
        if (rng() < 0.5) { ev.push({ type: "texte", j: o, texte: "Le procès est gagné : l’attaquant est détruit." }); auCimetiere(d, j, "monstres", place, ev); return ev; }
        ev.push({ type: "texte", j: o, texte: "Le procès est perdu : l’attaque se poursuit." });
        break;
      case "annulerCombat":
        ev.push({ type: "texte", j: o, texte: "La paix : l’attaque est annulée, le combat prend fin." });
        piocher(d, o, 1, ev);
        d.phase = "principale2"; ev.push({ type: "phase", phase: "principale2" });
        return ev;
      case "retarderAttaquant":
        A.bloque = Math.max(A.bloque, e.tours + 1);
        ev.push({ type: "bloque", j, place }); ev.push({ type: "texte", j: o, texte: "Retard : l’attaque est annulée." });
        return ev;
      case "renfortSurprise": {
        const choisi = O.main.map((id, i) => ({ id, i })).filter(x => def(x.id).type === "apparition" && (def(x.id).niveau || 0) <= 4)
          .sort((a, b) => def(b.id).def - def(a.id).def)[0];
        const zone = placeLibre(O.monstres);
        if (choisi && zone >= 0) {
          O.main.splice(choisi.i, 1);
          const m = apparitionDe(choisi.id, d); m.position = "defense"; O.monstres[zone] = m;
          ev.push({ type: "invocation", j: o, place: zone, id: choisi.id, speciale: true });
          reveler(d, o, zone, ev, rng);
          if (!O.monstres[zone] || !J.monstres[place]) { finSiBesoin(d, ev); return ev; }
          cible = zone;
          ev.push({ type: "texte", j: o, texte: `L’attaque est redirigée vers ${nomDe(choisi.id)}.` });
        }
        break;
      }
    }
  }
  if (!J.monstres[place]) return ev;

  const atk = atkEffectif(d, j, A);
  if (cible === "direct") { changerLP(d, o, -degatsSubis(O, atk), ev, "attaque directe"); voleur(d, j, A, ev, rng); finSiBesoin(d, ev); return ev; }
  const T = O.monstres[cible];
  if (!T) return ev;
  if (T.faceCachee) {
    T.faceCachee = false; ev.push({ type: "retournee", j: o, place: cible, id: T.id });
    reveler(d, o, cible, ev, rng);
    if (d.fini || !O.monstres[cible] || !J.monstres[place]) { finSiBesoin(d, ev); return ev; }
  }
  const atkA = atkContre(d, j, A, T);
  if (T.position === "attaque") {
    const atkT = atkContre(d, o, T, A), diff = atkA - atkT;
    if (diff > 0) { detruireAuCombat(d, o, cible, ev); changerLP(d, o, -degatsSubis(O, diff), ev, "combat"); voleur(d, j, A, ev, rng); }
    else if (diff < 0) { detruireAuCombat(d, j, place, ev); changerLP(d, j, -degatsSubis(J, -diff), ev, "combat"); }
    else if (atkA > 0) { detruireAuCombat(d, o, cible, ev); detruireAuCombat(d, j, place, ev); }
  } else {
    const diff = atkA - defEffectif(d, o, T);
    if (diff > 0) {
      detruireAuCombat(d, o, cible, ev);
      if (capacite(A, "percant")) { changerLP(d, o, -degatsSubis(O, diff), ev, "perçant"); voleur(d, j, A, ev, rng); }
    } else if (diff < 0) changerLP(d, j, -degatsSubis(J, -diff), ev, "la défense tient");
    else ev.push({ type: "texte", j, texte: "Les forces s’équilibrent : rien ne se passe." });
  }
  finSiBesoin(d, ev);
  return ev;
}

function degatsSubis(K, v) { return K.monstres.some(m => m && capacite(m, "moderation")) ? Math.round(v / 2) : v; }

function detruireAuCombat(d, k, place, ev) {
  const m = d.joueurs[k].monstres[place];
  if (!m) return;
  if (m.protege && !m.faceCachee) { m.protege = false; ev.push({ type: "protegee", j: k, place, id: m.id }); return; }
  auCimetiere(d, k, "monstres", place, ev);
}

function voleur(d, j, A, ev, rng) {
  if (capacite(A, "voleur")) appliquer({ d, j, rng, ev, mult: 1, nouvelle: null, prec: null }, { t: "voler" });
}

/** Un présage répond à une invocation adverse (versatile, passivité). */
export function reagirInvocation(d, k, presage, place) {
  const ev = [];
  if (presage == null || !presagesActivables(d, k, "invocation").includes(presage)) return ev;
  const e = activerPresage(d, k, presage, ev);
  const j = adversaire(k), m = d.joueurs[j].monstres[place];
  if (!e || !m) return ev;
  if (e.t === "inverserInvoquee") { [m.atk, m.def] = [m.def, m.atk]; m.statut = "confusion"; ev.push({ type: "affaibli", j, place }); ev.push({ type: "statut", j, place, id: m.id, etat: "confusion" }); }
  if (e.t === "passiviteInvoquee") { m.position = "defense"; m.bloque = Math.max(m.bloque, 2); m.statut = "sommeil"; ev.push({ type: "position", j, place }); ev.push({ type: "bloque", j, place }); ev.push({ type: "statut", j, place, id: m.id, etat: "sommeil" }); }
  return ev;
}

// ---------- Fin de tour et tour suivant ----------

export function finTour(d, rng = Math.random) {
  const ev = [];
  if (d.fini) return ev;
  const j = d.actif, J = d.joueurs[j];
  for (const x of monstres(J)) if (x.m.attaqueCeTour && capacite(x.m, "feuDePaille")) { ev.push({ type: "texte", j, texte: "Le feu de paille s’éteint." }); auCimetiere(d, j, "monstres", x.place, ev); }
  while (J.main.length > MAIN_MAX) {
    const id = J.main.splice(Math.floor(rng() * J.main.length), 1)[0];
    J.cimetiere.push(id); ev.push({ type: "defausse", j, id, limite: true });
  }
  for (const x of monstres(J)) if (x.m.bloque > 0) x.m.bloque--;
  J.voitMain = false; J.combo = 0;
  d.actif = adversaire(j); d.tour++; d.phase = "principale1";
  if (d.tour > d.limite) {
    // la Fatalité : l'échéance inéluctable ; celui qui a le plus de points de vie l'emporte
    d.fini = true;
    d.gagnant = d.joueurs[0].lp === d.joueurs[1].lp ? null : d.joueurs[0].lp > d.joueurs[1].lp ? 0 : 1;
    ev.push({ type: "fatalite", gagnant: d.gagnant }); ev.push({ type: "fin", gagnant: d.gagnant });
    return ev;
  }
  const K = d.joueurs[d.actif];
  K.invocationFaite = false; K.fusionFaite = false; K.techniqueFaite = false; K.accordTerrainFait = false; K.evolutionFaite = false; K.combo = 0; K.superFaite = false;
  ev.push({ type: "tour", j: d.actif });
  for (const x of monstres(K)) {
    x.m.aAttaque = false; x.m.changeFait = false; x.m.attaqueCeTour = false;
    if (!x.m.faceCachee && def(x.m.id).croissance) { x.m.atk += def(x.m.id).croissance; ev.push({ type: "renfort", j: d.actif, place: x.place }); }
    if (!x.m.faceCachee && def(x.m.id).regain) changerLP(d, d.actif, def(x.m.id).regain, ev, "l’affection");
    // les états
    const s = x.m.statut;
    if (s && K.terrainCarte === 9) { x.m.statut = null; ev.push({ type: "gueri", j: d.actif, place: x.place, id: x.m.id }); }
    else if (s === "poison") { x.m.atk = Math.max(0, x.m.atk - 300); ev.push({ type: "affaibli", j: d.actif, place: x.place }); ev.push({ type: "texte", j: d.actif, texte: `${nomDe(x.m.id)} est malade : −300 ATK.` }); }
    else if (s === "brulure") changerLP(d, d.actif, -200, ev, `${nomDe(x.m.id)} brûle`);
    else if (s === "sommeil" && rng() < 0.5) { x.m.statut = null; ev.push({ type: "gueri", j: d.actif, place: x.place, id: x.m.id, texte: "s’éveille" }); }
    else if (s === "confusion" && rng() < 1 / 3) { x.m.statut = null; ev.push({ type: "gueri", j: d.actif, place: x.place, id: x.m.id, texte: "reprend ses esprits" }); }
    if (d.fini) return ev;
  }
  // influences continues
  K.presages.forEach((p, place) => {
    if (!p || !p.continue || d.fini) return;
    ev.push({ type: "texte", j: d.actif, texte: `${nomDe(p.id)} agit encore (${p.tours} tour${p.tours > 1 ? "s" : ""}).` });
    for (const e of def(p.id).effets) appliquer({ d, j: d.actif, rng, ev, mult: p.mult || 1, nouvelle: null, prec: null, idCarte: p.id }, e);
    if (--p.tours <= 0) auCimetiere(d, d.actif, "presages", place, ev, "epuisee");
  });
  for (const df of K.differes) df.tours--;
  const echus = K.differes.filter(df => df.tours <= 0);
  K.differes = K.differes.filter(df => df.tours > 0);
  for (const df of echus) { ev.push({ type: "texte", j: d.actif, texte: "Une espérance se réalise." }); for (const e of df.effets) appliquer({ d, j: d.actif, rng, ev, mult: df.mult, nouvelle: null, prec: null }, e); }
  if (K.sterile) { K.sterile = false; ev.push({ type: "texte", j: d.actif, texte: `Stérilité : ${K.nom} ne pioche pas.` }); }
  else piocher(d, d.actif, Math.max(0, Math.min(PIOCHE_TOUR, MAIN_MAX - K.main.length)), ev);
  const lieu = terrainDe(K);
  if (lieu?.lp && !d.fini) changerLP(d, d.actif, lieu.lp, ev, nomDe(K.terrainCarte));
  if (lieu && --K.terrainTours <= 0) { ev.push({ type: "texte", j: d.actif, texte: `${nomDe(K.terrainCarte)} s’use et tombe.` }); casserTerrain(d, d.actif, ev); }
  finSiBesoin(d, ev);
  return ev;
}

// ---------- L'Ombre ----------

/** Valeur des points de vie : au-delà de 8000, chaque point compte moins (les soins ne sont pas tout). */
const valeurLP = lp => (lp <= LP ? lp / 100 : LP / 100 + (lp - LP) / 300);

/** Évaluation d'une position pour le joueur j. `soin` pondère le goût des points de vie. */
export function evaluer(d, j, profil = null) {
  const J = d.joueurs[j], o = adversaire(j), O = d.joueurs[o];
  if (O.lp <= 0) return 100000;
  if (J.lp <= 0) return -100000;
  const soin = profil?.soin ?? 1;
  const terrain = (K, k) => monstres(K).reduce((s, x) => s + (x.m.position === "attaque" ? atkEffectif(d, k, x.m) / 100 : defEffectif(d, k, x.m) / 160)
    + (x.m.faceCachee ? 3 : 0) + (x.m.bloque ? -2 : 0) + (capacite(x.m, "garde") ? 1.5 : 0) + (x.m.statut ? -3 : 0), 0)
    + K.presages.filter(p => p && !p.continue).length * 4 + K.presages.filter(p => p && p.continue).reduce((s, p) => s + 3 * p.tours, 0);
  const attente = K => K.differes.reduce((s, df) => s + df.effets.reduce((t, e) => t + (e.t === "lp" ? e.v / 120 : 2), 0), 0)
    + (K.doubler ? 3 : 0) + (K.voitMain ? 1 : 0);
  return soin * (valeurLP(J.lp) - valeurLP(O.lp)) + terrain(J, j) - terrain(O, o) + 2.5 * (J.main.length - O.main.length)
    + attente(J) - attente(O) + (O.annuleProchaine ? 4 : 0) - (J.annuleProchaine ? 4 : 0) + (O.sterile ? 3 : 0) - (J.sterile ? 3 : 0)
    + J.reserve.length * 0.5 + (J.terrainCarte != null ? 3 : 0) - (O.terrainCarte != null ? 3 : 0);
}

const neutre = () => 0.5;
const copie = d => structuredClone(d);

/**
 * L'adversaire k répond-il par un présage ? Renvoie l'emplacement choisi, ou null. contexte : { place, cible, index, choix }.
 * Un profil très hasardeux (le Novice) ne répond jamais : c'est l'essentiel de l'écart entre les difficultés.
 */
export function presageOmbre(d, k, declencheur, contexte = {}, profil = d.joueurs[k].profil) {
  const dispo = presagesActivables(d, k, declencheur);
  if (!dispo.length || (profil?.hasard ?? 0) > 0.5) return null;
  const j = adversaire(k);
  if (declencheur === "influence") {
    // une influence vaut-elle d'être contrée ? on compare la position avec et sans elle
    const sim = copie(d);
    if (contexte.revelee) revelerInfluence(sim, j, contexte.place, { choix: contexte.choix }, neutre);
    else activer(sim, j, contexte.index, { choix: contexte.choix }, neutre);
    return evaluer(sim, k) < evaluer(d, k) - 4 ? dispo[0] : null;
  }
  const A = d.joueurs[j].monstres[contexte.place];
  if (!A) return null;
  if (declencheur === "invocation") {
    const atk = atkEffectif(d, j, A);
    return dispo.find(p => {
      const t = def(d.joueurs[k].presages[p].id).effets[0].t;
      return t === "inverserInvoquee" ? A.atk - A.def >= 600 : atk >= 1600;
    }) ?? null;
  }
  const calc = calculCombat(d, j, contexte.place, contexte.cible);
  const grave = contexte.cible === "direct" ? calc.atk >= 1200 : calc.valeur == null || calc.atk >= calc.valeur;
  if (!grave) return null;
  const ordre = ["detruireAttaquant", "renvoyerAttaquant", "litige", "retarderAttaquant", "renfortSurprise", "annulerCombat"];
  const rang = place => ordre.indexOf(def(d.joueurs[k].presages[place].id).effets[0].t);
  return [...dispo].sort((a, b) => rang(a) - rang(b))[0];
}

/** Toutes les actions possibles du joueur actif, chacune avec sa valeur (positions simulées). */
function actionsNotees(d, profil) {
  const j = d.actif, J = d.joueurs[j], O = d.joueurs[adversaire(j)];
  const base = evaluer(d, j, profil), res = [];
  const noter = (action, faire) => { const sim = copie(d); faire(sim); res.push({ ...action, v: evaluer(sim, j, profil) - base }); };
  if (enPrincipale(d)) {
    J.main.forEach((id, index) => {
      const x = def(id);
      if (x.type === "influence" && peutActiver(d, j, index).ok)
        for (const c of (x.choix ? x.choix.map((_, i) => i) : [null])) noter({ type: "activer", index, choix: c }, s => activer(s, j, index, { choix: c }, neutre));
      if (x.type === "presage" && peutPoser(d, j, index).ok && d.tour > 2 * (d.douceur || 0)) res.push({ type: "poser", index, v: 3.5 });
      // une influence peu utile maintenant se garde face cachée pour plus tard
      if (x.type === "influence" && !x.sousType && peutPoserInfluence(d, j, index).ok && J.presages.filter(Boolean).length < 3) res.push({ type: "poserInfluence", index, v: 0.6 });
      if (x.type === "apparition") for (const pose of [false, true]) if (peutInvoquer(d, j, index, pose).ok) {
        const menace = Math.max(0, ...monstres(O).filter(m => m.m.position === "attaque" && !m.m.faceCachee).map(m => atkEffectif(d, adversaire(j), m.m)));
        noter({ type: "invoquer", index, pose }, s => invoquer(s, j, index, { pose }, neutre));
        if (!pose && x.atk < menace) res[res.length - 1].v -= 6;
      }
    });
    for (const f of fusionsPossibles(d, j)) noter({ type: "fusionner", figure: f.figure }, s => fusionner(s, j, f.figure, neutre));
    for (const t of techniquesPossibles(d, j)) noter({ type: "technique", cle: t.cle }, s => utiliserTechnique(s, j, t.cle, neutre));
    for (const t of accordsTerrain(d, j)) noter({ type: "accordTerrain", cle: t.cle }, s => accomplirAccordTerrain(s, j, t.cle));
    for (const e of evolutionsPossibles(d, j)) noter({ type: "evoluer", index: e.index, place: e.place }, s => evoluer(s, j, e.index, e.place, neutre));
    for (const c of superInvocationsPossibles(d, j)) noter({ type: "superInvoquer", famille: c.famille }, s => superInvoquer(s, j, c.famille, neutre));
    J.presages.forEach((p, place) => {
      if (!p?.influence || !peutRevelerInfluence(d, j, place).ok) return;
      for (const c of (def(p.id).choix ? def(p.id).choix.map((_, i) => i) : [null])) noter({ type: "revelerInfluence", place, choix: c }, s => revelerInfluence(s, j, place, { choix: c }, neutre));
    });
    for (const x of monstres(J)) if (peutChanger(d, j, x.place).ok) noter({ type: "changer", place: x.place }, s => changerPosition(s, j, x.place, neutre));
  } else if (d.phase === "combat") {
    J.monstres.forEach((m, place) => {
      if (!m) return;
      for (const c of ciblesAttaque(d, j, place)) noter({ type: "attaquer", place, cible: c }, s => attaquer(s, j, place, c, neutre, null));
    });
    for (const r of res) if (r.type === "attaquer") r.v *= profil?.agressif ?? 1;
  }
  return res;
}

/** Prochaine action de l'Ombre (joueur actif), que l'interface exécute puis anime. `profil` règle son style. */
export function actionOmbre(d, profil = d.joueurs[d.actif].profil, rng = Math.random) {
  if (d.fini) return { type: "rien" };
  const j = d.actif;
  const notes = actionsNotees(d, profil).sort((a, b) => b.v - a.v);
  const seuil = { activer: 1.5, poser: 0, poserInfluence: 0.5, revelerInfluence: 1.5, technique: 1, accordTerrain: 0.5, evoluer: 0.5, superInvoquer: 2, invoquer: -1, fusionner: 0, changer: 0.8, attaquer: 0 };
  let utiles = notes.filter(a => a.v > seuil[a.type] || (a.type === "invoquer" && !monstres(d.joueurs[j]).length));
  // la difficulté : une part de coups pris au hasard parmi les coups possibles
  if (utiles.length && profil?.hasard && rng() < profil.hasard) {
    const hasard = notes.filter(a => a.type !== "changer");
    if (hasard.length) return hasard[Math.floor(rng() * hasard.length)];
  }
  if (utiles.length) return utiles[0];
  if (d.phase === "principale1" && d.tour > 1 && monstres(d.joueurs[j]).some(x => x.m.position === "attaque" && !x.m.faceCachee && !x.m.bloque)) return { type: "combat" };
  if (d.phase === "combat") return { type: "principale2" };
  return { type: "fin" };
}

/** Exécute une action de l'Ombre. `reponse` : présage du défenseur (attaque) ou contre (influence). */
export function executerOmbre(d, a, rng = Math.random, reponse = null) {
  const j = d.actif;
  switch (a.type) {
    case "activer": return activer(d, j, a.index, { choix: a.choix, contre: reponse }, rng);
    case "poser": return poser(d, j, a.index);
    case "poserInfluence": return poserInfluence(d, j, a.index);
    case "revelerInfluence": return revelerInfluence(d, j, a.place, { choix: a.choix, contre: reponse }, rng);
    case "technique": return utiliserTechnique(d, j, a.cle, rng);
    case "accordTerrain": return accomplirAccordTerrain(d, j, a.cle);
    case "evoluer": return evoluer(d, j, a.index, a.place, rng);
    case "superInvoquer": return superInvoquer(d, j, a.famille, rng);
    case "invoquer": return invoquer(d, j, a.index, { pose: a.pose }, rng);
    case "fusionner": return fusionner(d, j, a.figure, rng);
    case "changer": return changerPosition(d, j, a.place, rng);
    case "combat": return passerAuCombat(d);
    case "principale2": return passerPrincipale2(d);
    case "attaquer": return attaquer(d, j, a.place, a.cible, rng, reponse);
    default: return [];
  }
}
