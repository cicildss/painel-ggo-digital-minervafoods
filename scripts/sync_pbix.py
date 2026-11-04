import os
import sys
import time
import argparse
import subprocess

pbix_path = r"C:\Users\MARIA.ALMEIDA\OneDrive - Minerva S.A\Área de Trabalho\painel GGO Digital V6 - com RLS.pbix"
etl_script = r"C:\Users\MARIA.ALMEIDA\.gemini\antigravity\scratch\painel-ggo-digital-minervafoods\scripts\generate_web_datasets.py"

def run_etl():
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Iniciando extração e atualização dos dados a partir do Power BI...")
    cmd = [sys.executable, etl_script]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] ✅ Dados sincronizados com sucesso!")
        print(res.stdout)
    else:
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] ❌ Erro na sincronização:\n", res.stderr)

def watch_pbix():
    print(f"Monitorando atualizações no arquivo:\n{pbix_path}\n(Pressione Ctrl+C para parar)")
    if not os.path.exists(pbix_path):
        print("Arquivo não encontrado no caminho especificado.")
        return

    last_mtime = os.path.getmtime(pbix_path)
    while True:
        try:
            time.sleep(15) # checa a cada 15s
            if os.path.exists(pbix_path):
                current_mtime = os.path.getmtime(pbix_path)
                if current_mtime != last_mtime:
                    print(f"\n[DETECTADO] O arquivo Power BI foi modificado no OneDrive! Atualizando aplicação...")
                    last_mtime = current_mtime
                    run_etl()
        except KeyboardInterrupt:
            print("\nMonitoramento encerrado.")
            break
        except Exception as e:
            print(f"Erro no monitoramento: {e}")
            time.sleep(10)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Sincronizador Automático do GGO Digital com Power BI")
    parser.add_argument('--watch', action='store_true', help="Executar em segundo plano monitorando alterações no PBIX")
    parser.add_argument('--once', action='store_true', help="Sincronizar uma vez agora")
    args = parser.parse_args()

    if args.watch:
        watch_pbix()
    else:
        run_etl()
