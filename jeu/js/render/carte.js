// Dessin d'une carte (face et dos), commun au Chemin, au Duel, au carnet et à la planche.
// Une carte occupe un rectangle de CONFIG.carteL × CONFIG.carteH à partir de (x, y).
import { CONFIG, COULEURS } from "../config.js";
import { ILLUSTRATIONS } from "./illustrations.js";

const CL = CONFIG.carteL, CH = CONFIG.carteH;

/** Couleur de famille : un liseré, le glyphe en pied de carte. */
export const FAMILLES = {
  preambule: { couleur: "#7A1F2B", glyphe: "⚷" },
  soleil: { couleur: "#b8862a", glyphe: "☉" },
  lune: { couleur: "#4f6290", glyphe: "☽" },
  mercure: { couleur: "#2f7d73", glyphe: "☿" },
  venus: { couleur: "#a8495e", glyphe: "♀" },
  mars: { couleur: "#a53b22", glyphe: "♂" },
  jupiter: { couleur: "#40549a", glyphe: "♃" },
  saturne: { couleur: "#57514a", glyphe: "♄" },
  hors: { couleur: "#2b5fae", glyphe: "◆" }
};

export function arrondi(c, x, y, l, h, r) {
  c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + l - r, y); c.quadraticCurveTo(x + l, y, x + l, y + r);
  c.lineTo(x + l, y + h - r); c.quadraticCurveTo(x + l, y + h, x + l - r, y + h); c.lineTo(x + r, y + h);
  c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath();
}

/** Écrit un texte sur plusieurs lignes centrées ; renvoie le nombre de lignes. */
export function ligneMultiple(c, texte, x, y, max, hl) {
  // Coupe aux espaces et après les traits d'union (PENSÉE-AMITIÉ)
  const mots = texte.split(" ").flatMap(m => m.split(/(?<=-)/)); let ligne = "", lignes = [];
  for (const m of mots) { const t = !ligne ? m : ligne.endsWith("-") ? ligne + m : ligne + " " + m; if (c.measureText(t).width > max && ligne) { lignes.push(ligne); ligne = m; } else ligne = t; }
  lignes.push(ligne);
  lignes.forEach((l, i) => c.fillText(l, x, y + i * hl - (lignes.length - 1) * hl / 2, max));
  return lignes.length;
}

function cadreDore(c, x, y) {
  const g = c.createLinearGradient(x, y, x + CL, y + CH);
  g.addColorStop(0, "#e4c675"); g.addColorStop(0.45, "#a9832f"); g.addColorStop(1, "#e0bd62");
  c.fillStyle = g; arrondi(c, x, y, CL, CH, 9); c.fill();
}

