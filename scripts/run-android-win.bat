@echo off
setlocal EnableDelayedExpansion

REM --- Java y Android SDK ---
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\emulator;%PATH%"

REM --- Gradle en ruta corta (evita el limite de 260 chars en Windows) ---
if not exist "C:\g" mkdir "C:\g"
set "GRADLE_USER_HOME=C:\g"
set "TEMP=C:\g\tmp"
set "TMP=C:\g\tmp"
if not exist "%TEMP%" mkdir "%TEMP%"

REM --- Proyecto fuente (donde vive este script) ---
set "SOURCE_DIR=%~dp0.."
for %%I in ("%SOURCE_DIR%") do set "SOURCE_DIR=%%~fI"

REM --- Copia de compilacion en ruta corta (Windows limita rutas a 260 caracteres) ---
set "BUILD_DIR=C:\lx"

if not exist "%BUILD_DIR%\package.json" (
  echo Primera vez: copiando proyecto a %BUILD_DIR% ...
  if not exist "%BUILD_DIR%" mkdir "%BUILD_DIR%"
  robocopy "%SOURCE_DIR%" "%BUILD_DIR%" /MIR /XD node_modules android\build android\app\build android\.gradle android\app\.cxx .expo .git /NFL /NDL /NJH /NJS /nc /ns /np
  if errorlevel 8 exit /b 1
  cd /d "%BUILD_DIR%"
  call npm install
  if errorlevel 1 exit /b 1
) else (
  echo Sincronizando cambios hacia %BUILD_DIR% ...
  robocopy "%SOURCE_DIR%" "%BUILD_DIR%" /MIR /XD node_modules android\build android\app\build android\.gradle android\app\.cxx .expo .git /NFL /NDL /NJH /NJS /nc /ns /np
  cd /d "%BUILD_DIR%"
  call npm install --prefer-offline --no-audit --no-fund
)

REM --- Emulador (inicia Pixel_7 si no hay dispositivo) ---
adb devices 2>nul | findstr /r "device$" >nul
if errorlevel 1 (
  echo Iniciando emulador Pixel_7...
  start "" "%ANDROID_HOME%\emulator\emulator.exe" -avd Pixel_7
  adb wait-for-device
)

echo Esperando que Android termine de arrancar...
:wait_boot
for /f "delims=" %%S in ('adb shell getprop sys.boot_completed 2^>nul') do set "BOOT=%%S"
for /f "delims=" %%S in ('adb shell getprop init.svc.bootanim 2^>nul') do set "ANIM=%%S"
adb shell pm list packages >nul 2>&1
if errorlevel 1 (
  timeout /t 3 /nobreak >nul
  goto wait_boot
)
if not "!BOOT!"=="1" (
  timeout /t 3 /nobreak >nul
  goto wait_boot
)
if not "!ANIM!"=="stopped" (
  timeout /t 3 /nobreak >nul
  goto wait_boot
)
echo Emulador listo.

cd /d "%BUILD_DIR%"
echo Compilando desde %BUILD_DIR%
call npx expo run:android %*
set "BUILD_EXIT=%ERRORLEVEL%"

REM Si Expo falla al abrir el deep link, lanzar la app directamente
adb shell am start -n com.lex.cardiosegura/com.lex.cardiosegura.MainActivity >nul 2>&1
if errorlevel 1 (
  echo.
  echo Si la app no abrio sola: busca "Lex CardioSegura" en el emulador.
  echo O ejecuta: adb shell am start -n com.lex.cardiosegura/com.lex.cardiosegura.MainActivity
)

exit /b %BUILD_EXIT%
