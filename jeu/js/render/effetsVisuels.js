// Effets visuels des cartes : un calque transparent posé sur la scène, qui joue une petite animation propre à
// chaque carte (l'Eau déferle en vague, le Feu flambe, l'Accident foudroie, le Départ s'envole en oiseaux...).
// Les effets suivent l'image que nomme la notice (la vague pour l'eau, la tour foudroyée, les oiseaux, la comète...). Ils sont décoratifs : ils ne changent rien au jeu.

import { ILLUSTRATIONS } from "./illustrations.js";

const TAU = Math.PI * 2;
const hasard = (a, b) => a + Math.random() * (b - a);
const ease = t => 1 - Math.pow(1 - t, 3);
const fondu = (p, entree = 0.15, sortie = 0.3) => Math.min(1, p / entree, (1 - p) / sortie);

/** Les effets : { duree (s), init(rect) → état, dessiner(c, rect, p (0 → 1), état, dt) }. */
/** Dessine l'image d'une carte (d'après la notice), lumineuse, centrée en (x, y), de taille t. */
function embleme(c, id, x, y, t, alpha, lueur = "#f3d58a") {
  const dessin = ILLUSTRATIONS[id];
  if (!dessin || alpha <= 0) return;
  c.save();
  c.globalAlpha = Math.min(1, alpha);
  const g = c.createRadialGradient(x, y, 0, x, y, t * 0.75);
  g.addColorStop(0, "rgba(255,248,225,.35)"); g.addColorStop(1, "rgba(255,248,225,0)");
  c.fillStyle = g; c.beginPath(); c.arc(x, y, t * 0.75, 0, TAU); c.fill();
  c.shadowColor = lueur; c.shadowBlur = t * 0.25;
  c.fillStyle = "#fff8e6"; c.strokeStyle = "#fff8e6";
  dessin(c, x, y, t);
  c.restore();
}

