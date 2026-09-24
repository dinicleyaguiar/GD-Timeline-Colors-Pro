@echo off
setlocal EnableExtensions
chcp 65001 >nul
cls
echo GD Timeline Colors Pro - desinstalacao
echo.
echo O Creative Cloud gerencia a remocao do plugin UXP.
echo Abra: Creative Cloud Desktop ^> Plugins ^> Gerenciar plugins.
echo Remova: GD Timeline Colors Pro.
echo.
set "PRESET1=%USERPROFILE%\Documents\Adobe\Common\Assets\Label Color Presets\GD-Padrao-Definitivo.prlabelpreset"
set "PRESET2=%USERPROFILE%\Documents\Adobe\Common\Assets\Label Color Presets\GD-Timeline-Colors-Pro.prlabelpreset"
if exist "%PRESET1%" del /Q "%PRESET1%"
if exist "%PRESET2%" del /Q "%PRESET2%"
echo [OK] Presets locais GD removidos, quando encontrados.
echo.
pause
endlocal
