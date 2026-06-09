# Métricas do Dashboard de Lançamento

Documento de referência para todas as métricas exibidas no **Dashboard de Lançamentos** (`/launch-dashboard`).

---

## Legenda de status

Cada métrica que possui uma **meta configurada** recebe um indicador de cor:

| Cor | Status | Critério |
|---|---|---|
| 🟢 Teal | **Dentro da meta** | Desempenho igual ou melhor que a meta |
| 🟡 Âmbar | **Atenção (10% fora)** | Desempenho entre 90% e 99% da meta |
| 🔴 Vermelho | **Ação necessária (11%+)** | Desempenho abaixo de 90% da meta |

Para métricas onde **maior é melhor** (leads, spend, connect rate): boa performance = valor alto.  
Para métricas onde **menor é melhor** (CPL, CPC, CPM): boa performance = valor baixo.

---

## Seção: Indicadores de Mídia

Dados originados da tabela `meta_ad_performance`, sincronizada diariamente via **Meta Ads Graph API**.

### Investimento Total (Gasto)
- **Campo:** `summary.spend`
- **Fonte:** `SUM(meta_ad_performance.spend)` no período
- **Unidade:** R$ (reais)
- **Direção:** maior = melhor (você quer atingir a meta de investimento para gerar volume)
- **Configurável:** sim — definir meta em Configurações

### Impressões
- **Campo:** `summary.impressions`
- **Fonte:** `SUM(meta_ad_performance.impressions)`
- **Unidade:** número absoluto
- **O que representa:** quantas vezes os anúncios foram exibidos

### Cliques
- **Campo:** `summary.clicks`
- **Fonte:** `SUM(meta_ad_performance.clicks)`
- **Unidade:** número absoluto
- **O que representa:** total de cliques nos anúncios (inclui cliques fora do link principal)

### CTR — Click-Through Rate
- **Campo:** `summary.ctr`
- **Fórmula:** `clicks / impressions`
- **Unidade:** proporção (ex: 0.02 = 2%)
- **Direção:** maior = melhor
- **O que representa:** eficiência criativa — que % das impressões resultou em clique
- **Configurável:** sim

### CPC — Custo por Clique
- **Campo:** `summary.cpc`
- **Fórmula:** `spend / clicks`
- **Unidade:** R$
- **Direção:** menor = melhor
- **O que representa:** quanto custa cada clique no anúncio
- **Configurável:** sim

### CPM — Custo por Mil Impressões
- **Campo:** `summary.cpm`
- **Fórmula:** `(spend × 1000) / impressions`
- **Unidade:** R$
- **Direção:** menor = melhor
- **O que representa:** custo para impactar 1.000 pessoas
- **Configurável:** sim

### Cliques no Link (Inline Link Clicks)
- **Campo:** `summary.inlineLinkClicks`
- **Fonte:** `SUM(meta_ad_performance.inline_link_clicks)`
- **O que representa:** cliques especificamente no link principal do anúncio (exclui reações e outros cliques)

### Páginas Visualizadas (Landing Page Views)
- **Campo:** `summary.landingPageViews`
- **Fonte:** `SUM(meta_ad_performance.landing_page_views)`
- **O que representa:** pessoas que efetivamente carregaram a landing page após clicar

### Connect Rate
- **Campo:** `summary.connectRate`
- **Fórmula:** `landing_page_views / inline_link_clicks`
- **Unidade:** proporção (ex: 0.725 = 72,5%)
- **Direção:** maior = melhor
- **O que representa:** % de pessoas que clicaram no link e efetivamente carregaram a página. Mede qualidade técnica do tráfego (latência, experiência mobile, etc.)
- **Configurável:** sim

### Conversão de Páginas (Tx PgV→Checkout)
- **Campo:** `summary.txPgvCheckout`
- **Fórmula:** `initiate_checkouts / landing_page_views`
- **Unidade:** proporção
- **Direção:** maior = melhor
- **O que representa:** % de visitantes da landing page que iniciaram o processo de checkout
- **Configurável:** sim

---

## Seção: Indicadores de Cadastros e Custo

Dados originados da tabela `capture`, linkada ao lançamento via `capture.launch_id`.

### Cadastros Gerados (Leads)
- **Campo:** `summary.leads`
- **Fórmula:** `COUNT(DISTINCT capture.person_id)` filtrado por `launch_id` e período
- **Unidade:** número absoluto
- **Direção:** maior = melhor
- **O que representa:** pessoas únicas que se cadastraram (captura de e-mail/lead) durante o período
- **Configurável:** sim

