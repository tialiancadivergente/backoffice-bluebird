import { useState } from "react";
import { CalendarIcon, Check, ChevronDown, Settings } from "lucide-react";
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
import type {
  LaunchAwarenessMetrics,
  LaunchDashboardConfig,
  LaunchDashboardFilters,
  LaunchDashboardSummary,
  LaunchTierDistribution as LaunchTierDistributionData,
} from "@/types/launch-dashboard";

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

function buildShareMessage(
  filters: LaunchDashboardFilters,
  launchName: string | undefined,
  accountNames: string[],
  summary: LaunchDashboardSummary | undefined,
  awareness: LaunchAwarenessMetrics | undefined,
  tier: LaunchTierDistributionData | undefined,
  config: LaunchDashboardConfig | null | undefined,
): string {
  const cur = (v: number | null | undefined) =>
    v == null ? "—" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
  const int = (v: number | null | undefined) =>
    v == null ? "—" : v.toLocaleString("pt-BR");
  const pct = (v: number | null | undefined) =>
    v == null ? "—" : `${(v * 100).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

  const dot = (actual: number | null | undefined, target: number | null | undefined, dir: "hi" | "lo") => {
    if (actual == null || !target) return "";
    const r = dir === "hi" ? actual / target : target / actual;
    return r >= 1 ? " 🟢" : r >= 0.9 ? " 🟡" : " 🔴";
  };

  const fmtDate = (d: string) => d.split("-").reverse().join("/");

  const lines: string[] = [];
  const launch = launchName ?? "Todos os Lançamentos";
  const period = filters.dateFrom && filters.dateTo
    ? `${fmtDate(filters.dateFrom)} a ${fmtDate(filters.dateTo)}`
    : "";

  lines.push(`📊 *Dashboard ${launch}${period ? ` — ${period}` : ""}*`);
  if (accountNames.length > 0) lines.push(`🔍 Contas: ${accountNames.join(", ")}`);

  if (!summary) {
    lines.push("\n_Sem dados disponíveis_");
    return lines.join("\n");
  }

  lines.push("\n━━━━━━━━━━━━━━━━━━━━");
  lines.push("💼 *MÍDIA*\n");
  lines.push(`💰 Gasto: ${cur(summary.spend)}${config?.targetSpend ? ` (META: ${cur(config.targetSpend)}${dot(summary.spend, config.targetSpend, "hi")})` : ""}`);
  lines.push(`   CPM: ${cur(summary.cpm)}${config?.targetCpm ? ` (META: ${cur(config.targetCpm)}${dot(summary.cpm, config.targetCpm, "lo")})` : ""}`);
  lines.push(`📣 Impressões: ${int(summary.impressions)}`);
  lines.push(`   CTR: ${pct(summary.ctr)}${config?.targetCtr ? ` (META: ${pct(config.targetCtr)}${dot(summary.ctr, config.targetCtr, "hi")})` : ""}`);
  lines.push(`🖱️ Cliques: ${int(summary.clicks)}`);
  lines.push(`   CPC: ${cur(summary.cpc)}${config?.targetCpc ? ` (META: ${cur(config.targetCpc)}${dot(summary.cpc, config.targetCpc, "lo")})` : ""}`);
  lines.push(`🔗 Cliques Link: ${int(summary.inlineLinkClicks)}`);
  lines.push(`   Connect Rate: ${pct(summary.connectRate)}${config?.targetConnectRate ? ` (META: ${pct(config.targetConnectRate)}${dot(summary.connectRate, config.targetConnectRate, "hi")})` : ""}`);
  lines.push(`📄 Pág. Visualizadas: ${int(summary.landingPageViews)}`);
  lines.push(`   Tx PgV→CK: ${pct(summary.txPgvCheckout)}${config?.targetPageConversion ? ` (META: ${pct(config.targetPageConversion)}${dot(summary.txPgvCheckout, config.targetPageConversion, "hi")})` : ""}`);

  lines.push("\n━━━━━━━━━━━━━━━━━━━━");
  lines.push("🎯 *FUNIL CRM*\n");
  lines.push(`👥 Leads: ${int(summary.leads)}${config?.targetLeads ? ` (META: ${int(config.targetLeads)}${dot(summary.leads, config.targetLeads, "hi")})` : ""}`);
  lines.push(`   CPL: ${cur(summary.cpl)}${config?.targetCpl ? ` (META: ${cur(config.targetCpl)}${dot(summary.cpl, config.targetCpl, "lo")})` : ""}`);
  lines.push(`🛒 Inicios Checkout: ${int(summary.initiateCheckouts)}`);
  lines.push(`🏆 Vendas Hotmart: ${int(summary.sales)}`);
  lines.push(`💰 Receita: ${cur(summary.revenue)}`);

  if (awareness) {
    lines.push("\n━━━━━━━━━━━━━━━━━━━━");
    lines.push("🧠 *CONSCIÊNCIA E ENGAJAMENTO*\n");
    lines.push(`📋 Taxa Resposta Pesquisa: ${pct(awareness.surveyResponseRate)}`);
    if (awareness.configured.consciousness)
      lines.push(`💡 Taxa de Consciência: ${pct(awareness.consciousnessRate)}${config?.targetConsciousnessRate ? ` (META: ${pct(config.targetConsciousnessRate)}${dot(awareness.consciousnessRate, config.targetConsciousnessRate, "hi")})` : ""}`);
    if (awareness.configured.knowsExpert)
      lines.push(`🧑‍💼 Taxa Conhece Especialista: ${pct(awareness.knowsExpertRate)}${config?.targetKnowsExpertRate ? ` (META: ${pct(config.targetKnowsExpertRate)}${dot(awareness.knowsExpertRate, config.targetKnowsExpertRate, "hi")})` : ""}`);
    if (awareness.configured.knowsAlliance)
      lines.push(`🤝 Taxa Conhece Aliança: ${pct(awareness.knowsAllianceRate)}${config?.targetKnowsAllianceRate ? ` (META: ${pct(config.targetKnowsAllianceRate)}${dot(awareness.knowsAllianceRate, config.targetKnowsAllianceRate, "hi")})` : ""}`);
  }

  if (tier && tier.distribution.length > 0) {
    lines.push("\n━━━━━━━━━━━━━━━━━━━━");
    lines.push("📊 *DISTRIBUIÇÃO POR FAIXA*\n");
    for (const d of tier.distribution)
      lines.push(`${d.tierName}: ${d.percentage.toFixed(2).replace(".", ",")}% (${int(d.count)} leads)`);
    lines.push(`\nTotal: ${int(tier.total)} leads`);
  }

  const now = new Date();
  lines.push(`\n━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`_Gerado em ${now.toLocaleDateString("pt-BR")} ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}_`);

  return lines.join("\n");
}


