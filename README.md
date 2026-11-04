# Painel GGO Digital - Minerva Foods

Plataforma corporativa moderna de acompanhamento e gestão de **GGO (Gestão de Gastos Operacionais)** da Minerva Foods, construída para substituir e modernizar o antigo painel em Power BI.

O sistema preserva integralmente as regras de negócio validadas, modelo dimensional, métricas financeiras (Orçado, Realizado, Desvios nominais e percentuais) e **Segurança em Nível de Linha (RLS)** por gestor de centro de custo.

---

## 🏛️ Identidade Visual e Experiência do Usuário

O projeto segue a identidade visual oficial da **Minerva Foods**:
- **Cores Oficiais**:
  - `Minerva Navy (Primária)`: `#24303b`
  - `Minerva Blue (Corporativa)`: `#385463`
  - `Minerva Red (Destaque / Alerta)`: `#e84752`
  - `Minerva Gold / Sand`: `#e3e0b0` / `#bdb58c`
  - `Surface Clean`: Fundo claro `#f8fafc` com cartões brancos e contraste limpo.
- **Tipografia e Estilo**: Design corporativo executivo, minimalista, rápido e responsivo.

---

## 🔒 Segurança e Acesso por Perfil (RLS)

O sistema possui controle rigoroso de visualização:
- **Administradores da Controladoria**: Visualização integral e irrestrita de todas as operações, empresas e centros de custo (ex: `maria.almeida@minervafoods.com`).
- **Gestores de Centros de Custo**: Acesso filtrado estritamente aos centros sob sua responsabilidade (mapeados na matriz `Gestores_TabEmp`).
- **Simulador de RLS em Tempo Real**: Na barra superior, é possível alternar entre perfis para auditar o que cada gestor visualiza no portal.

---

## 📊 Módulos e Telas do Sistema

1. **Visão Geral (Overview Financeiro)**:
   - Cards executivos com Orçado Acumulado, Realizado, Desvio (R$), % Desvio e Atingimento.
   - Gráfico mensal comparativo Realizado vs Orçado e tendência de desvio.
   - Composição de despesas entre **Pacotes Folha (Pessoal)** e **Pacotes Não Folha (Operação)**.
   - Top 5 Centros de Custo com maior volume de gastos.
2. **Centros de Custo**:
   - Tabela dinâmica e pesquisável de todos os centros de custo com filtros por macroárea e gestor.
   - Barra de atingimento orçamentário e classificação de ofensores / economia.
3. **Pacotes de Gastos**:
   - Segregação clara entre despesas de pessoal (salários, benefícios, encargos) e despesas de operação.
   - Gráfico comparativo e ranking por pacote.
4. **Base Analítica e Auditoria**:
   - Listagem detalhada de lançamentos contábeis com paginação e busca textual.
   - **Exportação instantânea para Excel (.xlsx)** com um clique.

---

## 🚀 Como Executar a Aplicação Web

### Pré-requisitos:
- **Node.js 18+** e **npm**

### Passo a passo:
```bash
# 1. Acesse o diretório da aplicação web
cd web

# 2. Instale as dependências (se ainda não instaladas)
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

---

## 📂 Estrutura do Repositório

```text
├── assets/
│   └── powerbi_resources/      # Imagens de fundo originais e tema JSON Minerva
├── docs/
│   └── model_documentation.md  # Dicionário do modelo, DAX, RLS e queries Power Query
├── extracted_model/            # Schemas, medidas em CSV e metadados extraídos do VertiPaq
├── scripts/                    # Scripts Python de extração do PBIX e ETL dos dados
└── web/                        # Aplicação Web (React, TypeScript, Tailwind CSS, Recharts)
    ├── src/
    │   ├── components/         # Componentes: Header, RLSBar, Overview, CostCenters, Packages, Analytics
    │   ├── data/               # Datasets corporativos extraídos do modelo validado
    │   └── types/              # Definições TypeScript
    └── package.json
```
