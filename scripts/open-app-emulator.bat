@echo off
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
set "PATH=%ANDROID_HOME%\platform-tools;%PATH%"

echo Abriendo Lex CardioSegura en el emulador...
adb shell am start -n com.lex.cardiosegura/com.lex.cardiosegura.MainActivity
if errorlevel 1 (
  echo.
  echo No se pudo abrir. Asegurate de que:
  echo  1. El emulador termino de arrancar ^(pantalla de inicio, no logo de Google^)
  echo  2. Corriste npm run android:win antes
  echo.
  echo O abri la app manualmente desde el cajon de aplicaciones.
)