const EFFETS = {
  // l'image de la carte monte au centre, puis s'efface
  embleme: {
    duree: 1.6,
    init: () => ({}),
    dessiner(c, r, p, e, dt, o) {
      const t = Math.min(r.w, r.h) * 0.42 * (0.85 + 0.15 * ease(Math.min(1, p * 2)));
      embleme(c, o.id, r.x + r.w / 2, r.y + r.h * (0.55 - 0.08 * ease(p)), t, fondu(p, 0.2, 0.35) * 0.9, o.lueur);
    }
  },
  // un duo : les deux images viennent l'une vers l'autre, se rejoignent, et la lumière éclate
  duo: {
    duree: 2.4,
    init: r => ({ rayons: Array.from({ length: 18 }, (_, k) => ({ a: k * TAU / 18 + hasard(-0.1, 0.1), l: hasard(0.6, 1) })) }),
    dessiner(c, r, p, e, dt, o) {
      const cx = r.x + r.w / 2, cy = r.y + r.h * 0.5, t = Math.min(r.w, r.h) * 0.32;
      const teinte = o.favorable ? "243,213,138" : "190,110,230";
      const q = ease(Math.min(1, p / 0.5)), ecart = r.w * 0.3 * (1 - q);
      const a = fondu(p, 0.12, 0.3);
      // le fil qui relie les deux cartes
      if (p < 0.55) {
        c.strokeStyle = `rgba(${teinte},${0.7 * a})`; c.lineWidth = 3; c.shadowColor = `rgb(${teinte})`; c.shadowBlur = 14;
        c.beginPath(); c.moveTo(cx - ecart, cy); c.quadraticCurveTo(cx, cy - r.h * 0.18 * (1 - q), cx + ecart, cy); c.stroke(); c.shadowBlur = 0;
      }
      embleme(c, o.a, cx - ecart, cy, t * (1 - 0.3 * Math.max(0, (p - 0.4) / 0.6)), a * (p < 0.6 ? 1 : 1 - (p - 0.6) * 2.5), `rgb(${teinte})`);
      embleme(c, o.b, cx + ecart, cy, t * (1 - 0.3 * Math.max(0, (p - 0.4) / 0.6)), a * (p < 0.6 ? 1 : 1 - (p - 0.6) * 2.5), `rgb(${teinte})`);
      if (p > 0.45) {
        const k = (p - 0.45) / 0.55, R = Math.max(r.w, r.h) * 0.6 * ease(k);
        c.globalCompositeOperation = "lighter";
        for (const ray of e.rayons) {
          c.strokeStyle = `rgba(${teinte},${0.5 * (1 - k)})`; c.lineWidth = 3;
          c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(ray.a) * R * ray.l, cy + Math.sin(ray.a) * R * ray.l); c.stroke();
        }
        c.strokeStyle = `rgba(255,248,225,${0.8 * (1 - k)})`; c.lineWidth = 4;
        c.beginPath(); c.arc(cx, cy, R * 0.5, 0, TAU); c.stroke();
        c.globalCompositeOperation = "source-over";
      }
    }
  },
  // un lien lumineux entre deux points (accord sur le terrain)
  // un lien entre deux cartes associées : une corde de lumière qui se tend, des perles qui courent, deux nœuds qui brillent
  lien: {
    duree: 2.4,
    init: () => ({}),
    dessiner(c, r, p, e, dt, o) {
      const [x1, y1, x2, y2] = o.points, a = fondu(p, 0.12, 0.3);
      const teinte = o.favorable ? [243, 213, 138] : [190, 110, 230];
      const tendu = ease(Math.min(1, p * 2.2)), mx = (x1 + x2) / 2, my = Math.min(y1, y2) - 60 * (1.4 - tendu * 0.4);
      const pt = t => { const u = 1 - t; return [u * u * x1 + 2 * u * t * mx + t * t * x2, u * u * y1 + 2 * u * t * my + t * t * y2]; };
      // la corde se déroule d'un bout à l'autre
      c.lineCap = "round";
      for (const [l, al] of [[10, 0.18], [5, 0.55], [2, 1]]) {
        c.strokeStyle = l === 2 ? `rgba(255,250,232,${a * al})` : rgba(teinte, a * al); c.lineWidth = l;
        c.beginPath(); c.moveTo(x1, y1);
        for (let k = 1; k <= 30; k++) { const t = (k / 30) * tendu; const [x, y] = pt(t); c.lineTo(x, y + Math.sin(k * 0.9 + p * 10) * 1.5 * (1 - tendu)); }
        c.stroke();
      }
      // les perles qui courent le long du lien
      if (tendu > 0.9) for (let k = 0; k < 7; k++) {
        const [x, y] = pt((p * 1.8 + k / 7) % 1);
        const g = c.createRadialGradient(x, y, 0, x, y, 7); g.addColorStop(0, `rgba(255,255,240,${a})`); g.addColorStop(1, rgba(teinte, 0));
        c.fillStyle = g; c.beginPath(); c.arc(x, y, 7, 0, TAU); c.fill();
      }
      // les deux nœuds
      for (const [x, y] of [[x1, y1], [x2, y2]]) {
        const R = 14 + 6 * Math.sin(p * 12), g = c.createRadialGradient(x, y, 0, x, y, R);
        g.addColorStop(0, `rgba(255,252,240,${a})`); g.addColorStop(0.5, rgba(teinte, a * 0.6)); g.addColorStop(1, rgba(teinte, 0));
        c.fillStyle = g; c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill();
      }
    }
  },

  vague: {
    duree: 1.8,
    init: r => ({ gouttes: Array.from({ length: 40 }, () => ({ x: hasard(0, 1), y: hasard(0.3, 1), v: hasard(0.4, 1), t: hasard(2, 5) })) }),
    dessiner(c, r, p, e) {
      const front = r.x - r.w * 0.3 + ease(p) * r.w * 1.6, a = fondu(p, 0.1, 0.35);
      c.beginPath(); c.rect(r.x, r.y - r.h * 0.2, r.w, r.h * 1.2); c.clip();
      for (let k = 0; k < 4; k++) {
        const base = r.y + r.h * (0.45 + k * 0.14), amp = r.h * (0.12 - k * 0.02);
        c.beginPath(); c.moveTo(r.x - 20, r.y + r.h + 20);
        for (let x = r.x - 20; x <= front; x += 6) {
          const y = base - amp * Math.sin((x - front) / 34 + k + p * 9) - (x > front - 80 ? (1 - (front - x) / 80) * amp * 1.4 : 0);
          c.lineTo(x, y);
        }
        c.quadraticCurveTo(front + r.h * 0.25, base, front + r.h * 0.45, r.y + r.h + 20); c.closePath();
        const g = c.createLinearGradient(0, base - amp, 0, r.y + r.h);
        g.addColorStop(0, `rgba(160,215,255,${0.55 * a})`); g.addColorStop(1, `rgba(20,70,150,${0.6 * a})`);
        c.fillStyle = g; c.fill();
      }
      c.fillStyle = `rgba(255,255,255,${0.8 * a})`;
      for (const d of e.gouttes) { const x = r.x + d.x * r.w; if (x < front) { c.beginPath(); c.arc(x, r.y + d.y * r.h - Math.abs(Math.sin(p * 10 * d.v)) * 30, d.t * 0.6, 0, TAU); c.fill(); } }
    }
  },
  flammes: {
    duree: 1.6,
    init: () => ({ p: [] }),
    dessiner(c, r, p, e, dt, o) {
      if (p < 0.75) for (let k = 0; k < 8; k++) e.p.push({ x: r.x + hasard(0.1, 0.9) * r.w, y: r.y + r.h * hasard(0.75, 1), vy: hasard(60, 160), vie: 1, t: hasard(6, 16) });
      c.globalCompositeOperation = "lighter";
      for (const q of e.p) {
        q.vie -= dt * 1.4; q.y -= q.vy * dt; q.x += Math.sin(q.y / 12) * 0.8;
        if (q.vie <= 0) continue;
        const g = c.createRadialGradient(q.x, q.y, 0, q.x, q.y, q.t);
        g.addColorStop(0, `rgba(255,240,180,${q.vie})`); g.addColorStop(0.4, o.couleur || `rgba(255,120,30,${q.vie * 0.8})`); g.addColorStop(1, "rgba(120,20,0,0)");
        c.fillStyle = g; c.beginPath(); c.arc(q.x, q.y, q.t, 0, TAU); c.fill();
      }
      e.p = e.p.filter(q => q.vie > 0);
      c.globalCompositeOperation = "source-over";
    }
  },
  eclair: {
    duree: 1.1,
    init: r => ({ chemins: [0, 1].map(() => { const pts = [[r.x + r.w * hasard(0.3, 0.7), r.y - r.h * 0.6]]; for (let k = 1; k <= 8; k++) pts.push([pts[k - 1][0] + hasard(-25, 25), r.y - r.h * 0.6 + (r.h * 1.2) * k / 8]); return pts; }) }),
    dessiner(c, r, p, e, dt, o) {
      // une lueur qui monte et retombe, sans flash
      const lueur = o.reduit ? 0 : Math.max(0, Math.sin(Math.min(1, p * 1.6) * Math.PI)) * 0.18;
      if (lueur) { c.fillStyle = `rgba(220,235,255,${lueur})`; c.fillRect(r.x, r.y, r.w, r.h); }
      const alpha = Math.sin(p * Math.PI);
      for (const [k, pts] of e.chemins.entries()) {
        const q = Math.min(1, Math.max(0, p * 3 - k * 0.6)), n = Math.max(2, Math.round(pts.length * q));
        c.globalAlpha = alpha; c.strokeStyle = "#fffbe0"; c.lineWidth = 4; c.shadowColor = "#9ad0ff"; c.shadowBlur = 22;
        c.beginPath(); pts.slice(0, n).forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
        c.lineWidth = 1.5; c.strokeStyle = "#ffffff"; c.stroke(); c.shadowBlur = 0;
      }
    }
  },
  oiseaux: {
    duree: 2,
    init: r => ({ o: Array.from({ length: 9 }, () => ({ x: r.x + hasard(0.1, 0.9) * r.w, y: r.y + r.h * hasard(0.5, 1), vx: hasard(40, 110), vy: hasard(-140, -70), t: hasard(7, 13), ph: hasard(0, 6) })) }),
    dessiner(c, r, p, e, dt) {
      c.strokeStyle = `rgba(30,25,40,${fondu(p)})`; c.lineWidth = 2.2; c.lineCap = "round";
      for (const b of e.o) {
        b.x += b.vx * dt; b.y += b.vy * dt; b.ph += dt * 14;
        const a = Math.sin(b.ph) * b.t * 0.5;
        c.beginPath(); c.moveTo(b.x - b.t, b.y - a); c.quadraticCurveTo(b.x - b.t / 2, b.y - b.t * 0.4, b.x, b.y); c.quadraticCurveTo(b.x + b.t / 2, b.y - b.t * 0.4, b.x + b.t, b.y - a); c.stroke();
      }
    }
  },
  vent: {
    duree: 1.6,
    init: r => ({ l: Array.from({ length: 10 }, () => ({ y: r.y + hasard(0.1, 0.9) * r.h, v: hasard(0.8, 1.4), r: hasard(10, 22), d: hasard(0, 0.3) })) }),
    dessiner(c, r, p, e) {
      c.lineCap = "round";
      for (const w of e.l) {
        const q = Math.max(0, Math.min(1, (p - w.d) * 1.6 * w.v));
        if (q <= 0 || q >= 1) continue;
        const x = r.x - 40 + q * (r.w + 80);
        c.strokeStyle = `rgba(230,240,255,${Math.sin(q * Math.PI) * 0.8})`; c.lineWidth = 2.5;
        c.beginPath(); c.moveTo(x - 70, w.y); c.lineTo(x, w.y); c.arc(x, w.y - w.r, w.r, Math.PI / 2, -Math.PI * 0.9, true); c.stroke();
      }
    }
  },
  colombes: {
    duree: 2,
    init: r => ({ o: Array.from({ length: 4 }, (_, k) => ({ x: r.x + r.w * (0.25 + k * 0.17), y: r.y + r.h * 0.85, vy: hasard(-100, -70), ph: hasard(0, 6) })) }),
    dessiner(c, r, p, e, dt) {
      const a = fondu(p);
      const g = c.createRadialGradient(r.x + r.w / 2, r.y + r.h / 2, 5, r.x + r.w / 2, r.y + r.h / 2, r.w * 0.6);
      g.addColorStop(0, `rgba(255,255,240,${0.5 * a})`); g.addColorStop(1, "rgba(255,255,240,0)");
      c.fillStyle = g; c.fillRect(r.x - r.w * 0.2, r.y - r.h * 0.2, r.w * 1.4, r.h * 1.4);
      c.fillStyle = `rgba(255,255,255,${a})`;
      for (const b of e.o) {
        b.y += b.vy * dt; b.ph += dt * 10; const w = Math.sin(b.ph) * 8;
        c.beginPath(); c.ellipse(b.x, b.y, 9, 4.5, 0, 0, TAU); c.fill();
        c.beginPath(); c.moveTo(b.x - 2, b.y); c.quadraticCurveTo(b.x - 10, b.y - 14 - w, b.x + 6, b.y - 10 - w); c.closePath(); c.fill();
      }
    }
  },
  eboulis: {
    duree: 1.7,
    init: r => ({ p: Array.from({ length: 22 }, () => ({ x: r.x + hasard(0, 1) * r.w, y: r.y - hasard(0, r.h * 0.6), vy: hasard(20, 80), t: hasard(5, 14), rot: hasard(0, 6), vr: hasard(-4, 4) })) }),
    dessiner(c, r, p, e, dt) {
      const a = fondu(p, 0.05, 0.25);
      for (const q of e.p) {
        q.vy += 600 * dt; q.y = Math.min(q.y + q.vy * dt, r.y + r.h - q.t / 2); q.rot += q.vr * dt;
        c.save(); c.translate(q.x, q.y); c.rotate(q.rot);
        c.fillStyle = `rgba(110,98,86,${a})`; c.strokeStyle = `rgba(40,34,30,${a})`; c.lineWidth = 1;
        c.beginPath(); c.moveTo(-q.t / 2, -q.t / 3); c.lineTo(q.t / 3, -q.t / 2); c.lineTo(q.t / 2, q.t / 4); c.lineTo(-q.t / 4, q.t / 2); c.closePath(); c.fill(); c.stroke();
        c.restore();
      }
      c.fillStyle = `rgba(160,150,140,${0.3 * a * p})`; c.fillRect(r.x, r.y + r.h * 0.6, r.w, r.h * 0.4);
    }
  },
  cendres: {
    duree: 2,
    init: r => ({ p: Array.from({ length: 60 }, () => ({ x: r.x + hasard(0, 1) * r.w, y: r.y + hasard(-0.2, 0.8) * r.h, vy: hasard(15, 45), t: hasard(1, 3) })) }),
    dessiner(c, r, p, e, dt) {
      const a = fondu(p);
      c.fillStyle = `rgba(70,66,62,${0.35 * a})`; c.fillRect(r.x, r.y, r.w, r.h);
      c.fillStyle = `rgba(200,195,185,${0.8 * a})`;
      for (const q of e.p) { q.y += q.vy * dt; q.x += Math.sin(q.y / 20) * 0.4; c.beginPath(); c.arc(q.x, q.y, q.t, 0, TAU); c.fill(); }
    }
  },
  etincelles: {
    duree: 1.8,
    init: r => ({ p: Array.from({ length: 46 }, () => ({ x: r.x + r.w / 2, y: r.y + r.h / 2, vx: hasard(-220, 220), vy: hasard(-260, 60), t: hasard(2, 5), rot: hasard(0, 6) })) }),
    dessiner(c, r, p, e, dt, o) {
      const a = fondu(p, 0.05, 0.4);
      c.globalCompositeOperation = "lighter";
      for (const q of e.p) {
        q.vy += 240 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.rot += dt * 4;
        c.fillStyle = o.couleur || `rgba(255,215,110,${a})`; c.globalAlpha = a;
        c.save(); c.translate(q.x, q.y); c.rotate(q.rot); etoile(c, q.t * 1.6, q.t * 0.6); c.fill(); c.restore();
      }
      c.globalAlpha = 1; c.globalCompositeOperation = "source-over";
    }
  },
  feuilles: {
    duree: 2,
    init: r => ({ p: Array.from({ length: 24 }, () => ({ x: r.x + hasard(0, 1) * r.w, y: r.y - hasard(0, r.h * 0.5), vy: hasard(40, 90), ph: hasard(0, 6), t: hasard(5, 9) })) }),
    dessiner(c, r, p, e, dt) {
      const a = fondu(p);
      const g = c.createRadialGradient(r.x + r.w / 2, r.y + r.h / 2, 5, r.x + r.w / 2, r.y + r.h / 2, r.w * 0.6);
      g.addColorStop(0, `rgba(160,240,150,${0.35 * a})`); g.addColorStop(1, "rgba(160,240,150,0)");
      c.fillStyle = g; c.fillRect(r.x - 20, r.y - 20, r.w + 40, r.h + 40);
      for (const q of e.p) {
        q.y += q.vy * dt; q.ph += dt * 3; const x = q.x + Math.sin(q.ph) * 18;
        c.save(); c.translate(x, q.y); c.rotate(Math.sin(q.ph) * 0.8);
        c.fillStyle = `rgba(90,170,70,${a})`; c.beginPath(); c.ellipse(0, 0, q.t, q.t * 0.45, 0, 0, TAU); c.fill();
        c.strokeStyle = `rgba(40,90,30,${a})`; c.lineWidth = 1; c.beginPath(); c.moveTo(-q.t, 0); c.lineTo(q.t, 0); c.stroke();
        c.restore();
      }
    }
  },
  miasme: {
    duree: 1.9,
    init: r => ({ b: Array.from({ length: 12 }, () => ({ x: r.x + hasard(0.1, 0.9) * r.w, y: r.y + hasard(0.2, 0.9) * r.h, t: hasard(14, 34), d: hasard(0, 0.4) })) }),
    dessiner(c, r, p, e, dt, o) {
      for (const b of e.b) {
        const q = Math.max(0, p - b.d) / (1 - b.d), a = Math.sin(q * Math.PI) * 0.45;
        if (a <= 0) continue;
        const g = c.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.t * (0.6 + q));
        g.addColorStop(0, o.couleur || `rgba(140,180,60,${a})`); g.addColorStop(1, "rgba(80,40,90,0)");
        c.fillStyle = g; c.beginPath(); c.arc(b.x, b.y - q * 20, b.t * (0.6 + q), 0, TAU); c.fill();
      }
    }
  },
  lune: {
    duree: 2,
    init: r => ({ et: Array.from({ length: 30 }, () => ({ x: r.x + hasard(0, 1) * r.w, y: r.y + hasard(0, 1) * r.h, t: hasard(0.6, 2), ph: hasard(0, 6) })) }),
    dessiner(c, r, p, e) {
      const a = fondu(p);
      c.fillStyle = `rgba(20,30,70,${0.35 * a})`; c.fillRect(r.x, r.y, r.w, r.h);
      for (const s of e.et) { c.fillStyle = `rgba(255,255,255,${a * (0.5 + 0.5 * Math.sin(s.ph + p * 12))})`; c.beginPath(); c.arc(s.x, s.y, s.t, 0, TAU); c.fill(); }
      const cx = r.x + r.w / 2, cy = r.y + r.h * (0.75 - ease(p) * 0.35), R = Math.min(r.w, r.h) * 0.2;
      c.shadowColor = "#cfe0ff"; c.shadowBlur = 30; c.fillStyle = `rgba(240,245,255,${a})`;
      c.beginPath(); c.arc(cx, cy, R, 0.5, TAU - 0.5); c.arc(cx + R * 0.45, cy - R * 0.1, R * 0.82, TAU - 0.75, 0.75, true); c.fill(); c.shadowBlur = 0;
    }
  },
  fumee: {
    duree: 1.9,
    init: r => ({ b: Array.from({ length: 16 }, () => ({ x: r.x + hasard(0, 1) * r.w, y: r.y + r.h * hasard(0.6, 1), t: hasard(18, 40), vy: hasard(-40, -15) })) }),
    dessiner(c, r, p, e, dt, o) {
      const a = fondu(p) * 0.5;
      for (const b of e.b) {
        b.y += b.vy * dt; b.t += dt * 12;
        const g = c.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.t);
        g.addColorStop(0, o.couleur || `rgba(70,30,90,${a})`); g.addColorStop(1, "rgba(20,10,30,0)");
        c.fillStyle = g; c.beginPath(); c.arc(b.x, b.y, b.t, 0, TAU); c.fill();
      }
    }
  },
  chaines: {
    duree: 1.6,
    init: () => ({}),
    dessiner(c, r, p) {
      const a = fondu(p, 0.1, 0.3), n = 9, q = ease(Math.min(1, p * 2));
      c.lineWidth = 3; c.strokeStyle = `rgba(190,190,200,${a})`; c.shadowColor = "rgba(0,0,0,.6)"; c.shadowBlur = 4;
      for (const s of [-1, 1]) for (let k = 0; k < n; k++) {
        const t = k / (n - 1);
        const x = s < 0 ? r.x + t * r.w * q : r.x + r.w - t * r.w * q, y = r.y + r.h * (s < 0 ? 0.25 + t * 0.5 : 0.75 - t * 0.5);
        c.save(); c.translate(x, y); c.rotate((s < 0 ? 0.45 : -0.45) + (k % 2) * Math.PI / 2);
        c.beginPath(); c.ellipse(0, 0, 9, 5, 0, 0, TAU); c.stroke(); c.restore();
      }
      c.shadowBlur = 0;
    }
  },
  sablier: {
    duree: 1.9,
    init: () => ({}),
    dessiner(c, r, p) {
      const a = fondu(p), cx = r.x + r.w / 2, cy = r.y + r.h / 2, H = Math.min(r.h * 0.6, 120), L = H * 0.55;
      c.fillStyle = `rgba(20,14,30,${0.35 * a})`; c.fillRect(r.x, r.y, r.w, r.h);
      c.save(); c.translate(cx, cy); c.rotate(p < 0.2 ? 0 : Math.min(1, (p - 0.2) * 3) * Math.PI);
      c.strokeStyle = `rgba(243,213,138,${a})`; c.lineWidth = 3;
      c.beginPath(); c.moveTo(-L / 2, -H / 2); c.lineTo(L / 2, -H / 2); c.lineTo(3, 0); c.lineTo(L / 2, H / 2); c.lineTo(-L / 2, H / 2); c.lineTo(-3, 0); c.closePath(); c.stroke();
      const s = Math.min(1, p * 1.4);
      c.fillStyle = `rgba(230,190,110,${a})`;
      c.beginPath(); c.moveTo(-L / 2 * (1 - s) + 2, -H / 2 * (1 - s)); c.lineTo(L / 2 * (1 - s) - 2, -H / 2 * (1 - s)); c.lineTo(0, -2); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(-L / 2 + 3, H / 2 - 2); c.lineTo(L / 2 - 3, H / 2 - 2); c.lineTo(0, H / 2 - 2 - s * H * 0.4); c.closePath(); c.fill();
      c.restore();
    }
  },
  chauvesouris: {
    duree: 1.7,
    init: r => ({ o: Array.from({ length: 7 }, (_, k) => ({ x: r.x - 30 - k * 25, y: r.y + r.h * hasard(0.2, 0.8), vx: hasard(260, 360), ph: hasard(0, 6), a: hasard(20, 50) })) }),
    dessiner(c, r, p, e, dt) {
      c.fillStyle = `rgba(25,15,30,${fondu(p)})`;
      for (const b of e.o) {
        b.x += b.vx * dt; b.ph += dt * 18; const y = b.y + Math.sin(b.x / 40) * b.a * 0.4, w = Math.sin(b.ph) * 6;
        c.beginPath(); c.moveTo(b.x, y);
        for (const s of [-1, 1]) { c.moveTo(b.x, y); c.quadraticCurveTo(b.x + s * 9, y - 9 - w, b.x + s * 18, y - 3 - w); c.quadraticCurveTo(b.x + s * 12, y + 1, b.x + s * 6, y + 4); c.lineTo(b.x, y + 2); }
        c.fill();
      }
    }
  },
  roue: {
    duree: 1.9,
    init: () => ({}),
    dessiner(c, r, p) {
      const a = fondu(p), cx = r.x + r.w / 2, cy = r.y + r.h / 2, R = Math.min(r.w, r.h) * 0.32;
      c.save(); c.translate(cx, cy); c.rotate(ease(p) * TAU * 3);
      c.strokeStyle = `rgba(243,213,138,${a})`; c.lineWidth = 4; c.shadowColor = "#f3d58a"; c.shadowBlur = 16;
      c.beginPath(); c.arc(0, 0, R, 0, TAU); c.stroke();
      c.lineWidth = 2; for (let k = 0; k < 8; k++) { const t = k * TAU / 8; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(t) * R, Math.sin(t) * R); c.stroke(); }
      c.restore(); c.shadowBlur = 0;
    }
  },
  comete: {
    duree: 1.3,
    init: () => ({}),
    dessiner(c, r, p) {
      const q = ease(Math.min(1, p * 1.4)), x0 = r.x - r.w * 0.5, y0 = r.y - r.h * 0.6;
      const x = x0 + (r.x + r.w / 2 - x0) * q, y = y0 + (r.y + r.h / 2 - y0) * q, a = fondu(p, 0.05, 0.3);
      const g = c.createLinearGradient(x0, y0, x, y);
      g.addColorStop(0, "rgba(180,220,255,0)"); g.addColorStop(1, `rgba(255,255,255,${a})`);
      c.strokeStyle = g; c.lineWidth = 6; c.lineCap = "round"; c.beginPath(); c.moveTo(x - (x - x0) * 0.6, y - (y - y0) * 0.6); c.lineTo(x, y); c.stroke();
      c.fillStyle = `rgba(255,255,255,${a})`; c.shadowColor = "#bfe0ff"; c.shadowBlur = 24; c.beginPath(); c.arc(x, y, 7, 0, TAU); c.fill(); c.shadowBlur = 0;
      if (p > 0.7) { c.strokeStyle = `rgba(255,255,255,${(1 - p) * 2})`; c.lineWidth = 2; c.beginPath(); c.arc(x, y, (p - 0.7) * 300, 0, TAU); c.stroke(); }
    }
  },
  faisceau: {
    duree: 1.7,
    init: () => ({}),
    dessiner(c, r, p, e, dt, o) {
      const a = fondu(p), x = r.x + r.w * (0.1 + 0.8 * (0.5 + 0.5 * Math.sin(p * Math.PI * 2 - Math.PI / 2)));
      const g = c.createLinearGradient(x - 60, 0, x + 60, 0);
      g.addColorStop(0, "rgba(255,255,220,0)"); g.addColorStop(0.5, o.couleur || `rgba(255,250,210,${0.55 * a})`); g.addColorStop(1, "rgba(255,255,220,0)");
      c.fillStyle = g; c.beginPath(); c.moveTo(x - 10, r.y - r.h * 0.3); c.lineTo(x + 10, r.y - r.h * 0.3); c.lineTo(x + 70, r.y + r.h); c.lineTo(x - 70, r.y + r.h); c.closePath(); c.fill();
    }
  },
  cle: {
    duree: 1.6,
    init: () => ({}),
    dessiner(c, r, p) {
      const a = fondu(p), cx = r.x + r.w / 2, cy = r.y + r.h / 2, s = Math.min(r.w, r.h) / 120;
      c.save(); c.translate(cx, cy); c.scale(s * (0.8 + 0.4 * ease(Math.min(1, p * 2))), s * (0.8 + 0.4 * ease(Math.min(1, p * 2))));
      c.rotate(p < 0.4 ? 0 : Math.min(1, (p - 0.4) * 3) * Math.PI / 2);
      c.strokeStyle = `rgba(243,213,138,${a})`; c.lineWidth = 7; c.shadowColor = "#f3d58a"; c.shadowBlur = 20;
      c.beginPath(); c.arc(-22, 0, 16, 0, TAU); c.stroke();
      c.beginPath(); c.moveTo(-6, 0); c.lineTo(38, 0); c.moveTo(26, 0); c.lineTo(26, 13); c.moveTo(36, 0); c.lineTo(36, 17); c.stroke();
      c.restore(); c.shadowBlur = 0;
    }
  },
  etoiles: {
    duree: 1.7,
    init: () => ({}),
    dessiner(c, r, p) {
      const a = fondu(p), cx = r.x + r.w / 2, cy = r.y + r.h / 2, R = Math.min(r.w, r.h) * (0.15 + 0.25 * ease(p));
      c.save(); c.translate(cx, cy); c.rotate(p * 1.5);
      c.globalCompositeOperation = "lighter";
      for (let k = 0; k < 12; k++) { c.rotate(TAU / 12); c.fillStyle = `rgba(255,230,160,${0.35 * a})`; c.beginPath(); c.moveTo(-3, 0); c.lineTo(0, -R * 1.6); c.lineTo(3, 0); c.fill(); }
      c.fillStyle = `rgba(255,248,220,${a})`; etoile(c, R * 0.5, R * 0.2); c.fill();
      c.restore(); c.globalCompositeOperation = "source-over";
    }
  },
  dome: {
    duree: 1.6,
    init: () => ({}),
    dessiner(c, r, p, e, dt, o) {
      const a = fondu(p), cx = r.x + r.w / 2, cy = r.y + r.h * 0.95, R = Math.min(r.w * 0.6, r.h * 1.1) * ease(Math.min(1, p * 2));
      const g = c.createRadialGradient(cx, cy, Math.max(0, R * 0.6), cx, cy, Math.max(1, R));
      g.addColorStop(0, "rgba(120,170,255,0)"); g.addColorStop(0.85, o.couleur || `rgba(140,190,255,${0.35 * a})`); g.addColorStop(1, `rgba(220,240,255,${0.7 * a})`);
      c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R, Math.PI, 0); c.closePath(); c.fill();
      c.strokeStyle = `rgba(230,245,255,${0.6 * a})`; c.lineWidth = 1;
      for (let k = 1; k < 6; k++) { c.beginPath(); c.arc(cx, cy, R, Math.PI + k * Math.PI / 6 - 0.01, Math.PI + k * Math.PI / 6 + 0.01); c.lineTo(cx, cy); c.stroke(); }
    }
  },
  coeurs: {
    duree: 1.9,
    init: r => ({ p: Array.from({ length: 16 }, () => ({ x: r.x + hasard(0.1, 0.9) * r.w, y: r.y + r.h * hasard(0.7, 1.1), vy: hasard(-110, -60), t: hasard(6, 13), ph: hasard(0, 6) })) }),
    dessiner(c, r, p, e, dt, o) {
      const a = fondu(p);
      for (const q of e.p) {
        q.y += q.vy * dt; q.ph += dt * 3;
        c.fillStyle = o.couleur || `rgba(240,90,120,${a})`;
        coeur(c, q.x + Math.sin(q.ph) * 8, q.y, q.t); c.fill();
      }
    }
  },
  epees: {
    duree: 1.4,
    init: () => ({}),
    dessiner(c, r, p) {
      const a = fondu(p, 0.1, 0.3), cx = r.x + r.w / 2, cy = r.y + r.h / 2, q = ease(Math.min(1, p * 2.2)), L = Math.min(r.w, r.h) * 0.45;
      for (const s of [-1, 1]) {
        c.save(); c.translate(cx + s * (1 - q) * r.w * 0.5, cy); c.rotate(s * (0.7 - q * 0.1));
        c.strokeStyle = `rgba(230,235,245,${a})`; c.lineWidth = 5; c.beginPath(); c.moveTo(0, -L); c.lineTo(0, L * 0.6); c.stroke();
        c.strokeStyle = `rgba(243,213,138,${a})`; c.lineWidth = 4; c.beginPath(); c.moveTo(-12, L * 0.6); c.lineTo(12, L * 0.6); c.moveTo(0, L * 0.6); c.lineTo(0, L * 0.9); c.stroke();
        c.restore();
      }
      if (p > 0.42 && p < 0.7) { c.fillStyle = `rgba(255,240,180,${(0.7 - p) * 3})`; for (let k = 0; k < 10; k++) { const t = k * TAU / 10; c.beginPath(); c.arc(cx + Math.cos(t) * (p - 0.42) * 160, cy + Math.sin(t) * (p - 0.42) * 160, 3, 0, TAU); c.fill(); } }
    }
  },
  ondes: {
    duree: 1.6,
    init: () => ({}),
    dessiner(c, r, p, e, dt, o) {
      const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
      for (let k = 0; k < 4; k++) {
        const q = p * 1.4 - k * 0.15; if (q <= 0 || q >= 1) continue;
        c.strokeStyle = o.couleur || `rgba(243,213,138,${1 - q})`; c.lineWidth = 3;
        c.beginPath(); c.arc(cx, cy, q * Math.max(r.w, r.h) * 0.6, 0, TAU); c.stroke();
      }
    }
  },
  notes: {
    duree: 1.9,
    init: r => ({ p: Array.from({ length: 12 }, () => ({ x: r.x + hasard(0.1, 0.9) * r.w, y: r.y + r.h * hasard(0.7, 1), vy: hasard(-90, -50), ph: hasard(0, 6), g: Math.random() < 0.5 ? "♪" : "♫" })) }),
    dessiner(c, r, p, e, dt) {
      const a = fondu(p);
      c.font = "24px serif"; c.textAlign = "center"; c.fillStyle = `rgba(255,230,170,${a})`; c.shadowColor = "#f3d58a"; c.shadowBlur = 8;
      for (const q of e.p) { q.y += q.vy * dt; q.ph += dt * 4; c.fillText(q.g, q.x + Math.sin(q.ph) * 10, q.y); }
      c.shadowBlur = 0;
    }
  },
  entaille: {
    duree: 0.6,
    init: () => ({}),
    dessiner(c, r, p) {
      const a = 1 - p, cx = r.x + r.w / 2, cy = r.y + r.h / 2, L = Math.max(r.w, r.h) * 0.6 * ease(Math.min(1, p * 3));
      c.strokeStyle = `rgba(255,250,230,${a})`; c.lineWidth = 4; c.shadowColor = "#ffb070"; c.shadowBlur = 14;
      for (const s of [-1, 1]) { c.beginPath(); c.moveTo(cx - L / 2, cy - s * L / 2); c.lineTo(cx + L / 2, cy + s * L / 2); c.stroke(); }
      c.shadowBlur = 0;
    }
  }
};

