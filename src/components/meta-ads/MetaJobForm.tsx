import { useState } from "react";
import { ChevronDown, HelpCircle, Loader2, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  useSyncMetaAll,
  useSyncMetaCampaigns,
  useSyncMetaAdsets,
  useSyncMetaAds,
  useSyncMetaInsights,
  useStartMetaInsightsJob,
  useStartMetaBulkInsightsJob,
} from "@/hooks/use-meta-ads";
import { useOAuthConnections, useMarketingSyncAccounts } from "@/hooks/use-marketing-sync";
import type { MetaDatePreset, MetaSyncPayload } from "@/types/meta-ads";

type JobType = "campaigns" | "adsets" | "ads" | "insights" | "all" | "async_job" | "bulk_async";

function resolvePresetDates(preset: MetaDatePreset): { since: string; until: string } {
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const today = new Date();
  const yesterday = new Date(today.getTime() - 86400000);
  if (preset === "today") return { since: fmt(today), until: fmt(today) };
  if (preset === "yesterday") return { since: fmt(yesterday), until: fmt(yesterday) };
  if (preset === "last_7d") return { since: fmt(new Date(today.getTime() - 7 * 86400000)), until: fmt(today) };
  if (preset === "last_14d") return { since: fmt(new Date(today.getTime() - 14 * 86400000)), until: fmt(today) };
  if (preset === "last_30d") return { since: fmt(new Date(today.getTime() - 30 * 86400000)), until: fmt(today) };
  if (preset === "last_90d") return { since: fmt(new Date(today.getTime() - 90 * 86400000)), until: fmt(today) };
  if (preset === "this_month") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return { since: fmt(start), until: fmt(today) };
  }
  if (preset === "last_month") {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const end = new Date(today.getFullYear(), today.getMonth(), 0);
    return { since: fmt(start), until: fmt(end) };
  }
  return { since: fmt(yesterday), until: fmt(yesterday) };
}

function accountLabel(account: { accountName?: string | null; accountId: string }) {
  return account.accountName || `Conta ${account.accountId}`;
}

function InfoTip({ children }: { children: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[320px] whitespace-normal">
        {children}
      </TooltipContent>
    </Tooltip>
  );
}

