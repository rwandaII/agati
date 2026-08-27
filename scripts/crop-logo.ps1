Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$src  = [System.Drawing.Bitmap]::FromFile("$root\public\brand\agati-logo-white.png")
$rect = New-Object System.Drawing.Rectangle(1180, 820, 1150, 840)
$out  = New-Object System.Drawing.Bitmap(1150, 840, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g    = [System.Drawing.Graphics]::FromImage($out)
$g.DrawImage($src, (New-Object System.Drawing.Rectangle(0,0,1150,840)), $rect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()
$out.Save("$root\public\brand\agati-mark.png", [System.Drawing.Imaging.ImageFormat]::Png)
$out.Dispose(); $src.Dispose()
Write-Output "agati-mark.png written"
