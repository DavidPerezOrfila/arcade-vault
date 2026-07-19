# Runs prettier + eslint --fix on files accumulated by accumulate-edited.ps1.
# Triggered by Claude Code Stop hook (once per response).

$ErrorActionPreference = 'SilentlyContinue'

$trackingFile = Join-Path $PSScriptRoot '.edited-files'
if (-not (Test-Path $trackingFile)) { exit 0 }

$files = @(Get-Content $trackingFile -ErrorAction SilentlyContinue | Where-Object { $_ -ne '' })
$files = @($files | Where-Object { Test-Path $_ })

if ($files.Count -eq 0) {
    Remove-Item $trackingFile -ErrorAction SilentlyContinue
    exit 0
}

$repoRoot = (git rev-parse --show-toplevel 2>$null)
if (-not $repoRoot) { $repoRoot = (Resolve-Path "$PSScriptRoot/../..").Path }

Push-Location $repoRoot
try {
    npx prettier --write @files 2>$null
    $lintable = @($files | Where-Object { $_ -match '\.(ts|tsx|js|jsx)$' })
    if ($lintable.Count -gt 0) {
        npx eslint --fix @lintable 2>$null
    }
} finally {
    Pop-Location
}

Remove-Item $trackingFile -ErrorAction SilentlyContinue
exit 0
