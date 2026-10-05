// Le mage sur le chemin : il marche le long des arêtes du graphe, choisit sa branche aux fourches, saute.
// Module pur (aucun accès au DOM), testable sous Node.
//
// Position : au nœud `noeud` si `vers` est null ; sinon sur l'arête noeud → vers, à la fraction `t`.
// Commande : { dx, dy } avec dx ∈ [-1, 1] (droite positive) et dy ∈ [-1, 1] (haut positif).
// Aux fourches, le mage prend l'arête la mieux alignée sur la commande ; une commande ambiguë
// (tout droit devant deux branches symétriques) le laisse sur place : il faut choisir.
import { CONFIG } from "../config.js";

export const PORTEE_SAUT = 190;     // distance maximale jusqu'à la carte qu'on veut sauter
const RECEPTION = 80;              // distance parcourue après la carte, à l'atterrissage
const VITESSE_SAUT = 300;

function geometrie(chemin, p, q) {
  const A = chemin.noeuds[p], B = chemin.noeuds[q];
  const dx = (B.x - A.x) * CONFIG.ecartVoies, da = B.a - A.a;
  const L = Math.hypot(dx, da) || 1;
  return { L, ux: dx / L, ua: da / L };
}

export class Mage {
  constructor(chemin) {
    this.noeud = chemin.depart;
    this.vers = null;
    this.t = 0;
    this.phase = 0;        // animation de marche
    this.saut = null;      // { cible, restant, total }
    this.fourche = false;  // arrêté devant une fourche, sans direction claire
  }

  position(chemin) {
    const A = chemin.noeuds[this.noeud];
    if (this.vers == null) return { x: A.x, a: A.a };
    const B = chemin.noeuds[this.vers];
    return { x: A.x + (B.x - A.x) * this.t, a: A.a + (B.a - A.a) * this.t };
  }

  /** Hauteur du saut en cours, de 0 à 1. */
  hauteur() { return this.saut ? Math.sin(Math.PI * (1 - this.saut.restant / this.saut.total)) : 0; }

  /** Carte que le mage peut sauter maintenant : la prochaine carte libre devant lui, à portée. */
  cibleSaut(chemin) {
    let de = this.noeud, vers = this.vers, distance = 0;
    if (vers == null) {
      const outs = chemin.suivants[de];
      if (outs.length !== 1) return null;
      vers = outs[0];
    } else distance = -this.t * geometrie(chemin, de, vers).L;
    // on suit le chemin tant qu'il est unique, jusqu'à la première carte libre
    for (let i = 0; i < 4; i++) {
      distance += geometrie(chemin, de, vers).L;
      if (distance > PORTEE_SAUT) return null;
      const n = chemin.noeuds[vers];
      if (n.carte != null && n.etat === "libre") return { noeud: vers, distance };
      if (n.porte != null || n.arrivee) return null;
      const outs = chemin.suivants[vers];
      if (outs.length !== 1) return null;
      de = vers; vers = outs[0];
    }
    return null;
  }

  /** Lance un saut. Renvoie la cible (nœud) ou null s'il n'y a rien à sauter (le mage saute quand même, pour rien). */
  sauter(chemin) {
    if (this.saut) return null;
    const c = this.cibleSaut(chemin);
    const total = c ? c.distance + RECEPTION : 90;
    if (this.vers == null) {
      const outs = chemin.suivants[this.noeud];
      if (outs.length === 1) { this.vers = outs[0]; this.t = 0; }
    }
    this.saut = { cible: c ? c.noeud : null, restant: total, total, aplace: this.vers == null };
    return c ? c.noeud : null;
  }

  /**
   * Avance le mage de `dt` secondes. `auto` : null (commande du joueur), { mode: 'hasard', rng }
   * (l'eau le porte) ou { mode: 'route', route: [nœuds] } (le joueur a cliqué une destination).
   * Renvoie { distance, arrivees: [{ noeud, enSaut }] }.
   */
  avancer(dt, commande, vitesse, chemin, auto = null) {
    const res = { distance: 0, arrivees: [] };
    this.fourche = false;

    if (this.saut) {
      const d = Math.min(this.saut.restant, Math.max(vitesse, VITESSE_SAUT) * dt);
      this.saut.restant -= d;
      if (!this.saut.aplace) this.deplacer(d, chemin, res, outs => (outs.length === 1 ? outs[0] : null), this.saut.cible);
      res.distance = d;
      if (this.saut.restant <= 0) this.saut = null;
      this.phase += dt * 6;
      return res;
    }
    if (vitesse <= 0) return res;

    const d = vitesse * dt;
    if (auto) {
      const choisir = auto.mode === "route"
        ? outs => { const k = outs.find(o => o === auto.route[0]); return k ?? null; }
        : outs => outs[Math.floor(auto.rng() * outs.length)];
      res.distance = this.deplacer(d, chemin, res, choisir, null, auto.mode === "route" ? auto.route : null);
      this.phase += res.distance / 22;
      return res;
    }

    const n = Math.hypot(commande.dx, commande.dy);
    if (n < 0.2) return res;
    const cx = commande.dx / n, ca = commande.dy / n;

    if (this.vers == null) {
      const outs = chemin.suivants[this.noeud];
      if (!outs.length) return res;
      const notes = outs.map(o => { const g = geometrie(chemin, this.noeud, o); return { o, s: g.ux * cx + g.ua * ca }; }).sort((p, q) => q.s - p.s);
      if (notes[0].s < 0.3) { this.fourche = outs.length > 1 && ca > 0; return res; }
      if (notes.length > 1 && notes[0].s - notes[1].s < 0.12) { this.fourche = true; return res; }
      this.vers = notes[0].o; this.t = 0;
    }
    const g = geometrie(chemin, this.noeud, this.vers);
    const s = g.ux * cx + g.ua * ca;
    if (s > 0.2) {
      res.distance = this.deplacer(d, chemin, res, () => null);
    } else if (s < -0.2) {
      // retour en arrière sur l'arête, jamais au-delà du nœud quitté
      const recul = Math.min(d, this.t * g.L);
      this.t -= recul / g.L;
      res.distance = recul;
      if (this.t <= 0.0001) { this.t = 0; this.vers = null; }
    }
    this.phase += res.distance / 22;
    return res;
  }

  /** Avance de `d` le long du chemin ; `choisir(outs)` désigne l'arête à prendre à un nœud (null : s'arrêter). */
  deplacer(d, chemin, res, choisir, cibleSaut = null, route = null) {
    let parcouru = 0;
    while (d > 1e-6) {
      if (this.vers == null) {
        const outs = chemin.suivants[this.noeud];
        const s = outs.length ? choisir(outs) : null;
        if (s == null) break;
        this.vers = s; this.t = 0;
        if (route && route[0] === s) route.shift();
      }
      const g = geometrie(chemin, this.noeud, this.vers);
      const reste = (1 - this.t) * g.L;
      if (d < reste) { this.t += d / g.L; parcouru += d; d = 0; break; }
      d -= reste; parcouru += reste;
      this.noeud = this.vers; this.vers = null; this.t = 0;
      res.arrivees.push({ noeud: this.noeud, enSaut: cibleSaut != null && this.noeud === cibleSaut });
      if (!cibleSaut && !route) break;   // à pied, on s'arrête sur chaque nœud (la carte se lit)
      if (route && !route.length) break;
      if (chemin.noeuds[this.noeud].carte != null && this.noeud !== cibleSaut) break;
    }
    return parcouru;
  }
}