function etoile(c, R, r) {
  c.beginPath();
  for (let k = 0; k < 10; k++) { const t = -Math.PI / 2 + k * Math.PI / 5, d = k % 2 ? r : R; c.lineTo(Math.cos(t) * d, Math.sin(t) * d); }
  c.closePath();
}
function coeur(c, x, y, r) {
  c.beginPath(); c.moveTo(x, y + r * 0.9);
  c.bezierCurveTo(x - r * 1.3, y, x - r * 0.8, y - r, x, y - r * 0.35);
  c.bezierCurveTo(x + r * 0.8, y - r, x + r * 1.3, y, x, y + r * 0.9); c.closePath();
}


// ---------- Les éléments du combat ----------
// Chaque planète a son élément ; il colore ce que font ses apparitions (attaque, impact, éclats).
export const ELEMENTS = { soleil: "lumiere", lune: "eau", mercure: "air", venus: "fleurs", mars: "feu", jupiter: "foudre", saturne: "terre", preambule: "lumiere", hors: "eau" };
export const TEINTES = {
  lumiere: [255, 214, 120], eau: [110, 178, 255], air: [190, 245, 232], fleurs: [255, 150, 190],
  feu: [255, 118, 40], foudre: [175, 195, 255], terre: [176, 132, 88], accord: [196, 150, 255]
};
/** L'élément d'une famille (planète) ; les figures d'accord ont le leur. */
export const elementDe = famille => ELEMENTS[famille] || "accord";
const rgba = (t, a) => `rgba(${t[0]},${t[1]},${t[2]},${a})`;
const bez = (o, q) => {
  const [x1, y1] = o.de, [x2, y2] = o.vers, mx = (x1 + x2) / 2, my = Math.min(y1, y2) - Math.abs(x2 - x1) * 0.15 - 30, u = 1 - q;
  return [u * u * x1 + 2 * u * q * mx + q * q * x2, u * u * y1 + 2 * u * q * my + q * q * y2];
};
function zigzag(c, x1, y1, x2, y2, n, amp) {
  c.beginPath(); c.moveTo(x1, y1);
  for (let k = 1; k < n; k++) { const t = k / n; c.lineTo(x1 + (x2 - x1) * t + hasard(-amp, amp), y1 + (y2 - y1) * t + hasard(-amp, amp)); }
  c.lineTo(x2, y2); c.stroke();
}
function caillou(c, x, y, t, rot, coul) {
  c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = coul;
  c.beginPath(); c.moveTo(-t, -t * 0.4); c.lineTo(-t * 0.3, -t); c.lineTo(t * 0.8, -t * 0.6); c.lineTo(t, t * 0.3); c.lineTo(t * 0.1, t); c.lineTo(-t * 0.8, t * 0.6); c.closePath(); c.fill();
  c.fillStyle = "rgba(255,255,255,.18)"; c.beginPath(); c.moveTo(-t * 0.3, -t); c.lineTo(t * 0.8, -t * 0.6); c.lineTo(t * 0.1, -t * 0.1); c.closePath(); c.fill();
  c.restore();
}
function petale(c, x, y, t, rot, a) {
  c.save(); c.translate(x, y); c.rotate(rot);
  const g = c.createLinearGradient(-t, 0, t, 0); g.addColorStop(0, `rgba(255,190,215,${a})`); g.addColorStop(1, `rgba(255,120,170,${a})`);
  c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, t, t * 0.45, 0, 0, TAU); c.fill(); c.restore();
}

