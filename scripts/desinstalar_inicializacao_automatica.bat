@echo off
setlocal
echo ===================================================================
echo   DESINSTALAR INICIALIZACAO AUTOMATICA - GGO MINERVA FOODS
echo ===================================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$path = [Environment]::GetFolderPath('Startup') + '\Minerva_GGO_Sync.lnk'; if (Test-Path $path) { Remove-Item $path -Force; Write-Host '[SUCESSO] Inicializacao automatica removida da pasta Startup!' } else { Write-Host '[INFO] Atalho nao encontrado na pasta Startup.' }"
echo.
pause
