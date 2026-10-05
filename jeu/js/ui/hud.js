// Tableau de bord : énergie (et ce qu'il faut pour la prochaine porte), fortune, boucliers, région, effets actifs.
import { CONFIG, REGIONS } from "../config.js";

const $ = id => document.getElementById(id);
let dernierActifs = "";

export function majHud(etat, region, besoin = 0) {
  const max = CONFIG.energieMax;
  $("jauge-energie").style.width = `${Math.min(100, etat.energie / max * 100)}%`;
  $("jauge-borne").style.width = `${100 - etat.energieMax / max * 100}%`;
  const b = $("jauge-besoin");
  b.style.left = `${Math.min(100, besoin / max * 100)}%`;
  b.classList.toggle("alerte", besoin >= etat.energie);
  b.title = `Il faut environ ${besoin} d’énergie pour atteindre la prochaine porte au pas actuel.`;
  $("val-energie").textContent = `${Math.round(etat.energie)} / ${etat.energieMax}`;
  $("val-besoin").textContent = besoin ? `porte : ${besoin}` : "";
  $("val-besoin").classList.toggle("alerte", besoin >= etat.energie);
  $("val-fortune").textContent = Math.round(etat.fortune);
  $("val-boucliers").textContent = etat.boucliers;
  const reg = REGIONS[region];
  $("nom-region").textContent = `${reg.glyphe} ${reg.nom}`;
  $("bouton-bleue").hidden = !etat.carteBleue;

  const m = etat.minuteurs, s = etat.suivante, actifs = [];
  const t = (nom, v, cl = "") => actifs.push(`<span class="puce ${cl}">${nom} <b>${Math.ceil(v)} s</b></span>`);
  const f = (nom, cl = "") => actifs.push(`<span class="puce ${cl}">${nom}</span>`);
  if (m.retrait > 0) t("Retrait", m.retrait, "mal");
  if (m.ralenti > 0) t("Ralenti", m.ralenti, "mal");
  if (m.accelere > 0) t("Pas vif", m.accelere, "bien");
  if (m.sterilite > 0) t("Stérilité", m.sterilite, "mal");
  if (m.lunaison > 0) t(`Lunaison ${REGIONS[etat.lunaisonRegion]?.glyphe ?? ""}`, m.lunaison);
  if (m.elevation > 0) t("Élévation", m.elevation, "bien");
  if (m.compagnon > 0) t("Le chien", m.compagnon, "bien");
  if (m.passivite > 0) t("Porté par l’eau", m.passivite, "mal");
  if (m.aveuglement > 0) t("Aveuglement", m.aveuglement, "mal");
  if (m.discernement > 0) t("Discernement", m.discernement, "bien");
  if (m.moderation > 0) t("Modération", m.moderation);
  if (m.deperissement > 0) t("Dépérissement", m.deperissement, "mal");
  if (m.regain > 0) t("Affection", m.regain, "bien");
  if (m.feuDePaille > 0) t("Feu de paille", m.feuDePaille);
  if (s.double) f("Prochaine carte doublée", "bien");
  if (s.ignorer) f("Prochaine carte fermée");
  if (s.survoler) f("Envol au-dessus de la prochaine");
  if (s.affaiblir) f("Prochain gain affaibli", "mal");
  if (s.attenuer) f("Prochaine perte atténuée", "bien");
  if (etat.reveler > 0) f(`Vue +${etat.reveler}`, "bien");
  for (const d of etat.differes) t(d.promesse ? "Promesse" : `Espérance +${d.valeur}`, d.restant);
  for (const p of etat.projets) f(`Projet : encore ${p.restantCartes} carte${p.restantCartes > 1 ? "s" : ""}`);
  const html = actifs.join("");
  if (html !== dernierActifs) { $("effets-actifs").innerHTML = html; dernierActifs = html; }
}

/** Le tirage composé en cours : les cartes retenues aux portes. */
export function majRetenues(retenues, nomCarte) {
  const el = $("retenues");
  if (!el) return;
  el.innerHTML = retenues.length
    ? retenues.map(r => `<span class="retenue" title="${nomCarte(r.id)}">${REGIONS[r.region].glyphe} ${nomCarte(r.id)}</span>`).join("")
    : "<span class='vide'>Aux portes, vous retiendrez une carte par planète.</span>";
}
