import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  abortMetaExecution,
  checkMetaJob,
  getMetaAdsets,
  getMetaAds,
  getMetaCampaignBreakdown,
  getMetaCampaigns,
  getMetaExecutions,
  getMetaJobResults,
  getMetaPerformance,
  getMetaPerformanceSummary,
  getMetaTimeseries,
  startMetaBulkInsightsJob,
  startMetaInsightsJob,
  syncMetaAds,
  syncMetaAdsets,
  syncMetaAll,
  syncMetaCampaigns,
  syncMetaInsights,
} from "@/api/meta-ads";
import type {
  MetaBulkInsightsPayload,
  MetaInsightsJobPayload,
  MetaPerformanceFilters,
  MetaSyncPayload,
} from "@/types/meta-ads";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const metaKeys = {
  all: ["meta-ads"] as const,
  summary: (f?: MetaPerformanceFilters) => [...metaKeys.all, "summary", f] as const,
  timeseries: (f?: MetaPerformanceFilters) => [...metaKeys.all, "timeseries", f] as const,
  campaigns: (p?: object) => [...metaKeys.all, "campaigns", p] as const,
  campaignBreakdown: (f?: MetaPerformanceFilters) => [...metaKeys.all, "campaign-breakdown", f] as const,
  adsets: (p?: object) => [...metaKeys.all, "adsets", p] as const,
  ads: (p?: object) => [...metaKeys.all, "ads", p] as const,
  performance: (f?: object) => [...metaKeys.all, "performance", f] as const,
  executionsRoot: () => [...metaKeys.all, "executions"] as const,
  executions: (p?: object) => [...metaKeys.executionsRoot(), p] as const,
  job: (id: string) => [...metaKeys.all, "job", id] as const,
};

// ─── Data queries ─────────────────────────────────────────────────────────────

export function useMetaSummary(filters?: MetaPerformanceFilters) {
  return useQuery({
    queryKey: metaKeys.summary(filters),
    queryFn: () => getMetaPerformanceSummary(filters),
    placeholderData: (prev) => prev,
  });
}

export function useMetaTimeseries(filters?: MetaPerformanceFilters, enabled = true) {
  return useQuery({
    queryKey: metaKeys.timeseries(filters),
    queryFn: () => getMetaTimeseries(filters),
    enabled,
    placeholderData: (prev) => prev,
  });
}

export function useMetaCampaignBreakdown(
  filters?: MetaPerformanceFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: metaKeys.campaignBreakdown(filters),
    queryFn: () => getMetaCampaignBreakdown(filters),
    enabled,
    placeholderData: (prev) => prev,
  });
}

export function useMetaCampaigns(
  params?: { accountId?: string; status?: string; limit?: number },
  enabled = true,
) {
  return useQuery({
    queryKey: metaKeys.campaigns(params),
    queryFn: () => getMetaCampaigns(params),
    enabled,
    placeholderData: (prev) => prev,
  });
}

export function useMetaAdsets(
  params?: { accountId?: string; campaignId?: string; status?: string },
  enabled = true,
) {
  return useQuery({
    queryKey: metaKeys.adsets(params),
    queryFn: () => getMetaAdsets(params),
    enabled,
    placeholderData: (prev) => prev,
  });
}

export function useMetaAds(
  params?: { accountId?: string; campaignId?: string; status?: string },
  enabled = true,
) {
  return useQuery({
    queryKey: metaKeys.ads(params),
    queryFn: () => getMetaAds(params),
    enabled,
    placeholderData: (prev) => prev,
  });
}

export function useMetaPerformance(
  filters?: MetaPerformanceFilters & { limit?: number },
  enabled = true,
) {
  return useQuery({
    queryKey: metaKeys.performance(filters),
    queryFn: () => getMetaPerformance(filters),
    enabled,
    placeholderData: (prev) => prev,
  });
}

export function useMetaExecutions(
  params?: { step?: string; status?: string; limit?: number },
) {
  return useQuery({
    queryKey: metaKeys.executions(params),
    queryFn: () => getMetaExecutions(params),
    refetchInterval: (query) => {
      const executions = query.state.data;
      return executions?.some((execution) => execution.status === "running")
        ? 5_000
        : 30_000;
    },
    placeholderData: (prev) => prev,
  });
}

export function useMetaJobStatus(reportRunId: string, connectionId: string) {
  return useQuery({
    queryKey: metaKeys.job(reportRunId),
    queryFn: () => checkMetaJob(reportRunId, connectionId),
    enabled: Boolean(reportRunId) && Boolean(connectionId),
    refetchInterval: (q) => {
      const status = q.state.data?.async_status;
      if (!status) return 5000;
      if (status === "Job Complete" || status === "Job Failed") return false;
      return 5000;
    },
  });
}

