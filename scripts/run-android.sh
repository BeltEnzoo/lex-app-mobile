#!/usr/bin/env bash
# Compila usando enlace C:\lex (no mueve el proyecto)
set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd -W 2>/dev/null || pwd)"

if [ ! -e "/c/lex" ]; then
  cmd //c "mklink /J C:\\lex \"$PROJECT_DIR\""
fi

export JAVA_HOME="/c/Program Files/Android/Android Studio/jbr"
export ANDROID_HOME="$LOCALAPPDATA/Android/Sdk"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"

cd /c/lex
echo "Compilando desde /c/lex"
npx expo run:android "$@"
