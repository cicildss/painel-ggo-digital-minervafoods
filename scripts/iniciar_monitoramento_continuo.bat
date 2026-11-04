@echo off
chcp 65001 > nul
echo ========================================================
echo   MONITORAMENTO CONTINUO GGO DIGITAL - MINERVA FOODS
echo   Detecta alteracoes no Power BI do OneDrive em tempo real
echo ========================================================
echo.
python "%~dp0sync_pbix.py" --watch
pause