export function MetaJobForm() {
  const [jobType, setJobType] = useState<JobType>("insights");
  const [dateMode, setDateMode] = useState<"preset" | "range">("preset");
  const [datePreset, setDatePreset] = useState<MetaDatePreset>("last_7d");
  const [since, setSince] = useState("");
  const [until, setUntil] = useState("");
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>("all");
  const [level, setLevel] = useState<"ad" | "adset" | "campaign">("ad");
  const [breakdowns, setBreakdowns] = useState("publisher_platform");
  const [nodeId, setNodeId] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [chunkDays, setChunkDays] = useState<number>(30);

  // Load Meta connections and their accounts
  const connectionsQuery = useOAuthConnections();
  const metaConnections = (connectionsQuery.data ?? []).filter(
    (c) => c.provider === "meta_ads",
  );

  const accountsQuery = useMarketingSyncAccounts({
    provider: "meta_ads",
    connectionId: selectedConnectionId === "all" ? undefined : selectedConnectionId,
  });
  const selectedAccounts = (accountsQuery.data ?? []).filter((a) => a.selected);

  const syncAll = useSyncMetaAll();
  const syncCampaigns = useSyncMetaCampaigns();
  const syncAdsets = useSyncMetaAdsets();
  const syncAds = useSyncMetaAds();
  const syncInsights = useSyncMetaInsights();
  const startJob = useStartMetaInsightsJob();
  const startBulkJob = useStartMetaBulkInsightsJob();

  const isLoading =
    syncAll.isPending ||
    syncCampaigns.isPending ||
    syncAdsets.isPending ||
    syncAds.isPending ||
    syncInsights.isPending ||
    startJob.isPending ||
    startBulkJob.isPending;

  function buildPayload(): MetaSyncPayload {
    return {
      connectionId: selectedConnectionId === "all" ? undefined : selectedConnectionId,
      datePreset: dateMode === "preset" ? datePreset : undefined,
      since: dateMode === "range" ? since : undefined,
      until: dateMode === "range" ? until : undefined,
      level: jobType === "async_job" ? level : "ad",
      breakdowns: breakdowns === "none" ? undefined : breakdowns,
    };
  }

  async function handleRun() {
    const payload = buildPayload();

    if (jobType === "all") syncAll.mutate(payload);
    else if (jobType === "campaigns") syncCampaigns.mutate(payload);
    else if (jobType === "adsets") syncAdsets.mutate(payload);
    else if (jobType === "ads") syncAds.mutate(payload);
    else if (jobType === "insights") syncInsights.mutate(payload);
    else if (jobType === "async_job") {
      if (!nodeId || !since || !until) return;
      const connId = selectedConnectionId === "all" ? metaConnections[0]?.id : selectedConnectionId;
      if (!connId) return;
      startJob.mutate({
        connectionId: connId,
        nodeId,
        since,
        until,
        level,
        breakdowns: breakdowns === "none" ? undefined : breakdowns,
      });
    } else if (jobType === "bulk_async") {
      const dates = dateMode === "preset" ? resolvePresetDates(datePreset) : { since, until };
      if (!dates.since || !dates.until) return;
      startBulkJob.mutate({
        connectionId: selectedConnectionId === "all" ? undefined : selectedConnectionId,
        since: dates.since,
        until: dates.until,
        level,
        breakdowns: breakdowns === "none" ? undefined : breakdowns,
        chunkDays,
      });
    }
  }

  const showNodeId = jobType === "async_job";
  const showLevel = jobType === "async_job" || jobType === "bulk_async";
  const showInsightsNote = jobType === "insights" || jobType === "all";
  const showChunkDays = jobType === "bulk_async";
  const forceDateRange = jobType === "async_job";

  return (
    <div className="space-y-4">
      {/* Conta / Conexão */}
      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Contas usadas neste sync
            </p>
            <InfoTip>
              O job usa as contas marcadas como selecionadas na aba Conexão. Se escolher “Todas as conexões ativas”, todas as contas selecionadas de todas as conexões entram no sync.
            </InfoTip>
          </div>
          <p className="text-sm text-muted-foreground">
            {selectedAccounts.length} conta{selectedAccounts.length === 1 ? "" : "s"} selecionada{selectedAccounts.length === 1 ? "" : "s"}.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label className="text-xs">Conexão</Label>
              <InfoTip>Use uma conexão específica só quando quiser limitar o sync a ela. Para a rotina normal, deixe todas as conexões ativas.</InfoTip>
            </div>
            <Select
              value={selectedConnectionId}
              onValueChange={setSelectedConnectionId}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Selecionar conexão..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as conexões ativas</SelectItem>
                {metaConnections.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.selectedAccountName || c.userName || c.connectionId || c.id.slice(0, 8)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label className="text-xs">Contas selecionadas</Label>
              <InfoTip>Essas são as contas de anúncio que terão métricas importadas. Para mudar a lista, volte para Conexão e use “Selecionar”/“Desselecionar”.</InfoTip>
            </div>
            <div className="min-h-10 max-h-28 overflow-y-auto rounded-md border border-input bg-background p-2">
              {accountsQuery.isLoading ? (
                <span className="text-xs text-muted-foreground">Carregando contas...</span>
              ) : selectedAccounts.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {selectedAccounts.map((account) => (
                    <Badge key={account.id} variant="secondary" className="max-w-full">
                      <span className="truncate">{accountLabel(account)}</span>
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Nenhuma conta selecionada para sync.</span>
              )}
            </div>
          </div>
        </div>
        {selectedAccounts.length === 0 && !accountsQuery.isLoading && (
          <p className="text-xs text-amber-500">
            Nenhuma conta ativa para sync. Volte para a aba Conexão e selecione pelo menos uma conta em “Contas que entram no sync”.
          </p>
        )}
      </div>

      {/* Job params */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Tipo de Job</Label>
          <Select
            value={jobType}
            onValueChange={(v) => {
              const next = v as JobType;
              setJobType(next);
              if (next === "async_job") setDateMode("range");
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="insights">Insights (métricas)</SelectItem>
              <SelectItem value="bulk_async">Insights Bulk Async (múltiplas contas + período longo)</SelectItem>
              <SelectItem value="campaigns">Campanhas</SelectItem>
              <SelectItem value="adsets">Conjuntos de Anúncios</SelectItem>
              <SelectItem value="ads">Anúncios (criativos)</SelectItem>
              <SelectItem value="all">Sync Completo (todos)</SelectItem>
              <SelectItem value="async_job">Job Assíncrono (node único, período longo)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Período</Label>
          <Select
            value={forceDateRange ? "range" : dateMode}
            onValueChange={(v) => {
              if (!forceDateRange) setDateMode(v as "preset" | "range");
            }}
            disabled={forceDateRange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="preset">Predefinido</SelectItem>
              <SelectItem value="range">Intervalo customizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {dateMode === "preset" ? (
          <div className="space-y-1.5">
            <Label>Predefinição</Label>
            <Select
              value={datePreset}
              onValueChange={(v) => setDatePreset(v as MetaDatePreset)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="yesterday">Ontem</SelectItem>
                <SelectItem value="last_7d">Últimos 7 dias</SelectItem>
                <SelectItem value="last_14d">Últimos 14 dias</SelectItem>
                <SelectItem value="last_30d">Últimos 30 dias</SelectItem>
                <SelectItem value="last_90d">Últimos 90 dias</SelectItem>
                <SelectItem value="this_month">Este mês</SelectItem>
                <SelectItem value="last_month">Mês passado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label>De (YYYY-MM-DD)</Label>
              <Input
                value={since}
                onChange={(e) => setSince(e.target.value)}
                placeholder="2025-05-01"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Até (YYYY-MM-DD)</Label>
              <Input
                value={until}
                onChange={(e) => setUntil(e.target.value)}
                placeholder="2025-05-22"
              />
            </div>
          </>
        )}

        {showNodeId && (
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Node ID</Label>
            <Input
              value={nodeId}
              onChange={(e) => setNodeId(e.target.value)}
              placeholder="act_123456789 ou campaign_id"
            />
            <p className="text-xs text-muted-foreground">
              ID da conta (act_...), campanha, conjunto ou anúncio. Use para períodos
              longos — a Meta retorna um report_run_id para polling.
            </p>
          </div>
        )}

        {showInsightsNote && (
          <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground sm:col-span-2">
            Insights do dashboard são importados no nível Anúncio (ad), porque a
            tabela de performance precisa do ID do anúncio para consolidar gasto,
            cliques e conversões.
          </div>
        )}

        {showChunkDays && (
          <>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label>Tamanho do Chunk</Label>
                <InfoTip>
                  O período total é dividido em blocos deste tamanho. Cada bloco vira um job assíncrono por conta. Chunks menores são mais resilientes a falhas mas geram mais jobs.
                </InfoTip>
              </div>
              <Select
                value={String(chunkDays)}
                onValueChange={(v) => setChunkDays(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 dias por chunk</SelectItem>
                  <SelectItem value="14">14 dias por chunk</SelectItem>
                  <SelectItem value="30">30 dias por chunk</SelectItem>
                  <SelectItem value="60">60 dias por chunk</SelectItem>
                  <SelectItem value="90">90 dias por chunk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground sm:col-span-2">
              Cria um job assíncrono por conta × chunk, processando até 5 em paralelo.
              Os resultados são salvos automaticamente — acompanhe no histórico de execuções.
              {since && until && chunkDays && (() => {
                const msPerChunk = chunkDays * 86400 * 1000;
                const totalMs = new Date(until).getTime() - new Date(since).getTime();
                const numChunks = Math.ceil(totalMs / msPerChunk) + 1;
                const numAccounts = selectedAccounts.length;
                return numAccounts > 0
                  ? ` Estimativa: ${numAccounts} conta${numAccounts > 1 ? "s" : ""} × ~${numChunks} chunk${numChunks > 1 ? "s" : ""} = ~${numAccounts * numChunks} jobs.`
                  : null;
              })()}
            </div>
          </>
        )}
      </div>

      {/* Advanced params */}
      {showLevel && (
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
              />
              Parâmetros avançados
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg border border-dashed border-border">
              <div className="space-y-1.5">
                <Label>Nível</Label>
                <Select
                  value={level}
                  onValueChange={(v) => setLevel(v as "ad" | "adset" | "campaign")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ad">Anúncio (ad)</SelectItem>
                    <SelectItem value="adset">Conjunto (adset)</SelectItem>
                    <SelectItem value="campaign">Campanha</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Breakdown</Label>
                <Select value={breakdowns} onValueChange={setBreakdowns}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="publisher_platform">
                      publisher_platform (Facebook / Instagram)
                    </SelectItem>
                    <SelectItem value="none">Sem breakdown (total)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Com breakdown salva uma linha por plataforma por anúncio
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      <Button
        onClick={handleRun}
        disabled={
          isLoading ||
          selectedAccounts.length === 0 ||
          (jobType === "bulk_async" && dateMode === "range" && (!since || !until)) ||
          (jobType === "async_job" && (!nodeId || !since || !until))
        }
        className="w-full sm:w-auto"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Play className="mr-2 h-4 w-4" />
        )}
        Executar
      </Button>
    </div>
  );
}
