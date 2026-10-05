// Dessin du chemin vu de dessus : il monte de bas en haut, la caméra suit le mage.
// Le canvas s'adapte à sa taille d'affichage et à la densité de l'écran (devicePixelRatio).
import { CONFIG, REGIONS, COULEURS } from "../config.js";
import { CARTE_PAR_ID } from "../data/cartes.js";
import { dessinerChien } from "./illustrations.js";
import { dessinerFace, dessinerDos, arrondi, hexA } from "./carte.js";

const CL = CONFIG.carteL, CH = CONFIG.carteH;

/** Abscisse logique d'une voie. */
export const xVoie = x => CONFIG.largeurMonde / 2 + x * CONFIG.ecartVoies;

// Hasard fixe pour les décors (le même à chaque image)
const bruit = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

export class Rendu {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.camA = null;
    this.zones = [];          // rectangles des cartes à l'écran, pour le clic : { noeud, x, y, l, h }
    this.flottants = [];      // textes qui s'envolent du mage
    this.particules = [];     // éclats : { x, a, vx, vy, vie, couleur }
    this.revelation = null;   // carte vécue montrée en grand : { id, vie, couleur }
    this.bandeau = null;      // { texte, sous, vie }
    this.secousse = 0;
    this.temps = 0;
    this.mouvementReduit = false;
    this.ajuster();
  }

  ajuster() {
    const r = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const l = Math.max(1, r.width), h = Math.max(1, r.height);
    this.k = l / CONFIG.largeurMonde;
    this.W = CONFIG.largeurMonde;
    // sur un écran étroit, les cartes grandissent (leur nom et leur mot-clé restent lisibles), le chemin ne bouge pas
    this.loupe = l < 520 ? 1.18 : 1;
    this.H = h / this.k;
    this.canvas.width = Math.round(l * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.dpr = dpr;
  }

  versLogique(px, py) { return { x: px / this.k, y: py / this.k }; }
  y(a) { return this.H * 0.7 - (a - this.camA); }

  flotter(texte, couleur, pos) { this.flottants.push({ texte, couleur, x: pos.x, a: pos.a, vie: 1.8, decalage: this.flottants.length }); }
  annoncer(texte, sous = "") { this.bandeau = { texte, sous, vie: 2.6 }; }

  /** Une carte vécue apparaît en grand ; éclats d'or (favorable) ou de braise (néfaste). */
  reveler(id, signe, pos) {
    const couleur = signe > 0 ? "#f3d58a" : signe < 0 ? "#ff8a5c" : "#e9e2d0";
    this.revelation = { id, vie: this.mouvementReduit ? 0.9 : 1.15, couleur };
    this.eclater(pos, couleur, signe < 0 ? 22 : 26);
    if (signe < 0 && !this.mouvementReduit) this.secousse = 0.25;
  }
  eclater(pos, couleur, n = 24) {
    if (this.mouvementReduit) return;
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * Math.PI * 2, v = 60 + Math.random() * 140;
      this.particules.push({ x: xVoie(pos.x), a: pos.a + 26, vx: Math.cos(ang) * v, va: Math.sin(ang) * v + 60, vie: 0.6 + Math.random() * 0.6, couleur });
    }
  }

  /** v : { p (partie), vue (regarder), dt } */
  dessiner(v) {
    const c = this.ctx, { p, vue } = v, { chemin, mage, etat } = p;
    this.temps += v.dt;
    const pos = mage.position(chemin);
    if (this.camA == null || this.mouvementReduit) this.camA = pos.a;
    else this.camA += (pos.a - this.camA) * Math.min(1, v.dt * 6);
    const aMin = this.camA - this.H * 0.35, aMax = this.camA + this.H * 0.75;

    c.setTransform(this.dpr * this.k, 0, 0, this.dpr * this.k, 0, 0);
    c.save();
    if (this.secousse > 0) { this.secousse -= v.dt; c.translate((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4); }
    this.fond(c, p, aMin, aMax);
    this.aretes(c, p, vue, aMin, aMax);
    this.zones = [];
    for (const n of chemin.noeuds) {
      if (n.a < aMin - CH || n.a > aMax + CH) continue;
      if (n.porte != null) this.porte(c, n, pos);
      else if (n.depart) this.etiquette(c, xVoie(0), this.y(n.a) + 62, "Départ");
      else if (n.arrivee) this.arrivee(c, n);
    }
    this.fils(c, p, vue);
    for (const n of chemin.noeuds) if (n.carte != null && n.a > aMin - CH && n.a < aMax + CH) this.carte(c, n, vue);
    if (p.cible != null) this.marqueCible(c, chemin.noeuds[p.cible]);
    this.fleches(c, p);
    this.dessinerMage(c, mage, etat, pos);
    this.eclats(c, v.dt);
    this.textesFlottants(c, v.dt);
    c.restore();
    this.voiles(c, etat, v.dt);
    this.carteEnGrand(c, v.dt);
  }

  fond(c, p, aMin, aMax) {
    const W = this.W, H = this.H, { chemin, etat } = p;
    c.fillStyle = "#1d1830"; c.fillRect(-10, -10, W + 20, H + 20);
    chemin.regions.forEach((r, i) => {
      if (r.aFin < aMin || r.aDebut > aMax) return;
      const reg = REGIONS[i];
      const haut = this.y(r.aFin), bas = this.y(r.aDebut);
      const g = c.createLinearGradient(0, haut, 0, bas);
      g.addColorStop(0, reg.ciel[0]); g.addColorStop(1, reg.ciel[1]);
      c.fillStyle = g; c.fillRect(-10, haut, W + 20, bas - haut);
      this.decor(c, i, r, aMin, aMax);
      const yg = Math.max(haut + 90, Math.min(bas - 90, H * 0.3));
      c.save(); c.globalAlpha = 0.12; c.fillStyle = reg.accent;
      c.font = "150px 'EB Garamond', serif"; c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText(reg.glyphe, W - 62, yg); c.restore();
    });
    if (etat.lunaisonRegion != null) {
      const reg = REGIONS[etat.lunaisonRegion];
      c.save(); c.globalAlpha = 0.35; c.fillStyle = reg.ciel[0]; c.fillRect(0, 0, W, H); c.restore();
    }
    // vignette
    const v = c.createRadialGradient(W / 2, H * 0.55, H * 0.3, W / 2, H * 0.55, H * 0.9);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(10,6,20,0.38)");
    c.fillStyle = v; c.fillRect(0, 0, W, H);
  }

  /** Décor de la région : des motifs semés (purement décoratifs, aux couleurs de la planète). */
  decor(c, i, r, aMin, aMax) {
    const reg = REGIONS[i];
    const pas = 90;
    const debut = Math.max(r.aDebut, Math.floor(aMin / pas) * pas), fin = Math.min(r.aFin, aMax);
    c.save();
    for (let a = debut; a < fin; a += pas) {
      for (const cote of [-1, 1]) {
        const s = a * 0.013 + cote * 7 + i * 31;
        if (bruit(s) < 0.45) continue;
        const x = cote < 0 ? 18 + bruit(s + 1) * 38 : this.W - 18 - bruit(s + 1) * 38;
        const y = this.y(a + bruit(s + 2) * pas);
        const t = 0.55 + bruit(s + 3) * 0.7;
        c.globalAlpha = 0.28 + bruit(s + 4) * 0.25;
        motif(c, reg.famille, x, y, 14 * t, reg.accent, reg.sol, this.temps + s);
      }
    }
    c.restore();
  }

  aretes(c, p, vue, aMin, aMax) {
    const { chemin, mage, parcourus } = p;
    c.save(); c.lineCap = "round"; c.lineJoin = "round";
    for (const passe of [0, 1, 2, 3]) {
      for (const n of chemin.noeuds) {
        for (const s of chemin.suivants[n.id]) {
          const m = chemin.noeuds[s];
          if (Math.max(n.a, m.a) < aMin || Math.min(n.a, m.a) > aMax) continue;
          const x1 = xVoie(n.x), y1 = this.y(n.a), x2 = xVoie(m.x), y2 = this.y(m.a);
          const marche = parcourus.has(n.id) && parcourus.has(s);
          const ouvert = marche || vue.atteints.has(s) || mage.vers === s;
          const sol = REGIONS[n.region].sol;
          c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2);
          if (passe === 0) { c.globalAlpha = ouvert ? 0.6 : 0.16; c.strokeStyle = "#1c1424"; c.lineWidth = 36; c.stroke(); }
          else if (passe === 1) { c.globalAlpha = ouvert ? 1 : 0.28; c.strokeStyle = sol; c.lineWidth = 28; c.stroke(); }
          else if (passe === 2) { c.globalAlpha = ouvert ? 0.35 : 0.1; c.strokeStyle = "#fff8e4"; c.lineWidth = 12; c.stroke(); }
          else if (marche) { c.globalAlpha = 0.95; c.strokeStyle = COULEURS.or; c.lineWidth = 3; c.setLineDash([2, 9]); c.stroke(); c.setLineDash([]); }
        }
      }
    }
    c.restore();
  }

  porte(c, n, pos) {
    const reg = REGIONS[n.porte], x = xVoie(0), y = this.y(n.a);
    // les battants s'ouvrent quand le mage approche
    const ouverture = Math.max(0, Math.min(1, 1 - (n.a - pos.a - 40) / 260));
    c.save();
    c.fillStyle = hexA("#000000", 0.25); c.fillRect(x - 52, y - 4, 104, 8);
    for (const s of [-1, 1]) {
      const l = 40 * (1 - ouverture * 0.85);
      c.fillStyle = "#5a3a1c"; c.strokeStyle = "#2a1a0c"; c.lineWidth = 1.5;
      c.fillRect(s < 0 ? x - 40 : x + 40 - l, y - 46, l, 46); c.strokeRect(s < 0 ? x - 40 : x + 40 - l, y - 46, l, 46);
      c.fillStyle = reg.accent; c.fillRect(x + s * 48 - 7, y - 58, 14, 62);
      c.strokeStyle = COULEURS.encre; c.strokeRect(x + s * 48 - 7, y - 58, 14, 62);
    }
    c.beginPath(); c.arc(x, y - 58, 55, Math.PI, 0); c.lineWidth = 10; c.strokeStyle = reg.accent; c.stroke();
    c.lineWidth = 2; c.strokeStyle = COULEURS.or; c.beginPath(); c.arc(x, y - 58, 60, Math.PI, 0); c.stroke();
    c.fillStyle = COULEURS.or; c.font = "22px 'EB Garamond', serif"; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText(reg.glyphe, x, y - 92);
    c.fillStyle = "rgba(253,248,236,.95)"; c.strokeStyle = COULEURS.or; c.lineWidth = 1.5;
    arrondi(c, x + 62, y - 44, 140, 28, 8); c.fill(); c.stroke();
    c.fillStyle = COULEURS.bordeaux; c.font = "bold 13px 'Cinzel', serif";
    c.fillText(`${reg.glyphe} ${reg.nom}`, x + 132, y - 30);
    c.restore();
  }

  arrivee(c, n) {
    const x = xVoie(0), y = this.y(n.a);
    c.save();
    const g = c.createRadialGradient(x, y - 30, 4, x, y - 30, 90);
    g.addColorStop(0, "rgba(243,213,138,.75)"); g.addColorStop(1, "rgba(243,213,138,0)");
    c.fillStyle = g; c.beginPath(); c.arc(x, y - 30, 90, 0, Math.PI * 2); c.fill();
    this.etiquette(c, x, y - 30, "Le cycle des sept planètes");
    c.restore();
  }

  etiquette(c, x, y, texte) {
    c.save(); c.font = "bold 13px 'Cinzel', serif"; c.textAlign = "center"; c.textBaseline = "middle";
    const l = c.measureText(texte).width + 22;
    c.fillStyle = "rgba(253,248,236,.95)"; c.strokeStyle = COULEURS.or; c.lineWidth = 1.5; arrondi(c, x - l / 2, y - 13, l, 26, 8); c.fill(); c.stroke();
    c.fillStyle = COULEURS.bordeaux; c.fillText(texte, x, y); c.restore();
  }

  /** Fils d'or : deux cartes que relie une règle déjà découverte dans le carnet. */
  fils(c, p, vue) {
    if (!vue.fils.length) return;
    c.save();
    for (const f of vue.fils) {
      const A = p.chemin.noeuds[f.a], B = p.chemin.noeuds[f.b];
      const x1 = xVoie(A.x), y1 = this.y(A.a), x2 = xVoie(B.x), y2 = this.y(B.a);
      const mx = (x1 + x2) / 2 + (A.x === B.x ? 64 * (A.x <= 0 ? 1 : -1) : 0), my = (y1 + y2) / 2;
      c.strokeStyle = "rgba(243,213,138,.9)"; c.lineWidth = 2.5; c.setLineDash([6, 5]);
      c.lineDashOffset = -this.temps * 20;
      c.shadowColor = "#f3d58a"; c.shadowBlur = 8;
      c.beginPath(); c.moveTo(x1, y1); c.quadraticCurveTo(mx, my, x2, y2); c.stroke();
      c.setLineDash([]); c.shadowBlur = 0;
      c.fillStyle = "#f3d58a"; c.font = "16px 'EB Garamond', serif"; c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText("✦", (x1 + 2 * mx + x2) / 4, (y1 + 2 * my + y2) / 4);
    }
    c.restore();
  }

  carte(c, n, vue) {
    const carte = CARTE_PAR_ID[n.carte];
    const cx = xVoie(n.x), cy = this.y(n.a);
    const x = cx - CL / 2, y = cy - CH / 2;
    const face = vue.faces.get(n.id) || (n.etat !== "libre" ? "face" : "dos");
    const libre = n.etat === "libre";
    const s = this.loupe || 1;
    this.zones.push({ noeud: n.id, x: cx - CL * s / 2, y: cy - CH * s / 2, l: CL * s, h: CH * s });
    c.save();
    if (s !== 1) { c.translate(cx, cy); c.scale(s, s); c.translate(-cx, -cy); }
    c.globalAlpha = libre ? 1 : n.etat === "vecue" ? 0.45 : 0.3;
    c.fillStyle = "rgba(0,0,0,0.3)"; arrondi(c, x + 4, y + 6, CL, CH, 9); c.fill();
    if (libre && face === "face" && vue.atteints.get(n.id) === 1) {
      // les cartes à portée immédiate respirent doucement
      c.shadowColor = "rgba(243,213,138,.8)"; c.shadowBlur = this.mouvementReduit ? 10 : 8 + Math.sin(this.temps * 3) * 5;
    }
    if (face === "dos") dessinerDos(c, x, y, REGIONS[n.region].glyphe, n.tronc ? "sur le tronc" : "voilée");
    else dessinerFace(c, carte, x, y);
    c.shadowBlur = 0;
    const val = vue.valences.get(n.id);
    if (libre && face === "face" && val != null) {
      c.fillStyle = val > 0 ? COULEURS.vert : val < 0 ? COULEURS.rouge : COULEURS.or;
      c.beginPath(); c.arc(x + 4, y + 4, 11, 0, Math.PI * 2); c.fill();
      c.strokeStyle = "#fff"; c.lineWidth = 1.5; c.stroke();
      c.fillStyle = "#fff"; c.font = "bold 15px 'EB Garamond', serif"; c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText(val > 0 ? "+" : val < 0 ? "−" : "~", x + 4, y + 4);
    }
    c.globalAlpha = 1;
    const marques = { fermee: "fermée", sautee: "sautée", survolee: "survolée", contournee: "laissée" };
    if (marques[n.etat]) marque(c, cx, cy, marques[n.etat]);
    c.restore();
  }

  marqueCible(c, n) {
    const x = xVoie(n.x), y = this.y(n.a);
    c.save(); c.strokeStyle = COULEURS.or; c.lineWidth = 3; c.setLineDash([6, 5]); c.lineDashOffset = -this.temps * 30;
    arrondi(c, x - CL / 2 - 7, y - CH / 2 - 7, CL + 14, CH + 14, 11); c.stroke(); c.restore();
  }

  /** Aux fourches : des flèches vers chaque branche. */
  fleches(c, p) {
    const { chemin, mage } = p;
    if (mage.vers != null || mage.saut) return;
    const outs = chemin.suivants[mage.noeud];
    if (outs.length < 2) return;
    const n = chemin.noeuds[mage.noeud];
    c.save();
    for (const o of outs) {
      const m = chemin.noeuds[o];
      const dx = (m.x - n.x) * CONFIG.ecartVoies, da = m.a - n.a, L = Math.hypot(dx, da);
      const ux = dx / L, uy = -da / L;
      const r = 50 + (this.mouvementReduit ? 0 : Math.sin(this.temps * 5) * 4);
      const px = xVoie(n.x) + ux * r, py = this.y(n.a) + uy * r;
      c.fillStyle = COULEURS.or; c.strokeStyle = COULEURS.encre; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(px + ux * 13, py + uy * 13); c.lineTo(px - uy * 10, py + ux * 10); c.lineTo(px + uy * 10, py - ux * 10); c.closePath(); c.fill(); c.stroke();
    }
    if (mage.fourche) {
      c.font = "bold 14px 'Cinzel', serif"; c.textAlign = "center"; c.fillStyle = COULEURS.creme;
      c.strokeStyle = COULEURS.encre; c.lineWidth = 3;
      const y = this.y(n.a) + 66;
      c.strokeText("Choisissez : ← ou →", xVoie(n.x), y); c.fillText("Choisissez : ← ou →", xVoie(n.x), y);
    }
    c.restore();
  }

  dessinerMage(c, m, etat, pos) {
    const h = m.hauteur();
    const x = xVoie(pos.x), y0 = this.y(pos.a) + 30;
    const y = y0 - h * 48, s = 1 + h * 0.3;
    c.save();
    c.fillStyle = "rgba(0,0,0,0.32)"; c.beginPath(); c.ellipse(x, y0 + 2, 16 * (1 - h * 0.35), 5 * (1 - h * 0.35), 0, 0, Math.PI * 2); c.fill();
    if (etat.minuteurs.compagnon > 0) { c.fillStyle = "#8a5a2b"; c.strokeStyle = "#8a5a2b"; dessinerChien(c, x + 22, y0 + 2, 34, m.phase * 1.4); }
    if (etat.minuteurs.passivite > 0) {
      c.strokeStyle = "rgba(43,95,174,0.85)"; c.lineWidth = 3;
      for (let k = 0; k < 2; k++) {
        c.beginPath();
        for (let i = 0; i <= 6; i++) { const px = x - 30 + i * 10, py = y0 - 2 - k * 7 + Math.sin(i * 1.6 + m.phase * 2 + k) * 3; if (i) c.lineTo(px, py); else c.moveTo(px, py); }
        c.stroke();
      }
    }
    if (etat.suivante.double) {
      const g = c.createRadialGradient(x, y - 30, 4, x, y - 30, 44);
      g.addColorStop(0, "rgba(243,213,138,.6)"); g.addColorStop(1, "rgba(243,213,138,0)");
      c.fillStyle = g; c.beginPath(); c.arc(x, y - 30, 44, 0, Math.PI * 2); c.fill();
    }
    if (etat.boucliers > 0) {
      c.strokeStyle = "rgba(90,140,220,0.85)"; c.lineWidth = 2.5;
      for (let k = 0; k < Math.min(3, etat.boucliers); k++) { c.beginPath(); c.arc(x, y - 28, 34 + k * 5, 0, Math.PI * 2); c.stroke(); }
    }
    if (etat.suivante.survoler) {
      c.strokeStyle = COULEURS.encre; c.lineWidth = 2;
      for (const [dx, dy] of [[-14, -70], [4, -78], [20, -68]]) {
        const bx = x + dx, by = y + dy + Math.sin(m.phase * 3 + dx) * 2;
        c.beginPath(); c.moveTo(bx - 6, by - 3); c.quadraticCurveTo(bx - 3, by - 5, bx, by); c.quadraticCurveTo(bx + 3, by - 5, bx + 6, by - 3); c.stroke();
      }
    }
    c.translate(x, y); c.scale(s, s);
    const p = Math.sin(m.phase) * 4, vent = Math.sin(this.temps * 2.2) * 2;
    // cape
    c.fillStyle = "#4d1019";
    c.beginPath(); c.moveTo(-9, -36); c.quadraticCurveTo(-18 - vent, -14, -15 - vent, -3); c.lineTo(15 + vent, -3); c.quadraticCurveTo(18 + vent, -14, 9, -36); c.closePath(); c.fill();
    c.strokeStyle = COULEURS.encre; c.lineWidth = 4; c.lineCap = "round";
    c.beginPath(); c.moveTo(-6, -6); c.lineTo(-6 + p * 0.4, 0); c.moveTo(6, -6); c.lineTo(6 - p * 0.4, 0); c.stroke();
    const robe = c.createLinearGradient(0, -36, 0, -6);
    robe.addColorStop(0, "#2d5487"); robe.addColorStop(1, COULEURS.bleu);
    c.fillStyle = robe;
    c.beginPath(); c.moveTo(-13, -6); c.lineTo(13, -6); c.lineTo(5, -36); c.lineTo(-5, -36); c.closePath(); c.fill();
    c.strokeStyle = COULEURS.or; c.lineWidth = 1; c.beginPath(); c.moveTo(-12, -9); c.lineTo(12, -9); c.stroke();
    c.strokeStyle = "#2d5487"; c.lineWidth = 5;
    c.beginPath(); c.moveTo(-6, -32); c.lineTo(-14 - p * 0.6, -18); c.moveTo(6, -32); c.lineTo(14 + p * 0.6, -18); c.stroke();
    // bâton
    c.strokeStyle = "#7a5530"; c.lineWidth = 2.5; c.beginPath(); c.moveTo(16 + p * 0.6, -16); c.lineTo(19 + p * 0.6, -50); c.stroke();
    c.fillStyle = "#f3d58a"; c.beginPath(); c.arc(19 + p * 0.6, -52, 3.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#e9cfa6"; c.beginPath(); c.arc(0, -41, 7, 0, Math.PI * 2); c.fill();
    if (etat.parure) { c.fillStyle = COULEURS.or; c.beginPath(); c.arc(0, -33, 2.6, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = COULEURS.bordeaux;
    c.beginPath(); c.ellipse(0, -45, 13, 4, 0, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.moveTo(-8, -46); c.lineTo(8, -46); c.quadraticCurveTo(4, -60, 6 + vent, -72); c.closePath(); c.fill();
    c.fillStyle = COULEURS.or; c.font = "9px serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("★", 1, -55);
    c.restore();
  }

  eclats(c, dt) {
    if (!this.particules.length) return;
    c.save();
    for (const q of this.particules) {
      q.vie -= dt; q.x += q.vx * dt; q.a += q.va * dt; q.va -= 260 * dt;
      c.globalAlpha = Math.max(0, Math.min(1, q.vie * 1.5));
      c.fillStyle = q.couleur;
      c.beginPath(); c.arc(q.x, this.y(q.a), 2.4, 0, Math.PI * 2); c.fill();
    }
    this.particules = this.particules.filter(q => q.vie > 0);
    c.restore();
  }

  textesFlottants(c, dt) {
    c.save(); c.font = "bold 17px 'EB Garamond', serif"; c.textAlign = "center"; c.textBaseline = "middle";
    for (const f of this.flottants) {
      f.vie -= dt;
      const montee = this.mouvementReduit ? 0 : (1.8 - f.vie) * 40;
      const y = this.y(f.a) - 70 - montee - f.decalage * 20;
      c.globalAlpha = Math.max(0, Math.min(1, f.vie));
      c.lineWidth = 3.5; c.strokeStyle = "rgba(30,20,30,0.85)"; c.strokeText(f.texte, xVoie(f.x) + 46, y);
      c.fillStyle = f.couleur; c.fillText(f.texte, xVoie(f.x) + 46, y);
    }
    this.flottants = this.flottants.filter(f => f.vie > 0);
    c.restore();
  }

  voiles(c, etat, dt) {
    const W = this.W, H = this.H, m = etat.minuteurs;
    if (m.aveuglement > 0) {
      const g = c.createRadialGradient(W / 2, H * 0.7, 40, W / 2, H * 0.7, H * 0.8);
      g.addColorStop(0, "rgba(20,16,30,0)"); g.addColorStop(1, "rgba(20,16,30,0.8)");
      c.fillStyle = g; c.fillRect(0, 0, W, H);
    }
    if (m.retrait > 0) {
      c.fillStyle = "rgba(42,36,32,0.42)"; c.fillRect(0, 0, W, H);
      this.etiquette(c, W / 2, H * 0.35, `Retrait : ${m.retrait.toFixed(1)} s`);
    }
    if (this.bandeau) {
      this.bandeau.vie -= dt;
      const b = this.bandeau, t = Math.max(0, Math.min(1, b.vie, (2.6 - b.vie) * 3));
      c.save(); c.globalAlpha = t;
      const y = H * 0.14;
      const g = c.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0, "rgba(253,248,236,0)"); g.addColorStop(0.2, "rgba(253,248,236,.95)"); g.addColorStop(0.8, "rgba(253,248,236,.95)"); g.addColorStop(1, "rgba(253,248,236,0)");
      c.fillStyle = g; c.fillRect(0, y, W, b.sous ? 70 : 54);
      c.fillStyle = COULEURS.or; c.fillRect(W * 0.2, y, W * 0.6, 1.5); c.fillRect(W * 0.2, y + (b.sous ? 70 : 54) - 1.5, W * 0.6, 1.5);
      c.fillStyle = COULEURS.bordeaux; c.font = "bold 24px 'Cinzel', serif"; c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText(b.texte, W / 2, y + 27);
      if (b.sous) { c.font = "italic 600 18px 'EB Garamond', serif"; c.fillStyle = COULEURS.bleu; c.fillText(b.sous, W / 2, y + 52); }
      c.restore();
      if (b.vie <= 0) this.bandeau = null;
    }
  }

  carteEnGrand(c, dt) {
    const r = this.revelation;
    if (!r) return;
    r.vie -= dt;
    if (r.vie <= 0) { this.revelation = null; return; }
    const total = this.mouvementReduit ? 0.9 : 1.15;
    const t = 1 - r.vie / total;                    // 0 → 1
    const entree = Math.min(1, t / 0.25), sortie = Math.max(0, (t - 0.7) / 0.3);
    const echelle = 1.6 + 0.4 * (1 - Math.pow(1 - entree, 3)) - sortie * 0.8;
    const retourne = this.mouvementReduit ? 1 : Math.min(1, t / 0.18);   // la carte se retourne
    c.save();
    c.globalAlpha = 1 - sortie;
    c.translate(this.W / 2, this.H * 0.42);
    const g = c.createRadialGradient(0, 0, 10, 0, 0, 150);
    g.addColorStop(0, hexA(r.couleur.length === 7 ? r.couleur : "#f3d58a", 0.55)); g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, 150, 0, Math.PI * 2); c.fill();
    c.scale(echelle * Math.max(0.05, Math.abs(Math.cos((1 - retourne) * Math.PI / 2))), echelle);
    if (retourne < 0.5 && !this.mouvementReduit) dessinerDos(c, -CL / 2, -CH / 2);
    else dessinerFace(c, CARTE_PAR_ID[r.id], -CL / 2, -CH / 2);
    c.restore();
  }
}

/** Motifs de décor par famille. */
function motif(c, famille, x, y, r, accent, sol, t) {
  c.fillStyle = accent; c.strokeStyle = accent; c.lineWidth = 1.4;
  switch (famille) {
    case "soleil":
      c.beginPath(); c.arc(x, y, r * 0.45, 0, Math.PI * 2); c.fill();
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + t * 0.2; c.beginPath(); c.moveTo(x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6); c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); c.stroke(); }
      break;
    case "lune":
      c.beginPath(); c.arc(x, y, r * 0.6, 0.4, Math.PI * 2 - 0.4); c.arc(x + r * 0.3, y, r * 0.45, Math.PI * 2 - 0.6, 0.6, true); c.fill();
      break;
    case "mercure": case "jupiter":
      for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(x + (i - 1) * r * 0.55, y + (i % 2) * r * 0.2, r * 0.45, Math.PI, 0); c.fill(); }
      break;
    case "venus":
      for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5; c.beginPath(); c.arc(x + Math.cos(a) * r * 0.4, y + Math.sin(a) * r * 0.4, r * 0.3, 0, Math.PI * 2); c.fill(); }
      break;
    case "mars":
      c.beginPath(); c.moveTo(x, y - r); c.quadraticCurveTo(x + r * 0.7, y, x, y + r * 0.4); c.quadraticCurveTo(x - r * 0.7, y, x, y - r); c.fill();
      break;
    case "saturne":
      c.beginPath(); c.ellipse(x, y, r * 0.5, r * 0.5, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(x, y, r, r * 0.3, -0.3, 0, Math.PI * 2); c.stroke();
      break;
    default:
      c.beginPath(); c.arc(x, y, r * 0.18, 0, Math.PI * 2); c.fill();
  }
}

function marque(c, cx, cy, texte) {
  c.font = "italic 600 15px 'EB Garamond', serif"; c.textAlign = "center"; c.textBaseline = "middle";
  const l = c.measureText(texte).width + 14;
  c.fillStyle = "rgba(30,22,30,0.78)"; arrondi(c, cx - l / 2, cy - 10, l, 20, 6); c.fill();
  c.fillStyle = COULEURS.creme; c.fillText(texte, cx, cy);
}
