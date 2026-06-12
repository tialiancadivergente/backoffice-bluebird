import { useState } from "react";
import { CalendarIcon, ChevronDown, Settings } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LaunchFunnelTable } from "@/components/launch-dashboard/LaunchFunnelTable";
import { LaunchKpiCards } from "@/components/launch-dashboard/LaunchKpiCards";
import { LaunchTimeseriesChart } from "@/components/launch-dashboard/LaunchTimeseriesChart";
import { LaunchAwarenessCards } from "@/components/launch-dashboard/LaunchAwarenessCards";
import { LaunchTierDistribution } from "@/components/launch-dashboard/LaunchTierDistribution";
import { LaunchConfigModal } from "@/components/launch-dashboard/LaunchConfigModal";
import {
  useAdAccounts,
  useLaunchAwareness,
  useLaunchConfig,
  useLaunchFunnelTable,
  useLaunchOptions,
  useLaunchSummary,
  useLaunchTimeseries,
  useLaunchTierDistribution,
} from "@/hooks/use-launch-dashboard";
import type { LaunchDashboardFilters } from "@/types/launch-dashboard";

function toParam(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function fromParam(date: string) {
  return new Date(`${date}T12:00:00`);
}

const FILTERS_KEY = "launch_dashboard_filters";

function defaultFilters(): LaunchDashboardFilters {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  return { dateFrom: toParam(thirtyDaysAgo), dateTo: toParam(today) };
}

function loadFilters(): LaunchDashboardFilters {
  try {
    const raw = localStorage.getItem(FILTERS_KEY);
    if (raw) return { ...defaultFilters(), ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return defaultFilters();
}

function saveFilters(f: LaunchDashboardFilters) {
  try {
    localStorage.setItem(FILTERS_KEY, JSON.stringify(f));
  } catch {
    // ignore
  }
}

export default function LaunchDashboardPage() {
  const [filters, setFilters] = useState<LaunchDashboardFilters>(loadFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  const launchesQuery = useLaunchOptions();
  const adAccountsQuery = useAdAccounts(filters);
  const summaryQuery = useLaunchSummary(filters);
  const timeseriesQuery = useLaunchTimeseries(filters);
  const funnelQuery = useLaunchFunnelTable(filters);
  const awarenessQuery = useLaunchAwareness(filters);
  const tierQuery = useLaunchTierDistribution(filters);
  const configQuery = useLaunchConfig(filters.launchId);

  const adAccounts = adAccountsQuery.data ?? [];

  const launches = launchesQuery.data ?? [];
  const selectedLaunch = launches.find((l) => l.id === filters.launchId);

  function setFilter<K extends keyof LaunchDashboardFilters>(
    key: K,
    value: LaunchDashboardFilters[K],
  ) {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      saveFilters(next);
      return next;
    });
  }

  function clearFilters() {
    const f = defaultFilters();
    saveFilters(f);
    setFilters(f);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard de Lançamentos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Funil completo: anúncio → lead → checkout → venda Hotmart.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 shrink-0"
          onClick={() => setConfigOpen(true)}
          title="Configurações do dashboard"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Configurações</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Launch selector */}
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <Label className="text-xs">Lançamento</Label>
            <Select
              value={filters.launchId ?? "all"}
              onValueChange={(v) => setFilter("launchId", v === "all" ? undefined : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os lançamentos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os lançamentos</SelectItem>
                {launches.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date From */}
          <div className="space-y-1.5">
            <Label className="text-xs">De</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateFrom
                    ? format(fromParam(filters.dateFrom), "dd/MM/yyyy", { locale: ptBR })
                    : "Selecionar"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateFrom ? fromParam(filters.dateFrom) : undefined}
                  onSelect={(d) => d && setFilter("dateFrom", toParam(d))}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Date To */}
          <div className="space-y-1.5">
            <Label className="text-xs">Até</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateTo
                    ? format(fromParam(filters.dateTo), "dd/MM/yyyy", { locale: ptBR })
                    : "Selecionar"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateTo ? fromParam(filters.dateTo) : undefined}
                  onSelect={(d) => d && setFilter("dateTo", toParam(d))}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Advanced filters */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 px-2">
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
              />
              Filtros avançados
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Conta de Anúncio</Label>
                <Select
                  value={filters.externalAccountId ?? "all"}
                  onValueChange={(v) =>
                    setFilter("externalAccountId", v === "all" ? undefined : v)
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todas as contas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as contas</SelectItem>
                    {adAccounts.map((a) => (
                      <SelectItem key={a.externalAccountId} value={a.externalAccountId}>
                        {a.accountName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Campanha ID</Label>
                <input
                  type="text"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  placeholder="external campaign id"
                  value={filters.externalCampaignId ?? ""}
                  onChange={(e) =>
                    setFilter("externalCampaignId", e.target.value || undefined)
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Adset ID</Label>
                <input
                  type="text"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  placeholder="external adset id"
                  value={filters.externalAdsetId ?? ""}
                  onChange={(e) =>
                    setFilter("externalAdsetId", e.target.value || undefined)
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Anúncio ID</Label>
                <input
                  type="text"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  placeholder="external ad id"
                  value={filters.externalAdId ?? ""}
                  onChange={(e) =>
                    setFilter("externalAdId", e.target.value || undefined)
                  }
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-7">
            Limpar filtros
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <section aria-label="Indicadores do funil">
        <h2 className="text-base font-semibold mb-3">Indicadores</h2>
        <LaunchKpiCards
          data={summaryQuery.data?.summary}
          config={configQuery.data}
          isLoading={summaryQuery.isLoading}
          isError={summaryQuery.isError}
        />
      </section>

      {/* Awareness Metrics */}
      <section aria-label="Métricas de consciência e engajamento">
        <h2 className="text-base font-semibold mb-3">Consciência e Engajamento</h2>
        <LaunchAwarenessCards
          data={awarenessQuery.data}
          config={configQuery.data}
          isLoading={awarenessQuery.isLoading}
        />
      </section>

      {/* Tier Distribution */}
      <section aria-label="Distribuição por faixa de leadscore">
        <h2 className="text-base font-semibold mb-3">Distribuição por Faixa</h2>
        <LaunchTierDistribution
          data={tierQuery.data}
          isLoading={tierQuery.isLoading}
        />
      </section>

      {/* Timeseries */}
      <section aria-label="Tendência diária">
        <h2 className="text-base font-semibold mb-3">Tendência</h2>
        <LaunchTimeseriesChart
          data={timeseriesQuery.data?.timeseries ?? []}
          isLoading={timeseriesQuery.isLoading}
        />
      </section>

      {/* Funnel Table / Performance de Anúncios */}
      <section aria-label="Performance de anúncios">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-base font-semibold">Performance de Anúncios</h2>
          {funnelQuery.data && (
            <span className="text-xs text-muted-foreground">
              {funnelQuery.data.total} anúncio{funnelQuery.data.total !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <LaunchFunnelTable
          items={funnelQuery.data?.items ?? []}
          isLoading={funnelQuery.isLoading}
          isError={funnelQuery.isError}
          onRetry={() => funnelQuery.refetch()}
        />
      </section>

      {/* Config Modal */}
      <LaunchConfigModal
        open={configOpen}
        onOpenChange={setConfigOpen}
        launchId={filters.launchId}
        launchName={selectedLaunch?.name}
      />
    </div>
  );
}
