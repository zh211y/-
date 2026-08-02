$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

function Clean-CloudflareToken {
    param([string]$Token)

    $clean = ($Token -replace "`r", "" -replace "`n", "").Trim()
    $clean = $clean.Trim('"').Trim("'").Trim()
    $clean = $clean -replace '^\s*set\s+CLOUDFLARE_API_TOKEN\s*=\s*', ''
    $clean = $clean -replace '^\s*CLOUDFLARE_API_TOKEN\s*=\s*', ''
    $clean = $clean -replace '^\s*Bearer\s+', ''
    $clean = $clean.Trim().Trim('"').Trim("'").Trim()
    return $clean
}

Write-Host "Paste your Cloudflare API Token below, then press Enter."
Write-Host "This script will clean Bearer/token assignment text automatically."
Write-Host ""
$rawToken = Read-Host "Cloudflare API Token"
$plainToken = Clean-CloudflareToken $rawToken

if ([string]::IsNullOrWhiteSpace($plainToken)) {
    Write-Host ""
    Write-Host "Token is empty. Deploy stopped."
    exit 1
}

$env:CLOUDFLARE_API_TOKEN = $plainToken

Write-Host ""
Write-Host "Building latest static files..."
npm run build
if ($LASTEXITCODE -ne 0) {
    throw "Build failed."
}

Write-Host ""
Write-Host "Deploying to Cloudflare Pages..."
Write-Host "If Wrangler asks about Cloudflare skills, this script answers no automatically."
cmd /c "echo n| npm exec --yes wrangler -- pages deploy dist --project-name jiaotongguanli --commit-dirty=true"
if ($LASTEXITCODE -ne 0) {
    throw "Deploy failed."
}

Write-Host ""
Write-Host "Deploy finished."
