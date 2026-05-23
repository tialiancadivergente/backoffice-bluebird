import { useState } from "react";
import { Loader2, Play, ChevronDown } from "lucide-react";
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
import {
  useSyncMetaAll,
  useSyncMetaCampaigns,
  useSyncMetaAdsets,
  useSyncMetaAds,
  useSyncMetaInsights,
  useStartMetaInsightsJob,
} from "@/hooks/use-meta-ads";
import { useOAuthConnections, useMarketingSyncAccounts } from "@/hooks/use-marketing-sync";
import type { MetaDatePreset, MetaSyncPayload } from "@/types/meta-ads";

type JobType = "campaigns" | "adsets" | "ads" | "insights" | "all" | "async_job";

function accountsLabel(accounts: Array<{ accountName?: string | null; accountId: string }>) {
  if (accounts.length === 0) return "Nenhuma conta selecionada";
  return accounts.map((a) => a.accountName ?? a.accountId).join(", ");
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

  const isLoading =
    syncAll.isPending ||
    syncCampaigns.isPending ||
    syncAdsets.isPending ||
    syncAds.isPending ||
    syncInsights.isPending ||
    startJob.isPending;

  function buildPayload(): MetaSyncPayload {
    return {
      connectionId: selectedConnectionId === "all" ? undefined : selectedConnectionId,
      datePreset: dateMode === "preset" ? datePreset : undefined,
      since: dateMode === "range" ? since : undefined,
      until: dateMode === "range" ? until : undefined,
      level,
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
    }
  }

  const showNodeId = jobType === "async_job";
  const showLevel = jobType === "insights" || jobType === "async_job";

  return (
    <div className="space-y-4">
      {/* Conta / Conexão */}
      <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Conta Meta Ads
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Conexão</Label>
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
                    {c.userName ?? c.connectionId ?? c.id.slice(0, 8)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Contas selecionadas</Label>
            <div className="h-8 px-3 flex items-center rounded-md border border-input bg-background text-xs text-muted-foreground">
              {accountsQuery.isLoading ? "Carregando..." : accountsLabel(selectedAccounts)}
            </div>
          </div>
        </div>
        {selectedAccounts.length === 0 && !accountsQuery.isLoading && (
          <p className="text-xs text-amber-500">
            Nenhuma conta ativa. Vá em{" "}
            <a href="/meta-ads/conexao" className="underline">
              Conexão
            </a>{" "}
            e selecione as contas.
          </p>
        )}
      </div>

      {/* Job params */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Tipo de Job</Label>
          <Select value={jobType} onValueChange={(v) => setJobType(v as JobType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="insights">Insights (métricas)</SelectItem>
              <SelectItem value="campaigns">Campanhas</SelectItem>
              <SelectItem value="adsets">Conjuntos de Anúncios</SelectItem>
              <SelectItem value="ads">Anúncios (criativos)</SelectItem>
              <SelectItem value="all">Sync Completo (todos)</SelectItem>
              <SelectItem value="async_job">Job Assíncrono (períodos longos)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Período</Label>
          <Select
            value={dateMode}
            onValueChange={(v) => setDateMode(v as "preset" | "range")}
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
        disabled={isLoading || selectedAccounts.length === 0}
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
