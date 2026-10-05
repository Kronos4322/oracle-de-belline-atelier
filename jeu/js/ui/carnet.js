// Carnet : écran de collection des cartes et des règles (la sauvegarde est dans stockage.js).
import { CARTES, CARTE_PAR_ID } from "../data/cartes.js";
import { VOISINAGE } from "../data/voisinage.js";
import { avancement } from "../engine/carnet.js";
import { peindreCarte } from "./fiche.js";

const $ = id => document.getElementById(id);
export function montrerCarnet(c) {
  const av = avancement(c);
  $("carnet-avancement").textContent = `${av.vecues} cartes vécues et ${av.vues} vues sur 53 · ${av.regles} règles de Belline sur ${av.totalRegles} · énigmes ${c.enigmes.reussies}/${c.enigmes.posees} · ${av.aRevoir} carte${av.aRevoir > 1 ? "s" : ""} à revoir · ${c.parties} chemin${c.parties > 1 ? "s" : ""}, meilleur score ${c.meilleurScore} · duels gagnés ${c.duels.gagnes}/${c.duels.joues}`;
  const grille = $("carnet-grille");
  const ordre = [...CARTES].sort((a, b) => a.id - b.id);
  grille.replaceChildren(...ordre.map(carte => {
    const f = c.cartes[carte.id] || { vue: 0, vecue: 0 };
    const b = document.createElement("button");
    b.className = "case-carnet" + (f.vecue ? " vecue" : f.vue ? " vue" : " inconnue") + (c.aRevoir[carte.id] ? " a-revoir" : "");
    b.setAttribute("aria-label", f.vue || f.vecue ? `${carte.id}. ${carte.nom}` : `Carte ${carte.id}, pas encore rencontrée`);
    if (f.vue || f.vecue) {
      const cv = document.createElement("canvas"); peindreCarte(cv, carte.id); b.appendChild(cv);
    } else b.innerHTML = `<span class="num">${carte.id || "◆"}</span><span>?</span>`;
    b.addEventListener("click", () => detail(carte.id, f));
    return b;
  }));
  $("carnet-regles").replaceChildren(...VOISINAGE.map(r => {
    const li = document.createElement("li");
    li.className = c.regles[r.id] ? "connue" : "";
    li.textContent = c.regles[r.id] ? r.texte : `N° ${r.a} ${r.ordre === "avant" ? "précédant" : "avec"} n° ${r.b} : à découvrir`;
    return li;
  }));
  $("carnet-detail").textContent = "Choisissez une carte pour relire sa notice.";
  $("ecran-carnet").classList.add("visible");
  $("bouton-fermer-carnet").focus();
}

function detail(id, f) {
  const carte = CARTE_PAR_ID[id];
  const d = $("carnet-detail");
  if (!f.vue && !f.vecue) { d.textContent = "Cette carte ne s’est pas encore montrée sur votre chemin."; return; }
  d.innerHTML = "<b></b><br><em></em><p></p><p class='lecon'></p>";
  d.querySelector("b").textContent = `${carte.id === 0 ? "" : carte.id + ". "}${carte.nom} · ${carte.motCle}`;
  d.querySelector("em").textContent = `Image : ${carte.image} · vue ${f.vue} fois, vécue ${f.vecue} fois`;
  d.querySelector("p").textContent = `« ${carte.notice} »`;
  d.querySelector(".lecon").textContent = carte.lecon;
}

export function cacherCarnet() { $("ecran-carnet").classList.remove("visible"); }
