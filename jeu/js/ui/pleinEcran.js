// Plein écran : un bouton qui ouvre la page entière en grand (et la referme). Commun au Chemin et au Duel.

/** Branche le bouton ; `apres()` est appelé quand l'écran change de taille (entrée ou sortie). */
export function installerPleinEcran(bouton, apres = () => {}) {
  if (!bouton) return;
  const racine = document.documentElement;
  const possible = !!(racine.requestFullscreen || racine.webkitRequestFullscreen);
  if (!possible) { bouton.hidden = true; return; }
  const actif = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
  const maj = () => {
    bouton.textContent = actif() ? "⤡ Quitter le plein écran" : "⤢ Plein écran";
    bouton.setAttribute("aria-pressed", String(actif()));
    document.body.classList.toggle("plein-ecran", actif());
  };
  bouton.addEventListener("click", () => {
    if (actif()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else (racine.requestFullscreen || racine.webkitRequestFullscreen).call(racine).catch?.(() => {});
  });
  for (const ev of ["fullscreenchange", "webkitfullscreenchange"]) document.addEventListener(ev, () => { maj(); setTimeout(apres, 60); });
  maj();
}
