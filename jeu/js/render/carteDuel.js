// Cartes du Duel, dessinées à la manière des jeux de cartes à duel : cadre selon la sorte de carte
// (apparition ambrée, influence vert-bleu, présage violet, figure d'accord pourpre et or, carte forte dorée),
// nom et attribut planétaire, étoiles de niveau, grande image sur un fond propre à chaque planète, texte
// d'effet, ATK / DEF. Format de base : 150 × 219 (proportions d'une carte à jouer).
import { COULEURS } from "../config.js";
import { CARTE_PAR_ID } from "../data/cartes.js";
import { DUEL } from "../data/duel.js";
import { FIGURES } from "../data/accords.js";
import { ASTRES } from "../data/astres.js";
import { ILLUSTRATIONS } from "./illustrations.js";
import { FAMILLES, arrondi, hexA } from "./carte.js";

export const DL = 150, DH = 219;

const CADRES = {
  apparition: ["#e2a654", "#a8662a", "#6e3c16"],
  forte: ["#fff1b8", "#d4a43c", "#7a5410"],
  influence: ["#3fb3a6", "#1c7d75", "#0d4743"],
  presage: ["#c9599f", "#8c2a68", "#4f0f39"],
  accord: ["#a77ad8", "#5e2f99", "#2a0f52"],
  bleue: ["#5b8fe0", "#2b5fae", "#173a75"],
  astre: ["#fff3c4", "#3b2f8f", "#0c0730"]
};
const NOMS_FAMILLE = { preambule: "Cartes maîtresses", soleil: "Soleil", lune: "Lune", mercure: "Mercure", venus: "Vénus", mars: "Mars", jupiter: "Jupiter", saturne: "Saturne", hors: "Hors jeu" };
const ACCORD_FAM = { couleur: "#7a4bb0", glyphe: "✦" };

const est = id => (id >= 200 ? ASTRES[id] : id >= 100 ? FIGURES[id] : DUEL[id]);
const nom = id => (id >= 200 ? ASTRES[id].nom : id >= 100 ? FIGURES[id].nom : CARTE_PAR_ID[id].nom);
const famille = id => (id >= 200 ? FAMILLES[ASTRES[id].famille] : id >= 100 ? ACCORD_FAM : FAMILLES[CARTE_PAR_ID[id].famille]);

/** Un astre (invocation céleste) : son symbole planétaire immense, ses rayons, son orbite. */
function dessinerAstre(c, id, cx, cy, t) {
  const a = ASTRES[id], fam = FAMILLES[a.famille];
  c.save();
  c.strokeStyle = "rgba(255,240,200,.38)"; c.lineCap = "round";
  for (let k = 0; k < 16; k++) {
    const ang = k * Math.PI / 8, r0 = t * 0.3, r1 = t * (k % 2 ? 0.5 : 0.64);
    c.lineWidth = Math.max(1, t * (k % 2 ? 0.012 : 0.022));
    c.beginPath(); c.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0); c.lineTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1); c.stroke();
  }
  c.strokeStyle = hexA(fam.couleur === "#57514a" ? "#cfc2a8" : fam.couleur, 0.9); c.lineWidth = Math.max(1, t * 0.018);
  c.beginPath(); c.ellipse(cx, cy, t * 0.56, t * 0.17, -0.35, 0, Math.PI * 2); c.stroke();
  const halo = c.createRadialGradient(cx, cy, 0, cx, cy, t * 0.42);
  halo.addColorStop(0, "rgba(255,248,225,.55)"); halo.addColorStop(1, "rgba(255,248,225,0)");
  c.fillStyle = halo; c.beginPath(); c.arc(cx, cy, t * 0.42, 0, Math.PI * 2); c.fill();
  c.shadowColor = "#fff3c4"; c.shadowBlur = t * 0.14; c.fillStyle = "#fff8e6";
  c.font = `${Math.round(t * 0.6)}px 'EB Garamond', serif`; c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText(a.glyphe, cx, cy + t * 0.03);
  c.restore();
}

function lignes(c, texte, max) {
  const mots = texte.split(" "), res = [];
  let l = "";
  for (const m of mots) { const t = l ? l + " " + m : m; if (c.measureText(t).width > max && l) { res.push(l); l = m; } else l = t; }
  if (l) res.push(l);
  return res;
}

