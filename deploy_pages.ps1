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

function Ensure-KvBinding {
    $configPath = Join-Path $PSScriptRoot "wrangler.toml"
    $configText = Get-Content -LiteralPath $configPath -Raw
    if ($configText -match 'binding\s*=\s*"DETECTIONS_KV"' -and $configText -notmatch 'REPLACE_WITH_DETECTIONS_KV_ID') {
        Write-Host "Cloudflare KV binding already configured."
        return
    }

    Write-Host ""
    Write-Host "Creating Cloudflare KV namespace for online detections..."
    $output = & cmd /c "echo n| npm exec --yes wrangler -- kv namespace create DETECTIONS_KV --preview false 2>&1"
    $text = ($output | Out-String)
    Write-Host $text

    $match = [regex]::Match($text, 'id\s*=\s*"([^"]+)"')
    if (-not $match.Success -and $text -match 'already exists') {
        Write-Host "KV namespace already exists. Looking up its id..."
        $listOutput = & cmd /c "echo n| npm exec --yes wrangler -- kv namespace list 2>&1"
        $listText = ($listOutput | Out-String)
        Write-Host $listText

        if ($LASTEXITCODE -ne 0) {
            throw "KV namespace list failed."
        }

        $listMatch = [regex]::Match($listText, '"id"\s*:\s*"([^"]+)"\s*,\s*"title"\s*:\s*"DETECTIONS_KV"')
        if (-not $listMatch.Success) {
            $listMatch = [regex]::Match($listText, '"title"\s*:\s*"DETECTIONS_KV"\s*,\s*"id"\s*:\s*"([^"]+)"')
        }

        if ($listMatch.Success) {
            $match = $listMatch;
        }
    } elseif ($LASTEXITCODE -ne 0) {
        throw "KV namespace create failed."
    }

    if (-not $match.Success) {
        throw "Could not find KV namespace id in Wrangler output."
    }

    $kvId = $match.Groups[1].Value
    $newBlock = @"
[[kv_namespaces]]
binding = "DETECTIONS_KV"
id = "$kvId"
"@

    if ($configText -match '\[\[kv_namespaces\]\][\s\S]*?binding\s*=\s*"DETECTIONS_KV"[\s\S]*?id\s*=\s*"[^"]+"') {
        $configText = [regex]::Replace(
            $configText,
            '\[\[kv_namespaces\]\]\s*binding\s*=\s*"DETECTIONS_KV"\s*id\s*=\s*"[^"]+"',
            $newBlock
        )
    } else {
        $configText = $configText.TrimEnd() + "`r`n`r`n" + $newBlock + "`r`n"
    }

    Set-Content -LiteralPath $configPath -Value $configText -Encoding UTF8
    Write-Host "Cloudflare KV binding saved to wrangler.toml."
}

Ensure-KvBinding

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
