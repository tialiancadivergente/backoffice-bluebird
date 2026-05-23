import { useState } from "react";
import { NavLink } from "react-router-dom";
import { RefreshCw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetaFilters } from "@/components/meta-ads/MetaFilters";
import { MetaKpiCards } from "@/components/meta-ads/MetaKpiCards";
import { MetaCampaignsTable } from "@/components/meta-ads/MetaCampaignsTable";
import { MetaCsvFallback } from "@/components/meta-ads/MetaCsvFallback";
import {
  useMetaSummary,
  useMetaCampaignBreakdown,
  useMetaTimeseries,
} from "@/hooks/use-meta-ads";
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

export default function MetaAdsDashboardPage() {
  const [filters, setFilters] = useState<MetaPerformanceFilters>({});
  const [activeTab, setActiveTab] = useState("resumo");

  const summary = useMetaSummary(filters);
  const campaignBreakdown = useMetaCampaignBreakdown(
    filters,
    activeTab === "campanhas",
  );
  const timeseries = useMetaTimeseries(filters, activeTab === "tendencia");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meta Ads</h1>
          <p className="text-muted-foreground text-sm">
            Performance de anúncios — Facebook & Instagram
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <NavLink to="/meta-ads/jobs">
              <RefreshCw className="mr-2 h-4 w-4" />
              Jobs de Sync
            </NavLink>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <NavLink to="/meta-ads/configuracoes">
              <Settings className="h-4 w-4" />
            </NavLink>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <MetaFilters filters={filters} onChange={setFilters} />

      {/* Error */}
      {summary.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            Erro ao carregar dados. Verifique a conexão ou execute um sync.
          </AlertDescription>
        </Alert>
      )}

      {/* KPI Cards */}
      <MetaKpiCards summary={summary.data} isLoading={summary.isLoading} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="tendencia">Tendência</TabsTrigger>
          <TabsTrigger value="campanhas">Por Campanha</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="space-y-4 mt-4">
          <MetaCsvFallback filters={filters} />
        </TabsContent>

        <TabsContent value="tendencia" className="mt-4">
          {timeseries.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : timeseries.data && timeseries.data.length > 0 ? (
            <div className="space-y-6">
              {/* Spend chart */}
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
              {/* CTR / Connect Rate chart */}
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
          ) : (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Nenhum dado de série temporal disponível. Execute um sync de insights.
            </div>
          )}
        </TabsContent>

        <TabsContent value="campanhas" className="mt-4">
          <MetaCampaignsTable
            data={campaignBreakdown.data}
            isLoading={campaignBreakdown.isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