### CPL — Custo por Lead
- **Campo:** `summary.cpl`
- **Fórmula:** `spend / leads`
- **Unidade:** R$
- **Direção:** menor = melhor
- **O que representa:** quanto o lançamento está pagando, em média, para adquirir cada lead
- **Configurável:** sim

### Inicios de Checkout
- **Campo:** `summary.initiateCheckouts`
- **Fonte:** `SUM(meta_ad_performance.initiate_checkouts)`
- **O que representa:** eventos de "início de checkout" rastreados pelo pixel da Meta

---

## Seção: Indicadores de Vendas (Hotmart)

Dados originados das tabelas `hotmart_sale` e `hotmart_product`.

### Vendas Hotmart
- **Campo:** `summary.sales`
- **Fórmula:** `COUNT(DISTINCT hotmart_sale.id)` onde `purchase_status IN ('APPROVED', 'COMPLETE')` e produto vinculado ao lançamento
- **O que representa:** número de vendas confirmadas na Hotmart no período

### Receita
- **Campo:** `summary.revenue`
- **Fórmula:** `SUM(hotmart_sale.price)` nas mesmas condições acima

### CPA — Custo por Aquisição
- **Campo:** `summary.cpa`
- **Fórmula:** `spend / sales`
- **Unidade:** R$
- **Direção:** menor = melhor
- **O que representa:** quanto o lançamento gastou em mídia por venda realizada

### Tx Checkout→Venda
- **Campo:** `summary.txCheckoutSale`
- **Fórmula:** `sales / initiate_checkouts`
- **O que representa:** % de checkouts iniciados que se converteram em venda

---

## Seção: Consciência e Engajamento

Dados originados das tabelas `form_response` e `form_answer`, via link `form_response.capture_id → capture.id`.

> **Pré-requisito:** as métricas de consciência requerem que o lançamento esteja selecionado no filtro **e** que as perguntas estejam configuradas em **Configurações**.

### Taxa Resposta Pesquisa
- **Campo:** `awareness.surveyResponseRate`
- **Fórmula:** `COUNT(DISTINCT form_response.id) / COUNT(DISTINCT capture.person_id)`
- **Unidade:** proporção (ex: 0.124 = 12,4%)
- **Direção:** maior = melhor
- **O que representa:** % de leads que responderam o quiz/pesquisa de diagnóstico
- **Categoria:** Engajamento
- **Configurável:** só a meta; o cálculo é automático

### Taxa de Consciência
- **Campo:** `awareness.consciousnessRate`
- **Fórmula:** `COUNT(form_responses com resposta positiva na pergunta configurada) / COUNT(total form_responses)`
- **Unidade:** proporção
- **Direção:** maior = melhor
- **O que representa:** % dos respondentes que demonstraram consciência do tema/produto (pergunta específica configurável)
- **Categoria:** Métricas de Consciência
- **Configurável:** pergunta + opção positiva + meta

### Taxa Conhece Elton
- **Campo:** `awareness.knowsEltonRate`
- **Fórmula:** `COUNT(form_responses com resposta positiva em "conhece o Elton?") / COUNT(total form_responses)`
- **Unidade:** proporção
- **Direção:** maior = melhor
- **O que representa:** % dos respondentes que já conheciam o criador/mentor antes do lançamento
- **Categoria:** Métricas de Consciência
- **Configurável:** pergunta + opção positiva + meta

### Taxa Conhece Aliança
- **Campo:** `awareness.knowsAllianceRate`
- **Fórmula:** `COUNT(form_responses com resposta positiva em "conhece a Aliança?") / COUNT(total form_responses)`
- **Unidade:** proporção
- **Direção:** maior = melhor
- **O que representa:** % dos respondentes que já conheciam a marca/produto Aliança Divergente
- **Categoria:** Métricas de Consciência
- **Configurável:** pergunta + opção positiva + meta

---

## Seção: Distribuição por Faixa

Dados originados das tabelas `leadscore_result` e `leadscore_tier`, via join:
`leadscore_result.form_response_id → form_response.capture_id → capture.launch_id`.

Exibe o percentual de leads em cada faixa de qualidade calculada pelo leadscore:

