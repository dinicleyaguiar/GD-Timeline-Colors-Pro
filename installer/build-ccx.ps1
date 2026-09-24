$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$plugin = Join-Path $root "plugin"
$build = Join-Path $root "build"
$zip = Join-Path $build "GD-Timeline-Colors-Pro.zip"
$ccx = Join-Path $build "GD-Timeline-Colors-Pro.ccx"

New-Item -ItemType Directory -Force -Path $build | Out-Null
Remove-Item $zip, $ccx -Force -ErrorAction SilentlyContinue
Compress-Archive -Path (Join-Path $plugin "*") -DestinationPath $zip -CompressionLevel Optimal -Force
Move-Item $zip $ccx -Force
Write-Output $ccx
