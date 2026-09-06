# Comic scans come off archive.org at full plate quality - around 700KB a page,
# which would put well over 100MB of images into the repository and make a phone
# in Musanze download a book's worth of data per page. Cap the width and, just
# as importantly, re-encode: these arrive at a quality far beyond what a screen
# can show.
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$maxWidth = 2000
$quality = 92

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters(1)
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
  [System.Drawing.Imaging.Encoder]::Quality, [long]$quality)

$before = 0
$after = 0
$count = 0

$comicRoot = Join-Path $root 'public\comics'
if (-not (Test-Path $comicRoot)) {
  Write-Output 'no comics downloaded yet'
  exit 0
}

foreach ($dir in (Get-ChildItem -Path $comicRoot -Directory)) {
  foreach ($item in (Get-ChildItem -Path $dir.FullName -Filter *.jpg)) {
    $file = $item.FullName
    $before += $item.Length

    try {
      $src = [System.Drawing.Bitmap]::FromFile($file)

      $w = [Math]::Min($src.Width, $maxWidth)
      $h = [int]([math]::Round($src.Height * ($w / $src.Width)))

      $dst = New-Object System.Drawing.Bitmap($w, $h)
      $g = [System.Drawing.Graphics]::FromImage($dst)
      $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $g.DrawImage($src, 0, 0, $w, $h)
      $g.Dispose()
      $src.Dispose()

      $tmp = "$file.tmp"
      $dst.Save($tmp, $codec, $params)
      $dst.Dispose()
      Move-Item -LiteralPath $tmp -Destination $file -Force

      $after += (Get-Item -LiteralPath $file).Length
      $count++
    }
    catch {
      Write-Output ("  could not shrink {0}: {1}" -f $item.Name, $_.Exception.Message)
      $after += $item.Length
    }
  }
}

if ($count -gt 0) {
  Write-Output ("{0} pages: {1:N1}MB -> {2:N1}MB" -f $count, ($before / 1MB), ($after / 1MB))
}
else {
  Write-Output 'no comic pages found'
}