| Faixa | Cor | Descrição |
|---|---|---|
| A+ | 🟢 | Lead de altíssima qualidade |
| A | 🟢 | Lead de alta qualidade |
| B | 🔵 | Lead de boa qualidade |
| C | 🟡 | Lead médio |
| D | 🟠 | Lead de baixa qualidade |
| E | 🔴 | Lead de qualidade muito baixa |

**Fórmula por faixa:** `COUNT(leads com tier X) / COUNT(total leads com score calculado) × 100`

---

## Seção: Performance de Anúncios

Tabela detalhada por anúncio (`external_ad_id`), agregando todas as métricas de mídia + leads + vendas no nível de criativo.

- **Fonte:** endpoint `GET /launch-dashboard/funnel`
- **Ordenação:** por gasto decrescente
- **Colunas:** Anúncio, Campanha, Gasto, Impressões, Cliques, CTR, CPC, Pág. Visualizadas, Connect Rate, Init. Checkout, Tx PgV→CK, Leads, CPL, Vendas, Receita, CPA, Tx CK→Venda

---

## Configurações do Dashboard

Acessível pelo botão ⚙️ **Configurações** no canto superior direito da página.

> Requer que um lançamento específico esteja selecionado no filtro.

### O que pode ser configurado

**Metas de mídia:**
- Investimento Total (R$)
- CPC, CPM, CTR, Connect Rate, Conversão de Páginas

**Metas de cadastros:**
- Cadastros Gerados (número absoluto)
- CPL (R$)

**Metas de consciência:**
- Taxa Resposta Pesquisa, Taxa Consciência, Taxa Conhece Elton, Taxa Conhece Aliança

**Perguntas de consciência:**
Para cada métrica de consciência, configurar:
1. **Pergunta** — selecionar qual `question_key` do quiz representa aquela métrica
2. **Opção positiva** — selecionar qual `option_key` conta como resposta afirmativa

### Como as metas afetam o dashboard

O indicador de status (teal/âmbar/vermelho) é calculado comparando o valor real com a meta:
- Métricas "maior = melhor": `ratio = atual / meta`
- Métricas "menor = melhor": `ratio = meta / atual`
- `ratio ≥ 1.0` → Dentro da meta (teal)
- `0.9 ≤ ratio < 1.0` → Atenção — 10% fora (âmbar)
- `ratio < 0.9` → Ação necessária — 11%+ fora (vermelho)

---

## Endpoints de API (lead-score)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/launch-dashboard/launches` | Lista de lançamentos |
| GET | `/launch-dashboard/summary` | KPIs agregados |
| GET | `/launch-dashboard/timeseries` | Série temporal diária |
| GET | `/launch-dashboard/funnel` | Tabela por anúncio |
| GET | `/launch-dashboard/awareness` | Métricas de consciência e engajamento |
| GET | `/launch-dashboard/tier-distribution` | Distribuição por faixa de leadscore |
| GET | `/launch-dashboard/config/:launchId` | Configuração do lançamento |
| PUT | `/launch-dashboard/config/:launchId` | Salvar configuração |
| GET | `/launch-dashboard/available-questions` | Perguntas disponíveis do quiz |

### Parâmetros comuns de filtro

| Parâmetro | Obrigatório | Descrição |
|---|---|---|
| `dateFrom` | Sim | Data inicial (YYYY-MM-DD) |
| `dateTo` | Sim | Data final (YYYY-MM-DD) |
| `launchId` | Não | UUID do lançamento |
| `seasonId` | Não | UUID da temporada |
| `externalAccountId` | Não | ID da conta Meta |
| `externalCampaignId` | Não | ID da campanha Meta |
| `externalAdsetId` | Não | ID do adset Meta |
| `externalAdId` | Não | ID do anúncio Meta |

---

## Fluxo de dados completo

```
Meta Ads Graph API
    ↓ (sync diário)
meta_ad_performance
    └── spend, impressions, clicks, inline_link_clicks,
        landing_page_views, initiate_checkouts, ctr, cpc, cpm

        ↓ (via capture.external_ad_id)

capture (leads)
    └── person_id, launch_id, season_id, occurred_at

        ├── → form_response (via capture_id)
        │       └── → form_answer (via form_response_id)
        │               └── → question (question_key)
        │               └── → question_option (option_key)
        │
        │   form_response → leadscore_result → leadscore_tier
        │                   (score_total, tier: A+/A/B/C/D/E)
        │
        └── → hotmart_sale (via person_id)
                └── price, purchase_status (APPROVED/COMPLETE)
```
