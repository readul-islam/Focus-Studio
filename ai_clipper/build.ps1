# Builds an unpacked Chrome extension in dist/ (load this folder in chrome://extensions)
# and a zip archive in releases/ for distribution.

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$dist = Join-Path $root 'dist'
$releases = Join-Path $root 'releases'

$manifest = Get-Content (Join-Path $root 'manifest.json') -Raw | ConvertFrom-Json
$version = $manifest.version

$include = @(
    'manifest.json',
    'api.js',
    'background.js',
    'content.js',
    'login.html',
    'login.js',
    'login.css',
    'popup.html',
    'popup.js',
    'popup.css',
    'settings.html',
    'settings.js',
    'settings.css',
    'icons'
)

if (Test-Path $dist) {
    Remove-Item -Recurse -Force $dist
}
New-Item -ItemType Directory -Path $dist | Out-Null

foreach ($item in $include) {
    $source = Join-Path $root $item
    $target = Join-Path $dist $item
    Copy-Item -Path $source -Destination $target -Recurse -Force
}

if (-not (Test-Path $releases)) {
    New-Item -ItemType Directory -Path $releases | Out-Null
}

$zipName = "focuspilot-clipper-v$version.zip"
$zipPath = Join-Path $releases $zipName
if (Test-Path $zipPath) {
    Remove-Item -Force $zipPath
}
Compress-Archive -Path (Join-Path $dist '*') -DestinationPath $zipPath -Force

Write-Host "Unpacked extension: $dist"
Write-Host "Zip archive:        $zipPath"
Write-Host ""
Write-Host "In Chrome: chrome://extensions -> Load unpacked -> select the dist folder"
