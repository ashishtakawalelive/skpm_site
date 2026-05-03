$files = Get-ChildItem -Path "d:\skpm site\*.html"
foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw
    # Replace Inter with var(--body-font)
    $content = $content -replace "font-family:\s*'Inter',\s*sans-serif", "font-family: var(--body-font)"
    $content = $content -replace "font-family:\s*'Playfair Display',\s*serif", "font-family: var(--heading-font)"
    # Handle cases without spaces or different quotes
    $content = $content -replace "font-family:'Inter',sans-serif", "font-family: var(--body-font)"
    
    Set-Content $f.FullName $content
}
