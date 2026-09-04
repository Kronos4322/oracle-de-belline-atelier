# ---------------------------------------------------------------------------
#  scan-cartes.ps1
#
#  Regenere js/data/card-images.js a partir des fichiers d'assets/cartes/.
#
#  1) Images de cartes : le nom commence par le NUMERO de la carte
#         1 DESTINEE.jpg        ->  carte 1
#         07. HONNEURS.jpg      ->  carte 7
#         00 CARTE BLEUE.jpg    ->  carte 53 (la carte bleue peut etre 0 ou 53)
#
#  2) Symboles planetaires : le nom est celui de la planete
#         SOLEIL.jpg  LUNE.jpg  MERCURE.jpg  VENUS.jpg  MARS.jpg
#         JUPITER.jpg  SATURNE.jpg
#
#  Les autres fichiers sont ignores.
#
#  Lancement : clic droit > "Executer avec PowerShell"
#              ou dans un terminal :  powershell -File tools\scan-cartes.ps1
# ---------------------------------------------------------------------------
$ErrorActionPreference = 'Stop'

$root    = Split-Path -Parent $PSScriptRoot
$dir     = Join-Path $root 'assets\cartes'
$outFile = Join-Path $root 'js\data\card-images.js'

if (-not (Test-Path $dir)) { throw "Dossier introuvable : $dir" }

$planets = 'SOLEIL', 'LUNE', 'MERCURE', 'VENUS', 'MARS', 'JUPITER', 'SATURNE'
$planetKey = @{
  SOLEIL = 'soleil'; LUNE = 'lune'; MERCURE = 'mercure'; VENUS = 'venus'
  MARS = 'mars'; JUPITER = 'jupiter'; SATURNE = 'saturne'
}

$cards       = [ordered]@{}
$planetFiles = [ordered]@{}

Get-ChildItem -Path $dir -File |
  Where-Object { $_.Extension -match '^\.(jpe?g|png|webp)$' } |
  Sort-Object Name |
  ForEach-Object {
    $base = $_.BaseName.Trim().ToUpperInvariant()
    if ($_.BaseName -match '^\s*(\d{1,2})') {
      $n = [int]$Matches[1]
      if ($n -eq 0) { $n = 53 }
      if ($n -ge 1 -and $n -le 53) {
        if ($cards.Contains("$n")) {
          Write-Warning ("Carte {0} : doublon, '{1}' ignore." -f $n, $_.Name)
        } else {
          $cards["$n"] = $_.Name
        }
      } else {
        Write-Warning ("Numero hors plage ({0}) : '{1}' ignore." -f $n, $_.Name)
      }
    } elseif ($planets -contains $base) {
      $planetFiles[$planetKey[$base]] = $_.Name
    } else {
      Write-Host ("  ignore : {0}" -f $_.Name)
    }
  }

function Format-Map($map) {
  $items = $map.Keys | ForEach-Object {
    $safe = $map[$_].Replace('\', '\\').Replace('"', '\"')
    '  "' + $_ + '": "' + $safe + '"'
  }
  if ($items) { "`n" + ($items -join ",`n") + "`n" } else { "" }
}

$content = @"
/* Genere par tools/scan-cartes.ps1 - ne pas editer a la main.
   CARD_IMAGES  : numero de carte  -> fichier image dans assets/cartes/
   PLANET_IMAGES: cle de planete   -> fichier symbole dans assets/cartes/ */
window.BELLINE = window.BELLINE || {};
window.BELLINE.CARD_IMAGES = {$(Format-Map $cards)};
window.BELLINE.PLANET_IMAGES = {$(Format-Map $planetFiles)};
"@

[System.IO.File]::WriteAllText($outFile, $content, (New-Object System.Text.UTF8Encoding($false)))

Write-Host ""
Write-Host ("{0} carte(s) sur 53, {1} symbole(s) planetaire(s) sur 7." -f $cards.Count, $planetFiles.Count)
if ($cards.Count -lt 53) {
  $manque = 1..53 | Where-Object { -not $cards.Contains("$_") }
  Write-Host ("Cartes sans image : " + ($manque -join ', '))
}
Write-Host "Ecrit : js/data/card-images.js"
