
$projectRoot = Get-Location
Write-Host "=== Starting Useless Files Audit ===" -ForegroundColor Cyan
Write-Host "Project Root: $($projectRoot.Path)" -ForegroundColor Gray

# --- 1. Collect all files ---
$allFiles = Get-ChildItem -Path $projectRoot -Recurse -File -Exclude node_modules,.next,.git,functions

$uselessFiles = @()

# --- 2. Check for empty files (0 bytes) ---
Write-Host "`n[1/7] Checking for empty files (0 bytes)..." -ForegroundColor Yellow
$emptyFiles = $allFiles | Where-Object { $_.Length -eq 0 }
if ($emptyFiles) {
    $uselessFiles += $emptyFiles | ForEach-Object { [PSCustomObject]@{ File=$_.FullName; Reason="Empty file (0 bytes)"; Category="Empty" } }
    Write-Host "→ Found $($emptyFiles.Count) empty files" -ForegroundColor Red
} else {
    Write-Host "→ No empty files found" -ForegroundColor Green
}

# --- 3. Check for backup files (.bak, .old, etc.) ---
Write-Host "`n[2/7] Checking for backup files (.bak, .old, .backup, .orig)..." -ForegroundColor Yellow
$backupPatterns = @("*.bak", "*.old", "*.backup", "*.orig")
$backupFiles = @()
foreach ($pat in $backupPatterns) {
    $backupFiles += Get-ChildItem -Path $projectRoot -Filter $pat -Recurse -File -Exclude node_modules,.next,.git,functions
}
if ($backupFiles) {
    $uselessFiles += $backupFiles | ForEach-Object { [PSCustomObject]@{ File=$_.FullName; Reason="Backup file ($($pat))"; Category="Backup" } }
    Write-Host "→ Found $($backupFiles.Count) backup files" -ForegroundColor Red
} else {
    Write-Host "→ No backup files found" -ForegroundColor Green
}

# --- 4. Check for temp files (.tmp, .log, .cache, .swp, .swo) ---
Write-Host "`n[3/7] Checking for temporary files (.tmp, .log, .cache, .swp, .swo)..." -ForegroundColor Yellow
$tempPatterns = @("*.tmp", "*.log", "*.cache", "*.swp", "*.swo")
$tempFiles = @()
foreach ($pat in $tempPatterns) {
    $tempFiles += Get-ChildItem -Path $projectRoot -Filter $pat -Recurse -File -Exclude node_modules,.next,.git,functions
}
if ($tempFiles) {
    $uselessFiles += $tempFiles | ForEach-Object { [PSCustomObject]@{ File=$_.FullName; Reason="Temporary file ($($pat))"; Category="Temporary" } }
    Write-Host "→ Found $($tempFiles.Count) temporary files" -ForegroundColor Red
} else {
    Write-Host "→ No temporary files found" -ForegroundColor Green
}

# --- 5. Check for duplicate files (by hash) ---
Write-Host "`n[4/7] Checking for duplicate files (by SHA256 hash)..." -ForegroundColor Yellow
$fileHashes = @{}
$duplicates = @()
foreach ($file in $allFiles) {
    $hash = (Get-FileHash -Path $file.FullName -Algorithm SHA256).Hash
    if ($fileHashes.ContainsKey($hash)) {
        $duplicates += [PSCustomObject]@{ File=$file.FullName; Original=$fileHashes[$hash]; Reason="Duplicate file (hash matches $($fileHashes[$hash]))"; Category="Duplicate" }
    } else {
        $fileHashes[$hash] = $file.FullName
    }
}
if ($duplicates) {
    $uselessFiles += $duplicates
    Write-Host "→ Found $($duplicates.Count) duplicate files" -ForegroundColor Red
} else {
    Write-Host "→ No duplicate files found" -ForegroundColor Green
}

# --- 6. Check for duplicate markdown files specifically ---
Write-Host "`n[5/7] Checking for duplicate markdown files specifically..." -ForegroundColor Yellow
$mdFiles = Get-ChildItem -Path $projectRoot -Filter *.md -Recurse -File -Exclude node_modules,.next,.git,functions
$mdHashes = @{}
$mdDuplicates = @()
foreach ($file in $mdFiles) {
    $hash = (Get-FileHash -Path $file.FullName -Algorithm SHA256).Hash
    if ($mdHashes.ContainsKey($hash)) {
        $mdDuplicates += [PSCustomObject]@{ File=$file.FullName; Original=$mdHashes[$hash]; Reason="Duplicate markdown (hash matches $($mdHashes[$hash]))"; Category="Duplicate MD" }
    } else {
        $mdHashes[$hash] = $file.FullName
    }
}
if ($mdDuplicates) {
    $uselessFiles += $mdDuplicates
    Write-Host "→ Found $($mdDuplicates.Count) duplicate markdown files" -ForegroundColor Red
} else {
    Write-Host "→ No duplicate markdown files found" -ForegroundColor Green
}

# --- 7. Display final useless files list ---
Write-Host "`n`n=== Final Useless Files Inventory ===" -ForegroundColor Cyan
if ($uselessFiles.Count -gt 0) {
    $uselessFiles | Format-Table -AutoSize
    $uselessFiles | Export-Csv -Path "useless-files-inventory.csv" -NoTypeInformation
    Write-Host "`nSaved useless files inventory to 'useless-files-inventory.csv'" -ForegroundColor Green
} else {
    Write-Host "→ No useless files found! Project is clean!" -ForegroundColor Green
}

Write-Host "`n=== Audit Complete ===" -ForegroundColor Cyan
