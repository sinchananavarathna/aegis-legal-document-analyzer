$ErrorActionPreference = 'Stop'
$url = 'https://nodejs.org/dist/v22.11.0/node-v22.11.0-win-x64.zip'
$dest = Join-Path $env:TEMP 'node-v22.11.0-win-x64.zip'
$extractDir = Join-Path $env:TEMP 'node-v22.11.0-win-x64'

if (Test-Path $extractDir) {
    Write-Output "Using existing Node install at $extractDir"
} else {
    Invoke-WebRequest -Uri $url -OutFile $dest
    Expand-Archive -Path $dest -DestinationPath $env:TEMP -Force
}

$node = Join-Path $extractDir 'node.exe'
$npm = Join-Path $extractDir 'npm.cmd'

if (-not (Test-Path $node)) { throw "Node executable not found at $node" }
if (-not (Test-Path $npm)) { throw "npm script not found at $npm" }

Write-Output "NODE=$node"
Write-Output "NPM=$npm"
