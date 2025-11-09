@echo off
setlocal EnableDelayedExpansion

:: ==========================================
:: LyntFlow - Start All Services
:: ==========================================
:: Inicia API, CMS, Editor e Docs em paralelo
:: ==========================================

echo.
echo ========================================
echo  LyntFlow - Iniciando Todos os Servicos
echo ========================================
echo.

:: Cores para output
color 0A

:: Configuracao dos projetos
set "API_PATH=C:\Git\FLOW\lynt-flow\packages\api"
set "CMS_PATH=C:\Git\FLOW\lynt-flow\packages\cms"
set "EDITOR_PATH=C:\Git\FLOW\lynt-flow\packages\editor"
set "DOCS_PATH=C:\Git\FLOW\lynt-flow\packages\docs"

:: Portas
set "API_PORT=3001"
set "CMS_PORT=5174"
set "EDITOR_PORT=5175"
set "DOCS_PORT=5177"

:: Verificar se os diretorios existem
echo [1/7] Verificando diretorios...
if not exist "%API_PATH%" (
    echo [ERRO] Diretorio da API nao encontrado: %API_PATH%
    pause
    exit /b 1
)
if not exist "%CMS_PATH%" (
    echo [ERRO] Diretorio do CMS nao encontrado: %CMS_PATH%
    pause
    exit /b 1
)
if not exist "%EDITOR_PATH%" (
    echo [ERRO] Diretorio do Editor nao encontrado: %EDITOR_PATH%
    pause
    exit /b 1
)
if not exist "%DOCS_PATH%" (
    echo [ERRO] Diretorio do Docs nao encontrado: %DOCS_PATH%
    pause
    exit /b 1
)
echo [OK] Todos os diretorios encontrados!
echo.

:: Verificar se pnpm esta instalado
echo [2/7] Verificando dependencias...
where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] pnpm nao esta instalado!
    echo Por favor, instale com: npm install -g pnpm
    pause
    exit /b 1
)
echo [OK] pnpm encontrado!
echo.

echo [3/7] Liberando portas (matando processos existentes)...

:: Matar processos na porta da API (3001)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%API_PORT%" ^| findstr "LISTENING"') do (
    echo [API] Matando processo PID %%a na porta %API_PORT%...
    taskkill /PID %%a /F >nul 2>&1
)

:: Matar processos na porta do CMS (5174)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%CMS_PORT%" ^| findstr "LISTENING"') do (
    echo [CMS] Matando processo PID %%a na porta %CMS_PORT%...
    taskkill /PID %%a /F >nul 2>&1
)

:: Matar processos na porta do Editor (5175)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%EDITOR_PORT%" ^| findstr "LISTENING"') do (
    echo [EDITOR] Matando processo PID %%a na porta %EDITOR_PORT%...
    taskkill /PID %%a /F >nul 2>&1
)

:: Matar processos na porta do Docs (5177)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%DOCS_PORT%" ^| findstr "LISTENING"') do (
    echo [DOCS] Matando processo PID %%a na porta %DOCS_PORT%...
    taskkill /PID %%a /F >nul 2>&1
)

echo [OK] Todas as portas liberadas!
echo.

echo [4/7] Preparando para iniciar servicos...
echo.
echo ========================================
echo  Servicos que serao iniciados:
echo ========================================
echo  [API]     Porta %API_PORT%
echo            %API_PATH%
echo.
echo  [CMS]     Porta %CMS_PORT%
echo            %CMS_PATH%
echo.
echo  [EDITOR]  Porta %EDITOR_PORT%
echo            %EDITOR_PATH%
echo.
echo  [DOCS]    Porta %DOCS_PORT%
echo            %DOCS_PATH%
echo ========================================
echo.

echo [5/7] Iniciando servicos em janelas separadas...
echo.

:: Iniciar API
echo [API] Iniciando API na porta %API_PORT%...
start "LyntFlow - API (%API_PORT%)" cmd /k "cd /d "%API_PATH%" && echo ===== API - Porta %API_PORT% ===== && pnpm dev"
timeout /t 2 /nobreak >nul

:: Iniciar CMS
echo [CMS] Iniciando CMS na porta %CMS_PORT%...
start "LyntFlow - CMS (%CMS_PORT%)" cmd /k "cd /d "%CMS_PATH%" && echo ===== CMS - Porta %CMS_PORT% ===== && pnpm dev"
timeout /t 2 /nobreak >nul

:: Iniciar Editor
echo [EDITOR] Iniciando Editor na porta %EDITOR_PORT%...
start "LyntFlow - Editor (%EDITOR_PORT%)" cmd /k "cd /d "%EDITOR_PATH%" && echo ===== EDITOR - Porta %EDITOR_PORT% ===== && pnpm dev"
timeout /t 2 /nobreak >nul

:: Iniciar Docs
echo [DOCS] Iniciando Docs na porta %DOCS_PORT%...
start "LyntFlow - Docs (%DOCS_PORT%)" cmd /k "cd /d "%DOCS_PATH%" && echo ===== DOCS - Porta %DOCS_PORT% ===== && pnpm dev"

echo.
echo [6/7] Aguardando inicializacao completa...
timeout /t 5 /nobreak >nul
echo.

echo ========================================
echo  Todos os servicos foram iniciados!
echo ========================================
echo.
echo  URLs de Acesso:
echo  ---------------
echo  CMS:     http://localhost:%CMS_PORT%/
echo  Editor:  http://localhost:%EDITOR_PORT%/
echo  Docs:    http://localhost:%DOCS_PORT%/
echo  API:     http://localhost:%API_PORT%/
echo.
echo  Nota: Todos os servicos rodando de forma independente.
echo        A Landing Page e o ponto de entrada principal.
echo.
echo  Pressione qualquer tecla para fechar esta janela.
echo  As janelas dos servicos continuarao rodando.
echo ========================================
echo.

pause >nul
exit /b 0
