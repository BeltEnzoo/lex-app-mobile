# Ejecutar una sola vez como Administrador (clic derecho > Ejecutar como administrador)
# Habilita rutas largas en Windows, necesario para compilar React Native en carpetas profundas.

$ErrorActionPreference = 'Stop'

if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Write-Host 'ERROR: Ejecuta este script como Administrador.' -ForegroundColor Red
  exit 1
}

New-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem' -Name 'LongPathsEnabled' -Value 1 -PropertyType DWORD -Force | Out-Null

Write-Host 'Rutas largas habilitadas. Reinicia la PC para que aplique.' -ForegroundColor Green