const EFFETS_ELEMENTS = {
  // le coup part de l'attaquant et file vers sa cible
  projectile: {
    duree: 0.5,
    init: () => ({ p: [], ancien: null }),
    dessiner(c, r, p, e, dt, o) {
      const q = p * p * (3 - 2 * p), [x, y] = bez(o, q), t = TEINTES[o.element] || TEINTES.accord;
      const [px, py] = e.ancien || [x, y]; e.ancien = [x, y];
      const ang = Math.atan2(y - py, x - px);
      // sillage
      for (let k = 0; k < 3; k++) e.p.push({ x: x + hasard(-4, 4), y: y + hasard(-4, 4), vx: hasard(-30, 30), vy: hasard(-30, 30) + (o.element === "eau" ? 40 : o.element === "feu" ? -50 : 0), vie: 1, t: hasard(2, 6), rot: hasard(0, 6) });
      c.globalCompositeOperation = o.element === "terre" ? "source-over" : "lighter";
      for (const s of e.p) {
        s.vie -= dt * 2.6; if (s.vie <= 0) continue;
        s.x += s.vx * dt; s.y += s.vy * dt; s.rot += dt * 6;
        if (o.element === "terre") caillou(c, s.x, s.y, s.t * 0.7, s.rot, `rgba(120,90,60,${s.vie})`);
        else if (o.element === "fleurs") petale(c, s.x, s.y, s.t, s.rot, s.vie);
        else { c.fillStyle = rgba(t, s.vie * 0.8); c.beginPath(); c.arc(s.x, s.y, s.t * s.vie, 0, TAU); c.fill(); }
      }
      e.p = e.p.filter(s => s.vie > 0);
      // la tête du coup
      if (o.element === "foudre") {
        c.strokeStyle = "rgba(235,245,255,.95)"; c.lineWidth = 3; c.shadowColor = rgba(t, 1); c.shadowBlur = 18;
        zigzag(c, o.de[0], o.de[1], x, y, 9, 10); c.lineWidth = 1.2; c.strokeStyle = "#fff"; zigzag(c, o.de[0], o.de[1], x, y, 9, 6); c.shadowBlur = 0;
      } else if (o.element === "lumiere") {
        const g = c.createLinearGradient(o.de[0], o.de[1], x, y); g.addColorStop(0, rgba(t, 0)); g.addColorStop(1, rgba(t, 0.9));
        c.strokeStyle = g; c.lineWidth = 6 + q * 8; c.lineCap = "round"; c.beginPath(); c.moveTo(o.de[0], o.de[1]); c.lineTo(x, y); c.stroke();
      } else if (o.element === "air") {
        c.strokeStyle = rgba(t, 0.8); c.lineWidth = 2.5;
        for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(x - Math.cos(ang) * k * 14, y - Math.sin(ang) * k * 14, 9 - k * 2, ang + 1, ang + 4); c.stroke(); }
      } else if (o.element === "terre") {
        caillou(c, x, y, 13, q * 9, "#7b5a3c");
      }
      const g = c.createRadialGradient(x, y, 0, x, y, o.element === "eau" ? 16 : 20);
      g.addColorStop(0, "rgba(255,255,255,.95)"); g.addColorStop(0.35, rgba(t, 0.9)); g.addColorStop(1, rgba(t, 0));
      c.fillStyle = g;
      c.save(); c.translate(x, y); c.rotate(ang); c.beginPath();
      if (o.element === "eau" || o.element === "feu") c.ellipse(0, 0, 24, 11, 0, 0, TAU); else c.arc(0, 0, 20, 0, TAU);
      c.fill(); c.restore();
      c.globalCompositeOperation = "source-over";
    }
  },
  // l'impact sur la cible, selon l'élément ; `fort` : un coup puissant (plus grand, plus de matière)
  impact: {
    duree: 0.9,
    init: (r, o) => {
      const n = o.fort ? 46 : 28, t = [];
      for (let k = 0; k < n; k++) { const a = hasard(0, TAU), v = hasard(60, o.fort ? 320 : 220); t.push({ x: 0, y: 0, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (o.element === "eau" ? 120 : 0), t: hasard(2, 7), rot: hasard(0, 6), vr: hasard(-8, 8) }); }
      return { p: t, eclair: Array.from({ length: 8 }, () => hasard(-14, 14)) };
    },
    dessiner(c, r, p, e, dt, o) {
      const cx = r.x + r.w / 2, cy = r.y + r.h / 2, t = TEINTES[o.element] || TEINTES.accord, a = 1 - p, R = Math.max(r.w, r.h) * (o.fort ? 1.1 : 0.8);
      // onde
      c.strokeStyle = rgba(t, a * 0.9); c.lineWidth = 3 + 4 * a;
      c.beginPath(); c.arc(cx, cy, R * ease(Math.min(1, p * 1.6)), 0, TAU); c.stroke();
      if (o.element === "feu" || o.element === "lumiere") {
        const g = c.createRadialGradient(cx, cy, 0, cx, cy, R * 0.8 * ease(Math.min(1, p * 2.5)));
        g.addColorStop(0, `rgba(255,250,220,${a})`); g.addColorStop(0.4, rgba(t, a * 0.85)); g.addColorStop(1, rgba(t, 0));
        c.globalCompositeOperation = "lighter"; c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.fill(); c.globalCompositeOperation = "source-over";
      }
      if (o.element === "foudre" && p < 0.45) {
        c.strokeStyle = "rgba(240,248,255,.95)"; c.lineWidth = 4; c.shadowColor = rgba(t, 1); c.shadowBlur = 22;
        c.beginPath(); let y = r.y - R * 1.2, x = cx; c.moveTo(x, y);
        for (const d of e.eclair) { y += (cy - (r.y - R * 1.2)) / 8; x = cx + d; c.lineTo(x, y); }
        c.stroke(); c.shadowBlur = 0;
      }
      if (o.element === "terre") {
        const g = c.createRadialGradient(cx, cy + 10, 0, cx, cy + 10, R);
        g.addColorStop(0, `rgba(150,120,90,${0.55 * a})`); g.addColorStop(1, "rgba(150,120,90,0)");
        c.fillStyle = g; c.beginPath(); c.arc(cx, cy + 10, R, 0, TAU); c.fill();
      }
      for (const s of e.p) {
        s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= 0.96; s.vy = s.vy * 0.96 + (o.element === "eau" || o.element === "terre" ? 520 : o.element === "feu" ? -80 : 60) * dt; s.rot += s.vr * dt;
        const x = cx + s.x, y = cy + s.y;
        if (o.element === "terre") caillou(c, x, y, s.t, s.rot, `rgba(110,82,56,${a})`);
        else if (o.element === "fleurs") petale(c, x, y, s.t * 1.2, s.rot, a);
        else if (o.element === "air") { c.strokeStyle = rgba(t, a * 0.8); c.lineWidth = 2; c.beginPath(); c.arc(x, y, s.t * 2, s.rot, s.rot + 2.5); c.stroke(); }
        else if (o.element === "eau") { c.fillStyle = `rgba(200,230,255,${a})`; c.beginPath(); c.ellipse(x, y, s.t * 0.6, s.t, Math.atan2(s.vy, s.vx) + Math.PI / 2, 0, TAU); c.fill(); }
        else { c.globalCompositeOperation = "lighter"; c.fillStyle = rgba(t, a); c.beginPath(); c.arc(x, y, s.t * (0.4 + a * 0.6), 0, TAU); c.fill(); c.globalCompositeOperation = "source-over"; }
      }
    }
  },
  // une apparition détruite vole en éclats de sa couleur
  eclatsCarte: {
    duree: 1.1,
    init: r => ({ p: Array.from({ length: 22 }, () => ({ x: hasard(0.15, 0.85) * r.w, y: hasard(0.1, 0.9) * r.h, vx: hasard(-160, 160), vy: hasard(-260, -40), t: hasard(5, 13), rot: hasard(0, 6), vr: hasard(-9, 9) })) }),
    dessiner(c, r, p, e, dt, o) {
      const t = TEINTES[o.element] || TEINTES.accord, a = 1 - p;
      for (const s of e.p) {
        s.vy += 640 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.rot += s.vr * dt;
        c.save(); c.translate(r.x + s.x, r.y + s.y); c.rotate(s.rot);
        c.fillStyle = rgba(t, a * 0.95); c.strokeStyle = `rgba(255,243,207,${a})`; c.lineWidth = 1;
        c.beginPath(); c.moveTo(-s.t, -s.t * 0.6); c.lineTo(s.t, -s.t * 0.2); c.lineTo(-s.t * 0.1, s.t); c.closePath(); c.fill(); c.stroke();
        c.restore();
      }
      if (p < 0.3) { c.globalCompositeOperation = "lighter"; c.fillStyle = rgba(t, (0.3 - p) * 2); c.fillRect(r.x, r.y, r.w, r.h); c.globalCompositeOperation = "source-over"; }
    }
  }
};
// la transformation (évolution) : la matière de l'élément s'enroule et monte en spirale, une colonne de lumière, un anneau
EFFETS_ELEMENTS.transformation = {
  duree: 1.6,
  init: () => ({ p: Array.from({ length: 36 }, (_, k) => ({ a: k * TAU / 36 + hasard(0, 0.3), r: hasard(0.8, 1.2), v: hasard(0.8, 1.3), t: hasard(2, 5) })) }),
  dessiner(c, r, p, e, dt, o) {
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2, t = TEINTES[o.element] || TEINTES.accord, R = Math.max(r.w, r.h) * 0.55;
    const monte = ease(Math.min(1, p * 1.4)), a = fondu(p, 0.1, 0.3);
    // colonne de lumière
    const col = c.createLinearGradient(0, cy + R * 0.4, 0, cy - R * 2.2);
    col.addColorStop(0, rgba(t, 0.55 * a)); col.addColorStop(1, rgba(t, 0));
    c.globalCompositeOperation = "lighter";
    c.fillStyle = col; c.fillRect(cx - R * 0.35 * (1 - p * 0.5), cy - R * 2.2, R * 0.7 * (1 - p * 0.5), R * 2.6);
    // la spirale qui se resserre en montant
    for (const s of e.p) {
      const ang = s.a + p * 9 * s.v, rr = R * s.r * (1 - monte * 0.85), y = cy + R * 0.3 - monte * R * 1.6 * s.v * 0.7;
      const x = cx + Math.cos(ang) * rr, yy = y + Math.sin(ang) * rr * 0.35;
      if (o.element === "fleurs") petale(c, x, yy, s.t * 1.3, ang, a);
      else if (o.element === "terre") caillou(c, x, yy, s.t, ang, `rgba(150,115,80,${a})`);
      else { c.fillStyle = rgba(t, a); c.beginPath(); c.arc(x, yy, s.t * (1 - p * 0.5), 0, TAU); c.fill(); }
    }
    // l'anneau et l'éclat de la nouvelle forme
    if (p > 0.55) {
      const q = (p - 0.55) / 0.45;
      c.strokeStyle = `rgba(255,250,230,${1 - q})`; c.lineWidth = 4 * (1 - q) + 1;
      c.beginPath(); c.arc(cx, cy, R * (0.3 + q * 1.3), 0, TAU); c.stroke();
      const g = c.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, `rgba(255,255,245,${(1 - q) * 0.8})`); g.addColorStop(1, rgba(t, 0));
      c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.fill();
    }
    c.globalCompositeOperation = "source-over";
  }
};
Object.assign(EFFETS, EFFETS_ELEMENTS);

