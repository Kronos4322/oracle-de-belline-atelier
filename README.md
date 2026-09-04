# Oracle de Belline — Atelier

Application personnelle pour étudier l'Oracle de Belline, s'entraîner et progresser
dans ses lectures.

## État actuel (squelette)

| Module | État |
|---|---|
| **Grimoire** | fonctionnel — les 53 fiches, éditables et enregistrées |
| **Entraînement** | première version — révision libre par flashcards |
| **Tirages** | ossature — décrit ce qui est prévu |
| **Journal** | ossature — décrit ce qui est prévu |
| **Progression** | ossature — 2 indicateurs déjà branchés |

Le contenu des cartes (mots-clés, symbolisme, significations) se remplit **carte par
carte** dans le Grimoire — l'application ne fournit que la structure : numéro, nom, série
planétaire.

## Technique

- HTML / CSS / JavaScript, **sans build ni dépendance**.
- Données stockées dans le **navigateur** (`localStorage`), isolées derrière
  `js/storage.js` pour pouvoir migrer plus tard vers une vraie base (Supabase…).
- Bouton **⬇** de la barre du haut : télécharge une sauvegarde `.json` de toutes les
  données. Bouton **⬆** : réimporte une sauvegarde (utile pour passer du PC au téléphone).

## Lancer en local

Ouvrir `index.html` dans un navigateur suffit. Pour un rendu identique à la mise en
ligne, servir le dossier :

```bash
python -m http.server 8000
```

puis ouvrir <http://localhost:8000>.

## Mettre en ligne (GitHub Pages)

1. Créer un dépôt sur GitHub et y pousser ce dossier.
2. *Settings → Pages → Build and deployment → Source : Deploy from a branch*,
   branche `main`, dossier `/ (root)`.
3. L'appli est accessible à `https://<utilisateur>.github.io/<dépôt>/` — sur PC comme
   sur téléphone.

## Images des cartes

Optionnelles. Placer les visuels dans `assets/cartes/` nommés `01.jpg` … `53.jpg`
(voir `assets/cartes/README.md`). En leur absence, l'application affiche le numéro de
la carte.

## Structure

```
index.html
css/styles.css
js/
  data/cards.js        les 53 cartes (référence)
  storage.js           lecture/écriture + sauvegarde/restauration
  app.js               routeur + démarrage
  views/               une vue par module
assets/cartes/         visuels des cartes (à fournir)
```

## Feuille de route

1. Grimoire + Entraînement *(en cours)*
2. Moteur de tirages : sélecteur des 53 cartes, modèles avec logique des positions,
   éditeur de tirage, 3 modes d'entrée (vide / physique / numérique)
3. Journal : lectures, consultants, champ « retour »
4. Progression : cartes qui bloquent, fréquences, justesse dans le temps
5. Quiz et répétition espacée dans l'Entraînement
