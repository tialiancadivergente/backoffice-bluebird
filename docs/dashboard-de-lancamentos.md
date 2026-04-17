# Dashboard de Lancamentos no Backoffice

## 1. Objetivo
Implementar uma tela read-only no backoffice para analise de performance de midia e cadastros, consumindo os endpoints de marketing dashboard do backend.

## 2. Estrutura criada
- Pagina: `LaunchDashboardPage`
- Blocos: filtros globais, cards de KPI, grafico temporal, tabela detalhada
- Camada de dados: client dedicado, hooks React Query e tipagem forte
- Integracao: rota `/launch-dashboard` e item no menu lateral

## 3. Variaveis de ambiente
- `VITE_MARKETING_DASHBOARD_API_BASE_URL`: base da API do dashboard
- Definicao sugerida em `.env.local` com base no `.env.example`

## 4. Endpoints consumidos
- `GET /marketing-dashboard/summary`
- `GET /marketing-dashboard/timeseries`
- `GET /marketing-dashboard/table`

## 5. Componentes principais
- `MarketingDashboardFilters`
- `MarketingDashboardSummaryCards`
- `MarketingDashboardTimeseriesChart`
- `MarketingDashboardTable`
- `MarketingDashboardTablePagination`

## 6. Fluxo de filtros e atualizacao
- Filtros sao editados no estado `draft` e aplicados explicitamente por botao.
- Ao aplicar filtros: atualiza `appliedFilters`, reseta pagina para 1 e refaz as queries.
- Tabela envia paginacao e ordenacao para o backend (`page`, `perPage`, `sortBy`, `sortOrder`).

## 7. Tratamento de loading/erro/estado vazio
- Loading por bloco (resumo, grafico e tabela independentes).
- Erro por bloco com mensagem amigavel e acao de retry.
- Estado vazio global e por bloco quando nao ha dados para o periodo/filtros.

## 8. Regras de negocio respeitadas
- Front read-only.
- Backend como fonte oficial para join e metricas.
- Metricas derivadas nulas (`cpc`, `ctr`, `cpm`, `cpl`) exibidas com fallback `—`.
- Sem logica de negocio pesada duplicada no front.

## 9. Limitacoes do MVP
- Filtro de provider possui opcoes estaticas comuns (meta/google/tiktok/kwai).
- Campos de conta/campanha/adset/anuncio usam entrada por ID externo (sem autocomplete remoto).
- Contrato de resposta da tabela pode variar; foi aplicada normalizacao defensiva para `items/table/rows`.

## 10. Proximos passos recomendados
1. Adicionar endpoint de opcoes de filtros (providers/accounts/campaigns/adsets/ads) para UX com seletores dinamicos.
2. Implementar persistencia de filtros na URL para compartilhamento.
3. Adicionar exportacao CSV/Excel da tabela do dashboard.
4. Incluir testes de integracao para cenarios de erro e payload parcial.
