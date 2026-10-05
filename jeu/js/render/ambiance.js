// L'ambiance du tapis : de fines particules qui dérivent lentement, selon le ciel du duel (la planète) et le terrain
// que chaque joueur a posé de son côté. Elles naissent et s'effacent en fondu, sans jamais clignoter.
// Décoratif : rien ne change au jeu. Avec « animations réduites », un seul dessin immobile.

const TAU = Math.PI * 2;
const h = (a, b) => a + Math.random() * (b - a);

// sorte de particule : [couleur (r,g,b), taille, vitesse x, vitesse y, nombre, forme]
const CIELS = {
  soleil: { c: [255, 214, 130], t: [1, 2.4], vx: [-4, 4], vy: [-14, -5], n: 26, forme: "point" },        // poussière d'or qui monte
  lune: { c: [190, 215, 255], t: [1.2, 3.2], vx: [-3, 3], vy: [-12, -4], n: 24, forme: "bulle" },        // bulles d'argent
  mercure: { c: [200, 250, 240], t: [8, 18], vx: [12, 26], vy: [-2, 2], n: 12, forme: "souffle" },      // souffles de vent
  venus: { c: [255, 170, 200], t: [2.5, 4.5], vx: [-6, 6], vy: [5, 13], n: 16, forme: "petale" },       // pétales qui tombent
  mars: { c: [255, 130, 50], t: [1, 2.2], vx: [-5, 5], vy: [-20, -8], n: 26, forme: "braise" },         // braises qui montent
  jupiter: { c: [175, 195, 255], t: [1, 2], vx: [-8, 8], vy: [-6, 6], n: 22, forme: "point" },          // étincelles bleues
  saturne: { c: [190, 175, 155], t: [1, 2.6], vx: [-2, 2], vy: [3, 9], n: 26, forme: "point" }          // poussière qui retombe
};
const LIEUX = {
  9: { c: [150, 220, 110], t: [2.5, 4.5], vx: [-8, 8], vy: [3, 9], n: 10, forme: "feuille" },          // Campagne : feuilles
  16: { c: [255, 150, 60], t: [1, 2.2], vx: [-4, 4], vy: [-16, -7], n: 12, forme: "braise" },          // Pénates : braises de l'âtre
  30: { c: [255, 220, 130], t: [1, 2], vx: [-3, 3], vy: [-6, 6], n: 12, forme: "point" },              // Table : poussière d'or
  52: { c: [200, 200, 215], t: [1, 2.4], vx: [-2, 2], vy: [2, 6], n: 12, forme: "point" }              // Cloître : poussière de pierre
};

