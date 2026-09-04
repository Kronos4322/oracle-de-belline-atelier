# Oracle de Belline — Atelier

Application personnelle pour étudier l'Oracle de Belline, s'entraîner et progresser
dans ses lectures.

## État actuel (squelette)

| Module | État |
|---|---|
| **Grimoire** | fonctionnel — 53 fiches pré-remplies, à retravailler |
| **Associations** | fonctionnel — combinaisons de cartes en dossiers / sous-dossiers |
| **Entraînement** | première version — révision libre par flashcards |
| **Tirages** | fonctionnel — **Tirage d'Hécate** (22 positions), plateau + panneau de lecture |
| **Journal** | ossature — décrit ce qui est prévu |
| **Progression** | ossature — 2 indicateurs branchés |

Le **Tirage d'Hécate** (`js/data/spreads.js`) : plateau en arbre (axe central →
deux voies → nœuds → éclaircisseurs + la Coupe), chaque position explique son rôle,
placement des cartes une à une ou tirage au sort, bouton « Charger l'exemple »
(transcription des planches de référence), section « Comment lire ce tirage ».

### Les 3 couches d'une fiche

1. **structure** (`js/data/cards.js`) : numéro, nom, série planétaire
2. **repères** (`js/data/card-reference.js`) : mots-clés + significations synthétisés
   de sources publiques — ils **pré-remplissent** les champs
3. **tes modifications** (`localStorage`) : dès que tu enregistres, ta version
   remplace les repères. « Revenir au texte de référence » l'efface.

Le compteur du Grimoire indique le nombre de fiches que **tu** as retravaillées.

Un **clic sur l'image** d'une carte (ou sur le symbole planétaire) l'affiche en grand.

## Technique

- HTML / CSS / JavaScript, **sans build ni dépendance**.
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
  data/spreads.js        modèles de tirage (Tirage d'Hécate)
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
