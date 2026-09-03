Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
Get-ChildItem "$root\public\agati\*.jpg" | ForEach-Object {
  $b = [System.Drawing.Bitmap]::FromFile($_.FullName)
  $ratio = [math]::Round($b.Width / $b.Height, 2)
  $shape = if ($ratio -gt 1.15) { "landscape" } elseif ($ratio -lt 0.85) { "PORTRAIT " } else { "square   " }
  # crude greyscale test: sample pixels and see how close R,G,B stay to each other
  $diff = 0; $n = 0
  for ($y=0; $y -lt $b.Height; $y += [math]::Max(1,[int]($b.Height/40))) {
    for ($x=0; $x -lt $b.Width; $x += [math]::Max(1,[int]($b.Width/40))) {
      $p = $b.GetPixel($x,$y)
      $mx = [math]::Max($p.R,[math]::Max($p.G,$p.B)); $mn = [math]::Min($p.R,[math]::Min($p.G,$p.B))
      $diff += ($mx - $mn); $n++
    }
  }
  $sat = [math]::Round($diff / [math]::Max($n,1), 1)
  $tone = if ($sat -lt 12) { "B&W  " } else { "COLOUR" }
  Write-Output ("{0}  {1}  {2}  {3}x{4}  ratio {5}  sat {6}" -f $_.Name.Substring(0,18), $shape, $tone, $b.Width, $b.Height, $ratio, $sat)
  $b.Dispose()
}
