// Une partie du Chemin : le mage, le chemin, l'état, et tout ce qui se passe quand il marche.
// Module pur (aucun accès au DOM) : le jeu (js/main.js) et le simulateur (tests/simulateur.mjs) s'en servent
// tous les deux, pour que les tests vérifient exactement ce que joue le joueur.
//
// La partie avance par `avancer(p, dt, commande)` et renvoie des événements que l'interface met en scène.
// Quand une décision du joueur est nécessaire, `p.attente` est rempli ; `resoudre(p, reponse)` y répond :
//   { kind: 'choix', id }          carte à choix (Destinée, Hazard…) : réponse = index du choix
//   { kind: 'retenir', region, candidats }  porte de région : la carte retenue pour le tirage (numéro)
//   { kind: 'enigme', enigme }     énigme de la porte : réponse = index de l'option
import { REGIONS } from "../config.js";
import { CARTE_PAR_ID } from "../data/cartes.js";
import { creerHasard } from "./hasard.js";
import { creerEtat, multiplicateurVitesse, avancerTemps, vue, peutSauter, usureCourante } from "./state.js";
import { construireChemin, rangs, injoignables, cheminVers, noeudDeCarte, bouleverser, distanceJusqua, longueurArete } from "./chemin.js";
import { rencontrer, contourner, etatArrivee, survoler, sauter, coutSaut, variation } from "./effects.js";
import { valence } from "./valeurs.js";
import { poserEnigme } from "./enigmes.js";
import { noterEnigme } from "./carnet.js";
import { Mage } from "../game/player.js";

export const RECOMPENSE_ENIGME = { vue: 2, fortune: 10 };

export function creerPartie(graine, consultant = "homme", { regions = 7, carnet = null } = {}) {
  const chemin = construireChemin(creerHasard(graine), { regions });
  return {
    graine, consultant, chemin, carnet,
    etat: creerEtat(consultant),
    mage: new Mage(chemin),
    rng: { effets: creerHasard(graine + 7), eau: creerHasard(graine + 13), enigme: creerHasard(graine + 29) },
    parcourus: new Set([chemin.depart]),
    vues: new Set(),          // cartes vues face visible pendant la partie
    retenues: [],             // le tirage composé : { region, id }, une carte par région planétaire
    enigmes: { posees: 0, reussies: 0 },
    route: null, cible: null, // marche vers une carte désignée
    file: [], attente: null,
    finDemandee: false, fini: false,
    cacheValences: { cle: "", valeurs: new Map() }
  };
}

/** Région dont le monde a l'apparence (la lunaison de Changement en emprunte une autre). */
export function regionAffichee(p) { return p.etat.lunaisonRegion ?? p.etat.region; }
const vitesse = p => REGIONS[regionAffichee(p)].vitesse * multiplicateurVitesse(p.etat);

/** Fait marcher le mage `dt` secondes. `commande` : { dx, dy }. Renvoie des événements. */
export function avancer(p, dt, commande) {
  const ev = [];
  if (p.attente || p.fini) return ev;
  const { etat, mage, chemin } = p;
  let auto = null;
  if (etat.minuteurs.passivite > 0) { auto = { mode: "hasard", rng: p.rng.eau }; p.route = null; p.cible = null; }
  else if (p.route) auto = { mode: "route", route: p.route };
  const v = etat.minuteurs.retrait > 0 ? 0 : vitesse(p);
  const res = mage.avancer(dt, commande, v, chemin, auto);
  for (const m of avancerTemps(etat, dt, res.distance > 0)) ev.push({ type: "temps", texte: m.texte, source: m.source });
  for (const a of res.arrivees) { ev.push(...arriver(p, a)); if (p.attente || p.fini) break; }
  if (p.route && !p.route.length) { p.route = null; p.cible = null; }
  ev.push(...verifierFin(p));
  return ev;
}

/** Le joueur reprend la main : la marche automatique s'arrête. */
export function reprendreMain(p) { p.route = null; p.cible = null; }

/** Conduire le mage vers un nœud (clic sur une carte). */
export function allerVers(p, noeud) {
  const route = cheminVers(p.chemin, p.mage.vers ?? p.mage.noeud, noeud);
  p.route = route; p.cible = route ? noeud : null;
  return !!route;
}

/** Saut demandé. Renvoie { ok, raison }. */
export function demanderSaut(p) {
  const { etat, mage, chemin } = p;
  if (p.attente || p.fini) return { ok: false };
  if (!peutSauter(etat)) return { ok: false, raison: etat.minuteurs.passivite > 0 ? "L’eau vous porte" : "Impossible de sauter" };
  const c = mage.cibleSaut(chemin);
  if (c && coutSaut(etat, chemin.noeuds[c.noeud].carte) >= etat.energie) return { ok: false, raison: "Trop épuisé pour sauter" };
  reprendreMain(p);
  mage.sauter(chemin);
  return { ok: true, cible: c?.noeud ?? null };
}