export default function LaunchDashboardPage() {
  const [filters, setFilters] = useState<LaunchDashboardFilters>(loadFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  const launchesQuery = useLaunchOptions();
  const adAccountsQuery = useAdAccounts({ ...filters, externalAccountId: undefined });
  const summaryQuery = useLaunchSummary(filters);
  const timeseriesQuery = useLaunchTimeseries(filters);
  const funnelQuery = useLaunchFunnelTable(filters);
  const awarenessQuery = useLaunchAwareness(filters);
  const tierQuery = useLaunchTierDistribution(filters);
  const configQuery = useLaunchConfig(filters.launchId);

  const adAccounts = adAccountsQuery.data ?? [];
  const selectedAccountIds = filters.externalAccountId
    ? filters.externalAccountId.split(",")
    : [];

  function toggleAccount(id: string) {
    const next = selectedAccountIds.includes(id)
      ? selectedAccountIds.filter((a) => a !== id)
      : [...selectedAccountIds, id];
    setFilter("externalAccountId", next.length ? next.join(",") : undefined);
  }

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
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            className="gap-1.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white border-0"
            onClick={() => {
              const accountNames = selectedAccountIds.map(
                (id) => adAccounts.find((a) => a.externalAccountId === id)?.accountName ?? id,
              );
              const msg = buildShareMessage(
                filters,
                selectedLaunch?.name,
                accountNames,
                summaryQuery.data?.summary,
                awarenessQuery.data,
                tierQuery.data,
                configQuery.data,
              );
              window.open(
                `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`,
                "_blank",
              );
            }}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span className="hidden sm:inline">Enviar no WhatsApp</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setConfigOpen(true)}
            title="Configurações do dashboard"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Configurações</span>
          </Button>
        </div>
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-9 w-full justify-between font-normal text-sm"
                    >
                      <span className="truncate">
                        {selectedAccountIds.length === 0
                          ? "Todas as contas"
                          : selectedAccountIds.length === 1
                            ? (adAccounts.find((a) => a.externalAccountId === selectedAccountIds[0])?.accountName ?? selectedAccountIds[0])
                            : `${selectedAccountIds.length} contas`}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50 ml-2" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-2" align="start">
                    <div className="max-h-60 overflow-y-auto space-y-0.5">
                      {adAccounts.length === 0 && (
                        <p className="text-xs text-muted-foreground px-2 py-1">
                          {adAccountsQuery.isLoading ? "Carregando..." : "Nenhuma conta disponível"}
                        </p>
                      )}
                      {adAccounts.map((a) => {
                        const checked = selectedAccountIds.includes(a.externalAccountId);
                        return (
                          <button
                            key={a.externalAccountId}
                            type="button"
                            onClick={() => toggleAccount(a.externalAccountId)}
                            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted text-left"
                          >
                            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${checked ? "bg-primary border-primary" : "border-input"}`}>
                              {checked && <Check className="h-3 w-3 text-primary-foreground" />}
                            </span>
                            <span className="truncate">{a.accountName}</span>
                          </button>
                        );
                      })}
                    </div>
                    {selectedAccountIds.length > 0 && (
                      <div className="border-t mt-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setFilter("externalAccountId", undefined)}
                          className="text-xs text-muted-foreground hover:text-foreground w-full text-left px-2"
                        >
                          Limpar seleção
                        </button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
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
        <div className="relative">
          <div className="pointer-events-none select-none blur-sm opacity-60">
            <LaunchTimeseriesChart
              data={timeseriesQuery.data?.timeseries ?? []}
              isLoading={timeseriesQuery.isLoading}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium text-muted-foreground bg-background/80 px-4 py-2 rounded-md border border-border">
              Em breve
            </span>
          </div>
        </div>
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