/** Fond de l'image, propre à chaque planète. */
function fondArt(c, id, fx, fy, fl, fh, coul) {
  const art = c.createRadialGradient(fx + fl / 2, fy + fh * 0.45, 4, fx + fl / 2, fy + fh / 2, fl * 0.8);
  art.addColorStop(0, hexA(coul, 0.95)); art.addColorStop(0.55, hexA(coul, 0.55)); art.addColorStop(1, "#120a1c");
  c.fillStyle = art; c.fillRect(fx, fy, fl, fh);
  const f = id >= 200 ? ASTRES[id].famille : id >= 100 ? "accord" : CARTE_PAR_ID[id].famille;
  const hasard = k => { const s = Math.sin((id + 1) * 91.7 + k * 12.9898) * 43758.5453; return s - Math.floor(s); };
  c.save();
  if (f === "lune" || f === "saturne" || f === "accord" || f === "preambule") {
    for (let k = 0; k < 26; k++) { c.fillStyle = `rgba(255,250,230,${0.25 + hasard(k) * 0.6})`; c.beginPath(); c.arc(fx + hasard(k + 40) * fl, fy + hasard(k + 80) * fh, 0.4 + hasard(k + 120) * 1.1, 0, Math.PI * 2); c.fill(); }
  }
  if (f === "saturne") { c.strokeStyle = "rgba(255,240,200,.18)"; c.lineWidth = 2; c.beginPath(); c.ellipse(fx + fl / 2, fy + fh / 2, fl * 0.55, fh * 0.16, -0.3, 0, Math.PI * 2); c.stroke(); }
  if (f === "mars") for (let k = 0; k < 18; k++) { c.fillStyle = `rgba(255,${120 + hasard(k) * 100},60,${0.25 + hasard(k + 7) * 0.5})`; c.beginPath(); c.arc(fx + hasard(k + 3) * fl, fy + fh - hasard(k + 9) * fh * 0.7, 0.8 + hasard(k + 5) * 1.6, 0, Math.PI * 2); c.fill(); }
  if (f === "venus") for (let k = 0; k < 10; k++) { c.fillStyle = `rgba(255,210,220,${0.15 + hasard(k) * 0.3})`; c.beginPath(); c.ellipse(fx + hasard(k + 2) * fl, fy + hasard(k + 4) * fh, 3, 1.5, hasard(k) * 3, 0, Math.PI * 2); c.fill(); }
  if (f === "jupiter") for (let k = 0; k < 5; k++) { c.fillStyle = "rgba(255,255,255,.07)"; c.beginPath(); c.ellipse(fx + hasard(k) * fl, fy + 12 + k * 18, 40, 6, 0, 0, Math.PI * 2); c.fill(); }
  if (f === "mercure") { c.strokeStyle = "rgba(220,255,250,.12)"; c.lineWidth = 1; for (let k = 0; k < 9; k++) { c.beginPath(); c.moveTo(fx, fy + k * 12); c.quadraticCurveTo(fx + fl / 2, fy + k * 12 - 10, fx + fl, fy + k * 12); c.stroke(); } }
  if (f === "soleil" || f === "hors" || f === "accord" || f === "preambule") {
    c.strokeStyle = "rgba(255,240,200,.12)"; c.lineWidth = 6;
    for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; c.beginPath(); c.moveTo(fx + fl / 2, fy + fh / 2); c.lineTo(fx + fl / 2 + Math.cos(a) * 120, fy + fh / 2 + Math.sin(a) * 120); c.stroke(); }
  }
  // l'élément de la planète, au pied de l'image
  if (f === "lune") {   // l'eau : trois vagues superposées
    for (let k = 0; k < 3; k++) {
      const base = fy + fh * (0.74 + k * 0.09), amp = fh * (0.035 - k * 0.006);
      c.fillStyle = `rgba(${150 - k * 30},${190 - k * 25},255,${0.2 - k * 0.03})`;
      c.beginPath(); c.moveTo(fx, fy + fh);
      for (let x = 0; x <= fl; x += 4) c.lineTo(fx + x, base - amp * Math.sin(x / (fl * 0.16) + k * 1.7 + hasard(k) * 3));
      c.lineTo(fx + fl, fy + fh); c.closePath(); c.fill();
      c.strokeStyle = `rgba(230,245,255,${0.28 - k * 0.07})`; c.lineWidth = 1;
      c.beginPath(); for (let x = 0; x <= fl; x += 4) c[x ? "lineTo" : "moveTo"](fx + x, base - amp * Math.sin(x / (fl * 0.16) + k * 1.7 + hasard(k) * 3)); c.stroke();
    }
  }
  if (f === "mars") {   // le feu : des langues de flamme qui montent du bas
    for (let k = 0; k < 7; k++) {
      const x = fx + (k + 0.5) * fl / 7 + (hasard(k + 30) - 0.5) * 8, H = fh * (0.18 + hasard(k + 31) * 0.22), l = fl / 9;
      const g = c.createLinearGradient(0, fy + fh, 0, fy + fh - H);
      g.addColorStop(0, "rgba(255,190,80,.32)"); g.addColorStop(1, "rgba(255,80,30,0)");
      c.fillStyle = g; c.beginPath(); c.moveTo(x - l, fy + fh);
      c.quadraticCurveTo(x - l * 0.6, fy + fh - H * 0.6, x + (hasard(k) - 0.5) * l, fy + fh - H);
      c.quadraticCurveTo(x + l * 0.6, fy + fh - H * 0.5, x + l, fy + fh); c.closePath(); c.fill();
    }
  }
  if (f === "saturne") {   // la terre : des strates et des galets
    for (let k = 0; k < 4; k++) {
      c.strokeStyle = `rgba(210,190,160,${0.16 - k * 0.025})`; c.lineWidth = 1.2;
      c.beginPath(); const y = fy + fh * (0.78 + k * 0.06);
      for (let x = 0; x <= fl; x += 6) c[x ? "lineTo" : "moveTo"](fx + x, y + Math.sin(x / 14 + k * 2 + hasard(k)) * 1.6); c.stroke();
    }
    for (let k = 0; k < 9; k++) { c.fillStyle = `rgba(180,160,135,${0.22 + hasard(k + 60) * 0.15})`; c.beginPath(); c.ellipse(fx + hasard(k + 61) * fl, fy + fh * (0.84 + hasard(k + 62) * 0.13), 2 + hasard(k + 63) * 3, 1.3 + hasard(k + 64) * 1.6, hasard(k) * 3, 0, Math.PI * 2); c.fill(); }
  }
  if (f === "jupiter") {   // la foudre, au loin dans les nuées
    c.strokeStyle = "rgba(220,230,255,.16)"; c.lineWidth = 1.4;
    for (let k = 0; k < 2; k++) {
      let x = fx + fl * (0.2 + k * 0.55 + hasard(k + 70) * 0.1), y = fy + 4; c.beginPath(); c.moveTo(x, y);
      for (let n = 0; n < 6; n++) { x += (hasard(k * 10 + n + 71) - 0.5) * 14; y += fh * 0.08; c.lineTo(x, y); } c.stroke();
    }
  }
  // vignette
  const v = c.createRadialGradient(fx + fl / 2, fy + fh / 2, fl * 0.3, fx + fl / 2, fy + fh / 2, fl * 0.75);
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.45)");
  c.fillStyle = v; c.fillRect(fx, fy, fl, fh);
  c.restore();
}

