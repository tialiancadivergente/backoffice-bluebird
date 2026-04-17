import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  patchMarketingSyncAccountSelection,
  refreshAllMarketingSyncAccounts,
  refreshConnectionMarketingSyncAccounts,
} from "@/api/syncs/marketing-sync";
import { useMarketingSyncAccounts } from "@/hooks/use-marketing-sync";
import type { OAuthConnection } from "@/types/syncs/marketing-sync";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "./StatusBadge";

interface AccountsSectionProps {
  connections: OAuthConnection[];
}

function isManagerAccount(raw: Record<string, unknown> | undefined): boolean {
  if (!raw) return false;
  if (raw.canManageClients === true || raw.manager === true) return true;
  const typeField = raw.accountType ?? raw.type;
  if (typeof typeField !== "string") return false;
  return typeField.toUpperCase().includes("MANAGER");
}

export function AccountsSection({ connections }: Readonly<AccountsSectionProps>) {
  const queryClient = useQueryClient();
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [connectionFilter, setConnectionFilter] = useState<string>("all");

  const accountsQuery = useMarketingSyncAccounts({
    provider: providerFilter === "all" ? undefined : providerFilter,
    connectionId: connectionFilter === "all" ? undefined : connectionFilter,
  });

  const providers = useMemo(() => {
    return Array.from(new Set(connections.map((item) => item.provider))).sort((a, b) => a.localeCompare(b));
  }, [connections]);

  const loadingRowKeys = ["loading-a", "loading-b", "loading-c", "loading-d"];

  const refreshAllMutation = useMutation({
    mutationFn: refreshAllMarketingSyncAccounts,
    onSuccess: () => {
      toast.success("Sincronizacao global iniciada.");
      queryClient.invalidateQueries({ queryKey: ["marketing-sync", "accounts"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao iniciar sincronizacao global.");
    },
  });

  const refreshConnectionMutation = useMutation({
    mutationFn: (connectionId: string) => refreshConnectionMarketingSyncAccounts(connectionId),
    onSuccess: () => {
      toast.success("Sincronizacao da conexao iniciada.");
      queryClient.invalidateQueries({ queryKey: ["marketing-sync", "accounts"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao sincronizar conexao.");
    },
  });

  const patchSelectionMutation = useMutation({
    mutationFn: ({ accountId, selected }: { accountId: string; selected: boolean }) =>
      patchMarketingSyncAccountSelection(accountId, selected),
    onSuccess: () => {
      toast.success("Selecao da conta atualizada.");
      queryClient.invalidateQueries({ queryKey: ["marketing-sync", "accounts"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao atualizar selecao da conta.");
    },
  });

  const tableBodyContent = (() => {
    if (accountsQuery.isLoading) {
      return loadingRowKeys.map((key) => (
        <TableRow key={key}>
          <TableCell colSpan={8}>
            <Skeleton className="h-6 w-full" />
          </TableCell>
        </TableRow>
      ));
    }

    if ((accountsQuery.data?.length ?? 0) === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
            Nenhuma conta sincronizada encontrada para os filtros.
          </TableCell>
        </TableRow>
      );
    }

    return accountsQuery.data!.map((account) => (
      <TableRow key={account.id} className={isManagerAccount(account.raw) ? "bg-yellow-50/40 dark:bg-yellow-900/10" : undefined}>
        <TableCell>{account.provider}</TableCell>
        <TableCell className="font-mono text-xs">{account.connectionId || "—"}</TableCell>
        <TableCell className="font-mono text-xs">{account.accountId}</TableCell>
        <TableCell>{account.accountName || "—"}</TableCell>
        <TableCell>
          {isManagerAccount(account.raw) ? (
            <Badge variant="secondary" title="Conta gerenciadora (MCC). Nao suporta extracao direta de metricas.">MCC</Badge>
          ) : (
            <Badge variant="outline">Cliente</Badge>
          )}
        </TableCell>
        <TableCell>
          <StatusBadge status={account.status} />
        </TableCell>
        <TableCell>
          <StatusBadge status={account.selected ? "selected" : "not_selected"} />
        </TableCell>
        <TableCell className="text-right">
          <Button
            type="button"
            variant={isManagerAccount(account.raw) ? "destructive" : "outline"}
            size="sm"
            disabled={patchSelectionMutation.isPending}
            title={isManagerAccount(account.raw) ? "Contas MCC nao suportam extracao de metricas. Selecione uma conta cliente." : undefined}
            onClick={() => patchSelectionMutation.mutate({ accountId: account.id, selected: !account.selected })}
          >
            {(() => {
              if (isManagerAccount(account.raw)) {
                return account.selected ? "⚠ Desselecionar (MCC)" : "⚠ Selecionar (MCC)";
              }
              return account.selected ? "Desselecionar" : "Selecionar";
            })()}
          </Button>
        </TableCell>
      </TableRow>
    ));
  })();

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3">
        <div>
          <CardTitle className="text-base">Contas sincronizadas</CardTitle>
          <p className="text-sm text-muted-foreground">Operacao de selecao e refresh das contas de marketing.</p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
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
            <Label>Connection ID</Label>
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

          <div className="flex items-end gap-2">
            <Button type="button" variant="outline" onClick={() => refreshAllMutation.mutate()} disabled={refreshAllMutation.isPending}>
              {refreshAllMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Sync global
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={connectionFilter === "all" || refreshConnectionMutation.isPending}
              onClick={() => refreshConnectionMutation.mutate(connectionFilter)}
            >
              {refreshConnectionMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Sync conexao
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {accountsQuery.isError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Falha ao carregar contas sincronizadas</AlertTitle>
            <AlertDescription>Tente atualizar novamente ou revise a API de marketing sync.</AlertDescription>
          </Alert>
        )}

        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Connection ID</TableHead>
                <TableHead>ID Conta</TableHead>
                <TableHead>Nome da conta</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Selecionada</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableBodyContent}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
