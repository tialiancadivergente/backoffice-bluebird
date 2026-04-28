import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  exportAdPerformanceCsv,
  getMarketingSyncPerformance,
  importAdPerformanceCsv,
} from "@/api/syncs/marketing-sync";
import {
  getMarketingDashboardFilters,
  getMarketingDashboardSummary,
  getMarketingDashboardTable,
  getMarketingDashboardTimeseries,
} from "@/api/marketing-dashboard";
import type { AdPerformanceCsvExportFilters, AdPerformanceCsvImportResult, OAuthConnection } from "@/types/syncs/marketing-sync";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface CsvFallbackSectionProps {
  connections: OAuthConnection[];
}

type DebugState =
  | {
      operation: "export";
      endpoint: string;
      payload: AdPerformanceCsvExportFilters;
    }
  | {
      operation: "import";
      endpoint: string;
      payload: {
        provider?: string;
        fileName: string;
      };
      result: AdPerformanceCsvImportResult;
    };

export function CsvFallbackSection({ connections }: Readonly<CsvFallbackSectionProps>) {
  const queryClient = useQueryClient();
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [accountIdFilter, setAccountIdFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [limit, setLimit] = useState<string>("5000");
  const [importProviderOverride, setImportProviderOverride] = useState<string>("keep");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [debugState, setDebugState] = useState<DebugState | null>(null);

  const providers = useMemo(() => {
    return Array.from(new Set(connections.map((item) => item.provider))).sort((a, b) => a.localeCompare(b));
  }, [connections]);

  const exportFilters: AdPerformanceCsvExportFilters = {
    provider: providerFilter === "all" ? undefined : providerFilter,
    accountId: accountIdFilter || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    limit: limit.trim() ? Math.max(1, Number(limit) || 5000) : undefined,
  };

  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await exportAdPerformanceCsv(exportFilters);
      return {
        ...response,
        payload: exportFilters,
      };
    },
    onSuccess: ({ blob, filename, payload }) => {
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);

      setDebugState({
        operation: "export",
        endpoint: "/marketing-sync/ad-performance/export/csv",
        payload,
      });
      toast.success("CSV exportado com sucesso.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao exportar CSV.");
    },
  });

  const importMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) {
        throw new Error("Selecione um arquivo CSV antes de importar.");
      }

      const provider = importProviderOverride === "keep" ? undefined : importProviderOverride;
      const result = await importAdPerformanceCsv({
        file: selectedFile,
        provider,
      });

      return {
        result,
        provider,
        fileName: selectedFile.name,
      };
    },
    onSuccess: async ({ result, provider, fileName }) => {
      setDebugState({
        operation: "import",
        endpoint: "/marketing-sync/ad-performance/import/csv",
        payload: {
          provider,
          fileName,
        },
        result,
      });

      await Promise.allSettled([
        queryClient.fetchQuery({
          queryKey: ["marketing-sync", "performance", { provider, connectionId: undefined, accountId: undefined, limit: undefined }],
          queryFn: () => getMarketingSyncPerformance({ provider }),
        }),
        queryClient.fetchQuery({
          queryKey: ["marketing-dashboard", "filters", { provider }],
          queryFn: () => getMarketingDashboardFilters({ provider }),
        }),
        queryClient.fetchQuery({
          queryKey: ["marketing-dashboard", "summary", { provider }],
          queryFn: () => getMarketingDashboardSummary({ provider }),
        }),
        queryClient.fetchQuery({
          queryKey: ["marketing-dashboard", "timeseries", { provider }],
          queryFn: () => getMarketingDashboardTimeseries({ provider }),
        }),
        queryClient.fetchQuery({
          queryKey: ["marketing-dashboard", "table", { provider, page: 1, perPage: 20 }],
          queryFn: () => getMarketingDashboardTable({ provider, page: 1, perPage: 20 }),
        }),
      ]);

      void queryClient.invalidateQueries({ queryKey: ["marketing-sync", "performance"] });
      void queryClient.invalidateQueries({ queryKey: ["marketing-dashboard"] });

      toast.success("Import concluido. Leituras operacionais e dashboard atualizados.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao importar CSV.");
    },
  });

  const importSummary = debugState?.operation === "import" ? debugState.result : null;

  return (
    <div className="space-y-4">
      <Alert>
        <AlertTitle>Fallback CSV de Performance</AlertTitle>
        <AlertDescription>
          Fluxo auxiliar e controlado para importar ou exportar performance ja normalizada no nivel de anuncio. Ele e
          util para historico antigo, lacunas da API oficial, validacao operacional e testes de persistencia, sem
          substituir a trilha oficial via OAuth, jobs e dados raw.
        </AlertDescription>
      </Alert>

      <Alert>
        <AlertTitle>Semantica operacional do import</AlertTitle>
        <AlertDescription>
          Reimportar atualiza linhas existentes. O backend faz upsert por `provider`, `external_account_id`,
          `external_ad_id` e `report_date`, insere linhas novas e recalcula automaticamente o consolidado por campanha.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exportar CSV da base atual</CardTitle>
          <p className="text-sm text-muted-foreground">
            Baixe um snapshot operacional da tabela normalizada para auditoria, validacao ou preparo de reimport.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-5">
            <div className="space-y-1.5">
              <Label>Provider</Label>
              <Select value={providerFilter} onValueChange={setProviderFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {providers.map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Account ID</Label>
              <Input value={accountIdFilter} onChange={(event) => setAccountIdFilter(event.target.value)} placeholder="Opcional" />
            </div>

            <div className="space-y-1.5">
              <Label>Data inicial</Label>
              <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label>Data final</Label>
              <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label>Limite</Label>
              <Input type="number" min={1} value={limit} onChange={(event) => setLimit(event.target.value)} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="button" onClick={() => exportMutation.mutate()} disabled={exportMutation.isPending}>
              {exportMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Baixar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Importar CSV manual</CardTitle>
          <p className="text-sm text-muted-foreground">
            Envie um CSV no formato normalizado para popular ou corrigir a performance por anuncio sem depender da API do provider.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Arquivo CSV</Label>
              <Input
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Provider para sobrescrever o CSV</Label>
              <Select value={importProviderOverride} onValueChange={setImportProviderOverride}>
                <SelectTrigger>
                  <SelectValue placeholder="Manter provider do arquivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="keep">Manter provider do arquivo</SelectItem>
                  {providers.map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
            <p>Arquivo selecionado: {selectedFile?.name ?? "nenhum arquivo"}</p>
            <p>Se o mesmo CSV for reenviado, as linhas tendem a ser atualizadas, nao duplicadas.</p>
          </div>

          <div className="flex justify-end">
            <Button type="button" onClick={() => importMutation.mutate()} disabled={importMutation.isPending || !selectedFile}>
              {importMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Importar CSV
            </Button>
          </div>

          {importSummary && (
            <>
              <Separator />
              <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Linhas importadas</p>
                  <p className="text-2xl font-semibold">{importSummary.importedRows}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Inseridas</p>
                  <p className="text-2xl font-semibold">{importSummary.inserted}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Atualizadas</p>
                  <p className="text-2xl font-semibold">{importSummary.updated}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Grupos afetados</p>
                  <p className="text-2xl font-semibold">{importSummary.affectedGroups}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {debugState && (
        <Alert>
          <AlertTitle>Debug do ultimo request</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              Operacao: <span className="font-mono">{debugState.operation}</span>
            </p>
            <p>
              Endpoint: <span className="font-mono">{debugState.endpoint}</span>
            </p>
            <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">{JSON.stringify(debugState.payload, null, 2)}</pre>
            {debugState.operation === "import" && (
              <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">{JSON.stringify(debugState.result, null, 2)}</pre>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
