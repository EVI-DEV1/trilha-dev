@echo off
cd /d "%~dp0"
set NG_CLI_ANALYTICS=false
echo Compilando para verificar erros... aguarde.
call npx ng build --configuration development > build-log.txt 2>&1
echo Pronto. Resultado em build-log.txt
timeout /t 3 >nul