function arriver(p, { noeud, enSaut }) {
  const { chemin, etat } = p;
  const ev = [];
  const n = chemin.noeuds[noeud];
  p.parcourus.add(noeud);
  if (n.porte != null && n.porte !== etat.region) {
    const quittee = etat.region;
    etat.region = n.porte;
    ev.push({ type: "region", region: n.porte });
    if (quittee >= 1) preparerPorte(p, quittee, true);
  }
  for (const k of injoignables(chemin, noeud)) {
    const m = chemin.noeuds[k];
    m.etat = "contournee";
    const avant = gainDepuis(etat);
    const messages = contourner(etat, m.carte, p.rng.effets);
    ev.push({ type: "laissee", id: m.carte, noeud: k, messages, gain: avant() });
  }
  if (n.carte != null && n.etat === "libre") {
    if (enSaut) {
      n.etat = "sautee";
      const avant = gainDepuis(etat);
      const messages = sauter(etat, n.carte, p.rng.effets);
      ev.push({ type: "sautee", id: n.carte, noeud, messages, gain: avant() });
    } else ev.push(...vivre(p, n, n.carte));
  }
  if (n.arrivee) { preparerPorte(p, etat.region, false); p.finDemandee = true; }
  poursuivre(p);
  return ev;
}

const gainDepuis = etat => {
  const e = etat.energie, f = etat.fortune;
  return () => ({ energie: Math.round(etat.energie - e), fortune: Math.round(etat.fortune - f) });
};

/** À une porte : retenir une carte de la région quittée, puis (sauf à l'arrivée) une énigme. */
function preparerPorte(p, region, enigme) {
  const vecues = [...new Set(p.etat.historique.filter(h => h.region === region && !h.ignoree && !h.remplacee).map(h => h.id))];
  if (vecues.length) p.file.push({ kind: "retenir", region, candidats: vecues });
  if (!enigme) return;
  const vus = p.chemin.noeuds.filter(n => n.region === region && n.carte != null && (p.vues.has(n.carte) || n.etat !== "libre")).map(n => n.carte);
  const e = poserEnigme(vus, p.rng.enigme, p.carnet?.aRevoir);
  if (e) p.file.push({ kind: "enigme", enigme: e });
}

function vivre(p, n, id) {
  const quoi = etatArrivee(p.etat, id);
  if (quoi === "survolee") {
    if (n) n.etat = "survolee";
    return [{ type: "survolee", id, noeud: n?.id, messages: survoler(p.etat, id) }];
  }
  if (quoi === "choix") { p.file.unshift({ kind: "choix", id, noeud: n ? n.id : null }); return []; }
  return appliquer(p, n, id, null);
}

function appliquer(p, n, id, choix) {
  const { etat, chemin } = p;
  const avant = gainDepuis(etat);
  const retour = n != null && (n.etat === "contournee" || n.etat === "sautee");
  const region = etat.region;
  const res = rencontrer(etat, id, choix, p.rng.effets, {
    region, retour,
    bouleverser: () => bouleverser(chemin, region, p.mage.noeud, p.rng.effets)
  });
  if (n) n.etat = res.entree.ignoree ? "fermee" : "vecue";
  const titre = res.entree.ignoree ? "Carte fermée" : retour ? "Carte revenue" : "Carte vécue";
  const ev = [{ type: "vecue", id, noeud: n?.id, messages: res.messages, regles: res.regles, entree: res.entree, gain: avant(), titre }];
  if (res.retour != null && !etat.termine) ev.push(...vivre(p, noeudDeCarte(chemin, res.retour), res.retour));
  return ev;
}

function poursuivre(p) {
  if (!p.attente && p.file.length) p.attente = p.file.shift();
}

function verifierFin(p) {
  if (p.fini) return [];
  const { etat } = p;
  if (etat.termine && !etat.victoire) { p.fini = true; p.file = []; p.attente = null; return [{ type: "fin", victoire: false }]; }
  if (p.finDemandee && !p.attente && !p.file.length) {
    etat.victoire = true; etat.termine = true; p.fini = true;
    return [{ type: "fin", victoire: true }];
  }
  return [];
}

