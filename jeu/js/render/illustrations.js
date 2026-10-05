// Illustrations des cartes, dessinées d'après l'image que nomme la notice de Belline
// (sans reproduire les illustrations éditées). Chaque fonction dessine dans un carré
// de côté `t` centré en (cx, cy), à l'encre courante (strokeStyle et fillStyle déjà posés).
// Une carte sans illustration affiche son symbole.

function etoile(c, cx, cy, branches, rExt, rInt, rotation = -Math.PI / 2) {
  c.beginPath();
  for (let i = 0; i < branches * 2; i++) {
    const r = i % 2 ? rInt : rExt, a = rotation + i * Math.PI / branches;
    c.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
  }
  c.closePath();
}

export const ILLUSTRATIONS = {
  // La clef
  1(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 2.5 * u;
    c.beginPath(); c.arc(cx - 9 * u, cy, 7 * u, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(cx - 9 * u, cy, 2.5 * u, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(cx - 2 * u, cy); c.lineTo(cx + 16 * u, cy);
    c.moveTo(cx + 10 * u, cy); c.lineTo(cx + 10 * u, cy + 6 * u);
    c.moveTo(cx + 15 * u, cy); c.lineTo(cx + 15 * u, cy + 8 * u); c.stroke();
  },
  // L'Étoile de l'homme : sceau à six branches
  2(c, cx, cy, t) {
    const r = t * 0.42;
    c.lineWidth = 2;
    for (const rot of [-Math.PI / 2, Math.PI / 2]) {
      c.beginPath();
      for (let i = 0; i < 3; i++) { const a = rot + i * 2 * Math.PI / 3; c.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a)); }
      c.closePath(); c.stroke();
    }
  },
  // L'Étoile de la femme : étoile pleine à huit branches
  3(c, cx, cy, t) { etoile(c, cx, cy, 8, t * 0.44, t * 0.2); c.fill(); },
  // L'Horoscope : la roue des douze maisons
  4(c, cx, cy, t) {
    const R = t * 0.44, r = t * 0.18;
    c.lineWidth = 1.5;
    c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();
    c.beginPath();
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; c.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a)); c.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a)); }
    c.stroke();
    c.beginPath(); c.arc(cx, cy, 2, 0, Math.PI * 2); c.fill();
  },
  // La médaille
  5(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 2;
    c.beginPath(); c.moveTo(cx - 8 * u, cy - 18 * u); c.lineTo(cx, cy - 4 * u); c.lineTo(cx + 8 * u, cy - 18 * u); c.stroke();
    c.beginPath(); c.arc(cx, cy + 6 * u, 11 * u, 0, Math.PI * 2); c.fill();
    c.save(); c.fillStyle = "#F7F1E3"; etoile(c, cx, cy + 6 * u, 5, 6 * u, 2.6 * u); c.fill(); c.restore();
  },
  // La pyramide
  6(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 1.8;
    c.beginPath(); c.moveTo(cx, cy - 17 * u); c.lineTo(cx + 19 * u, cy + 15 * u); c.lineTo(cx - 19 * u, cy + 15 * u); c.closePath(); c.stroke();
    c.beginPath();
    for (const k of [0.33, 0.66]) {
      const y = cy - 17 * u + k * 32 * u, dx = k * 19 * u;
      c.moveTo(cx - dx, y); c.lineTo(cx + dx, y);
    }
    c.moveTo(cx, cy - 17 * u); c.lineTo(cx + 4 * u, cy + 15 * u); c.stroke();
  },
  // L'honneur : la couronne de laurier
  7(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 1.8;
    for (const s of [-1, 1]) {
      c.beginPath(); c.arc(cx, cy + 2 * u, 15 * u, Math.PI / 2 + s * 0.25, Math.PI / 2 + s * 2.6, s < 0); c.stroke();
      for (let i = 0; i < 5; i++) {
        const a = Math.PI / 2 + s * (0.6 + i * 0.45), x = cx + 15 * u * Math.cos(a), y = cy + 2 * u + 15 * u * Math.sin(a);
        c.save(); c.translate(x, y); c.rotate(a + s * 0.9);
        c.beginPath(); c.ellipse(0, -4 * u, 2.2 * u, 4.5 * u, 0, 0, Math.PI * 2); c.fill(); c.restore();
      }
    }
  },
  // Le chien
  8(c, cx, cy, t) { dessinerChien(c, cx - t * 0.45, cy + t * 0.3, t * 0.9); },
  // Le jardin
  9(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(cx - 19 * u, cy + 15 * u); c.lineTo(cx + 19 * u, cy + 15 * u); c.stroke();
    for (const [dx, h] of [[-11, 20], [0, 28], [11, 18]]) {
      const x = cx + dx * u, y = cy + 15 * u - h * u;
      c.beginPath(); c.moveTo(x, cy + 15 * u); c.lineTo(x, y); c.stroke();
      for (let i = 0; i < 5; i++) { const a = i * 2 * Math.PI / 5; c.beginPath(); c.arc(x + 3.2 * u * Math.cos(a), y + 3.2 * u * Math.sin(a), 2.4 * u, 0, Math.PI * 2); c.fill(); }
      c.save(); c.fillStyle = "#B08D3C"; c.beginPath(); c.arc(x, y, 1.8 * u, 0, Math.PI * 2); c.fill(); c.restore();
    }
  },
  // Les présents
  10(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 1.8;
    c.strokeRect(cx - 14 * u, cy - 4 * u, 28 * u, 20 * u);
    c.strokeRect(cx - 16 * u, cy - 10 * u, 32 * u, 6 * u);
    c.beginPath(); c.moveTo(cx, cy - 10 * u); c.lineTo(cx, cy + 16 * u); c.stroke();
    c.beginPath(); c.ellipse(cx - 6 * u, cy - 14 * u, 6 * u, 3.5 * u, -0.4, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.ellipse(cx + 6 * u, cy - 14 * u, 6 * u, 3.5 * u, 0.4, 0, Math.PI * 2); c.stroke();
  }
};

