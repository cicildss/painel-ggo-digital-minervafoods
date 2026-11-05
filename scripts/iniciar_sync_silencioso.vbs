' Inicia o sincronizador de dados do OneDrive em segundo plano sem abrir janela de prompt
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

strScriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
strPythonScript = strScriptDir & "\sync_pbix.py"
strCommand = "python """ & strPythonScript & """ --watch"

' Executa com estilo de janela 0 (oculto) e sem aguardar termino
WshShell.Run strCommand, 0, False
