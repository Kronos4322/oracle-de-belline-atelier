// Commandes : clavier (flèches, ou ZQSD / WASD selon le clavier : on lit la position des touches),
// et, sur écran tactile ou à la souris, glisser sur la scène pour marcher (comme un manche), toucher pour lire
// une carte ou sauter. Espace : sauter. B : Carte Bleue. Échap : fermer.

const DIRECTIONS = {
  ArrowUp: "haut", KeyW: "haut",
  ArrowDown: "bas", KeyS: "bas",
  ArrowLeft: "gauche", KeyA: "gauche",
  ArrowRight: "droite", KeyD: "droite"
};
const SEUIL_GLISSE = 14;   // px avant qu'un toucher devienne une marche

function surControle(e) {
  const t = e.target;
  return t instanceof HTMLElement && (t.closest("button, input, select, textarea, a, summary, [contenteditable]") != null);
}

export function installerCommandes({ canvas, surSaut, surBleue, surEchap, surChiffre, surToucher, enJeu }) {
  const tenues = new Set();
  let manuel = false;
  let glisse = null;   // { x0, y0, dx, dy, actif, t0 }

  window.addEventListener("keydown", e => {
    const dir = DIRECTIONS[e.code];
    if (dir && enJeu() && !surControle(e)) { e.preventDefault(); tenues.add(dir); manuel = true; return; }
    if (e.code === "Escape") { surEchap(); return; }
    if (/^Digit[1-9]$/.test(e.code) || /^Numpad[1-9]$/.test(e.code)) { if (surChiffre(+e.code.slice(-1))) e.preventDefault(); return; }
    if (surControle(e)) return; // Espace et Entrée activent le bouton qui a le focus
    if (e.code === "Space" && enJeu()) { e.preventDefault(); if (!e.repeat) surSaut(); return; }
    if (e.code === "KeyB" && enJeu()) surBleue();
  });
  window.addEventListener("keyup", e => { const dir = DIRECTIONS[e.code]; if (dir) tenues.delete(dir); });
  window.addEventListener("blur", () => { tenues.clear(); glisse = null; });

  // Glisser pour marcher, toucher pour lire ou sauter
  canvas.addEventListener("pointerdown", e => {
    canvas.setPointerCapture?.(e.pointerId);
    glisse = { x0: e.clientX, y0: e.clientY, dx: 0, dy: 0, actif: false, t0: performance.now() };
  });
  canvas.addEventListener("pointermove", e => {
    if (!glisse) return;
    const dx = e.clientX - glisse.x0, dy = e.clientY - glisse.y0;
    if (!glisse.actif && Math.hypot(dx, dy) > SEUIL_GLISSE) { glisse.actif = true; manuel = true; }
    if (glisse.actif) { const n = Math.hypot(dx, dy) || 1; glisse.dx = dx / n; glisse.dy = -dy / n; }
  });
  const finir = e => {
    if (!glisse) return;
    if (!glisse.actif && performance.now() - glisse.t0 < 450) surToucher(e);
    glisse = null;
  };
  canvas.addEventListener("pointerup", finir);
  canvas.addEventListener("pointercancel", () => { glisse = null; });
  document.querySelector("[data-action='saut']")?.addEventListener("click", () => surSaut());

  const tient = d => tenues.has(d);
  return {
    /** Direction voulue : { dx, dy } (dy positif vers le haut). */
    commande() {
      if (glisse?.actif) return { dx: glisse.dx, dy: glisse.dy };
      return { dx: (tient("droite") ? 1 : 0) - (tient("gauche") ? 1 : 0), dy: (tient("haut") ? 1 : 0) - (tient("bas") ? 1 : 0) };
    },
    /** Vrai si le joueur a donné une direction depuis le dernier appel (annule une marche automatique). */
    manuel() { const m = manuel; manuel = false; return m; },
    relacher() { tenues.clear(); glisse = null; }
  };
}
