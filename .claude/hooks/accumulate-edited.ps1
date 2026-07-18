# Accumulates edited file paths so the Stop hook can format/lint them in batch.
# Triggered by PostToolUse on Write|Edit tool.

$ErrorActionPreference = 'SilentlyContinue'

$toolInputJson = $env:CLAUDE_TOOL_INPUT
if (-not $toolInputJson) { exit 0 }

try {
    $toolInput = $toolInputJson | ConvertFrom-Json -ErrorAction Stop
} catch {
    exit 0
}

$filePath = $toolInput.file_path
if (-not $filePath) { exit 0 }

# Only track files we care about formatting/linting.
$relevant = '\.(ts|tsx|js|jsx|css|json|md)$'
if ($filePath -notmatch $relevant) { exit 0 }

# Normalize to repo-relative path.
$repoRoot = (git rev-parse --show-toplevel 2>$null)
if ($repoRoot -and $filePath.StartsWith($repoRoot)) {
    $filePath = $filePath.Substring($repoRoot.Length).TrimStart('\','/')
}

$trackingFile = Join-Path $PSScriptRoot '.edited-files'

# Append without duplicates.
$existing = @()
if (Test-Path $trackingFile) {
    $existing = @(Get-Content $trackingFile -ErrorAction SilentlyContinue | Where-Object { $_ -ne '' })
}
if ($existing -notcontains $filePath) {
    $existing += $filePath
}

# Write atomically.
$tempFile = "$trackingFile.tmp"
$existing | Set-Content -Path $tempFile -Encoding UTF8
Move-Item -Path $tempFile -Destination $trackingFile -Force

exit 0
