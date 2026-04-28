# Integrações e Syncs de Marketing

## Rota
- `/admin/integracoes/marketing-sync`

## Seções
- Conexoes: iniciar OAuth, listar conexoes, listar contas por conexao e selecionar conta oficial.
- Contas: listar contas sincronizadas, filtrar, sincronizar e marcar selecionada/desselecionada.
- Jobs: criar jobs diarios, listar status, reenfileirar e processar manualmente.
- Diagnostico: consultar raw e performance legada para suporte operacional.

## Configuração
- Defina `VITE_MARKETING_SYNC_API_BASE_URL` no arquivo `.env.local`.
- Exemplo local: `VITE_MARKETING_SYNC_API_BASE_URL=http://localhost:3000`

## Uso rápido
1. Abra Conexoes e conclua OAuth de Google Ads ou Meta Ads.
2. Em Conexoes, selecione a conta oficial de cada conexao.
3. Em Contas, sincronize e marque as contas que devem permanecer selecionadas.
4. Em Jobs, crie jobs diarios para o periodo e acompanhe status.
5. Em Diagnostico, valide payloads raw e performance quando houver falhas de sync.