Object.assign(ILLUSTRATIONS, {
  // Le diable : tête cornue
  11(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 1.8;
    c.beginPath(); c.ellipse(cx, cy + 3 * u, 10 * u, 12 * u, 0, 0, Math.PI * 2); c.stroke();
    for (const s of [-1, 1]) {
      c.beginPath(); c.moveTo(cx + s * 6 * u, cy - 7 * u); c.quadraticCurveTo(cx + s * 14 * u, cy - 12 * u, cx + s * 12 * u, cy - 19 * u);
      c.quadraticCurveTo(cx + s * 10 * u, cy - 12 * u, cx + s * 3 * u, cy - 8 * u); c.fill();
      c.beginPath(); c.moveTo(cx + s * 2 * u, cy); c.lineTo(cx + s * 7 * u, cy - 2 * u); c.lineTo(cx + s * 6 * u, cy + 1 * u); c.closePath(); c.fill();
    }
    c.beginPath(); c.moveTo(cx - 5 * u, cy + 8 * u); c.quadraticCurveTo(cx, cy + 11 * u, cx + 5 * u, cy + 8 * u); c.stroke();
    c.beginPath(); c.moveTo(cx - 3 * u, cy + 14 * u); c.lineTo(cx, cy + 22 * u); c.lineTo(cx + 3 * u, cy + 14 * u); c.fill();
  },
  // Les oiseaux
  12(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 2; c.lineCap = "round";
    for (const [dx, dy, k] of [[-9, -8, 1], [8, -2, 1.2], [-4, 10, 0.8]]) {
      const x = cx + dx * u, y = cy + dy * u, l = 9 * u * k;
      c.beginPath(); c.moveTo(x - l, y - l * 0.4); c.quadraticCurveTo(x - l * 0.4, y - l * 0.7, x, y);
      c.quadraticCurveTo(x + l * 0.4, y - l * 0.7, x + l, y - l * 0.4); c.stroke();
    }
  },
  // Le vent : un visage de nuage qui souffle
  13(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 1.8; c.lineCap = "round";
    c.beginPath(); c.arc(cx - 9 * u, cy - 2 * u, 8 * u, Math.PI * 0.4, Math.PI * 1.9); c.stroke();
    c.beginPath(); c.arc(cx - 9 * u, cy - 4 * u, 1.3 * u, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(cx - 2 * u, cy + 1 * u, 1.6 * u, 0, Math.PI * 2); c.stroke();
    for (const [dy, l] of [[-7, 18], [1, 21], [9, 15]]) {
      c.beginPath(); c.moveTo(cx + 2 * u, cy + dy * u); c.lineTo(cx + l * u, cy + dy * u);
      c.arc(cx + l * u, cy + (dy - 2.5) * u, 2.5 * u, Math.PI / 2, -Math.PI, true); c.stroke();
    }
  },
  // La longue-vue
  14(c, cx, cy, t) {
    const u = t / 40;
    c.save(); c.translate(cx, cy - 2 * u); c.rotate(-0.45);
    c.lineWidth = 1.6;
    c.strokeRect(-18 * u, -3 * u, 13 * u, 6 * u);
    c.strokeRect(-5 * u, -4 * u, 12 * u, 8 * u);
    c.strokeRect(7 * u, -5.5 * u, 11 * u, 11 * u);
    c.restore();
    c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(cx, cy + 1 * u); c.lineTo(cx - 8 * u, cy + 18 * u); c.moveTo(cx, cy + 1 * u); c.lineTo(cx + 8 * u, cy + 18 * u);
    c.moveTo(cx, cy + 1 * u); c.lineTo(cx, cy + 18 * u); c.stroke();
  },
  // L'eau : vagues
  15(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 2; c.lineCap = "round";
    for (const dy of [-10, 0, 10]) {
      c.beginPath();
      for (let i = 0; i <= 3; i++) {
        const x = cx - 18 * u + i * 12 * u, y = cy + dy * u;
        if (i === 0) c.moveTo(x, y); else c.quadraticCurveTo(x - 6 * u, y - 7 * u, x, y);
      }
      c.stroke();
    }
  },
  // Le château
  16(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 1.6;
    const bas = cy + 16 * u;
    const tour = (x, l, h) => {
      c.strokeRect(x, bas - h, l, h);
      for (let k = 0; k < 3; k++) c.fillRect(x + k * l / 2.5, bas - h - 3 * u, l / 5, 3 * u);
    };
    tour(cx - 19 * u, 10 * u, 26 * u); tour(cx + 9 * u, 10 * u, 26 * u); tour(cx - 9 * u, 18 * u, 20 * u);
    c.beginPath(); c.arc(cx, bas, 4.5 * u, Math.PI, 0); c.fill();
    c.fillRect(cx - 15.5 * u, bas - 18 * u, 3 * u, 5 * u); c.fillRect(cx + 12.5 * u, bas - 18 * u, 3 * u, 5 * u);
  },
  // Le crapaud (l'autre image de la carte est l'aigle)
  17(c, cx, cy, t) {
    const u = t / 40;
    c.beginPath(); c.ellipse(cx, cy + 4 * u, 14 * u, 9 * u, 0, 0, Math.PI * 2); c.fill();
    for (const s of [-1, 1]) {
      c.beginPath(); c.arc(cx + s * 7 * u, cy - 4 * u, 4.5 * u, 0, Math.PI * 2); c.fill();
      c.save(); c.fillStyle = "#F7F1E3"; c.beginPath(); c.arc(cx + s * 7 * u, cy - 4.5 * u, 2 * u, 0, Math.PI * 2); c.fill(); c.restore();
      c.lineWidth = 3 * u; c.lineCap = "round";
      c.beginPath(); c.moveTo(cx + s * 10 * u, cy + 9 * u); c.lineTo(cx + s * 18 * u, cy + 14 * u); c.lineTo(cx + s * 13 * u, cy + 16 * u); c.stroke();
    }
    c.save(); c.strokeStyle = "#F7F1E3"; c.lineWidth = 1.3;
    c.beginPath(); c.moveTo(cx - 8 * u, cy + 2 * u); c.quadraticCurveTo(cx, cy + 6 * u, cx + 8 * u, cy + 2 * u); c.stroke(); c.restore();
  }
});

// Mercure, Vénus, Mars, Jupiter, Saturne
Object.assign(ILLUSTRATIONS, {
  // Les astres : un croissant et trois étoiles
  18(c, cx, cy, t) {
    const u = t / 40;
    c.beginPath(); c.arc(cx - 4 * u, cy, 13 * u, Math.PI * 0.35, Math.PI * 1.65); c.arc(cx + 1 * u, cy, 10 * u, Math.PI * 1.55, Math.PI * 0.45, true); c.closePath(); c.fill();
    for (const [dx, dy, r] of [[11, -11, 4], [15, 4, 3], [5, 14, 2.5]]) { etoile(c, cx + dx * u, cy + dy * u, 5, r * u, r * 0.42 * u); c.fill(); }
  },
  // La corne d'abondance
  19(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 1.8;
    c.beginPath(); c.moveTo(cx - 17 * u, cy + 12 * u); c.quadraticCurveTo(cx - 6 * u, cy + 16 * u, cx + 6 * u, cy + 2 * u);
    c.lineTo(cx + 12 * u, cy - 10 * u); c.quadraticCurveTo(cx + 2 * u, cy - 4 * u, cx - 4 * u, cy + 4 * u); c.quadraticCurveTo(cx - 10 * u, cy + 10 * u, cx - 17 * u, cy + 12 * u); c.stroke();
    for (const [dx, dy, r] of [[12, -15, 4], [17, -9, 3.5], [7, -16, 3], [17, -17, 2.5]]) { c.beginPath(); c.arc(cx + dx * u, cy + dy * u, r * u, 0, Math.PI * 2); c.fill(); }
  },
  // Le livre ouvert
  20(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 1.6;
    for (const s of [-1, 1]) {
      c.beginPath(); c.moveTo(cx, cy - 10 * u); c.quadraticCurveTo(cx + s * 9 * u, cy - 14 * u, cx + s * 18 * u, cy - 11 * u);
      c.lineTo(cx + s * 18 * u, cy + 12 * u); c.quadraticCurveTo(cx + s * 9 * u, cy + 9 * u, cx, cy + 13 * u); c.closePath(); c.stroke();
      for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(cx + s * 4 * u, cy - 6 * u + k * 5 * u); c.lineTo(cx + s * 15 * u, cy - 7 * u + k * 5 * u); c.stroke(); }
    }
  },
  // La chauve-souris
  21(c, cx, cy, t) {
    const u = t / 40;
    c.beginPath();
    for (const s of [1, -1]) {
      c.moveTo(cx, cy - 2 * u);
      c.quadraticCurveTo(cx + s * 10 * u, cy - 14 * u, cx + s * 20 * u, cy - 8 * u);
      c.quadraticCurveTo(cx + s * 16 * u, cy - 2 * u, cx + s * 17 * u, cy + 4 * u);
      c.quadraticCurveTo(cx + s * 12 * u, cy, cx + s * 10 * u, cy + 5 * u);
      c.quadraticCurveTo(cx + s * 6 * u, cy + 1 * u, cx, cy + 6 * u);
    }
    c.fill();
    c.beginPath(); c.ellipse(cx, cy, 4 * u, 6 * u, 0, 0, Math.PI * 2); c.fill();
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(cx + s * 1 * u, cy - 5 * u); c.lineTo(cx + s * 3.5 * u, cy - 10 * u); c.lineTo(cx + s * 4 * u, cy - 4 * u); c.fill(); }
  },
  // Le plan
  22(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 1.6;
    c.strokeRect(cx - 17 * u, cy - 14 * u, 34 * u, 28 * u);
    c.lineWidth = 1.1;
    c.beginPath(); c.moveTo(cx - 3 * u, cy - 14 * u); c.lineTo(cx - 3 * u, cy + 3 * u); c.lineTo(cx - 17 * u, cy + 3 * u);
    c.moveTo(cx - 3 * u, cy - 3 * u); c.lineTo(cx + 17 * u, cy - 3 * u); c.moveTo(cx + 6 * u, cy - 3 * u); c.lineTo(cx + 6 * u, cy + 14 * u); c.stroke();
    c.beginPath(); c.arc(cx - 10 * u, cy + 3 * u, 5 * u, -Math.PI / 2, 0); c.stroke();
  },
  // Le caducée
  23(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 2.2;
    c.beginPath(); c.moveTo(cx, cy - 16 * u); c.lineTo(cx, cy + 19 * u); c.stroke();
    c.beginPath(); c.arc(cx, cy - 17 * u, 2.6 * u, 0, Math.PI * 2); c.fill();
    c.lineWidth = 1.6;
    for (const s of [-1, 1]) {
      c.beginPath();
      for (let k = 0; k <= 24; k++) { const y = cy + 14 * u - k * 1.15 * u, x = cx + s * Math.sin(k / 24 * Math.PI * 3) * 6 * u; if (k) c.lineTo(x, y); else c.moveTo(x, y); }
      c.stroke();
      c.beginPath(); c.moveTo(cx, cy - 12 * u); c.quadraticCurveTo(cx + s * 10 * u, cy - 20 * u, cx + s * 17 * u, cy - 16 * u); c.quadraticCurveTo(cx + s * 9 * u, cy - 13 * u, cx, cy - 9 * u); c.fill();
    }
  },
  // La comète
  24(c, cx, cy, t) {
    const u = t / 40;
    c.beginPath(); c.arc(cx + 9 * u, cy - 9 * u, 6 * u, 0, Math.PI * 2); c.fill();
    c.lineWidth = 1.6; c.lineCap = "round";
    for (const [k, l] of [[-1, 24], [0, 30], [1, 24], [-2, 16], [2, 16]]) {
      c.beginPath(); c.moveTo(cx + 9 * u + k * 2.5 * u, cy - 9 * u - k * 2.5 * u); c.lineTo(cx + 9 * u - l * u * 0.75 + k * 2.5 * u, cy - 9 * u + l * u * 0.75 - k * 2.5 * u); c.stroke();
    }
  },
  // La lyre
  25(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 2.2;
    c.beginPath(); c.moveTo(cx - 12 * u, cy - 16 * u); c.quadraticCurveTo(cx - 18 * u, cy + 4 * u, cx - 8 * u, cy + 14 * u); c.lineTo(cx + 8 * u, cy + 14 * u);
    c.quadraticCurveTo(cx + 18 * u, cy + 4 * u, cx + 12 * u, cy - 16 * u); c.stroke();
    c.beginPath(); c.moveTo(cx - 14 * u, cy - 10 * u); c.lineTo(cx + 14 * u, cy - 10 * u); c.stroke();
    c.lineWidth = 1;
    for (const dx of [-6, -2, 2, 6]) { c.beginPath(); c.moveTo(cx + dx * u, cy - 10 * u); c.lineTo(cx + dx * u, cy + 14 * u); c.stroke(); }
  },
  // La hache aux faisceaux
  26(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 1.5;
    for (const dx of [-6, -3, 0, 3, 6]) { c.beginPath(); c.moveTo(cx + dx * u, cy - 14 * u); c.lineTo(cx + dx * u, cy + 18 * u); c.stroke(); }
    c.lineWidth = 2;
    for (const dy of [-6, 4, 13]) { c.beginPath(); c.moveTo(cx - 8 * u, cy + dy * u); c.lineTo(cx + 8 * u, cy + dy * u); c.stroke(); }
    c.beginPath(); c.moveTo(cx + 7 * u, cy - 15 * u); c.quadraticCurveTo(cx + 20 * u, cy - 18 * u, cx + 18 * u, cy - 6 * u); c.quadraticCurveTo(cx + 14 * u, cy - 9 * u, cx + 7 * u, cy - 8 * u); c.fill();
  },
  // L'autel et sa flamme
  27(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 1.6;
    c.strokeRect(cx - 13 * u, cy - 2 * u, 26 * u, 18 * u);
    c.fillRect(cx - 16 * u, cy - 5 * u, 32 * u, 4 * u); c.fillRect(cx - 16 * u, cy + 15 * u, 32 * u, 3 * u);
    c.beginPath(); c.moveTo(cx, cy - 20 * u); c.quadraticCurveTo(cx + 8 * u, cy - 11 * u, cx + 3 * u, cy - 6 * u); c.lineTo(cx - 3 * u, cy - 6 * u); c.quadraticCurveTo(cx - 8 * u, cy - 11 * u, cx, cy - 20 * u); c.fill();
  },
  // Le pélican et ses petits
  28(c, cx, cy, t) {
    const u = t / 40;
    c.beginPath(); c.ellipse(cx + 2 * u, cy + 2 * u, 13 * u, 8 * u, -0.2, 0, Math.PI * 2); c.fill();
    c.lineWidth = 3 * u; c.lineCap = "round";
    c.beginPath(); c.moveTo(cx - 8 * u, cy - 2 * u); c.quadraticCurveTo(cx - 14 * u, cy - 14 * u, cx - 6 * u, cy - 16 * u); c.stroke();
    c.lineWidth = 2 * u;
    c.beginPath(); c.moveTo(cx - 5 * u, cy - 16 * u); c.lineTo(cx - 1 * u, cy - 4 * u); c.stroke();
    for (const dx of [-10, -2, 6]) { c.beginPath(); c.arc(cx + dx * u, cy + 15 * u, 3.2 * u, 0, Math.PI * 2); c.fill(); }
  },
  // Les deux cœurs
  29(c, cx, cy, t) {
    const u = t / 40;
    coeur(c, cx - 6 * u, cy - 2 * u, 11 * u); c.fill();
    c.save(); c.globalAlpha = 0.6; coeur(c, cx + 6 * u, cy + 3 * u, 11 * u); c.fill(); c.restore();
  },
  // L'amphore
  30(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 1.8;
    c.beginPath(); c.moveTo(cx - 4 * u, cy - 17 * u); c.lineTo(cx - 4 * u, cy - 11 * u); c.quadraticCurveTo(cx - 15 * u, cy - 4 * u, cx - 9 * u, cy + 10 * u);
    c.lineTo(cx - 3 * u, cy + 18 * u); c.lineTo(cx + 3 * u, cy + 18 * u); c.lineTo(cx + 9 * u, cy + 10 * u); c.quadraticCurveTo(cx + 15 * u, cy - 4 * u, cx + 4 * u, cy - 11 * u); c.lineTo(cx + 4 * u, cy - 17 * u); c.stroke();
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(cx + s * 4 * u, cy - 14 * u); c.quadraticCurveTo(cx + s * 13 * u, cy - 15 * u, cx + s * 9 * u, cy - 5 * u); c.stroke(); }
    c.beginPath(); c.moveTo(cx - 10 * u, cy + 2 * u); c.lineTo(cx + 10 * u, cy + 2 * u); c.stroke();
  },
  // Les cœurs blessés : un cœur percé d'une flèche
  31(c, cx, cy, t) {
    const u = t / 40;
    coeur(c, cx, cy, 14 * u); c.fill();
    c.lineWidth = 2;
    c.beginPath(); c.moveTo(cx - 19 * u, cy + 12 * u); c.lineTo(cx + 18 * u, cy - 12 * u); c.stroke();
    c.beginPath(); c.moveTo(cx + 18 * u, cy - 12 * u); c.lineTo(cx + 11 * u, cy - 11 * u); c.lineTo(cx + 15 * u, cy - 6 * u); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(cx - 19 * u, cy + 12 * u); c.lineTo(cx - 19 * u, cy + 6 * u); c.moveTo(cx - 19 * u, cy + 12 * u); c.lineTo(cx - 13 * u, cy + 13 * u); c.stroke();
  },
  // La lanterne
  32(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 1.6;
    c.beginPath(); c.arc(cx, cy - 17 * u, 3 * u, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(cx - 8 * u, cy - 9 * u); c.lineTo(cx, cy - 14 * u); c.lineTo(cx + 8 * u, cy - 9 * u); c.closePath(); c.fill();
    c.strokeRect(cx - 8 * u, cy - 9 * u, 16 * u, 22 * u);
    c.fillRect(cx - 9 * u, cy + 13 * u, 18 * u, 3 * u);
    c.save(); c.fillStyle = "#B08D3C"; c.beginPath(); c.moveTo(cx, cy - 4 * u); c.quadraticCurveTo(cx + 5 * u, cy + 3 * u, cx, cy + 8 * u); c.quadraticCurveTo(cx - 5 * u, cy + 3 * u, cx, cy - 4 * u); c.fill(); c.restore();
  },
  // Les deux épées croisées
  33(c, cx, cy, t) {
    const u = t / 40;
    for (const s of [-1, 1]) {
      c.save(); c.translate(cx, cy); c.rotate(s * 0.75);
      c.lineWidth = 2.6; c.beginPath(); c.moveTo(0, -20 * u); c.lineTo(0, 12 * u); c.stroke();
      c.lineWidth = 2; c.beginPath(); c.moveTo(-6 * u, 12 * u); c.lineTo(6 * u, 12 * u); c.stroke();
      c.beginPath(); c.moveTo(0, 12 * u); c.lineTo(0, 19 * u); c.stroke();
      c.restore();
    }
  },
  // L'enchaîné : une silhouette entravée par une chaîne
  34(c, cx, cy, t) {
    const u = t / 40;
    c.beginPath(); c.arc(cx, cy - 13 * u, 5 * u, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.moveTo(cx - 7 * u, cy - 6 * u); c.lineTo(cx + 7 * u, cy - 6 * u); c.lineTo(cx + 5 * u, cy + 18 * u); c.lineTo(cx - 5 * u, cy + 18 * u); c.closePath(); c.fill();
    c.lineWidth = 1.5;
    for (let k = 0; k < 5; k++) { c.beginPath(); c.ellipse(cx - 16 * u + k * 8 * u, cy + 4 * u, 4 * u, 2.4 * u, 0, 0, Math.PI * 2); c.stroke(); }
  },
  // Le glaive et le serpent
  35(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 2.6; c.beginPath(); c.moveTo(cx, cy - 20 * u); c.lineTo(cx, cy + 12 * u); c.stroke();
    c.lineWidth = 2; c.beginPath(); c.moveTo(cx - 8 * u, cy + 12 * u); c.lineTo(cx + 8 * u, cy + 12 * u); c.moveTo(cx, cy + 12 * u); c.lineTo(cx, cy + 20 * u); c.stroke();
    c.lineWidth = 2.2; c.beginPath();
    for (let k = 0; k <= 30; k++) { const y = cy + 9 * u - k * 0.9 * u, x = cx + Math.sin(k / 30 * Math.PI * 3.2) * 8 * u; if (k) c.lineTo(x, y); else c.moveTo(x, y); }
    c.stroke();
    c.beginPath(); c.arc(cx + Math.sin(Math.PI * 3.2) * 8 * u, cy - 18 * u, 2.6 * u, 0, Math.PI * 2); c.fill();
  },
  // Les oiseaux des îles : deux perroquets face à face
  36(c, cx, cy, t) {
    const u = t / 40;
    for (const s of [-1, 1]) {
      c.save(); c.translate(cx + s * 9 * u, cy); c.scale(-s, 1);
      c.beginPath(); c.ellipse(0, 0, 6 * u, 10 * u, 0.2, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(3 * u, -11 * u, 4.5 * u, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.moveTo(6 * u, -12 * u); c.quadraticCurveTo(11 * u, -11 * u, 8 * u, -6 * u); c.lineTo(6 * u, -9 * u); c.fill();
      c.beginPath(); c.moveTo(-3 * u, 8 * u); c.lineTo(-7 * u, 20 * u); c.lineTo(-1 * u, 10 * u); c.fill();
      c.restore();
    }
  },
  // La torche
  37(c, cx, cy, t) {
    const u = t / 40;
    c.beginPath(); c.moveTo(cx - 4 * u, cy - 2 * u); c.lineTo(cx + 4 * u, cy - 2 * u); c.lineTo(cx + 2 * u, cy + 20 * u); c.lineTo(cx - 2 * u, cy + 20 * u); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(cx, cy - 22 * u); c.quadraticCurveTo(cx + 12 * u, cy - 10 * u, cx + 6 * u, cy - 3 * u); c.lineTo(cx - 6 * u, cy - 3 * u); c.quadraticCurveTo(cx - 12 * u, cy - 10 * u, cx, cy - 22 * u); c.fill();
    c.save(); c.fillStyle = "#B08D3C"; c.beginPath(); c.moveTo(cx, cy - 14 * u); c.quadraticCurveTo(cx + 5 * u, cy - 7 * u, cx + 2 * u, cy - 4 * u); c.lineTo(cx - 2 * u, cy - 4 * u); c.quadraticCurveTo(cx - 5 * u, cy - 7 * u, cx, cy - 14 * u); c.fill(); c.restore();
  },
  // La tour foudroyée
  38(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 1.6;
    c.strokeRect(cx - 8 * u, cy - 8 * u, 16 * u, 26 * u);
    for (let k = 0; k < 3; k++) c.fillRect(cx - 8 * u + k * 6 * u, cy - 12 * u, 4 * u, 4 * u);
    c.fillRect(cx - 2 * u, cy + 10 * u, 4 * u, 8 * u);
    c.save(); c.fillStyle = "#B08D3C";
    c.beginPath(); c.moveTo(cx + 6 * u, cy - 22 * u); c.lineTo(cx - 3 * u, cy - 11 * u); c.lineTo(cx + 2 * u, cy - 11 * u); c.lineTo(cx - 6 * u, cy + 2 * u); c.lineTo(cx + 7 * u, cy - 13 * u); c.lineTo(cx + 2 * u, cy - 13 * u); c.closePath(); c.fill(); c.restore();
  },
  // L'aigle couronné
  39(c, cx, cy, t) {
    const u = t / 40;
    c.beginPath(); c.ellipse(cx, cy + 3 * u, 5 * u, 9 * u, 0, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(cx, cy - 8 * u, 4 * u, 0, Math.PI * 2); c.fill();
    for (const s of [-1, 1]) {
      c.beginPath(); c.moveTo(cx + s * 3 * u, cy - 2 * u); c.lineTo(cx + s * 20 * u, cy - 9 * u); c.lineTo(cx + s * 17 * u, cy - 2 * u);
      c.lineTo(cx + s * 19 * u, cy); c.lineTo(cx + s * 14 * u, cy + 3 * u); c.lineTo(cx + s * 15 * u, cy + 6 * u); c.lineTo(cx + s * 4 * u, cy + 5 * u); c.fill();
    }
    c.beginPath(); c.moveTo(cx - 5 * u, cy - 14 * u); c.lineTo(cx - 5 * u, cy - 20 * u); c.lineTo(cx - 2 * u, cy - 17 * u); c.lineTo(cx, cy - 21 * u); c.lineTo(cx + 2 * u, cy - 17 * u); c.lineTo(cx + 5 * u, cy - 20 * u); c.lineTo(cx + 5 * u, cy - 14 * u); c.closePath(); c.fill();
  },
  // La fleur royale (fleur de lis)
  40(c, cx, cy, t) {
    const u = t / 40;
    c.beginPath(); c.moveTo(cx, cy - 20 * u); c.quadraticCurveTo(cx + 7 * u, cy - 8 * u, cx, cy + 4 * u); c.quadraticCurveTo(cx - 7 * u, cy - 8 * u, cx, cy - 20 * u); c.fill();
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(cx + s * 2 * u, cy + 2 * u); c.quadraticCurveTo(cx + s * 18 * u, cy - 10 * u, cx + s * 14 * u, cy + 4 * u); c.quadraticCurveTo(cx + s * 12 * u, cy - 2 * u, cx + s * 2 * u, cy + 6 * u); c.fill(); }
    c.fillRect(cx - 9 * u, cy + 4 * u, 18 * u, 3.5 * u);
    c.beginPath(); c.moveTo(cx - 2 * u, cy + 7 * u); c.lineTo(cx - 6 * u, cy + 18 * u); c.lineTo(cx + 6 * u, cy + 18 * u); c.lineTo(cx + 2 * u, cy + 7 * u); c.fill();
  },
  // Le grimoire
  41(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 1.8;
    c.strokeRect(cx - 13 * u, cy - 17 * u, 26 * u, 34 * u);
    c.fillRect(cx - 13 * u, cy - 17 * u, 4 * u, 34 * u);
    c.fillRect(cx + 11 * u, cy - 3 * u, 5 * u, 6 * u);
    etoile(c, cx + 2 * u, cy, 5, 7 * u, 3 * u); c.stroke();
  },
  // La chouette
  42(c, cx, cy, t) {
    const u = t / 40;
    c.beginPath(); c.ellipse(cx, cy + 4 * u, 12 * u, 15 * u, 0, 0, Math.PI * 2); c.fill();
    for (const s of [-1, 1]) {
      c.beginPath(); c.moveTo(cx + s * 4 * u, cy - 9 * u); c.lineTo(cx + s * 11 * u, cy - 17 * u); c.lineTo(cx + s * 11 * u, cy - 7 * u); c.fill();
      c.save(); c.fillStyle = "#F7F1E3"; c.beginPath(); c.arc(cx + s * 5 * u, cy - 3 * u, 4.5 * u, 0, Math.PI * 2); c.fill(); c.restore();
      c.beginPath(); c.arc(cx + s * 5 * u, cy - 3 * u, 2 * u, 0, Math.PI * 2); c.fill();
    }
    c.save(); c.fillStyle = "#B08D3C"; c.beginPath(); c.moveTo(cx - 2 * u, cy + 1 * u); c.lineTo(cx + 2 * u, cy + 1 * u); c.lineTo(cx, cy + 5 * u); c.fill(); c.restore();
  },
  // La trompette
  43(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 2.6;
    c.beginPath(); c.moveTo(cx - 18 * u, cy + 6 * u); c.lineTo(cx + 6 * u, cy - 4 * u); c.stroke();
    c.beginPath(); c.moveTo(cx + 4 * u, cy - 3 * u); c.lineTo(cx + 18 * u, cy - 14 * u); c.lineTo(cx + 20 * u, cy + 2 * u); c.closePath(); c.fill();
    c.lineWidth = 1.4; c.beginPath(); c.ellipse(cx - 6 * u, cy + 4 * u, 6 * u, 3 * u, -0.4, 0, Math.PI * 2); c.stroke();
    c.save(); c.globalAlpha = 0.6; c.lineWidth = 1.2;
    for (const r of [6, 10]) { c.beginPath(); c.arc(cx + 20 * u, cy - 6 * u, r * u, -0.9, 0.5); c.stroke(); }
    c.restore();
  },
  // La roue de fortune
  44(c, cx, cy, t) {
    const R = t * 0.42;
    c.lineWidth = 2;
    c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(cx, cy, R * 0.2, 0, Math.PI * 2); c.fill();
    c.lineWidth = 1.4; c.beginPath();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; c.moveTo(cx, cy); c.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a)); }
    c.stroke();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + Math.PI / 8; c.beginPath(); c.arc(cx + R * Math.cos(a), cy + R * Math.sin(a), 2, 0, Math.PI * 2); c.fill(); }
  },
  // L'étoile des mages
  45(c, cx, cy, t) {
    const u = t / 40;
    etoile(c, cx, cy - 2 * u, 5, 13 * u, 5.5 * u); c.fill();
    c.lineWidth = 1.2;
    for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 + Math.PI / 10; c.beginPath(); c.moveTo(cx + 15 * u * Math.cos(a), cy - 2 * u + 15 * u * Math.sin(a)); c.lineTo(cx + 19 * u * Math.cos(a), cy - 2 * u + 19 * u * Math.sin(a)); c.stroke(); }
  },
  // La mendiante : une silhouette voûtée tend sa sébile
  46(c, cx, cy, t) {
    const u = t / 40;
    c.beginPath(); c.arc(cx - 2 * u, cy - 10 * u, 5 * u, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.moveTo(cx - 9 * u, cy - 12 * u); c.quadraticCurveTo(cx - 2 * u, cy - 20 * u, cx + 5 * u, cy - 10 * u); c.lineTo(cx + 8 * u, cy + 18 * u); c.lineTo(cx - 12 * u, cy + 18 * u); c.closePath(); c.fill();
    c.lineWidth = 2;
    c.beginPath(); c.moveTo(cx + 4 * u, cy); c.lineTo(cx + 13 * u, cy + 3 * u); c.stroke();
    c.beginPath(); c.arc(cx + 15 * u, cy + 3 * u, 4 * u, 0, Math.PI); c.fill();
  },
  // L'île déserte
  47(c, cx, cy, t) {
    const u = t / 40;
    c.beginPath(); c.ellipse(cx, cy + 10 * u, 14 * u, 5 * u, 0, Math.PI, 0); c.fill();
    c.lineWidth = 2; c.beginPath(); c.moveTo(cx, cy + 6 * u); c.quadraticCurveTo(cx + 3 * u, cy - 6 * u, cx - 1 * u, cy - 14 * u); c.stroke();
    for (const s of [-1, 1]) for (const k of [0.6, 1]) { c.beginPath(); c.moveTo(cx - 1 * u, cy - 14 * u); c.quadraticCurveTo(cx + s * 8 * u * k, cy - 20 * u, cx + s * 13 * u * k, cy - 11 * u * k - 3 * u); c.stroke(); }
    c.lineWidth = 1.4;
    for (const dy of [14, 19]) { c.beginPath(); for (let i = 0; i <= 4; i++) { const x = cx - 18 * u + i * 9 * u; if (i) c.quadraticCurveTo(x - 4.5 * u, cy + (dy - 3) * u, x, cy + dy * u); else c.moveTo(x, cy + dy * u); } c.stroke(); }
  },
  // Le temps : le sablier
  48(c, cx, cy, t) {
    const u = t / 40;
    c.fillRect(cx - 12 * u, cy - 19 * u, 24 * u, 3 * u); c.fillRect(cx - 12 * u, cy + 16 * u, 24 * u, 3 * u);
    c.lineWidth = 1.8;
    c.beginPath(); c.moveTo(cx - 9 * u, cy - 16 * u); c.quadraticCurveTo(cx - 9 * u, cy - 4 * u, cx - 1.5 * u, cy); c.quadraticCurveTo(cx - 9 * u, cy + 4 * u, cx - 9 * u, cy + 16 * u);
    c.moveTo(cx + 9 * u, cy - 16 * u); c.quadraticCurveTo(cx + 9 * u, cy - 4 * u, cx + 1.5 * u, cy); c.quadraticCurveTo(cx + 9 * u, cy + 4 * u, cx + 9 * u, cy + 16 * u); c.stroke();
    c.beginPath(); c.moveTo(cx - 6 * u, cy - 10 * u); c.lineTo(cx + 6 * u, cy - 10 * u); c.lineTo(cx, cy - 2 * u); c.fill();
    c.beginPath(); c.moveTo(cx - 8 * u, cy + 16 * u); c.lineTo(cx, cy + 8 * u); c.lineTo(cx + 8 * u, cy + 16 * u); c.fill();
  },
  // La colombe au rameau
  49(c, cx, cy, t) {
    const u = t / 40;
    c.beginPath(); c.ellipse(cx, cy + 2 * u, 12 * u, 6 * u, -0.2, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(cx + 11 * u, cy - 3 * u, 4.5 * u, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.moveTo(cx - 2 * u, cy); c.quadraticCurveTo(cx - 6 * u, cy - 18 * u, cx + 6 * u, cy - 16 * u); c.quadraticCurveTo(cx + 2 * u, cy - 8 * u, cx + 4 * u, cy - 1 * u); c.fill();
    c.beginPath(); c.moveTo(cx - 11 * u, cy + 2 * u); c.lineTo(cx - 20 * u, cy - 2 * u); c.lineTo(cx - 19 * u, cy + 7 * u); c.fill();
    c.lineWidth = 1.4; c.beginPath(); c.moveTo(cx + 15 * u, cy - 2 * u); c.lineTo(cx + 21 * u, cy + 6 * u); c.stroke();
    for (const k of [0.3, 0.65, 0.95]) { c.beginPath(); c.ellipse(cx + 15 * u + 6 * u * k, cy - 2 * u + 8 * u * k, 2.2 * u, 1.1 * u, 0.6, 0, Math.PI * 2); c.fill(); }
  },
  // Les ruines : des colonnes brisées
  50(c, cx, cy, t) {
    const u = t / 40;
    c.fillRect(cx - 19 * u, cy + 15 * u, 38 * u, 3 * u);
    for (const [dx, h, cassee] of [[-12, 26, false], [0, 15, true], [12, 21, true]]) {
      c.fillRect(cx + (dx - 3) * u, cy + (15 - h) * u, 6 * u, h * u);
      if (!cassee) c.fillRect(cx + (dx - 5) * u, cy + (13 - h) * u, 10 * u, 3 * u);
      else { c.beginPath(); c.moveTo(cx + (dx - 3) * u, cy + (15 - h) * u); c.lineTo(cx + dx * u, cy + (11 - h) * u); c.lineTo(cx + (dx + 3) * u, cy + (16 - h) * u); c.fill(); }
    }
    c.fillRect(cx + 4 * u, cy + 11 * u, 10 * u, 4 * u);
  },
  // La roue dans l'ornière
  51(c, cx, cy, t) {
    const u = t / 40;
    c.save(); c.beginPath(); c.rect(cx - 20 * u, cy - 20 * u, 40 * u, 28 * u); c.clip();
    c.lineWidth = 2; c.beginPath(); c.arc(cx, cy + 2 * u, 14 * u, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 1.4; c.beginPath();
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + 0.3; c.moveTo(cx, cy + 2 * u); c.lineTo(cx + 14 * u * Math.cos(a), cy + 2 * u + 14 * u * Math.sin(a)); }
    c.stroke(); c.restore();
    c.beginPath(); c.moveTo(cx - 20 * u, cy + 6 * u); c.quadraticCurveTo(cx, cy + 12 * u, cx + 20 * u, cy + 6 * u); c.lineTo(cx + 20 * u, cy + 18 * u); c.lineTo(cx - 20 * u, cy + 18 * u); c.closePath(); c.fill();
  },
  // Le cloître : une arcade
  52(c, cx, cy, t) {
    const u = t / 40;
    c.fillRect(cx - 19 * u, cy - 14 * u, 38 * u, 3 * u); c.fillRect(cx - 19 * u, cy + 15 * u, 38 * u, 3 * u);
    c.lineWidth = 1.8;
    for (const dx of [-12, 0, 12]) {
      c.beginPath(); c.moveTo(cx + (dx - 5) * u, cy + 15 * u); c.lineTo(cx + (dx - 5) * u, cy - 3 * u); c.arc(cx + dx * u, cy - 3 * u, 5 * u, Math.PI, 0); c.lineTo(cx + (dx + 5) * u, cy + 15 * u); c.stroke();
    }
  }
});

function coeur(c, cx, cy, r) {
  c.beginPath();
  c.moveTo(cx, cy + r * 0.9);
  c.bezierCurveTo(cx - r * 1.3, cy, cx - r * 0.8, cy - r * 1.0, cx, cy - r * 0.35);
  c.bezierCurveTo(cx + r * 0.8, cy - r * 1.0, cx + r * 1.3, cy, cx, cy + r * 0.9);
  c.closePath();
}

/** Chien de profil, tourné vers la droite. (x, y) : bas gauche ; l : longueur. Sert aussi au compagnon du mage. */
export function dessinerChien(c, x, y, l, phase = 0) {
  const u = l / 36;
  c.save();
  c.lineCap = "round";
  c.beginPath(); c.ellipse(x + 16 * u, y - 13 * u, 11 * u, 5.5 * u, 0, 0, Math.PI * 2); c.fill();      // corps
  c.beginPath(); c.ellipse(x + 29 * u, y - 20 * u, 5 * u, 4.2 * u, 0, 0, Math.PI * 2); c.fill();       // tête
  c.beginPath(); c.ellipse(x + 34 * u, y - 18.5 * u, 3 * u, 2 * u, 0, 0, Math.PI * 2); c.fill();       // museau
  c.beginPath(); c.ellipse(x + 26.5 * u, y - 22 * u, 2 * u, 4.5 * u, 0.5, 0, Math.PI * 2); c.fill();   // oreille
  c.lineWidth = 2.6 * u;
  const p = Math.sin(phase) * 3 * u;
  c.beginPath();
  c.moveTo(x + 9 * u, y - 10 * u); c.lineTo(x + 9 * u + p, y);                                          // pattes
  c.moveTo(x + 13 * u, y - 10 * u); c.lineTo(x + 13 * u - p, y);
  c.moveTo(x + 21 * u, y - 10 * u); c.lineTo(x + 21 * u - p, y);
  c.moveTo(x + 24 * u, y - 10 * u); c.lineTo(x + 24 * u + p, y);
  c.moveTo(x + 6 * u, y - 15 * u); c.quadraticCurveTo(x, y - 22 * u, x + 2 * u, y - 26 * u);            // queue
  c.stroke();
  c.restore();
}
