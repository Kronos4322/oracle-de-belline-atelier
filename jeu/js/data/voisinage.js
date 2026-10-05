// Règles de voisinage de la notice de Belline.
// Elles s'appliquent quand deux cartes sont vécues l'une après l'autre (cartes voisines dans le tirage).
//   id      identifiant stable (carnet du joueur)
//   a, b    numéros des cartes
//   ordre   'libre' : « avec le n° … », « près du n° … » (l'ordre est indifférent)
//           'avant' : « la carte a précédant la carte b » (a doit être vécue juste avant b)
//   exige   (facultatif) { id, choix } : la carte `id` doit avoir été vécue avec ce choix (Hazard : avoir misé)
//   texte   formulation de Belline
//   source  où la notice donne cette règle
//   effets  effets ajoutés à ceux des deux cartes

const SOURCE_ETOILE = "À vérifier : cette règle ne figure dans aucune notice de carte de ce fichier (méthode de lecture ?)";

export const VOISINAGE = [
  { id: "4-47", a: 4, b: 47, ordre: "libre", source: "notice du n° 4", texte: "Nativité près de Stérilité : efforts inutiles.", effets: [{ type: "fortune", valeur: -15 }] },
  { id: "9-30", a: 9, b: 30, ordre: "libre", source: "notice du n° 9", texte: "Campagne et Table : pique-nique.", effets: [{ type: "energie", valeur: 15 }] },
  { id: "12-15", a: 12, b: 15, ordre: "libre", source: "notice du n° 12", texte: "Départ et Eau : voyage à l’étranger.", effets: [{ type: "accelerer", duree: 4 }, { type: "fortune", valeur: 10 }] },
  { id: "13-38", a: 13, b: 38, ordre: "libre", source: "notice du n° 13", texte: "Inconstance et Accident : catastrophe aérienne.", effets: [{ type: "energie", valeur: -20 }] },
  { id: "15-38", a: 15, b: 38, ordre: "libre", source: "notice du n° 15", texte: "Eau et Accident : noyade, inondation, naufrage.", effets: [{ type: "energie", valeur: -20 }] },
  { id: "17-48", a: 17, b: 48, ordre: "libre", source: "notice du n° 17", texte: "Maladie et Fatalité : maladie fatale.", effets: [{ type: "energie", valeur: -25 }] },
  { id: "17-49", a: 17, b: 49, ordre: "libre", source: "notice du n° 17", texte: "Maladie et Grâce : guérison, convalescence.", effets: [{ type: "energie", valeur: 25 }] },
  { id: "21-23", a: 21, b: 23, ordre: "libre", source: "notice du n° 21", texte: "Vol-Perte et Trafic : affaires véreuses.", effets: [{ type: "fortune", valeur: -20 }] },
  { id: "21-35", a: 21, b: 35, ordre: "libre", source: "notice du n° 21", texte: "Vol-Perte et Ennemis : attaque, vol.", effets: [{ type: "fortune", valeur: -20 }] },
  { id: "22-32", a: 22, b: 32, ordre: "libre", source: "notice du n° 22", texte: "Entreprises et Méchanceté : guet-apens, piège.", effets: [{ type: "energie", valeur: -15 }] },
  { id: "23-19", a: 23, b: 19, ordre: "libre", source: "notice du n° 23", texte: "Trafic et Argent : placements intéressants.", effets: [{ type: "fortune", valeur: 25 }] },
  { id: "27-30", a: 27, b: 30, ordre: "libre", source: "notice du n° 27", texte: "Union et Table : invitation à un mariage.", effets: [{ type: "energie", valeur: 15 }] },
  { id: "27-50", a: 27, b: 50, ordre: "libre", source: "notice du n° 27", texte: "Union et Ruine : divorce, rupture.", effets: [{ type: "energie", valeur: -20 }] },
  { id: "29-33", a: 29, b: 33, ordre: "libre", source: "notice du n° 29", texte: "Amor et Procès : rivalité en amour.", effets: [{ type: "energie", valeur: -10 }] },
  { id: "30-17", a: 30, b: 17, ordre: "libre", source: "notice du n° 30", texte: "Table et Maladie : excès nuisibles.", effets: [{ type: "energie", valeur: -10 }] },
  { id: "31-34", a: 31, b: 34, ordre: "libre", source: "notice du n° 31", texte: "Passions et Despotisme : passions malheureuses, dégradantes.", effets: [{ type: "energie", valeur: -15 }] },
  { id: "36-32", a: 36, b: 32, ordre: "libre", source: "notice du n° 36", texte: "Pourparlers et Méchanceté : complot.", effets: [{ type: "energie", valeur: -15 }] },
  { id: "37-38", a: 37, b: 38, ordre: "libre", source: "notice du n° 38", texte: "Feu et Accident : incendie, foudre, électrocution.", effets: [{ type: "energie", valeur: -20 }] },
  { id: "44-50", a: 44, b: 50, ordre: "libre", exige: { id: 44, choix: 0 }, source: "notice du n° 44", texte: "Hazard et Ruine : ruine au jeu, spéculations néfastes.", effets: [{ type: "fortune", valeur: -40 }] },
  { id: "52-17", a: 52, b: 17, ordre: "libre", source: "notice du n° 52", texte: "Cloître et Maladie : hôpital.", effets: [{ type: "retrait", duree: 2 }] },
  { id: "52-46", a: 52, b: 46, ordre: "libre", source: "notice du n° 52", texte: "Cloître et Infortune : hospice.", effets: [{ type: "retrait", duree: 2 }] },
  { id: "52-29", a: 52, b: 29, ordre: "libre", source: "notice du n° 52", texte: "Cloître et Amor : amour sacrifié.", effets: [{ type: "energie", valeur: -10 }] },
  { id: "38>2", a: 38, b: 2, ordre: "avant", source: SOURCE_ETOILE, texte: "Accident précédant l’Étoile : vous êtes exposé à un accident.", effets: [{ type: "energie", valeur: -15 }] },
  { id: "38>3", a: 38, b: 3, ordre: "avant", source: SOURCE_ETOILE, texte: "Accident précédant l’Étoile : vous êtes exposé à un accident.", effets: [{ type: "energie", valeur: -15 }] },
  { id: "7>2", a: 7, b: 2, ordre: "avant", source: SOURCE_ETOILE, texte: "Honneur précédant l’Étoile : vous bénéficierez d’une distinction.", effets: [{ type: "fortune", valeur: 30 }] },
  { id: "7>3", a: 7, b: 3, ordre: "avant", source: SOURCE_ETOILE, texte: "Honneur précédant l’Étoile : vous bénéficierez d’une distinction.", effets: [{ type: "fortune", valeur: 30 }] }
];

/** Vrai si la règle `r` relie les deux cartes (ordre compris). */
export function regleRelie(r, idPrecedente, idCourante) {
  if (r.ordre === "avant") return r.a === idPrecedente && r.b === idCourante;
  return (r.a === idPrecedente && r.b === idCourante) || (r.b === idPrecedente && r.a === idCourante);
}

/**
 * Règles déclenchées quand l'entrée `courante` du tirage suit immédiatement `precedente`.
 * Une entrée est { id, choix } ; `exige` vérifie le choix fait sur une carte (Hazard misé).
 */
export function reglesDeclenchees(precedente, courante) {
  if (!precedente || !courante) return [];
  return VOISINAGE.filter(r => {
    if (!regleRelie(r, precedente.id, courante.id)) return false;
    if (r.exige) {
      const e = [precedente, courante].find(x => x.id === r.exige.id);
      if (!e || e.choix !== r.exige.choix) return false;
    }
    return true;
  });
}
