# Visuels des cartes

Déposer ici les images des 53 cartes. **Le nom doit commencer par le numéro de la
carte** — le reste du nom est libre (majuscules, sans accent, peu importe) :

```
00 CARTE BLEUE.jpg      -> carte 53 (la carte bleue : 0 ou 53 acceptés)
01 DESTINEE.jpg         -> carte 1
04. NATIVITE.jpg        -> carte 4  (un point après le numéro est toléré)
07 HONNEURS.jpg         -> carte 7
```

Formats : `.jpg`, `.jpeg`, `.png`, `.webp`.

Les fichiers **sans numéro en tête** (planches d'astrologie, captures d'écran…) sont
simplement ignorés — tu peux les laisser dans le dossier.

## Après avoir ajouté ou renommé des images

Lancer le scanner pour mettre à jour la correspondance utilisée par l'application :

```
powershell -File tools\scan-cartes.ps1
```

(ou clic droit sur `tools\scan-cartes.ps1` → « Exécuter avec PowerShell »)

Il régénère `js/data/card-images.js`. Sans image pour une carte, la fiche affiche
juste son numéro.

## Droits

Les illustrations de l'Oracle de Belline sont protégées. N'utiliser ici que des
reproductions pour un usage strictement personnel. Si tu publies le dépôt sur GitHub
en public, envisage de **garder les images en local** (ne pousser que le code).
