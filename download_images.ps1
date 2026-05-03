$images = @{
    "audit" = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"
    "tax" = "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80"
    "advisory" = "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"
    "nri" = "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=800&q=80"
    "governance" = "https://images.unsplash.com/photo-1436450412740-6b988f486c6b?auto=format&fit=crop&w=800&q=80"
    "valuation" = "https://images.unsplash.com/photo-1560472355-536de3962603?auto=format&fit=crop&w=800&q=80"
    "indas" = "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80"
    "cfo" = "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80"
    "succession" = "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=800&q=80"
    "rera" = "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=800&q=80"
}

foreach ($name in $images.Keys) {
    $url = $images[$name]
    $path = "images/services/$name.jpg"
    Write-Host "Downloading $name to $path..."
    Invoke-WebRequest -Uri $url -OutFile $path
}
