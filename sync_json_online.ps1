$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

Write-Host "Paste your Cloudflare API Token below, then press Enter."
$token = Read-Host "Cloudflare API Token"
$token = $token.Trim().Trim('"').Trim("'") -replace '^\s*Bearer\s+', ''

if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "Token is empty."
    exit 1
}

$env:CLOUDFLARE_API_TOKEN = $token

Write-Host ""
Write-Host "Building and deploying online JSON API..."
npm run build
if ($LASTEXITCODE -ne 0) { throw "Build failed." }

cmd /c "echo n| npm exec --yes wrangler -- pages deploy dist --project-name jiaotongguanli --commit-dirty=true"
if ($LASTEXITCODE -ne 0) { throw "Deploy failed." }

Write-Host ""
Write-Host "Uploading local data/detections.json to online JSON API..."
node scripts/upload-detections-online.js
if ($LASTEXITCODE -ne 0) { throw "Upload failed." }

Write-Host ""
Write-Host "Sync finished."
