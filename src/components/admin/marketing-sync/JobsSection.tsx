import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Play, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  createManualJobs,
  createDailyJobs,
  enqueueMarketingSyncJob,
  getMarketingSyncAccounts,
  getMarketingSyncJobs,
  processMarketingSyncJob,
} from "@/api/syncs/marketing-sync";
import { useMarketingSyncJobs, useMarketingSyncAccounts } from "@/hooks/use-marketing-sync";
import type { CreateDailyJobsPayload, CreateManualJobsPayload, OAuthConnection } from "@/types/syncs/marketing-sync";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { StatusBadge } from "./StatusBadge";

interface JobsSectionProps {
  connections: OAuthConnection[];
}

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

type JobCreationDebugState = {
  endpoint: string;
  payload: CreateDailyJobsPayload | CreateManualJobsPayload;
};

export function JobsSection({ connections }: Readonly<JobsSectionProps>) {
  const queryClient = useQueryClient();
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [connectionFilter, setConnectionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [dailyProvider, setDailyProvider] = useState<string>("all");
  const [dailyConnectionId, setDailyConnectionId] = useState<string>("all");
  const [dailyDateFrom, setDailyDateFrom] = useState<string>("");
  const [dailyDateTo, setDailyDateTo] = useState<string>("");
  const [creationDebug, setCreationDebug] = useState<JobCreationDebugState | null>(null);
  const [jobCreationMode, setJobCreationMode] = useState<"daily" | "manual">("daily");

  const jobsQuery = useMarketingSyncJobs({
    provider: providerFilter === "all" ? undefined : providerFilter,
    connectionId: connectionFilter === "all" ? undefined : connectionFilter,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const providers = useMemo(() => {
    return Array.from(new Set(connections.map((item) => item.provider))).sort((a, b) => a.localeCompare(b));
  }, [connections]);

  const accountsQuery = useMarketingSyncAccounts({});
  const accountNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const acc of accountsQuery.data ?? []) {
      if (acc.accountName) map.set(acc.accountId, acc.accountName);
    }
    return map;
  }, [accountsQuery.data]);

  const createJobsMutation = useMutation({
    mutationFn: async () => {
      const provider = dailyProvider === "all" ? undefined : dailyProvider;
      const connectionId = dailyConnectionId === "all" ? undefined : dailyConnectionId;
      const isManual = jobCreationMode === "manual";

      if (isManual) {
        if (!provider) {
          throw new Error("Selecione um provider para criar jobs manuais.");
        }

        if (!dailyDateFrom || !dailyDateTo) {
          throw new Error("Informe data inicial e data final para a extracao manual.");
        }

        const payload: CreateManualJobsPayload = {
          provider,
          dateFrom: dailyDateFrom,
          dateTo: dailyDateTo,
          enqueue: true,
        };

        if (connectionId) {
          const accounts = await getMarketingSyncAccounts({ provider, connectionId });
          const selectedAccount = accounts.find((account) => account.selected);

          if (!selectedAccount) {
            throw new Error("Nao foi encontrada conta sincronizada selecionada para a conexao informada.");
          }

          payload.accountId = selectedAccount.id;
        }

        await createManualJobs(payload);

        return {
          endpoint: "/marketing-sync/jobs/manual",
          payload,
          provider,
          successMessage: "Criacao de job manual solicitada.",
        };
      }

      const payload: CreateDailyJobsPayload = {
        provider,
      };

      await createDailyJobs(payload);

      return {
        endpoint: "/marketing-sync/jobs/daily",
        payload,
        provider,
        successMessage: "Criacao de jobs diarios solicitada.",
      };
    },
    onSuccess: async (result) => {
      setCreationDebug({
        endpoint: result.endpoint,
        payload: result.payload,
      });
      toast.success(result.successMessage);

      if (result.endpoint === "/marketing-sync/jobs/manual" && result.provider) {
        await queryClient.fetchQuery({
          queryKey: ["marketing-sync", "jobs", { provider: result.provider }],
          queryFn: () => getMarketingSyncJobs({ provider: result.provider }),
        });
      }

      queryClient.invalidateQueries({ queryKey: ["marketing-sync", "jobs"] });
      if (result.provider && providerFilter === "all") {
        setProviderFilter(result.provider);
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao criar jobs.");
    },
  });

  const dailyDefaults = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return {
      dateFrom: toDateInput(yesterday),
      dateTo: toDateInput(today),
    };
  }, []);
  const isManualMode = jobCreationMode === "manual";

  const enqueueMutation = useMutation({
    mutationFn: (jobId: string) => enqueueMarketingSyncJob(jobId),
    onSuccess: () => {
      toast.success("Job reenfileirado com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["marketing-sync", "jobs"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao reenfileirar job.");
    },
  });

  const processMutation = useMutation({
    mutationFn: (jobId: string) => processMarketingSyncJob(jobId),
    onSuccess: () => {
      toast.success("Processamento manual iniciado.");
      queryClient.invalidateQueries({ queryKey: ["marketing-sync", "jobs"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao processar job manualmente.");
    },
  });

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div>
          <CardTitle className="text-base">Jobs de sincronizacao</CardTitle>
          <p className="text-sm text-muted-foreground">Criacao, reenfileiramento e processamento manual de jobs.</p>
        </div>

        <div className="grid gap-3 rounded-lg border border-border p-3 md:grid-cols-5">
          <div className="space-y-1.5 md:col-span-5">
            <Label>Tipo de execucao</Label>
            <div className="grid gap-2 md:grid-cols-2">
              <button
                type="button"
                className={`rounded-lg border p-3 text-left transition-colors ${
                  !isManualMode
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-foreground hover:border-primary/40"
                }`}
                onClick={() => {
                  setJobCreationMode("daily");
                  setDailyDateFrom("");
                  setDailyDateTo("");
                }}
              >
                <div className="text-sm font-medium">Fluxo diario</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Dispara a extracao padrao do backend. Nao e um agendamento da UI; e uma execucao sob demanda para o fluxo
                  automatico de `yesterday` e, quando aplicavel, `today`.
                </p>
              </button>

              <button
                type="button"
                className={`rounded-lg border p-3 text-left transition-colors ${
                  isManualMode
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-foreground hover:border-primary/40"
                }`}
                onClick={() => {
                  setJobCreationMode("manual");
                  setDailyDateFrom((current) => current || dailyDefaults.dateFrom);
                  setDailyDateTo((current) => current || dailyDefaults.dateTo);
                }}
              >
                <div className="text-sm font-medium">Fluxo manual</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Permite informar um intervalo customizado. Esse fluxo usa `POST /marketing-sync/jobs/manual`.
                </p>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Provider</Label>
            <Select value={dailyProvider} onValueChange={setDailyProvider}>
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
            <Label>Connection ID</Label>
            <Select value={dailyConnectionId} onValueChange={setDailyConnectionId}>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {connections.map((connection) => (
                  <SelectItem key={connection.id} value={connection.connectionId}>
                    {connection.connectionId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Data inicial</Label>
            <Input
              type="date"
              value={dailyDateFrom}
              disabled={!isManualMode}
              onChange={(event) => setDailyDateFrom(event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Data final</Label>
            <Input
              type="date"
              value={dailyDateTo}
              disabled={!isManualMode}
              onChange={(event) => setDailyDateTo(event.target.value)}
            />
          </div>

          <div className="flex items-end">
            <Button type="button" onClick={() => createJobsMutation.mutate()} disabled={createJobsMutation.isPending}>
              {createJobsMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
              {isManualMode ? "Criar job manual" : "Criar jobs diarios"}
            </Button>
          </div>
        </div>

        <Alert>
          <AlertTitle>{isManualMode ? "Fluxo manual ativo" : "Fluxo diario ativo"}</AlertTitle>
          <AlertDescription>
            {isManualMode
              ? "Com data inicial/final preenchidas, o backoffice chama POST /marketing-sync/jobs/manual. Se houver connectionId, ele e resolvido para a conta sincronizada selecionada antes do envio."
              : "Esse modo nao agenda nada na UI. Ele apenas dispara, sob demanda, o endpoint POST /marketing-sync/jobs/daily para o fluxo automatico padrao do backend."}
          </AlertDescription>
        </Alert>

        {creationDebug && (
          <Alert>
            <AlertTitle>Debug da ultima criacao</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                Endpoint chamado: <span className="font-mono">{creationDebug.endpoint}</span>
              </p>
              <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
                {JSON.stringify(creationDebug.payload, null, 2)}
              </pre>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Filtro provider</Label>
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
            <Label>Filtro connectionId</Label>
            <Select value={connectionFilter} onValueChange={setConnectionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {connections.map((connection) => (
                  <SelectItem key={connection.id} value={connection.connectionId}>
                    {connection.connectionId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Filtro status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="queued">queued</SelectItem>
                <SelectItem value="running">running</SelectItem>
                <SelectItem value="completed">completed</SelectItem>
                <SelectItem value="failed">failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button type="button" variant="outline" onClick={() => jobsQuery.refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar jobs
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {jobsQuery.isError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Falha ao carregar jobs</AlertTitle>
            <AlertDescription>Revise os filtros ou a disponibilidade da API de jobs.</AlertDescription>
          </Alert>
        )}

        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Conta</TableHead>
                <TableHead>Periodo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Erro</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                if (jobsQuery.isLoading) {
                  return (["jl-a", "jl-b", "jl-c", "jl-d", "jl-e"] as const).map((key) => (
                    <TableRow key={key}>
                      <TableCell colSpan={6}><Skeleton className="h-6 w-full" /></TableCell>
                    </TableRow>
                  ));
                }
                if ((jobsQuery.data?.length ?? 0) === 0) {
                  return (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        Nenhum job encontrado para os filtros selecionados.
                      </TableCell>
                    </TableRow>
                  );
                }
                return jobsQuery.data!.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>{job.provider || "—"}</TableCell>
                    <TableCell className="text-xs">
                      {(() => {
                        const displayName = job.accountName || (job.accountId ? accountNameMap.get(job.accountId) : null);
                        if (displayName) {
                          return <span title={job.accountId ?? undefined}>{displayName}</span>;
                        }
                        return job.accountId ?? "—";
                      })()}
                    </TableCell>
                    <TableCell>
                      {job.dateFrom || "—"} a {job.dateTo || "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={job.status} />
                    </TableCell>
                    <TableCell className="max-w-[240px] text-xs text-muted-foreground">
                      {job.error ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block cursor-help truncate">{job.error}</span>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-[480px] whitespace-pre-wrap break-words font-mono text-xs">
                            {job.error}
                          </TooltipContent>
                        </Tooltip>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={enqueueMutation.isPending}
                          onClick={() => enqueueMutation.mutate(job.id)}
                        >
                          Reenfileirar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={processMutation.isPending}
                          onClick={() => processMutation.mutate(job.id)}
                        >
                          Processar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ));
              })()}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
