@echo off
setlocal EnableExtensions
chcp 65001 >nul
cls
echo ==========================================================
echo       GD TIMELINE COLORS PRO - INSTALACAO FINAL
echo ==========================================================
echo.
echo Feche o Adobe Premiere Pro antes de continuar.
echo.
pause

set "ROOT=%~dp0.."
set "PRESETDIR=%USERPROFILE%\Documents\Adobe\Common\Assets\Label Color Presets"
set "PRESET=%ROOT%\preset\GD-Padrao-Definitivo.prlabelpreset"
set "CCX=%ROOT%\release\GD-Timeline-Colors-Pro.ccx"

if not exist "%PRESETDIR%" mkdir "%PRESETDIR%" >nul 2>&1
copy /Y "%PRESET%" "%PRESETDIR%\GD-Padrao-Definitivo.prlabelpreset" >nul
if errorlevel 1 (
  echo [AVISO] Nao foi possivel copiar o preset.
) else (
  echo [OK] Preset definitivo instalado.
)

set "UPIA=C:\Program Files\Common Files\Adobe\Adobe Desktop Common\RemoteComponents\UPI\UnifiedPluginInstallerAgent\UnifiedPluginInstallerAgent.exe"
if exist "%UPIA%" (
  echo Instalando/atualizando plugin UXP...
  "%UPIA%" /install "%CCX%"
  if errorlevel 1 (
    echo [AVISO] Instalacao automatica nao concluiu.
    echo Abrindo o pacote no Creative Cloud Desktop...
    start "" "%CCX%"
  ) else (
    echo [OK] Plugin instalado/atualizado.
  )
) else (
  echo Instalador Adobe UPIA nao localizado.
  echo Abrindo o pacote no Creative Cloud Desktop...
  start "" "%CCX%"
)

echo.
echo ==========================================================
echo DEPOIS:
echo 1. Abra o Premiere.
echo 2. Abra sua sequencia.
echo 3. Janela ^> Plugins UXP ^> GD Timeline Colors Pro.
echo 4. Deixe o painel aberto/dockado.
echo 5. Na Timeline, ative Show Source Clip Name and Label.
echo 6. Clique em ORGANIZAR TIMELINE.
echo ==========================================================
echo.
pause
endlocal
