# Oracle de Belline — Atelier

Application personnelle pour étudier l'Oracle de Belline, s'entraîner et progresser
dans ses lectures.

## État actuel (squelette)

| Module | État |
|---|---|
| **Grimoire** | fonctionnel — 53 fiches pré-remplies, à retravailler |
| **Associations** | fonctionnel — combinaisons de cartes en dossiers / sous-dossiers |
| **Entraînement** | première version — révision libre par flashcards |
| **Tirages** | 4 dispositifs : Hécate, Miroir du Cœur, Verdict, Flambeau |
| **Journal** | fonctionnel — le carnet (format du manuel : avant / après) |
| **Progression** | fonctionnel — test de concordance, relevé des cartes fortes |
| **Méthode** | mémo de lecture d'après les deux manuels |
| **Jeux** | le Chemin du Mage et le Duel des Apparitions (dossier `jeu/`), reliés à l'Atelier |

Basé sur *Lire le Belline*, *L'Oracle et la grille* et le *Dossier encyclopédique
des 53 cartes* :
- **valence** lexicale (positive / négative / neutre), **polarité de travail**
  nuancée, **5 cartes fortes** traditionnelles (11, 34, 38, 42, 48) et
  **cartes majeures** — dont 11 très favorables (Réussite, Paix, Union, Amor,
  Appui, Sagesse, Renommée, Hasard, Bonheur, Grâce, Carte Bleue) ;
- fiches du Grimoire pré-remplies depuis le dossier + section **« Dossier complet »**
  (ombre, oui/non, lecture par position, à ne pas confondre…) ;
- 4 tirages avec leur grammaire (substantif / adjectif, nœud de cause / d'action,
  réversibilité, axes) ;
- **test de valence contraire** automatique dans la fenêtre de placement ;
- carnet : relevés calculés (familles, valences, cartes fortes, positions contraires),
  concordance, énoncés falsifiables ;
- Progression : concordance par tirage + combinaison de Fisher, écart cumulé des cartes fortes.

### Les 3 couches d'une fiche

1. **structure** (`js/data/cards.js`) : numéro, nom, série planétaire
2. **repères** (`js/data/card-reference.js`) : mots-clés + significations synthétisés
   de sources publiques — ils **pré-remplissent** les champs
3. **tes modifications** (`localStorage`) : dès que tu enregistres, ta version
   remplace les repères. « Revenir au texte de référence » l'efface.

Le compteur du Grimoire indique le nombre de fiches que **tu** as retravaillées.

Un **clic sur l'image** d'une carte (ou sur le symbole planétaire) l'affiche en grand.

## Les jeux (`jeu/`)

Deux jeux pour apprendre le Belline, ouverts depuis l'onglet **Jeux** :

- **Le Chemin du Mage** : le mage monte le chemin des sept planètes ; chaque carte vécue agit selon la notice.
- **Le Duel des Apparitions** : un jeu de cartes à duel (apparitions, influences, présages, figures d'accord,
  évolution, états, terrains, les Sept Gardiens). Les accords y suivent les règles de la notice, et les lectures
  du **dictionnaire des 2652 associations** de l'Atelier (chargé après le démarrage).

Même origine que l'Atelier : les jeux partagent le stockage du navigateur. L'onglet Jeux montre le carnet de jeu
(cartes vécues, règles découvertes, duels, Gardiens) ; une carte du Duel ouvre sa fiche dans le Grimoire.

Les jeux ont leur propre code (modules ES assemblés en un script par page) et leurs tests :

```bash
cd jeu
npm run build   # après toute modification de jeu/js/ : régénère jeu/js/jeu.js et jeu/js/jeu-duel.js
npm test        # 143 tests (moteur, données, équilibre, dictionnaire de l'Atelier, pages)
```

Voir `jeu/CLAUDE.md` pour les règles de contenu (fidélité à la notice) et l'architecture des jeux.
Après une modification des jeux : `node tools/gen-sw.js` à la racine (le cache hors-ligne les inclut ; les pages
`jeu/` sont servies réseau d'abord, donc toujours à jour en ligne).

## Technique

- HTML / CSS / JavaScript, **sans build ni dépendance**.
- Le dictionnaire des 2652 associations (4 Mo) n'est chargé qu'à l'ouverture de l'onglet Associations
  (`BELLINE.chargerDictionnaire`, `js/app.js`) : l'ouverture de l'appli sur téléphone passe de 4,9 Mo à 0,7 Mo.
- Données stockées dans le **navigateur** (`localStorage`), isolées derrière
  `js/storage.js` pour pouvoir migrer plus tard vers une vraie base (Supabase…).
- Bouton **⬇** de la barre du haut : télécharge une sauvegarde `.json` de toutes les
  données. Bouton **⬆** : réimporte une sauvegarde (utile pour passer du PC au téléphone).

## Lancer en local

Servir le dossier avec le serveur **sans cache** (important pendant le
développement, sinon le navigateur garde les anciens CSS/JS) :

```bash
python tools/serve.py
```

puis ouvrir <http://localhost:4173>. Après une modif de CSS/JS, incrémenter le
`?v=` dans `index.html` (ou `Ctrl+Maj+R`).

## Mettre en ligne (GitHub Pages)

1. Créer un dépôt sur GitHub et y pousser ce dossier.
2. *Settings → Pages → Build and deployment → Source : Deploy from a branch*,
   branche `main`, dossier `/ (root)`.
3. L'appli est accessible à `https://<utilisateur>.github.io/<dépôt>/` — sur PC comme
   sur téléphone.

## Images des cartes

Optionnelles. Placer les visuels dans `assets/cartes/` — chaque nom de fichier doit
**commencer par le numéro de la carte** (`01 DESTINEE.jpg`, `07. HONNEURS.jpg`,
`00 CARTE BLEUE.jpg`…). Puis lancer le scanner :

```bash
powershell -File tools\scan-cartes.ps1
```

Il régénère `js/data/card-images.js` (numéro → fichier). En l'absence d'image, la
fiche affiche le numéro de la carte. Détails : `assets/cartes/README.md`.

## Structure

```
index.html
css/styles.css
js/
  data/cards.js          les 53 cartes (structure)
  data/card-images.js    numéro → image + symboles planétaires (généré)
  data/card-reference.js repères de lecture (pré-remplissage des fiches)
  data/cards.js           + valence et cartes fortes des 53 lames
  data/spreads.js        4 modèles de tirage + analyse (relevés, concordance)
  storage.js             couches de données + sauvegarde/restauration
  app.js                 routeur + lightbox + démarrage
  views/                 une vue par module
tools/serve.py         serveur de dev sans cache
tools/scan-cartes.ps1  régénère card-images.js d'après assets/cartes/
assets/cartes/         visuels des cartes + 7 symboles planétaires
```

## Feuille de route

1. Grimoire + Entraînement *(en cours)*
2. Moteur de tirages : sélecteur des 53 cartes, modèles avec logique des positions,
   éditeur de tirage, 3 modes d'entrée (vide / physique / numérique)
3. Journal : lectures, consultants, champ « retour »
4. Progression : cartes qui bloquent, fréquences, justesse dans le temps
5. Quiz et répétition espacée dans l'Entraînement