export class Ambiance {
  constructor(conteneur) {
    this.conteneur = conteneur;
    this.canvas = document.createElement("canvas");
    this.canvas.className = "ambiance";
    this.canvas.setAttribute("aria-hidden", "true");
    conteneur.prepend(this.canvas);
    this.c = this.canvas.getContext("2d");
    this.p = [];
    this.cle = "";
    this.reduit = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    this.ajuster();
    if (window.ResizeObserver) new ResizeObserver(() => this.ajuster()).observe(conteneur);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) this.lancer(); });
  }

  ajuster() {
    const l = this.conteneur.clientWidth, H = this.conteneur.clientHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (!l || !H) return;
    this.l = l; this.h = H;
    this.canvas.width = Math.round(l * dpr); this.canvas.height = Math.round(H * dpr);
    this.c.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (this.reduit) this.dessiner(0);
  }

  /** Le ciel du duel (famille) et les terrains des deux joueurs ([vous, adversaire]). */
  regler(ciel, lieux = [null, null]) {
    const cle = `${ciel}|${lieux[0]}|${lieux[1]}`;
    if (cle === this.cle) return;
    this.cle = cle;
    this.sortes = [];
    if (CIELS[ciel]) this.sortes.push({ ...CIELS[ciel], zone: [0, 1] });
    // la moitié du bas est la vôtre, celle du haut est celle de l'adversaire
    if (LIEUX[lieux[0]]) this.sortes.push({ ...LIEUX[lieux[0]], zone: [0.5, 1] });
    if (LIEUX[lieux[1]]) this.sortes.push({ ...LIEUX[lieux[1]], zone: [0, 0.5] });
    // les particules des sortes qui ne sont plus là s'effacent d'elles-mêmes
    for (const q of this.p) {
      const m = this.sortes.find(s => s.c === q.s.c && s.zone[0] === q.s.zone[0]);
      if (m) q.s = m; else q.vie = Math.min(q.vie, q.age + 1.5);
    }
    this.lancer();
  }

  naitre(s, partout = false) {
    const y0 = s.zone[0] * this.h, y1 = s.zone[1] * this.h;
    return { s, x: h(0, this.l), y: partout ? h(y0, y1) : s.vy[0] < 0 ? y1 : s.vy[0] > 0 ? y0 : h(y0, y1), vx: h(...s.vx), vy: h(...s.vy), t: h(...s.t),
      rot: h(0, TAU), vr: h(-0.6, 0.6), age: 0, vie: h(7, 14), y0, y1 };
  }

  lancer() {
    if (this.boucle || !this.sortes || !this.l) return;
    if (this.reduit) { this.dessiner(0); return; }
    // au premier lancement, les particules sont déjà là (pas d'apparition en masse)
    for (const s of this.sortes) while (this.p.filter(q => q.s === s).length < s.n) { const q = this.naitre(s, true); q.age = h(1.5, q.vie - 1); this.p.push(q); }
    this.dernier = performance.now();
    const pas = t => {
      if (document.hidden) { this.boucle = null; return; }
      const dt = Math.min(0.1, (t - this.dernier) / 1000);
      if (dt >= 1 / 32) { this.dernier = t; this.avancer(dt); this.dessiner(); }
      this.boucle = requestAnimationFrame(pas);
    };
    this.boucle = requestAnimationFrame(pas);
  }

  avancer(dt) {
    for (const q of this.p) {
      q.age += dt; q.x += q.vx * dt + Math.sin(q.age * 0.7 + q.rot) * 3 * dt; q.y += q.vy * dt; q.rot += q.vr * dt;
      if (q.x < -20) q.x = this.l + 20; if (q.x > this.l + 20) q.x = -20;
    }
    this.p = this.p.filter(q => q.age < q.vie && q.y > q.y0 - 30 && q.y < q.y1 + 30);
    for (const s of this.sortes) { const n = this.p.filter(q => q.s === s).length; for (let k = n; k < s.n; k++) if (Math.random() < 0.08) this.p.push(this.naitre(s)); }
  }

  dessiner() {
    const c = this.c;
    c.clearRect(0, 0, this.l, this.h);
    for (const q of this.p) {
      // fondu doux à la naissance et à la fin : ni pop, ni clignotement
      const a = Math.min(1, q.age / 1.5, (q.vie - q.age) / 1.5) * 0.55;
      if (a <= 0) continue;
      const [r, g, b] = q.s.c;
      c.fillStyle = `rgba(${r},${g},${b},${a})`; c.strokeStyle = `rgba(${r},${g},${b},${a})`;
      switch (q.s.forme) {
        case "bulle": c.lineWidth = 0.8; c.beginPath(); c.arc(q.x, q.y, q.t, 0, TAU); c.stroke(); break;
        case "souffle": c.lineWidth = 1.2; c.beginPath(); c.moveTo(q.x - q.t, q.y); c.quadraticCurveTo(q.x, q.y - q.t * 0.3, q.x + q.t, q.y); c.stroke(); break;
        case "petale": case "feuille":
          c.save(); c.translate(q.x, q.y); c.rotate(q.rot); c.beginPath(); c.ellipse(0, 0, q.t, q.t * 0.45, 0, 0, TAU); c.fill(); c.restore(); break;
        case "braise": {
          const gr = c.createRadialGradient(q.x, q.y, 0, q.x, q.y, q.t * 3);
          gr.addColorStop(0, `rgba(255,230,180,${a})`); gr.addColorStop(0.4, `rgba(${r},${g},${b},${a * 0.7})`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
          c.fillStyle = gr; c.beginPath(); c.arc(q.x, q.y, q.t * 3, 0, TAU); c.fill(); break;
        }
        default: c.beginPath(); c.arc(q.x, q.y, q.t, 0, TAU); c.fill();
      }
    }
  }
}
