$filePath = "d:\Project\DealFlow.AI\dealsflowsai\app\portal\admin\page.tsx"
# Read file as UTF-8
$content = [System.IO.File]::ReadAllText($filePath)

# Remove BOM if present at the start
if ($content.StartsWith([char]0xFEFF)) {
    $content = $content.Substring(1)
}

# Replace any internal BOM characters just in case
$content = $content.Replace([char]0xFEFF, "")

# Normalize all line endings to LF
$content = $content.Replace("`r`n", "`n")

# Write using UTF-8 without BOM encoding
$utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($filePath, $content, $utf8WithoutBom)

Write-Host "Successfully normalized line endings to LF and removed BOM in admin page.tsx"
