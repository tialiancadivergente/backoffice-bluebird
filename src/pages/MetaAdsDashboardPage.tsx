import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetaFilters } from "@/components/meta-ads/MetaFilters";
import { MetaKpiCards } from "@/components/meta-ads/MetaKpiCards";
import { MetaCampaignsTable } from "@/components/meta-ads/MetaCampaignsTable";
import { MetaCsvFallback } from "@/components/meta-ads/MetaCsvFallback";
import { MetaJobForm } from "@/components/meta-ads/MetaJobForm";
import { MetaExecutionsList } from "@/components/meta-ads/MetaExecutionsList";
import { ConnectionsSection } from "@/components/admin/marketing-sync/ConnectionsSection";
import { AccountsSection } from "@/components/admin/marketing-sync/AccountsSection";
import { useOAuthConnections } from "@/hooks/use-marketing-sync";
import {
  useMetaSummary,
  useMetaCampaignBreakdown,
  useMetaTimeseries,
  useMetaExecutions,
  metaKeys,
} from "@/hooks/use-meta-ads";
import { useQueryClient } from "@tanstack/react-query";
import type { MetaPerformanceFilters } from "@/types/meta-ads";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";

const PERFORMANCE_TABS = new Set(["resumo", "tendencia", "campanhas"]);

