// Écran de fin : le tirage composé (une carte retenue par planète), dessiné et lu, puis le chemin parcouru.
import { REGIONS } from "../config.js";
import { CARTE_PAR_ID } from "../data/cartes.js";
import { peindreCarte } from "./fiche.js";

const $ = id => document.getElementById(id);
const nom = id => (id == null ? "" : `${CARTE_PAR_ID[id].symbole} ${CARTE_PAR_ID[id].nom}`);
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));

function phraseEtoile(e, role) {
  if (!e) return "";
  if (!e.rencontree) return `<p><b>${role}</b> : ${esc(nom(e.etoile))} n’a pas été rencontrée.</p>`;
  if (e.ignoree) return `<p><b>${role}</b> : ${esc(nom(e.etoile))} est restée voilée (porte fermée par La Destinée).</p>`;
  if (e.recu == null) return `<p><b>${role}</b> : ${esc(nom(e.etoile))} n’a rien reçu.</p>`;
  return `<p><b>${role}</b> : ${esc(nom(e.etoile))} a reçu <b>${esc(nom(e.recu))}</b> : « ${esc(CARTE_PAR_ID[e.recu].motCle)} ».</p>`;
}

export function montrerLecture(lecture, etat, { graine, record, consultant, enigmes }) {
  $("fin-titre").textContent = etat.victoire ? "Le cycle des sept planètes est accompli" : "Le mage s’arrête";
  const b = lecture.bilan;
  $("fin-bilan").textContent = `Chemin n° ${graine} · ${b.vecues} cartes vécues, ${b.laissees} laissées · Fortune ${b.fortune} · Énergie ${b.energie} · Énigmes ${enigmes.reussies}/${enigmes.posees} · Score ${b.score}${record ? " · nouveau record" : ""}`;

  // Le tirage, dessiné
  const zone = $("fin-tirage");
  zone.replaceChildren(...lecture.tirage.map(t => {
    const fig = document.createElement("figure");
    fig.className = "carte-tirage";
    fig.style.setProperty("--i", t.position);
    const cv = document.createElement("canvas"); peindreCarte(cv, t.id);
    const cap = document.createElement("figcaption");
    cap.textContent = `${REGIONS[t.region].glyphe} ${REGIONS[t.region].nom}`;
    fig.append(cv, cap);
    return fig;
  }));
  $("fin-tirage-vide").hidden = lecture.tirage.length > 0;

  // La lecture, position par position
  const accordsPar = new Map();
  for (const a of lecture.accords) accordsPar.set(a.positions[1], a);
  let html = lecture.tirage.map(t => {
    const c = CARTE_PAR_ID[t.id], a = accordsPar.get(t.position);
    return `<p><b>${esc(REGIONS[t.region].glyphe)} ${esc(REGIONS[t.region].nom)}</b> : ${esc(c.nom)}, « ${esc(c.motCle)} ». <span class="petit">${esc(c.notice)}</span>${a ? `<br><span class="accord">✦ Avec la carte précédente : ${esc(a.texte)}</span>` : ""}</p>`;
  }).join("");
  const moi = consultant === "femme" ? "Votre significateur (la consultante)" : "Votre significateur (le consultant)";
  html += `<hr>${phraseEtoile(lecture.significateur, moi)}${phraseEtoile(lecture.influence, "L’influence")}`;
  if (lecture.premierPlan) {
    const p = lecture.premierPlan;
    html += p.ouverte
      ? `<p><b>Au premier plan</b> : La Destinée a ouvert la porte sur ${p.carte != null ? `<b>${esc(nom(p.carte))}</b>` : "aucune carte"}.</p>`
      : `<p><b>La Destinée</b> a fermé la porte sur ${p.carte != null ? esc(nom(p.carte)) : "aucune carte"}.</p>`;
  }
  html += lecture.regles.length
    ? `<p><b>Règles de Belline réunies en chemin</b> :</p><ul>${lecture.regles.map(r => `<li>${esc(r.texte)}</li>`).join("")}</ul>`
    : "<p><b>Règles de Belline</b> : aucune réunie en chemin. Cherchez les fils d’or.</p>";
  if (lecture.fortes.length) html += `<p><b>Cartes fortes vécues</b> : ${lecture.fortes.map(id => esc(nom(id))).join(", ")}.</p>`;
  $("fin-lecture").innerHTML = html;

  $("fin-sequence").innerHTML = lecture.parRegion.map(({ region, entrees }) => {
    const r = REGIONS[region];
    const cartes = entrees.map(h => {
      const c = CARTE_PAR_ID[h.id];
      const marques = [h.double ? "doublée" : "", h.ignoree ? "fermée" : "", h.remplacee ? "remplacée" : "", h.retour ? "revenue" : "",
        h.choix != null && c.choix ? c.choix[h.choix].label.split(" (")[0] : ""].filter(Boolean).join(", ");
      return `<li title="${esc(c.notice)}"><span class="sym">${esc(c.symbole)}</span>${esc(c.nom)}${marques ? ` <em>(${esc(marques)})</em>` : ""}</li>`;
    }).join("");
    return `<div class="region-tirage"><h4>${esc(r.glyphe)} ${esc(r.nom)}</h4><ol>${cartes}</ol></div>`;
  }).join("");
  $("ecran-fin").classList.add("visible");
  $("ecran-fin").scrollTop = 0;
  $("bouton-meme").focus();
}

export function cacherTirage() { $("ecran-fin").classList.remove("visible"); }
