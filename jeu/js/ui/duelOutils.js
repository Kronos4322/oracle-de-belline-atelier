// Petits outils de l'interface du Duel, sans état : mises à jour sur place (rien ne clignote), éléments de panneau.

/**
 * Met à jour les enfants d'un conteneur sans tout reconstruire : un élément dont la signature n'a pas changé
 * est gardé tel quel (ses animations continuent). `liste` : [[signature, créer]].
 */
export function reconcilier(conteneur, liste) {
  const enfants = [...conteneur.children];
  liste.forEach(([sig, creer], k) => {
    const ancien = enfants[k];
    if (ancien && ancien.dataset.sig === sig) return;
    const el = creer();
    el.dataset.sig = sig;
    if (ancien) ancien.replaceWith(el); else conteneur.appendChild(el);
  });
  for (let k = liste.length; k < enfants.length; k++) enfants[k].remove();
}

/** Pose ou retire des classes sur place (l'élément n'est pas recréé). */
export function basculer(el, toutes, actives) { for (const k of toutes) el.classList.toggle(k, actives.includes(k)); }

/** Un élément des panneaux Accords et Techniques : titre, texte, état ; un bouton s'il y a une action. */
export function itemPanneau(titre, texte, etat, action = null, classe = "") {
  const b = document.createElement(action ? "button" : "div");
  b.className = `technique-item ${classe}`;
  b.innerHTML = "<b></b><span></span><small></small>";
  b.querySelector("b").textContent = titre;
  b.querySelector("span").textContent = texte;
  b.querySelector("small").textContent = etat;
  if (action) b.addEventListener("click", action);
  return b;
}