// ─── Sync mutations ───────────────────────────────────────────────────────────

export function useSyncMetaCampaigns() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: MetaSyncPayload) => syncMetaCampaigns(p),
    onSuccess: (data) => {
      toast.success(`Campanhas sincronizadas: ${data.total} registros`);
      qc.invalidateQueries({ queryKey: metaKeys.campaigns() });
      qc.invalidateQueries({ queryKey: metaKeys.executionsRoot() });
    },
    onError: () => toast.error("Erro ao sincronizar campanhas"),
  });
}

export function useSyncMetaAdsets() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: MetaSyncPayload) => syncMetaAdsets(p),
    onSuccess: (data) => {
      toast.success(`Conjuntos sincronizados: ${data.total} registros`);
      qc.invalidateQueries({ queryKey: metaKeys.adsets() });
      qc.invalidateQueries({ queryKey: metaKeys.executionsRoot() });
    },
    onError: () => toast.error("Erro ao sincronizar conjuntos de anúncios"),
  });
}

export function useSyncMetaAds() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: MetaSyncPayload) => syncMetaAds(p),
    onSuccess: (data) => {
      toast.success(`Anúncios sincronizados: ${data.total} registros`);
      qc.invalidateQueries({ queryKey: metaKeys.ads() });
      qc.invalidateQueries({ queryKey: metaKeys.executionsRoot() });
    },
    onError: () => toast.error("Erro ao sincronizar anúncios"),
  });
}

export function useSyncMetaInsights() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: MetaSyncPayload) => syncMetaInsights(p),
    onSuccess: (data) => {
      toast.success(
        data.queued
          ? "Sync de insights iniciado. Acompanhe o progresso no histórico."
          : `Insights sincronizados: ${data.total ?? 0} registros`,
      );
      qc.invalidateQueries({ queryKey: metaKeys.summary() });
      qc.invalidateQueries({ queryKey: metaKeys.timeseries() });
      qc.invalidateQueries({ queryKey: metaKeys.executionsRoot() });
    },
    onError: () => toast.error("Erro ao sincronizar insights"),
  });
}

export function useSyncMetaAll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: MetaSyncPayload) => syncMetaAll(p),
    onSuccess: (data) => {
      const total =
        data.campaigns + data.adsets + data.ads + data.insights;
      toast.success(
        `Sync completo: ${total} registros (campanhas=${data.campaigns}, conjuntos=${data.adsets}, anúncios=${data.ads}, insights=${data.insights})`,
      );
      qc.invalidateQueries({ queryKey: metaKeys.all });
    },
    onError: () => toast.error("Erro no sync completo Meta Ads"),
  });
}

export function useStartMetaInsightsJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: MetaInsightsJobPayload) => startMetaInsightsJob(p),
    onSuccess: (data) => {
      toast.success(`Job iniciado: ${data.report_run_id}`);
      qc.invalidateQueries({ queryKey: metaKeys.executionsRoot() });
    },
    onError: () => toast.error("Erro ao iniciar job de insights"),
  });
}

export function useStartMetaBulkInsightsJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: MetaBulkInsightsPayload) => startMetaBulkInsightsJob(p),
    onSuccess: (data) => {
      toast.success(
        `Bulk sync iniciado: ${data.totalJobs} jobs criados. Acompanhe o progresso no histórico.`,
      );
      qc.invalidateQueries({ queryKey: metaKeys.executionsRoot() });
    },
    onError: () => toast.error("Erro ao iniciar bulk sync de insights"),
  });
}

export function useAbortMetaExecution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => abortMetaExecution(id),
    onSuccess: (data) => {
      if (data.aborted) {
        toast.success("Sync abortado com sucesso.");
      } else {
        toast.warning(data.message);
      }
      qc.invalidateQueries({ queryKey: metaKeys.executionsRoot() });
    },
    onError: () => toast.error("Erro ao abortar execução"),
  });
}

export function useGetMetaJobResults() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      reportRunId,
      connectionId,
      accountId,
      save,
    }: {
      reportRunId: string;
      connectionId: string;
      accountId?: string;
      save?: boolean;
    }) => getMetaJobResults(reportRunId, connectionId, { accountId, save }),
    onSuccess: (data) => {
      if (data.saved !== undefined) {
        toast.success(`Job salvo: ${data.saved} registros`);
        qc.invalidateQueries({ queryKey: metaKeys.all });
      }
    },
    onError: () => toast.error("Erro ao recuperar resultados do job"),
  });
}
