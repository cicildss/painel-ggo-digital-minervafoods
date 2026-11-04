@echo off
chcp 65001 > nul
echo ========================================================
echo   SINCRONIZADOR GGO DIGITAL - MINERVA FOODS
echo   Origem: painel GGO Digital V6 - com RLS.pbix (OneDrive)
echo ========================================================
echo.
python "%~dp0sync_pbix.py" --once
echo.
echo Processo finalizado!
pause
