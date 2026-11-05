@echo off
setlocal
echo ===================================================================
echo   INICIALIZACAO AUTOMATICA - GGO MINERVA FOODS
echo ===================================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut([Environment]::GetFolderPath('Startup') + '\Minerva_GGO_Sync.lnk'); $s.TargetPath = 'wscript.exe'; $s.Arguments = '\"%~dp0iniciar_sync_silencioso.vbs\"'; $s.Description = 'Sincronizador Continuo OneDrive GGO Minerva'; $s.Save(); Write-Host '[SUCESSO] Inicializacao automatica configurada na pasta Startup do Windows!'"
echo.
pause