/** Face d'une carte. */
export function dessinerFace(c, carte, x, y) {
  const bleue = carte.id === 0;
  const fam = FAMILLES[carte.famille];
  c.save();
  cadreDore(c, x, y);
  // parchemin (ou fond bleu uni)
  const p = c.createLinearGradient(x, y, x, y + CH);
  if (bleue) { p.addColorStop(0, "#3a72c4"); p.addColorStop(1, "#1f4d8f"); }
  else { p.addColorStop(0, "#fdf8ec"); p.addColorStop(1, "#eedfbd"); }
  c.fillStyle = p; arrondi(c, x + 3, y + 3, CL - 6, CH - 6, 7); c.fill();
  // filet intérieur
  c.strokeStyle = bleue ? "rgba(247,241,227,.6)" : fam.couleur; c.lineWidth = 1;
  arrondi(c, x + 6, y + 6, CL - 12, CH - 12, 5); c.stroke();

  if (!bleue) {
    // halo derrière l'image, à la couleur de la famille
    const h = c.createRadialGradient(x + CL / 2, y + 50, 2, x + CL / 2, y + 50, 30);
    h.addColorStop(0, hexA(fam.couleur, 0.22)); h.addColorStop(1, hexA(fam.couleur, 0));
    c.fillStyle = h; c.fillRect(x + 8, y + 20, CL - 16, 60);
    // médaillon du numéro
    c.fillStyle = "#fdf8ec"; c.strokeStyle = "#a9832f"; c.lineWidth = 1.5;
    c.beginPath(); c.arc(x + CL / 2, y + 13, 9, 0, Math.PI * 2); c.fill(); c.stroke();
    c.fillStyle = COULEURS.bordeaux; c.font = "bold 10px 'Cinzel', serif"; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText(String(carte.id), x + CL / 2, y + 13.5);
  }
  const encre = bleue ? COULEURS.creme : COULEURS.bordeaux;
  c.fillStyle = encre; c.strokeStyle = encre;
  const dessin = ILLUSTRATIONS[carte.id];
  if (dessin) { c.save(); dessin(c, x + CL / 2, y + 50, 44); c.restore(); }
  else if (bleue) { c.font = "28px 'EB Garamond', serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("◆", x + CL / 2, y + 50); }

  // bandeau du nom
  c.font = "bold 9.5px 'Cinzel', serif"; c.textAlign = "center"; c.textBaseline = "middle";
  const yb = y + 86;
  c.fillStyle = bleue ? "rgba(247,241,227,.18)" : COULEURS.bordeaux;
  c.beginPath(); c.moveTo(x + 7, yb - 10); c.lineTo(x + CL - 7, yb - 10); c.lineTo(x + CL - 11, yb); c.lineTo(x + CL - 7, yb + 10);
  c.lineTo(x + 7, yb + 10); c.lineTo(x + 11, yb); c.closePath(); c.fill();
  c.fillStyle = COULEURS.creme;
  if (c.measureText(carte.nom.toUpperCase()).width > CL - 22) c.font = "bold 7.5px 'Cinzel', serif";
  ligneMultiple(c, carte.nom.toUpperCase(), x + CL / 2, yb, CL - 22, 8);

  c.font = "italic 600 13.5px 'EB Garamond', serif"; c.fillStyle = bleue ? COULEURS.creme : COULEURS.bleu;
  ligneMultiple(c, carte.motCle, x + CL / 2, y + 108, CL - 12, 12);
  c.font = "11px 'EB Garamond', serif"; c.fillStyle = bleue ? COULEURS.creme : fam.couleur;
  c.fillText(fam.glyphe, x + CL / 2, y + CH - 11);
  if (carte.forte) {
    c.fillStyle = COULEURS.bordeaux; arrondi(c, x + CL - 30, y + CH - 18, 24, 11, 3); c.fill();
    c.fillStyle = "#f3d58a"; c.font = "bold 6.5px 'Cinzel', serif"; c.fillText("FORTE", x + CL - 18, y + CH - 12.3);
  }
  c.restore();
}

/** Dos d'une carte : `glyphe` (planète) et `legende` facultatifs. */
export function dessinerDos(c, x, y, glyphe = "✶", legende = "") {
  c.save();
  cadreDore(c, x, y);
  const g = c.createLinearGradient(x, y, x + CL, y + CH);
  g.addColorStop(0, "#8a2433"); g.addColorStop(1, "#4d1019");
  c.fillStyle = g; arrondi(c, x + 3, y + 3, CL - 6, CH - 6, 7); c.fill();
  // treillis doré
  c.save(); arrondi(c, x + 7, y + 7, CL - 14, CH - 14, 5); c.clip();
  c.strokeStyle = "rgba(228,198,117,.28)"; c.lineWidth = 1;
  for (let k = -CH; k < CL + CH; k += 12) {
    c.beginPath(); c.moveTo(x + k, y); c.lineTo(x + k + CH, y + CH); c.stroke();
    c.beginPath(); c.moveTo(x + k, y + CH); c.lineTo(x + k + CH, y); c.stroke();
  }
  c.restore();
  c.strokeStyle = "#e4c675"; c.lineWidth = 1; arrondi(c, x + 7, y + 7, CL - 14, CH - 14, 5); c.stroke();
  // médaillon central
  c.fillStyle = "#4d1019"; c.strokeStyle = "#e4c675"; c.lineWidth = 2;
  c.beginPath(); c.arc(x + CL / 2, y + CH / 2 - 4, 22, 0, Math.PI * 2); c.fill(); c.stroke();
  c.fillStyle = "#f3d58a"; c.font = "28px 'EB Garamond', serif"; c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText(glyphe, x + CL / 2, y + CH / 2 - 3);
  if (legende) { c.font = "italic 600 13px 'EB Garamond', serif"; c.fillText(legende, x + CL / 2, y + CH - 18); }
  c.restore();
}

/** Couleur #rrggbb avec transparence. */
export function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Peint une carte dans un canvas à la taille d'une carte (densité de l'écran comprise). */
export function peindreDansCanvas(canvas, carte, face = true) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  canvas.width = CL * dpr; canvas.height = CH * dpr;
  const c = canvas.getContext("2d");
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, CL, CH);
  if (face) dessinerFace(c, carte, 0, 0); else dessinerDos(c, 0, 0);
}