/** Les noms des effets disponibles. */
export const NOMS_EFFETS = Object.keys(EFFETS).filter(n => !["embleme", "duo", "lien", "projectile", "impact", "eclatsCarte", "transformation"].includes(n));

/** L'effet de chaque carte (d'après son image) : [effet, couleur facultative]. */
export const EFFET_DE_CARTE = {
  0: ["dome", "rgba(90,140,230,.4)"], 1: ["cle"], 2: ["etoiles"], 3: ["etoiles"], 4: ["etoiles"], 5: ["etincelles"], 6: ["faisceau"],
  7: ["etincelles"], 8: ["dome", "rgba(200,160,110,.35)"], 9: ["feuilles"], 10: ["etincelles"],
  11: ["fumee"], 12: ["oiseaux"], 13: ["vent"], 14: ["faisceau"], 15: ["vague"], 16: ["dome"], 17: ["miasme"],
  18: ["lune"], 19: ["etincelles"], 20: ["faisceau", "rgba(200,230,255,.5)"], 21: ["chauvesouris"], 22: ["faisceau"], 23: ["etincelles"], 24: ["comete"],
  25: ["notes"], 26: ["ondes", "rgba(243,213,138,.7)"], 27: ["coeurs", "rgba(255,200,120,.9)"], 28: ["dome", "rgba(230,150,170,.35)"], 29: ["coeurs"], 30: ["etincelles"], 31: ["flammes", "rgba(255,80,140,.8)"],
  32: ["faisceau", "rgba(255,150,90,.5)"], 33: ["epees"], 34: ["chaines"], 35: ["epees"], 36: ["oiseaux"], 37: ["flammes"], 38: ["eclair"],
  39: ["dome", "rgba(243,213,138,.35)"], 40: ["etincelles", "rgba(255,170,210,.9)"], 41: ["faisceau", "rgba(243,213,138,.5)"], 42: ["lune"], 43: ["ondes"], 44: ["roue"], 45: ["etoiles"],
  46: ["cendres"], 47: ["cendres"], 48: ["sablier"], 49: ["colombes"], 50: ["eboulis"], 51: ["sablier"], 52: ["dome", "rgba(120,110,140,.4)"],
  100: ["cendres"], 101: ["feuilles"], 102: ["oiseaux"], 103: ["eclair"], 104: ["vague"], 105: ["miasme", "rgba(60,30,40,.5)"], 106: ["colombes"],
  107: ["chauvesouris"], 108: ["epees"], 109: ["chaines"], 110: ["etincelles"], 111: ["coeurs"], 112: ["eboulis"], 113: ["epees"], 114: ["miasme"],
  115: ["flammes", "rgba(255,80,140,.8)"], 116: ["fumee"], 117: ["flammes"], 118: ["roue"], 119: ["dome"], 120: ["dome"], 121: ["coeurs", "rgba(150,120,200,.9)"],
  122: ["eclair"], 123: ["etincelles"],
  // les astres (invocation céleste)
  200: ["etoiles"], 201: ["vague"], 202: ["vent"], 203: ["colombes"], 204: ["flammes"], 205: ["eclair"], 206: ["eboulis"]
};

