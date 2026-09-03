Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
foreach ($f in @('196173_1d62e4517c0049b0af1f6e1fc57d64b2.png','196173_0c3bd3bf80964fd9ac1e23c8d74319d2.png','11062b_2533d1d4c31245408717d17b946bc8d8.png','11062b_603340b7bcb14e7785c7b65b233cd9f9.png')) {
  $path = "$root\public\agati\$f"
  if (-not (Test-Path $path)) { continue }
  $b = [System.Drawing.Bitmap]::FromFile($path)
  $counts = @{}
  for ($y=0; $y -lt $b.Height; $y+=5) {
    for ($x=0; $x -lt $b.Width; $x+=5) {
      $p = $b.GetPixel($x,$y)
      if ($p.A -gt 200) {
        $key = "{0:X2}{1:X2}{2:X2}" -f $p.R,$p.G,$p.B
        if ($counts.ContainsKey($key)) { $counts[$key]++ } else { $counts[$key]=1 }
      }
    }
  }
  Write-Output "$f  ($($b.Width)x$($b.Height))"
  $counts.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 5 | ForEach-Object {
    Write-Output ("    #" + $_.Key + "  x" + $_.Value)
  }
  $b.Dispose()
}
