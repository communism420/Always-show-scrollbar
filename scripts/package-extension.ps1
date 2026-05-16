$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$manifestPath = Join-Path $root "manifest.json"
$manifest = Get-Content -Raw -Path $manifestPath | ConvertFrom-Json
$version = $manifest.version
$dist = Join-Path $root "dist"
$zipPath = Join-Path $dist "always-show-scrollbar-$version.zip"

Push-Location $root
try {
    node scripts/validate-extension.mjs

    if (Test-Path $dist) {
        Remove-Item -LiteralPath $dist -Recurse -Force
    }

    New-Item -ItemType Directory -Force -Path $dist | Out-Null

    $runtimeItems = @(
        "_locales",
        "icons",
        "options",
        "popup",
        "src",
        "LICENSE",
        "logo.png",
        "manifest.json"
    )

    Compress-Archive -Path $runtimeItems -DestinationPath $zipPath -CompressionLevel Optimal
    Write-Output "Created $zipPath"
}
finally {
    Pop-Location
}