/** Un dégradé d'or poli, en diagonale. */
function orPoli(c, l, h) {
  const g = c.createLinearGradient(0, 0, l, h);
  g.addColorStop(0, "#fff1c4"); g.addColorStop(0.22, "#c9a24a"); g.addColorStop(0.45, "#fbe7a8");
  g.addColorStop(0.7, "#9c7a2c"); g.addColorStop(1, "#f3d58a");
  return g;
}

/** Cadre d'or poli et fleurons aux quatre coins (cartes complètes et compactes). */
function orner(c, l, h, r, fort) {
  c.save();
  c.strokeStyle = orPoli(c, l, h); c.lineWidth = fort ? 3 : 2;
  arrondi(c, 1.5, 1.5, l - 3, h - 3, r); c.stroke();
  c.strokeStyle = "rgba(20,12,30,.55)"; c.lineWidth = 1;
  arrondi(c, 4, 4, l - 8, h - 8, Math.max(2, r - 2)); c.stroke();
  const f = Math.max(3, l * 0.03), o = 3.5;
  c.fillStyle = orPoli(c, l, h);
  for (const [x, y] of [[o, o], [l - o, o], [o, h - o], [l - o, h - o]]) {
    c.beginPath(); c.moveTo(x, y - f); c.lineTo(x + f * 0.45, y); c.lineTo(x, y + f); c.lineTo(x - f * 0.45, y); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(x - f, y); c.lineTo(x, y + f * 0.45); c.lineTo(x + f, y); c.lineTo(x, y - f * 0.45); c.closePath(); c.fill();
  }
  c.restore();
}

/** Liseré d'une fenêtre d'image : un filet d'or et un filet à la couleur de la planète, une ombre intérieure. */
function fenetre(c, x, y, l, h, couleur) {
  c.save();
  const v = c.createRadialGradient(x + l / 2, y + h / 2, Math.min(l, h) * 0.35, x + l / 2, y + h / 2, Math.max(l, h) * 0.75);
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.45)");
  c.fillStyle = v; c.fillRect(x, y, l, h);
  c.strokeStyle = hexA(couleur, 0.9); c.lineWidth = 1.2; c.strokeRect(x + 1.5, y + 1.5, l - 3, h - 3);
  c.strokeStyle = orPoli(c, l, h); c.lineWidth = 1.2; c.strokeRect(x, y, l, h);
  c.restore();
}

