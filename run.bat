@echo off
setlocal ENABLEDELAYEDEXPANSION
set "DCCMD=docker compose"

echo ========= CURSO NODE + MONGODB =========

REM 1) Derrubar ambiente anterior (incluindo volumes)
%DCCMD% down -v

REM 2) criar pastas
if not exist app mkdir app
if not exist mongo-data mkdir mongo-data

REM 3) puxar imagem
echo Baixando imagem papadopoli/curso-node:1.0.0 ...
docker pull papadopoli/curso-node:1.0.0

REM 4) subir container
echo Subindo container...
%DCCMD% up -d

REM 5) corrigir permissoes do volume (como root)
echo Ajustando permissoes do volume /app e /data/db ...
docker exec -u 0 curso-node bash -lc "mkdir -p /app/node_modules /data/db && chown -R app:app /app /data/db"

REM 6) instalar deps dentro do container
echo Instalando dependencias dentro do container (npm install)...
docker exec -it curso-node bash -lc "cd /app && npm install"
if %ERRORLEVEL% NEQ 0 (
  echo ATENCAO: houve erro ao instalar dependencias. Verifique seu package.json em .\app
)

REM 7) abrir health
echo Abrindo http://localhost:3000/health
start http://localhost:3000/health

echo Pronto.
endlocal
