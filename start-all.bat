@echo off
setlocal EnableDelayedExpansion

:: ==========================================
:: FlowForge - Start All Services
:: ==========================================
:: Inicia API, CMS e Editor em paralelo
:: ==========================================

echo.
echo ========================================
echo  FlowForge - Iniciando Todos os Servicos
echo ========================================
echo.

:: Cores para output
color 0A

:: Configuracao dos projetos
set "API_PATH=C:\Git\FLOW\lynt-flow\packages\api"
set "CMS_PATH=C:\Git\FLOW\lynt-flow\packages\cms"
set "EDITOR_PATH=C:\Git\FLOW\lynt-flow\packages\editor"

:: Portas
set "API_PORT=3001"
set "CMS_PORT=5174"
set "EDITOR_PORT=5175"

:: Verificar se os diretorios existem
echo [1/5] Verificando diretorios...
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
echo [OK] Todos os diretorios encontrados!
echo.

:: Verificar se pnpm esta instalado
echo [2/5] Verificando dependencias...
where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] pnpm nao esta instalado!
    echo Por favor, instale com: npm install -g pnpm
    pause
    exit /b 1
)
echo [OK] pnpm encontrado!
echo.

echo [3/5] Liberando portas (matando processos existentes)...

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

echo [OK] Todas as portas liberadas!
echo.

echo [4/5] Preparando para iniciar servicos...
echo.
echo ========================================
echo  Servicos que serao iniciados:
echo ========================================
echo  [API]    Porta %API_PORT%
echo           %API_PATH%
echo.
echo  [CMS]    Porta %CMS_PORT% (Servidor Principal)
echo           %CMS_PATH%
echo.
echo  [EDITOR] Porta %EDITOR_PORT% (Proxeado via CMS em /editor)
echo           %EDITOR_PATH%
echo ========================================
echo.

echo [5/5] Iniciando servicos em janelas separadas...
echo.

:: Iniciar API
echo [API] Iniciando API na porta %API_PORT%...
start "FlowForge - API (%API_PORT%)" cmd /k "cd /d "%API_PATH%" && echo ===== API - Porta %API_PORT% ===== && pnpm dev"
timeout /t 3 /nobreak >nul

:: Iniciar Editor
echo [EDITOR] Iniciando Editor na porta %EDITOR_PORT%...
start "FlowForge - Editor (%EDITOR_PORT%)" cmd /k "cd /d "%EDITOR_PATH%" && echo ===== EDITOR - Porta %EDITOR_PORT% (/editor) ===== && pnpm dev"
timeout /t 3 /nobreak >nul

:: Iniciar CMS (por ultimo, pois e o servidor principal)
echo [CMS] Iniciando CMS na porta %CMS_PORT% (Servidor Principal)...
start "FlowForge - CMS (%CMS_PORT%)" cmd /k "cd /d "%CMS_PATH%" && echo ===== CMS - Porta %CMS_PORT% (Servidor Principal) ===== && pnpm dev"

echo.
echo ========================================
echo  Todos os servicos foram iniciados!
echo ========================================
echo.
echo  URLs de Acesso:
echo  ---------------
echo  CMS:    http://localhost:5174/
echo  Editor: http://localhost:5174/editor/
echo  API:    http://localhost:3001/
echo.
echo  Nota: O CMS faz proxy do Editor e API.
echo        Tudo acessivel via localhost:5174
echo.
echo  Pressione qualquer tecla para fechar esta janela.
echo  As janelas dos servicos continuarao rodando.
echo ========================================
echo.

pause >nul
exit /b 0