/** Encre de l'image : un dégradé crème à or, avec une ombre portée. */
function encre(c, fy, fh) {
  const g = c.createLinearGradient(0, fy, 0, fy + fh);
  g.addColorStop(0, "#fffaf0"); g.addColorStop(1, "#f3d58a");
  c.fillStyle = g; c.strokeStyle = g;
  c.shadowColor = "rgba(0,0,0,.65)"; c.shadowBlur = 6; c.shadowOffsetY = 2;
}

/** Dessine la face d'une carte de duel (ou d'une figure d'accord) à (x, y), à l'échelle `s`. */
export function dessinerCarteDuel(c, id, x = 0, y = 0, s = 1) {
  const x0 = est(id), fam = famille(id);
  const sorte = id >= 200 ? "astre" : id >= 100 ? "accord" : id === 0 ? "bleue" : x0.forte ? "forte" : x0.type;
  const [c1, c2, c3] = CADRES[sorte];
  c.save();
  c.translate(x, y); c.scale(s, s);

  const g = c.createLinearGradient(0, 0, DL, DH);
  g.addColorStop(0, c1); g.addColorStop(0.5, c2); g.addColorStop(1, c3);
  c.fillStyle = g; arrondi(c, 0, 0, DL, DH, 7); c.fill();
  orner(c, DL, DH, 6, sorte === "forte" || sorte === "accord");
  c.save(); arrondi(c, 3, 3, DL - 6, DH - 6, 5); c.clip();
  c.strokeStyle = "rgba(255,255,255,.06)"; c.lineWidth = 1;
  for (let k = -DH; k < DL; k += 6) { c.beginPath(); c.moveTo(k, 0); c.lineTo(k + DH, DH); c.stroke(); }
  c.restore();

  // barre du nom
  const nb = c.createLinearGradient(0, 7, 0, 27);
  nb.addColorStop(0, "#fdf8ec"); nb.addColorStop(1, sorte === "forte" ? "#f3d58a" : "#e6d5ae");
  c.fillStyle = nb; arrondi(c, 7, 7, DL - 14, 20, 3); c.fill();
  c.strokeStyle = "rgba(0,0,0,.35)"; c.lineWidth = 0.8; c.stroke();
  c.fillStyle = COULEURS.encre; c.font = "bold 11px 'Cinzel', serif"; c.textAlign = "left"; c.textBaseline = "middle";
  let n = nom(id);
  while (c.measureText(n).width > DL - 46 && n.length > 4) n = n.slice(0, -2) + "…";
  c.fillText(n, 12, 17.5);
  c.fillStyle = fam.couleur; c.beginPath(); c.arc(DL - 18, 17, 8.5, 0, Math.PI * 2); c.fill();
  c.strokeStyle = "#f3d58a"; c.lineWidth = 1.2; c.stroke();
  c.fillStyle = "#fdf8ec"; c.font = "11px 'EB Garamond', serif"; c.textAlign = "center"; c.fillText(fam.glyphe, DL - 18, 17.5);

  // niveau ou sorte
  if (x0.type === "presage" || x0.type === "influence") {
    c.font = "bold 8px 'Cinzel', serif"; c.fillStyle = "#fdf8ec"; c.textAlign = "right";
    const st = x0.sousType === "equipement" ? " ⚒" : x0.sousType === "continue" ? " ∞" : x0.sousType === "terrain" ? " ⌂" : "";
    c.fillText(x0.type === "presage" ? "[ PRÉSAGE ◈ ]" : `[ INFLUENCE ✦${st} ]`, DL - 10, 34);
  } else {
    for (let k = 0; k < x0.niveau; k++) {
      const sx = DL - 14 - k * 12;
      c.beginPath(); c.arc(sx - 4.5, 34, 5, 0, Math.PI * 2); c.fillStyle = sorte === "accord" ? "#5e2f99" : "#b8322b"; c.fill();
      c.fillStyle = "#ffe9a6"; c.font = "8px serif"; c.textAlign = "center"; c.fillText("★", sx - 4.5, 34.5);
    }
  }

  // image
  const fx = 13, fy = 42, fl = DL - 26, fh = 74;
  c.fillStyle = "#1a1224"; c.fillRect(fx - 2, fy - 2, fl + 4, fh + 4);
  fondArt(c, id, fx, fy, fl, fh, fam.couleur);
  c.save(); c.beginPath(); c.rect(fx, fy, fl, fh); c.clip();
  if (id >= 200) dessinerAstre(c, id, fx + fl / 2, fy + fh / 2, fh * 0.95);
  else if (id >= 100) {
    // la figure d'accord réunit les deux cartes de la règle
    const [a, b] = x0.materiaux.map(m => (Array.isArray(m) ? m[0] : m));
    c.fillStyle = "rgba(243,213,138,.25)"; c.beginPath(); c.arc(fx + fl / 2, fy + fh / 2, 32, 0, Math.PI * 2); c.fill();
    encre(c, fy, fh);
    if (ILLUSTRATIONS[a]) { c.save(); ILLUSTRATIONS[a](c, fx + fl * 0.32, fy + fh * 0.48, 46); c.restore(); }
    encre(c, fy, fh);
    if (ILLUSTRATIONS[b]) { c.save(); ILLUSTRATIONS[b](c, fx + fl * 0.68, fy + fh * 0.52, 46); c.restore(); }
    c.shadowBlur = 0; c.fillStyle = "#f3d58a"; c.font = "16px serif"; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText("✦", fx + fl / 2, fy + fh * 0.5);
  } else {
    c.fillStyle = "rgba(255,255,255,.16)"; c.beginPath(); c.arc(fx + fl / 2, fy + fh / 2, 28, 0, Math.PI * 2); c.fill();
    encre(c, fy, fh);
    const dessin = ILLUSTRATIONS[id];
    if (dessin) { c.save(); dessin(c, fx + fl / 2, fy + fh / 2, 62); c.restore(); }
    else { c.font = "54px 'EB Garamond', serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("◆", fx + fl / 2, fy + fh / 2); }
  }
  c.restore();
  fenetre(c, fx, fy, fl, fh, fam.couleur);

  // texte
  // le texte prend la place : il doit se lire même quand la carte est petite
  const tx = 7, ty = 121, tl = DL - 14, th = DH - 121 - 10;
  const tb = c.createLinearGradient(0, ty, 0, ty + th);
  tb.addColorStop(0, "#fbf3df"); tb.addColorStop(1, "#ead9b2");
  c.fillStyle = tb; arrondi(c, tx, ty, tl, th, 3); c.fill();
  c.strokeStyle = "rgba(0,0,0,.35)"; c.lineWidth = 0.8; c.stroke();
  c.textAlign = "left"; c.textBaseline = "alphabetic";
  c.fillStyle = COULEURS.encre; c.font = "bold 8px 'Cinzel', serif";
  const typeLigne = id >= 200 ? `[ Astre / Invocation céleste ]` : id >= 100 ? `[ Figure d’accord / ${x0.favorable ? "Favorable" : "Néfaste"} ]`
    : x0.type === "apparition" ? `[ ${NOMS_FAMILLE[CARTE_PAR_ID[id].famille]} / Figure${x0.forte ? " / Forte" : ""} ]`
    : x0.type === "presage" ? `[ Présage / ${{ attaque: "Attaque", invocation: "Invocation", influence: "Chaîne" }[x0.declencheur]} ]`
    : `[ Influence${x0.sousType === "equipement" ? " / Équipement" : x0.sousType === "continue" ? " / Continue" : x0.sousType === "terrain" ? " / Terrain" : ""} ]`;
  c.fillText(typeLigne, tx + 4, ty + 10);
  c.fillStyle = "#3a2f28";
  const avecStats = x0.atk != null, place = th - 17 - (avecStats ? 13 : 2);
  // la plus grande taille où tout le texte tient
  let taille = 10.4, ls;
  for (; taille > 7; taille -= 0.4) {
    c.font = `italic 500 ${taille}px 'EB Garamond', serif`;
    ls = lignes(c, x0.texte, tl - 8);
    if (ls.length * taille * 1.04 <= place) break;
  }
  ls.forEach((l, i) => c.fillText(l, tx + 4, ty + 15 + taille + i * taille * 1.04));
  if (avecStats) {
    c.strokeStyle = "rgba(0,0,0,.4)"; c.lineWidth = 0.7; c.beginPath(); c.moveTo(tx + 4, ty + th - 11); c.lineTo(tx + tl - 4, ty + th - 11); c.stroke();
    c.font = "bold 9.5px 'Cinzel', serif"; c.fillStyle = COULEURS.encre; c.textAlign = "right";
    c.fillText(`ATK/${x0.atk}   DEF/${x0.def}`, tx + tl - 4, ty + th - 3);
  }
  c.font = "6px 'Cinzel', serif"; c.fillStyle = "rgba(253,248,236,.85)"; c.textAlign = "left";
  const pied = id >= 200 ? "Invocation céleste · Belline" : id >= 100 ? `Accord ${x0.regles[0].replace(">", " · ").replace("-", " · ")} · Belline` : id === 0 ? "Carte Bleue · Belline" : `N° ${id} · Belline`;
  c.fillText(pied, 9, DH - 4);
  c.restore();
}

/** Dos d'une carte de duel. */
export function dessinerDosDuel(c, x = 0, y = 0, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const g = c.createRadialGradient(DL / 2, DH / 2, 10, DL / 2, DH / 2, DH * 0.7);
  g.addColorStop(0, "#7a2a3a"); g.addColorStop(0.6, "#4a1424"); g.addColorStop(1, "#200810");
  c.fillStyle = g; arrondi(c, 0, 0, DL, DH, 7); c.fill();
  c.strokeStyle = "#e4c675"; c.lineWidth = 2; arrondi(c, 4, 4, DL - 8, DH - 8, 5); c.stroke();
  c.lineWidth = 0.8; arrondi(c, 9, 9, DL - 18, DH - 18, 4); c.stroke();
  c.save(); c.translate(DL / 2, DH / 2);
  c.strokeStyle = "rgba(228,198,117,.35)"; c.lineWidth = 1;
  for (let k = 0; k < 24; k++) { c.rotate(Math.PI / 12); c.beginPath(); c.moveTo(0, 28); c.lineTo(0, 62); c.stroke(); }
  c.fillStyle = "#2a0c16"; c.strokeStyle = "#e4c675"; c.lineWidth = 2;
  c.beginPath(); c.ellipse(0, 0, 30, 40, 0, 0, Math.PI * 2); c.fill(); c.stroke();
  c.fillStyle = "#f3d58a"; c.font = "34px serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("✶", 0, 1);
  c.restore();
  c.fillStyle = "#e4c675"; c.font = "bold 9px 'Cinzel', serif"; c.textAlign = "center";
  c.fillText("BELLINE", DL / 2, DH - 22);
  c.restore();
}

/** L'apparition elle-même : l'image de la carte, lumineuse, sur fond transparent (l'hologramme du terrain). */
/**
 * Hologramme d'une apparition, dessiné une fois pour toutes (aucune animation, aucun filtre CSS : rien ne scintille).
 * Un projecteur au sol, un cône de lumière à la couleur de la planète, la figure lumineuse, de fines lignes de balayage,
 * et un fondu vers le bas pour qu'elle se pose sur sa carte.
 */
export function dessinerHologramme(c, id, taille) {
  const fam = famille(id), T = taille, cx = T / 2, sol = T * 0.97;
  c.save();
  c.clearRect(0, 0, T, T);
  // cône de lumière depuis le projecteur
  const cone = c.createLinearGradient(0, sol, 0, T * 0.08);
  cone.addColorStop(0, hexA(fam.couleur, 0.55)); cone.addColorStop(0.55, hexA(fam.couleur, 0.16)); cone.addColorStop(1, hexA(fam.couleur, 0));
  c.fillStyle = cone;
  c.beginPath(); c.moveTo(cx - T * 0.1, sol); c.lineTo(cx - T * 0.46, T * 0.08); c.lineTo(cx + T * 0.46, T * 0.08); c.lineTo(cx + T * 0.1, sol); c.closePath(); c.fill();
  // halo derrière la figure
  const g = c.createRadialGradient(cx, T * 0.5, 2, cx, T * 0.5, T * 0.45);
  g.addColorStop(0, hexA(fam.couleur, 0.5)); g.addColorStop(0.6, hexA(fam.couleur, 0.14)); g.addColorStop(1, hexA(fam.couleur, 0));
  c.fillStyle = g; c.fillRect(0, 0, T, T);
  // la figure : deux passes, une lueur colorée puis le trait clair
  const figure = (couleur, flou) => {
    c.save();
    c.shadowColor = couleur; c.shadowBlur = flou;
    c.fillStyle = "#fff8e6"; c.strokeStyle = "#fff8e6";
    if (id >= 200) dessinerAstre(c, id, cx, T * 0.48, T * 0.8);
    else if (id >= 100) {
      const [a, b] = FIGURES[id].materiaux.map(m => (Array.isArray(m) ? m[0] : m));
      if (ILLUSTRATIONS[a]) { c.save(); ILLUSTRATIONS[a](c, T * 0.35, T * 0.5, T * 0.56); c.restore(); }
      if (ILLUSTRATIONS[b]) { c.save(); ILLUSTRATIONS[b](c, T * 0.65, T * 0.48, T * 0.56); c.restore(); }
    } else if (ILLUSTRATIONS[id]) ILLUSTRATIONS[id](c, cx, T * 0.5, T * 0.72);
    c.restore();
  };
  figure(fam.couleur, T * 0.12);
  figure("#fff3c4", T * 0.04);
  // lignes de balayage, fixes
  c.globalCompositeOperation = "destination-out";
  c.fillStyle = "rgba(0,0,0,.2)";
  for (let y = 0; y < T; y += 3) c.fillRect(0, y, T, 1);
  // fondu vers le bas
  const fondu = c.createLinearGradient(0, T * 0.68, 0, T);
  fondu.addColorStop(0, "rgba(0,0,0,0)"); fondu.addColorStop(1, "rgba(0,0,0,.92)");
  c.fillStyle = fondu; c.fillRect(0, T * 0.68, T, T * 0.32);
  c.globalCompositeOperation = "source-over";
  // le projecteur au sol
  const p = c.createRadialGradient(cx, sol, 0, cx, sol, T * 0.18);
  p.addColorStop(0, "rgba(255,248,225,.9)"); p.addColorStop(0.4, hexA(fam.couleur, 0.6)); p.addColorStop(1, hexA(fam.couleur, 0));
  c.fillStyle = p; c.beginPath(); c.ellipse(cx, sol, T * 0.18, T * 0.05, 0, 0, Math.PI * 2); c.fill();
  c.restore();
}

/** Peint une carte de duel dans un canvas, à la largeur CSS `largeur`. */

// ---------- Formats lisibles en petit ----------

const borne = (v, min, max) => Math.max(min, Math.min(max, v));

/**
 * Carte compacte, dessinée à sa taille réelle (`l` px de large) avec des textes à taille fixe, pour rester
 * lisible en petit : nom en gros, niveau, image ; en bas l'ATK et la DEF en grands chiffres (ou la sorte de carte).
 * `jeton` : sans bandeau du bas (sur le terrain, les valeurs en jeu s'affichent à part).
 */
export function dessinerCarteCompacte(c, id, l, jeton = false) {
  const h = l * DH / DL, x0 = est(id), fam = famille(id);
  const sorte = id >= 200 ? "astre" : id >= 100 ? "accord" : id === 0 ? "bleue" : x0.forte ? "forte" : x0.type;
  const [c1, c2, c3] = CADRES[sorte];
  c.save();
  const g = c.createLinearGradient(0, 0, l, h);
  g.addColorStop(0, c1); g.addColorStop(0.5, c2); g.addColorStop(1, c3);
  c.fillStyle = g; arrondi(c, 0, 0, l, h, Math.max(4, l * 0.05)); c.fill();
  orner(c, l, h, Math.max(3, l * 0.045), sorte === "forte" || sorte === "accord");

  // bandeau du nom
  const fn = borne(l * 0.105, 10, 16), bh = fn + 8, m = Math.max(3, l * 0.035);
  const nb = c.createLinearGradient(0, m, 0, m + bh);
  nb.addColorStop(0, "#fdf8ec"); nb.addColorStop(1, sorte === "forte" ? "#f3d58a" : "#e6d5ae");
  c.fillStyle = nb; arrondi(c, m, m, l - 2 * m, bh, 3); c.fill();
  const rM = bh * 0.36;
  c.fillStyle = fam.couleur; c.beginPath(); c.arc(l - m - rM - 3, m + bh / 2, rM, 0, Math.PI * 2); c.fill();
  c.fillStyle = "#fdf8ec"; c.font = `${Math.round(rM * 1.5)}px 'EB Garamond', serif`; c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText(fam.glyphe, l - m - rM - 3, m + bh / 2 + 1);
  c.fillStyle = COULEURS.encre; c.textAlign = "left";
  const place = l - 2 * m - 2 * rM - 12;
  let n = nom(id), taille = fn;
  // le nom entier d'abord, en rapetissant un peu ; il n'est coupé qu'en dernier recours
  c.font = `bold ${taille}px 'Cinzel', serif`;
  while (c.measureText(n).width > place && taille > fn * 0.78) { taille -= 0.5; c.font = `bold ${taille}px 'Cinzel', serif`; }
  while (c.measureText(n).width > place && n.length > 3) n = n.slice(0, -2) + "…";
  c.fillText(n, m + 4, m + bh / 2 + 1);

  // image
  const basH = jeton ? 0 : borne(l * 0.2, 18, 30);
  const ax = m, ay = m + bh + 2, al = l - 2 * m, ah = h - ay - m - basH - (jeton ? 0 : 2);
  c.save(); c.beginPath(); c.rect(ax, ay, al, ah); c.clip();
  fondArt(c, id, ax, ay, al, ah, fam.couleur);
  const t = Math.min(al, ah) * 0.82, cx = ax + al / 2, cy = ay + ah / 2;
  if (id >= 200) dessinerAstre(c, id, cx, cy, t * 1.05);
  else if (id >= 100) {
    const [a, b] = x0.materiaux.map(mm => (Array.isArray(mm) ? mm[0] : mm));
    encre(c, ay, ah); if (ILLUSTRATIONS[a]) { c.save(); ILLUSTRATIONS[a](c, cx - al * 0.18, cy, t * 0.7); c.restore(); }
    encre(c, ay, ah); if (ILLUSTRATIONS[b]) { c.save(); ILLUSTRATIONS[b](c, cx + al * 0.18, cy, t * 0.7); c.restore(); }
  } else {
    encre(c, ay, ah);
    if (ILLUSTRATIONS[id]) { c.save(); ILLUSTRATIONS[id](c, cx, cy, t); c.restore(); }
    else { c.font = `${Math.round(t * 0.6)}px 'EB Garamond', serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("◆", cx, cy); }
  }
  c.restore();
  fenetre(c, ax, ay, al, ah, fam.couleur);
  // niveau (étoiles) ou sorte, en surimpression sur l'image
  const pe = borne(l * 0.075, 8, 12);
  if (x0.niveau) {
    c.font = `${pe}px serif`; c.textAlign = "left"; c.textBaseline = "top";
    const txt = "★".repeat(x0.niveau);
    const lt = c.measureText(txt).width + 6;
    c.fillStyle = "rgba(14,10,24,.72)"; arrondi(c, ax + 2, ay + 2, lt, pe + 5, 3); c.fill();
    c.fillStyle = "#ffd76a"; c.fillText(txt, ax + 5, ay + 4);
  } else {
    const st = x0.type === "presage" ? "◈" : x0.sousType === "equipement" ? "⚒" : x0.sousType === "continue" ? "∞" : x0.sousType === "terrain" ? "⌂" : "✦";
    c.font = `bold ${pe + 2}px serif`; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillStyle = "rgba(14,10,24,.72)"; c.beginPath(); c.arc(ax + pe + 2, ay + pe + 2, pe, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#fdf3d8"; c.fillText(st, ax + pe + 2, ay + pe + 3);
  }

  // bandeau du bas
  if (!jeton) {
    const by = h - m - basH;
    c.fillStyle = "rgba(251,243,223,.97)"; arrondi(c, m, by, l - 2 * m, basH, 3); c.fill();
    c.textBaseline = "middle"; c.textAlign = "center";
    if (x0.atk != null) {
      const f = borne(l * 0.1, 10, 17);
      c.font = `900 ${f}px 'Cinzel', serif`;
      c.fillStyle = "#8a1f1f"; c.textAlign = "left"; c.fillText(`${x0.atk}`, m + 5, by + basH / 2 + 1);
      c.fillStyle = "#1f3a5f"; c.textAlign = "right"; c.fillText(`${x0.def}`, l - m - 5, by + basH / 2 + 1);
      c.fillStyle = "#6e6a64"; c.textAlign = "center"; c.font = `bold ${Math.round(f * 0.62)}px 'Cinzel', serif`; c.fillText("ATK · DEF", l / 2, by + basH / 2 + 1);
    } else {
      c.font = `bold ${borne(l * 0.075, 8, 13)}px 'Cinzel', serif`; c.fillStyle = COULEURS.encre;
      const lib = x0.type === "presage" ? "Présage" : x0.sousType === "equipement" ? "Équipement" : x0.sousType === "continue" ? "Continue" : x0.sousType === "terrain" ? "Terrain" : "Influence";
      c.fillText(lib.toUpperCase(), l / 2, by + basH / 2 + 1);
    }
  }
  c.restore();
}

// ---------- Mémoire des dessins ----------
// Dessiner une carte coûte cher (dégradés, ombres, textes) ; chaque dessin est gardé en mémoire et recopié.
const memoire = new Map();
const dprCourant = () => Math.min(window.devicePixelRatio || 1, 2.5);

function image(cle, l, h, dessiner) {
  const dpr = dprCourant(), k = `${cle}|${Math.round(l)}|${dpr}`;
  let img = memoire.get(k);
  if (!img) {
    if (memoire.size > 600) memoire.clear();
    img = document.createElement("canvas");
    img.width = Math.max(1, Math.round(l * dpr)); img.height = Math.max(1, Math.round(h * dpr));
    const c = img.getContext("2d");
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    dessiner(c);
    memoire.set(k, img);
  }
  return img;
}

function recopier(canvas, img) {
  canvas.width = img.width; canvas.height = img.height;
  canvas.getContext("2d").drawImage(img, 0, 0);
}

/**
 * Peint une carte de duel dans un canvas, à la largeur CSS `largeur`.
 * `format` : 'complete' (la vraie carte), 'compacte' (main), 'jeton' (terrain).
 */
export function peindreCarteDuel(canvas, id, face = true, largeur = DL, format = "complete") {
  const h = largeur * DH / DL;
  const f = face ? format : "dos";
  recopier(canvas, image(`v6:${f}:${id}`, largeur, h, c => {
    if (!face) dessinerDosDuel(c, 0, 0, largeur / DL);
    else if (format === "complete") dessinerCarteDuel(c, id, 0, 0, largeur / DL);
    else dessinerCarteCompacte(c, id, largeur, format === "jeton");
  }));
}

/** Peint l'hologramme d'une apparition dans un canvas carré de `taille` px CSS. */
export function peindreHologramme(canvas, id, taille) {
  recopier(canvas, image(`holo3:${id}`, taille, taille, c => dessinerHologramme(c, id, taille)));
}