/** Le calque d'effets d'un conteneur (positionné). */
export class Effets {
  constructor(conteneur) {
    this.conteneur = conteneur;
    this.canvas = document.createElement("canvas");
    this.canvas.className = "calque-effets";
    this.canvas.setAttribute("aria-hidden", "true");
    conteneur.appendChild(this.canvas);
    this.c = this.canvas.getContext("2d");
    this.actifs = [];
    this.boucle = null;
    // Avec « animations réduites », les effets jouent quand même (ils sont demandés), mais sans éclair blanc.
    this.reduit = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    this.ajuster();
    if (window.ResizeObserver) new ResizeObserver(() => this.ajuster()).observe(conteneur);
  }

  ajuster() {
    const r = this.conteneur.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.l = r.width; this.h = r.height;
    this.canvas.width = Math.max(1, Math.round(r.width * dpr)); this.canvas.height = Math.max(1, Math.round(r.height * dpr));
    this.c.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /** Rectangle d'un élément, dans les coordonnées du calque. */
  rect(el) {
    if (!el) return { x: 0, y: 0, w: this.l, h: this.h };
    const r = el.getBoundingClientRect(), b = this.conteneur.getBoundingClientRect();
    return { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height };
  }

  /** Joue un effet nommé sur un rectangle (ou un élément). Résout quand il s'achève. */
  jouer(nom, cible = null, options = {}) {
    const def = EFFETS[nom];
    if (!def) return Promise.resolve();
    const r = cible && cible.getBoundingClientRect ? this.rect(cible) : cible || this.rect(null);
    return new Promise(resolve => {
      this.actifs.push({ def, r, options: { ...options, reduit: this.reduit }, etat: def.init(r, options), t: 0, resolve });
      if (!this.boucle) { this.dernier = performance.now(); this.boucle = requestAnimationFrame(t => this.pas(t)); }
    });
  }

  /** L'effet propre à une carte. */
  carte(id, cible = null, avecEmbleme = false) {
    const [nom, couleur] = EFFET_DE_CARTE[id] || ["etincelles"];
    if (avecEmbleme && id < 100) this.jouer("embleme", cible, { id, lueur: couleur ? couleur.replace(/,[\d.]+\)$/, ",1)") : "#f3d58a" });
    return this.jouer(nom, cible, { couleur });
  }