export default function MetaAdsDashboardPage() {
  const [filters, setFilters] = useState<MetaPerformanceFilters>({});
  const [activeTab, setActiveTab] = useState("resumo");
  const [execTab, setExecTab] = useState("all");
  const qc = useQueryClient();

  const summary = useMetaSummary(filters, PERFORMANCE_TABS.has(activeTab));
  const campaignBreakdown = useMetaCampaignBreakdown(filters, activeTab === "campanhas");
  const timeseries = useMetaTimeseries(filters, activeTab === "tendencia");
  const executions = useMetaExecutions({
    step: execTab === "all" ? undefined : execTab,
    limit: 50,
  });

  const connectionsQuery = useOAuthConnections();
  const metaConnections = (connectionsQuery.data ?? []).filter(
    (c) => c.provider === "meta_ads",
  );

  const isPerformanceTab = PERFORMANCE_TABS.has(activeTab);

  let timeseriesContent: JSX.Element;
  if (timeseries.isLoading) {
    timeseriesContent = <Skeleton className="h-64 w-full" />;
  } else if (timeseries.data && timeseries.data.length > 0) {
    timeseriesContent = (
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium mb-3">Gasto & Leads por dia</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={timeseries.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) =>
                  format(new Date(v + "T12:00:00"), "dd/MM", { locale: ptBR })
                }
              />
              <YAxis yAxisId="spend" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="leads" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip
                labelFormatter={(v) =>
                  format(new Date(v + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })
                }
              />
              <Legend />
              <Line
                yAxisId="spend"
                type="monotone"
                dataKey="spend"
                name="Gasto (R$)"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="leads"
                type="monotone"
                dataKey="leads"
                name="Leads"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div>
          <p className="text-sm font-medium mb-3">CTR & Connect Rate por dia</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={timeseries.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) =>
                  format(new Date(v + "T12:00:00"), "dd/MM", { locale: ptBR })
                }
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                labelFormatter={(v) =>
                  format(new Date(v + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })
                }
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="ctr"
                name="CTR (%)"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="connect_rate"
                name="Connect Rate"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  } else {
    timeseriesContent = (
      <div className="py-12 text-center text-muted-foreground text-sm">
        Nenhum dado de série temporal disponível. Execute um sync de insights.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meta Ads</h1>
        <p className="text-muted-foreground text-sm">
          Performance de anúncios — Facebook & Instagram
        </p>
      </div>

      {isPerformanceTab && (
        <>
          <MetaFilters filters={filters} onChange={setFilters} />

          {summary.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                Erro ao carregar dados. Verifique a conexão ou execute um sync.
              </AlertDescription>
            </Alert>
          )}

          <MetaKpiCards summary={summary.data} isLoading={summary.isLoading} />
        </>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="tendencia">Tendência</TabsTrigger>
          <TabsTrigger value="campanhas">Por Campanha</TabsTrigger>
          <TabsTrigger value="conexao">Conexão</TabsTrigger>
          <TabsTrigger value="sincronizacao">Sincronização</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        {/* ── Resumo ──────────────────────────────────────────────── */}
        <TabsContent value="resumo" className="space-y-4 mt-4">
          <MetaCsvFallback filters={filters} />
        </TabsContent>

        {/* ── Tendência ───────────────────────────────────────────── */}
        <TabsContent value="tendencia" className="mt-4">
          {timeseriesContent}
        </TabsContent>

        {/* ── Por Campanha ────────────────────────────────────────── */}
        <TabsContent value="campanhas" className="mt-4">
          <MetaCampaignsTable
            data={campaignBreakdown.data}
            isLoading={campaignBreakdown.isLoading}
          />
        </TabsContent>

        {/* ── Conexão ─────────────────────────────────────────────── */}
        <TabsContent value="conexao" className="space-y-6 mt-4">
          <div>
            <h2 className="text-base font-semibold mb-3">Autenticação</h2>
            <ConnectionsSection
              connections={metaConnections}
              isLoading={connectionsQuery.isLoading}
              isError={connectionsQuery.isError}
              onRefetch={() => connectionsQuery.refetch()}
            />
          </div>
          <div>
            <h2 className="text-base font-semibold mb-3">Contas de Anúncios</h2>
            <AccountsSection connections={metaConnections} />
          </div>
        </TabsContent>

        {/* ── Sincronização ───────────────────────────────────────── */}
        <TabsContent value="sincronizacao" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Criar Job de Sincronização</CardTitle>
            </CardHeader>
            <CardContent>
              <MetaJobForm />
            </CardContent>
          </Card>

          <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Como funciona cada tipo:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>Insights (Batch)</strong> — Busca métricas de performance diária (CPC, CTR, CPM, vídeo). Recomendado para até 30 dias.</li>
              <li><strong>Campanhas / Conjuntos / Anúncios</strong> — Sincroniza estrutura (status, orçamento, criativos). Não tem filtro de data obrigatório.</li>
              <li><strong>Job Assíncrono</strong> — Inicia um job na Meta para períodos longos (&gt;30 dias). Retorna um report_run_id para polling.</li>
              <li><strong>Sync Completo</strong> — Executa os 4 tipos em paralelo.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Histórico de Execuções</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => qc.invalidateQueries({ queryKey: metaKeys.executions() })}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <Tabs value={execTab} onValueChange={setExecTab}>
              <TabsList className="h-8 text-xs">
                <TabsTrigger value="all" className="text-xs">Todos</TabsTrigger>
                <TabsTrigger value="insights" className="text-xs">Insights</TabsTrigger>
                <TabsTrigger value="campaigns" className="text-xs">Campanhas</TabsTrigger>
                <TabsTrigger value="adsets" className="text-xs">Conjuntos</TabsTrigger>
                <TabsTrigger value="ads" className="text-xs">Anúncios</TabsTrigger>
              </TabsList>
              <TabsContent value={execTab} className="mt-3">
                <MetaExecutionsList
                  data={executions.data}
                  isLoading={executions.isLoading}
                />
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>

        {/* ── Configurações ───────────────────────────────────────── */}
        <TabsContent value="configuracoes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sync Automático</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-2">
                <p>
                  O scheduler dedicado da Meta é configurado via variáveis de ambiente no servidor:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>
                    <code className="text-xs bg-muted px-1 rounded">META_SCHEDULER_ENABLED=true</code>{" "}
                    — ativa o sync automático
                  </li>
                  <li>
                    <code className="text-xs bg-muted px-1 rounded">META_SCHEDULER_INTERVAL_MINUTES=60</code>{" "}
                    — intervalo entre syncs (padrão: 60min)
                  </li>
                  <li>
                    <code className="text-xs bg-muted px-1 rounded">META_SCHEDULER_LOOKBACK_DAYS=7</code>{" "}
                    — quantos dias retroativos buscar a cada sync (padrão: 7 dias)
                  </li>
                </ul>
                <p className="text-muted-foreground">
                  O scheduler executa campanhas, conjuntos, anúncios e insights em paralelo para todas as contas selecionadas.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
