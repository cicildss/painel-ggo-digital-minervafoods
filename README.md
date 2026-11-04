# Painel GGO Digital - Minerva Foods

Plataforma corporativa de acompanhamento e gestão de **GGO (Gestão de Gastos Operacionais)** da Minerva Foods.

Este projeto substitui e expande o painel analítico anterior, preservando todas as regras de negócio validadas, modelo dimensional, métricas financeiras (Orçado, Realizado, Desvios nominais e percentuais) e **Segurança em Nível de Linha (RLS)** por gestor de centro de custo.

---

## 🏛️ Identidade Visual e Experiência do Usuário

O projeto segue a identidade visual oficial da **Minerva Foods**:
- **Paleta de Cores**:
  - `Primary Dark`: `#24303b` (Azul Petróleo Profundo)
  - `Primary Medium`: `#385463` (Azul Corporativo)
  - `Accent / Highlight`: `#e84752` (Vermelho Minerva)
  - `Neutral / Warm`: `#e3e0b0` / `#bdb58c` (Dourado / Areia Suave)
  - `Background Clean`: Superfícies brancas e neutras com contraste elegante e moderno
- **Diretrizes de Design**: Clean, minimalista, altamente funcional, informativo e adaptável a telas corporativas.

---

## 🔒 Segurança e Acesso por Perfil (RLS)

O sistema possui controle rigoroso de visualização:
- **Administradores da Controladoria**: Visualização integral e irrestrita de todas as operações, empresas e centros de custo.
- **Gestores de Centros de Custo**: Acesso filtrado estritamente aos centros sob sua responsabilidade (mapeados pela matriz `Gestores_TabEmp`).

---

## 📊 Módulos e Visões

1. **Dashboard Executivo (Overview Financeiro)**: KPIs de Realizado vs Orçado, evolução temporal e atingimento de metas.
2. **Centros de Custo**: Análise detalhada por centro, desvios absolutos e percentuais.
3. **Gestores e Responsáveis**: Desempenho consolidado por hierarquia de gestão.
4. **Pacotes de Gastos (Folha e Não-Folha)**: Segregação analítica dos tipos de despesas operacionais e pessoal.
5. **Base Analítica e Auditoria**: Consulta detalhada ao nível de documento e conta contábil.

---

## 📂 Estrutura do Repositório

```text
├── assets/
│   └── powerbi_resources/      # Imagens de fundo originais, temas JSON e referências visuais
├── docs/
│   └── model_documentation.md  # Dicionário do modelo, DAX, RLS e queries Power Query
├── extracted_model/            # Schemas, medidas em CSV e metadados extraídos
├── scripts/                    # Scripts de extração e automação de pipelines
└── README.md
```
