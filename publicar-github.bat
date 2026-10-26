@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Trilha - enviar para o GitHub

where git >nul 2>&1
if errorlevel 1 (
  echo [ERRO] O Git nao esta instalado. Baixe em https://git-scm.com/download/win e rode de novo.
  pause
  exit /b 1
)

if not exist ".git" (
  git init -b main
)

git config user.name >nul 2>&1 || git config user.name "Eliane Vitoriano Luiz"
git config user.email >nul 2>&1 || git config user.email "eviofc4@gmail.com"

rem O workflow de CI precisa ficar em .github\workflows
if exist "ci\ci.yml" (
  if not exist ".github\workflows" mkdir ".github\workflows"
  copy /y "ci\ci.yml" ".github\workflows\ci.yml" >nul
)

git remote get-url origin >nul 2>&1 || git remote add origin https://github.com/EVI-DEV1/trilha-dev.git

git add -A
git commit -m "Trilha: PiP compacto, importar curso por link, GitHub no Bento, pagina /baixar" || echo (nada novo para salvar)
git branch -M main

echo.
echo Enviando para github.com/EVI-DEV1/trilha-dev ...
echo Se abrir uma janela do GitHub pedindo login, entre com a sua conta.
git push -u origin main
if errorlevel 1 (
  echo.
  echo [ERRO] O envio falhou. Veja a mensagem acima.
  pause
  exit /b 1
)
echo.
echo [OK] Codigo enviado! https://github.com/EVI-DEV1/trilha-dev
pause
