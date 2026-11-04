# Documentação do Modelo de Dados - GGO Digital Minerva Foods

Esta documentação foi extraída e compilada diretamente a partir do painel validado de Power BI (`painel GGO Digital V6 - com RLS.pbix`).

---

## 1. Segurança em Nível de Linha (RLS - Row-Level Security)

### Regra: `RLS_Gestores_Centros`
- **Tabela Aplicada**: `dim_grupo_centro`
- **Mecanismo**: Identificação do usuário logado via `USERPRINCIPALNAME()`.

#### Lógica DAX:
```dax
VAR _UsuarioLogado = LOWER ( TRIM ( USERPRINCIPALNAME () ) )

VAR _AdminsAutorizados = {
    "lilian.nascimento@minervafoods.com",
    "maria.almeida@minervafoods.com",
    "jeanderson.borba@minervafoods.com",
    "roberto.mendonca@minervafoods.com",
    "thatiana.freire@minervafoods.com",
    "gustavo.franco@minervafoods.com",
    "francielle.justino@minervafoods.com",
    "ana.palazzo@minervafoods.com",
    "luiza.bessa@minervafoods.com",
    "laura.masalskiene@minervafoods.com"
}

VAR _EhAdmin = _UsuarioLogado IN _AdminsAutorizados

RETURN
IF (
    _EhAdmin,
    TRUE (),
    dim_grupo_centro[Cod Objeto Custo] IN 
    SELECTCOLUMNS (
        FILTER (
            Gestores_TabEmp,
            LOWER ( TRIM ( Gestores_TabEmp[E-mail] ) ) = _UsuarioLogado
        ),
        "CC", Gestores_TabEmp[Centro de Custo]
    )
)
```

---

## 2. Fontes de Dados e Consultas (Power Query)

1. **Data Warehouse Minerva Foods (SQL Server - `WMINCPTSQLDW01`)**:
   - `fato_ggo_realizado`: `[dw].[controladoria].[fato_ggo_realizado]`
   - `fato_gestor_centro_custo`: `[dw].[controladoria].[fato_gestor_centro_custo]`
   - `dim_conta_contabil`: `[dw].[controladoria].[dim_chart_account]`
   - `dim_moeda`: `[dw].[controladoria].[dim_currency]`
   - `dim_empresa`: `[dw].[controladoria].[dim_company]`
   - `dim_pais`: `[dw].[controladoria].[dim_country]`
   - `dim_filial`: `[dw].[controladoria].[dim_branch]`
   - `dim_operacao`: `[dw].[controladoria].[dim_operation]`
   - `dim_pacote`: `[dw].[controladoria].[dim_package]`
   - `dim_pessoas`: `[dw].[controladoria].[dim_person]`
   - `dim_negocio`: `[dw].[controladoria].[dim_business]`
   - `dim_macro_area`: `[dw].[controladoria].[dim_macro_area]`
   - `dim_tipo_centro_custo`: `[dw].[controladoria].[dim_cost_center_type]`

2. **Banco PostgreSQL (`LMINCPTDW01`, database `dw`)**:
   - `dim_desc_centro`: Origem SAP CSKS / CSKT (`trusted.partner_source_sap_csks` / `trusted.partner_source_sap_cskt`)

3. **Arquivos Corporativos de Apoio**:
   - `Gestores_TabEmp`: `\\BTSERVER001\Controladoria-Corporativa\GGO Corporativo\03. GGO\Geral\Bases de Apoio\Gestores_Centros_New.xlsx`
   - `dim_negocio_dux`: Negócios / Mapeamento CORP, NR, LOG, BRA, COM.

4. **Tabela Fato Unificada (`@fato`)**:
   - Combinação de `fato_ggo_orcado` (Tipo Lancamento = 1) e `fato_ggo_realizado` (Tipo Lancamento = 2).

---

## 3. Principais Métricas e Medidas DAX

- **Orçado**:
  ```dax
  VAR EscalaSelecionada = SELECTEDVALUE('aux_escala_valores'[Opcao], "BRL")
  VAR ValorBase = CALCULATE(SUM('@fato'[Valor Reais]), '@fato'[Tipo Lancamento] = 1)
  RETURN SWITCH(EscalaSelecionada, "BRL/1000", ValorBase / 1000, ValorBase)
  ```
- **Realizado**:
  ```dax
  VAR EscalaSelecionada = SELECTEDVALUE('aux_escala_valores'[Opcao], "BRL")
  VAR ValorBase = CALCULATE(SUM('@fato'[Valor Reais]), '@fato'[Tipo Lancamento] = 2)
  RETURN SWITCH(EscalaSelecionada, "BRL/1000", ValorBase / 1000, ValorBase)
  ```
- **Desvio (R$)**: `[Realizado] - [Orçado]`
- **Desvio (%)**: `DIVIDE([Realizado], [Orçado]) - 1`
- **Orçado Ano / Ano Anterior**: Calculado filtrando `dim_calendario[Ano]` para `YEAR(TODAY())` e `YEAR(TODAY()) - 1`.
- **Top N**:
  - Top N Pacotes (Folha e Não Folha)
  - Top N Centros de Custo (Maiores Desvios e Menores Desvios)
  - Top N Contas Contábeis
  - Top N Responsáveis / Gestores

---

## 4. Estrutura de Telas e Páginas

1. **Página Inicial (Home)**: Navegação rápida e resumo executivo.
2. **Filtros Avançados**: Seleção granular por Ano, Mês, Negócio, Empresa, Filial, Macroárea, Centro de Custo, Pacote e Escala.
3. **Visão Geral (Overview Financeiro)**: KPIs consolidados de Realizado x Orçado, Desvio nominal e percentual, tendência e comparações YoY.
4. **Centros de Custo**: Detalhamento por centro de custo, ranking de desvios e análise analítica.
5. **Responsáveis**: Visualização por gestor/responsável de acordo com o mapeamento hierárquico.
6. **Pacotes Não Folha**: Acompanhamento dos pacotes de despesas gerais e operacionais.
7. **Pacotes Folha**: Acompanhamento específico de despesas com pessoal e encargos.
8. **Base Analítica**: Tabela detalhada de lançamentos contábeis para conferência e auditoria.

---

## 5. Identidade Visual Minerva Foods

- **Cores Primárias**:
  - `#24303b` (Azul Petróleo / Marinho Escuro Minerva)
  - `#385463` (Azul Corporativo Médio)
  - `#2b3d4a` (Azul Grafite)
- **Cores de Suporte e Destaque**:
  - `#e3e0b0` e `#bdb58c` (Dourado / Areia Suave)
  - `#e84752` e `#bf404d` (Vermelho Alerta Minerva / Desvios desfavoráveis)
- **Tipografia e Estilo**:
  - Design limpo, focado em legibilidade corporativa, espaçamento moderno, cards KPI com indicadores de status e gráficos de alta precisão.