/** Répond à l'attente en cours. Renvoie des événements. */
export function resoudre(p, reponse) {
  const a = p.attente;
  if (!a) return [];
  p.attente = null;
  let ev = [];
  if (a.kind === "choix") {
    const n = a.noeud != null ? p.chemin.noeuds[a.noeud] : null;
    ev = appliquer(p, n, a.id, reponse);
  } else if (a.kind === "retenir") {
    const id = a.candidats.includes(reponse) ? reponse : a.candidats[0];
    p.retenues.push({ region: a.region, id });
    ev = [{ type: "retenue", region: a.region, id }];
  } else if (a.kind === "enigme") {
    const e = a.enigme, reussie = reponse === e.bonne;
    p.enigmes.posees++;
    const messages = [];
    if (reussie) {
      p.enigmes.reussies++;
      p.etat.reveler = Math.max(p.etat.reveler, RECOMPENSE_ENIGME.vue);
      messages.push("La porte s’ouvre en grand : la route se révèle.", variation(p.etat, "fortune", RECOMPENSE_ENIGME.fortune));
    } else messages.push("La porte s’ouvre quand même. Cette carte reviendra dans vos énigmes.");
    if (p.carnet) noterEnigme(p.carnet, e.carte, reussie);
    ev = [{ type: "enigme", reussie, enigme: e, messages }];
  }
  poursuivre(p);
  ev.push(...verifierFin(p));
  return ev;
}

/**
 * Ce que voit le mage : rangs, faces visibles, cartes « devant vous », marques du discernement,
 * fils d'or (règles déjà découvertes dans le carnet), cartes vues pour la première fois.
 */
export function regarder(p) {
  const { chemin, etat, mage } = p;
  const atteints = rangs(chemin, mage.noeud, mage.vers);
  const portee = vue(etat);
  const faces = new Map(), nouvelles = [];
  for (const n of chemin.noeuds) {
    if (n.carte == null) continue;
    if (n.etat !== "libre") { faces.set(n.id, "face"); continue; }
    const c = CARTE_PAR_ID[n.carte], rang = atteints.get(n.id);
    const visible = rang != null && (c.declaree || (!c.surprise && rang <= portee));
    faces.set(n.id, visible ? "face" : "dos");
    if (visible && !p.vues.has(n.carte)) { p.vues.add(n.carte); nouvelles.push(n.carte); }
  }

  const devant = [];
  for (const [id, f] of faces) {
    const n = chemin.noeuds[id];
    if (f !== "face" || n.etat !== "libre" || !atteints.has(id)) continue;
    const rang = atteints.get(id);
    if (rang > Math.max(portee, 1) + (CARTE_PAR_ID[n.carte].declaree ? 2 : 0)) continue;
    const cote = rang > 1 ? `plus loin (rang ${rang})` : n.tronc ? "sur le tronc" : n.x < 0 ? "à gauche" : "à droite";
    devant.push({ noeud: id, id: n.carte, rang, cote, x: n.x });
  }
  devant.sort((a, b) => a.rang - b.rang || a.x - b.x);

  let valences = new Map();
  if (etat.minuteurs.discernement > 0) {
    const visibles = [...faces].filter(([id, f]) => f === "face" && chemin.noeuds[id].etat === "libre").map(([id]) => id);
    const cle = `${visibles.join(",")}|${Math.round(etat.energie / 5)}|${etat.fortune}|${etat.boucliers}`;
    if (cle !== p.cacheValences.cle) p.cacheValences = { cle, valeurs: new Map(visibles.map(id => [id, valence(etat, chemin.noeuds[id].carte)])) };
    valences = p.cacheValences.valeurs;
  }

  const fils = [];
  if (p.carnet) for (const rv of chemin.rendezVous) {
    if (!p.carnet.regles[rv.regle]) continue;
    const [a, b] = rv.cartes.map(id => noeudDeCarte(chemin, id));
    if (a && b && a.etat === "libre" && b.etat === "libre" && (faces.get(a.id) === "face" || faces.get(b.id) === "face")) fils.push({ a: a.id, b: b.id, regle: rv.regle });
  }
  return { atteints, faces, devant, valences, fils, nouvelles, portee };
}

/** Énergie qu'il faudra pour atteindre la prochaine porte (ou l'arrivée), au pas actuel. */
export function besoinEnergie(p) {
  const { chemin, mage, etat } = p;
  let d = 0, depuis = mage.noeud;
  if (mage.vers != null) { d = (1 - mage.t) * longueurArete(chemin, mage.noeud, mage.vers); depuis = mage.vers; }
  const n0 = chemin.noeuds[depuis];
  const reste = n0.porte != null && n0.porte !== etat.region || n0.arrivee ? 0 : distanceJusqua(chemin, depuis, n => (n.porte != null && n.porte !== etat.region) || n.arrivee);
  if (reste == null) return 0;
  const v = Math.max(1, vitesse(p) || REGIONS[regionAffichee(p)].vitesse);
  return Math.max(0, Math.ceil((d + reste) / v * usureCourante(etat)));
}

