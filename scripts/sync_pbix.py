import os
import sys
import time
import glob
import argparse
import subprocess

# Configure UTF-8 output if possible
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

onedrive_dir = r"C:\Users\MARIA.ALMEIDA\OneDrive - Minerva S.A\Área de Trabalho"
default_pbix = os.path.join(onedrive_dir, "painel GGO Digital V6 - com RLS.pbix")
etl_script = r"C:\Users\MARIA.ALMEIDA\.gemini\antigravity\scratch\painel-ggo-digital-minervafoods\scripts\generate_web_datasets.py"

def find_latest_pbix():
    candidates = glob.glob(os.path.join(onedrive_dir, "*GGO*.pbix")) + glob.glob(os.path.join(onedrive_dir, "painel*.pbix"))
    candidates = list(set(candidates))
    if candidates:
        candidates.sort(key=lambda x: os.path.getmtime(x), reverse=True)
        return candidates[0]
    return default_pbix

def run_etl():
    latest_file = find_latest_pbix()
    print(f"\n[{time.strftime('%Y-%m-%d %H:%M:%S')}] Iniciando extração a partir do Power BI no OneDrive...")
    print(f"Arquivo de origem: {os.path.basename(latest_file)}")
    cmd = [sys.executable, etl_script]
    res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace')
    if res.returncode == 0:
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] [SUCESSO] Dados sincronizados com sucesso!")
        print(res.stdout)
    else:
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] [ERRO] Erro na sincronização:\n", res.stderr)

def watch_pbix():
    current_target = find_latest_pbix()
    print(f"============================================================")
    print(f"  SINCRONIZADOR CONTÍNUO DO GGO DIGITAL (ONEDRIVE)")
    print(f"  Diretório monitorado: {onedrive_dir}")
    print(f"  Arquivo mais recente ativo: {os.path.basename(current_target)}")
    print(f"  Intervalo de verificação: a cada 15 segundos")
    print(f"  (Pressione Ctrl+C para parar)")
    print(f"============================================================\n")

    last_file = current_target
    last_mtime = os.path.getmtime(last_file) if os.path.exists(last_file) else 0

    while True:
        try:
            time.sleep(15) # checa a cada 15s
            latest = find_latest_pbix()

            # Caso 1: Um novo arquivo mais recente foi adicionado (ex: V7)
            if latest != last_file:
                print(f"\n[NOVO ARQUIVO DETECTADO] Nova versão do Power BI encontrada no OneDrive!")
                print(f"Anterior: {os.path.basename(last_file)} -> Nova: {os.path.basename(latest)}")
                last_file = latest
                last_mtime = os.path.getmtime(latest)
                run_etl()
                continue

            # Caso 2: O arquivo atual foi modificado/salvo no Power BI
            if os.path.exists(latest):
                current_mtime = os.path.getmtime(latest)
                if current_mtime != last_mtime:
                    print(f"\n[MODIFICAÇÃO DETECTADA] O arquivo '{os.path.basename(latest)}' foi salvo no OneDrive!")
                    last_mtime = current_mtime
                    run_etl()
        except KeyboardInterrupt:
            print("\nMonitoramento encerrado pelo usuário.")
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
