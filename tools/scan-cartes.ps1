# ---------------------------------------------------------------------------
#  scan-cartes.ps1
#
#  Regenere js/data/card-images.js a partir des fichiers d'assets/cartes/.
#
#  Chaque image doit commencer par le NUMERO de la carte :
#      1 DESTINEE.jpg        ->  carte 1
#      07. HONNEURS.jpg      ->  carte 7
#      0 CARTE BLEUE.jpg     ->  carte 53 (la carte bleue peut etre 0 ou 53)
#
#  Les fichiers sans numero en tete (ASTROLOGIE SOLEIL.jpg, captures...) sont ignores.
#
#  Lancement : clic droit > "Executer avec PowerShell"
#              ou dans un terminal :  powershell -File tools\scan-cartes.ps1
# ---------------------------------------------------------------------------
$ErrorActionPreference = 'Stop'

$root    = Split-Path -Parent $PSScriptRoot
$dir     = Join-Path $root 'assets\cartes'
$outFile = Join-Path $root 'js\data\card-images.js'

if (-not (Test-Path $dir)) { throw "Dossier introuvable : $dir" }

$map = [ordered]@{}

Get-ChildItem -Path $dir -File |
  Where-Object { $_.Extension -match '^\.(jpe?g|png|webp)$' } |
  Sort-Object Name |
  ForEach-Object {
    if ($_.BaseName -match '^\s*(\d{1,2})') {
      $n = [int]$Matches[1]
      if ($n -eq 0) { $n = 53 }
      if ($n -ge 1 -and $n -le 53) {
        if ($map.Contains("$n")) {
          Write-Warning ("Carte {0} : doublon, '{1}' ignore." -f $n, $_.Name)
        } else {
          $map["$n"] = $_.Name
        }
      } else {
        Write-Warning ("Numero hors plage ({0}) : '{1}' ignore." -f $n, $_.Name)
      }
    } else {
      Write-Host ("  ignore (pas de numero) : {0}" -f $_.Name)
    }
  }

$entries = $map.Keys | ForEach-Object {
  $safe = $map[$_].Replace('\', '\\').Replace('"', '\"')
  '  "' + $_ + '": "' + $safe + '"'
}

$body = if ($entries) { "`n" + ($entries -join ",`n") + "`n" } else { "" }

$content = @"
/* Genere par tools/scan-cartes.ps1 - ne pas editer a la main.
   Numero de carte -> nom du fichier image dans assets/cartes/. */
window.BELLINE = window.BELLINE || {};
window.BELLINE.CARD_IMAGES = {$body};
"@

[System.IO.File]::WriteAllText($outFile, $content, (New-Object System.Text.UTF8Encoding($false)))

Write-Host ""
Write-Host ("{0} image(s) associee(s) sur 53." -f $map.Count)
if ($map.Count) { Write-Host ("Cartes : " + (($map.Keys | Sort-Object { [int]$_ }) -join ', ')) }
Write-Host "Ecrit : js/data/card-images.js"
