@echo off
REM Abre el modulo nativo Android en Android Studio
set "PROJECT_DIR=%~dp0.."
for %%I in ("%PROJECT_DIR%") do set "PROJECT_DIR=%%~fI"

if exist "C:\Program Files\Android\Android Studio\bin\studio64.exe" (
  start "" "C:\Program Files\Android\Android Studio\bin\studio64.exe" "%PROJECT_DIR%\android"
) else (
  echo No se encontro Android Studio en la ruta predeterminada.
  exit /b 1
)
