Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$b = [System.Drawing.Bitmap]::FromFile("$root\public\agati\196173_0c3bd3bf80964fd9ac1e23c8d74319d2.png")
$counts = @{}
for ($y=0; $y -lt $b.Height; $y+=2) {
  for ($x=0; $x -lt $b.Width; $x+=2) {
    $p = $b.GetPixel($x,$y)
    if ($p.A -gt 230) {
      $sum = [int]$p.R + [int]$p.G + [int]$p.B
      if ($sum -lt 720) {   # skip near-white
        $key = "{0:X2}{1:X2}{2:X2}" -f $p.R,$p.G,$p.B
        if ($counts.ContainsKey($key)) { $counts[$key]++ } else { $counts[$key]=1 }
      }
    }
  }
}
Write-Output "AGATI LOGO PALETTE:"
$counts.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 10 | ForEach-Object {
  Write-Output ("  #" + $_.Key + "   " + $_.Value + " px")
}
$b.Dispose()