  /** Un duo de cartes (accord) : leurs deux images se rejoignent ; puis l'effet de chacune. */
  duo(a, b, cible, favorable) {
    this.jouer("duo", cible, { a, b, favorable });
    setTimeout(() => { this.carte(a, cible); this.carte(b, cible); }, 1100);
  }

  /** Le coup d'une apparition : il file de l'attaquant à sa cible, dans son élément. Résout à l'arrivée. */
  attaque(de, vers, element) {
    const a = this.rect(de), b = this.rect(vers);
    return this.jouer("projectile", null, { element, de: [a.x + a.w / 2, a.y + a.h * 0.35], vers: [b.x + b.w / 2, b.y + b.h / 2] });
  }

  /** L'impact d'un coup sur sa cible (`fort` : un coup puissant). */
  impact(cible, element, fort = false) { return this.jouer("impact", cible, { element, fort }); }

  /** Une apparition détruite vole en éclats, de la couleur de son élément. */
  eclatsCarte(cible, element) { return this.jouer("eclatsCarte", cible, { element }); }

  /** Un lien lumineux entre deux éléments. */
  lien(el1, el2, favorable) {
    const r1 = this.rect(el1), r2 = this.rect(el2);
    return this.jouer("lien", null, { points: [r1.x + r1.w / 2, r1.y + r1.h / 3, r2.x + r2.w / 2, r2.y + r2.h / 3], favorable });
  }

  pas(t) {
    // l'horodatage du premier dessin peut précéder le départ : jamais de temps négatif
    const dt = Math.max(0, Math.min(0.05, (t - this.dernier) / 1000)); this.dernier = Math.max(t, this.dernier);
    this.c.clearRect(0, 0, this.l, this.h);
    for (const a of this.actifs) {
      a.t += dt;
      const p = Math.min(1, a.t / a.def.duree);
      this.c.save();
      // un effet qui échoue s'arrête seul, sans bloquer les autres
      try { a.def.dessiner(this.c, a.r, p, a.etat, dt, a.options); } catch (err) { a.t = a.def.duree; console.warn("Effet visuel interrompu :", err); }
      this.c.restore();
      if (p >= 1) { a.fini = true; a.resolve(); }
    }
    this.actifs = this.actifs.filter(a => !a.fini);
    if (this.actifs.length) this.boucle = requestAnimationFrame(x => this.pas(x));
    else { this.boucle = null; this.c.clearRect(0, 0, this.l, this.h); }
  }
}
