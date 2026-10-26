@echo off
chcp 65001 >nul
title Trilha - servidor
cd /d "%~dp0"
set NG_CLI_ANALYTICS=false
where node >nul 2>nul
if errorlevel 1 goto semnode

echo Encerrando servidores antigos do Trilha (portas 4200 e 3000), se houver...
for /f "tokens=5" %%p in ('netstat -aon ^| findstr ":4200 " ^| findstr LISTENING') do taskkill /PID %%p /F >nul 2>nul
for /f "tokens=5" %%p in ('netstat -aon ^| findstr ":3000 " ^| findstr LISTENING') do taskkill /PID %%p /F >nul 2>nul

echo Conferindo dependencias...
call npm install --no-audit --no-fund
if errorlevel 1 goto erro

echo.
echo Subindo o Trilha em http://localhost:4200 ...
echo Para parar, feche esta janela.
call npm run dev
pause
exit /b 0

:semnode
echo Node.js nao encontrado. Instale a versao LTS em https://nodejs.org e rode este arquivo de novo.
pause
exit /b 1

:erro
echo A instalacao falhou. Veja a mensagem acima.
pause
exit /b 1
