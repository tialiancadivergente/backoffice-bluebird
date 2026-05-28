import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HelpCircle, Loader2, RefreshCw } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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

function shortId(value: string | null | undefined) {
  if (!value) return "—";
  if (value.length <= 14) return value;
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function accountNameLabel(account: { accountName: string | null; accountId: string }) {
  return account.accountName || "Nome não sincronizado";
}

export function AccountsSection({ connections }: Readonly<AccountsSectionProps>) {
  const queryClient = useQueryClient();
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [connectionFilter, setConnectionFilter] = useState<string>("all");
  const [selectionFilter, setSelectionFilter] = useState<string>("all");

  const accountsQuery = useMarketingSyncAccounts({
    provider: providerFilter === "all" ? undefined : providerFilter,
    connectionId: connectionFilter === "all" ? undefined : connectionFilter,
  });

  const providers = useMemo(() => {
    return Array.from(new Set(connections.map((item) => item.provider))).sort((a, b) => a.localeCompare(b));
  }, [connections]);

  const accounts = accountsQuery.data ?? [];
  const visibleAccounts = useMemo(() => {
    if (selectionFilter === "selected") return accounts.filter((account) => account.selected);
    if (selectionFilter === "available") return accounts.filter((account) => !account.selected);
    return accounts;
  }, [accounts, selectionFilter]);
  const selectedCount = accounts.filter((account) => account.selected).length;
  const selectableVisibleAccounts = visibleAccounts.filter((account) => !isManagerAccount(account.raw));

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

  const bulkSelectionMutation = useMutation({
    mutationFn: async (selected: boolean) => {
      await Promise.all(
        selectableVisibleAccounts
          .filter((account) => account.selected !== selected)
          .map((account) => patchMarketingSyncAccountSelection(account.id, selected)),
      );
    },
    onSuccess: () => {
      toast.success("Selecao das contas atualizada.");
      queryClient.invalidateQueries({ queryKey: ["marketing-sync", "accounts"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao atualizar contas em lote.");
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

    if (accounts.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
            Nenhuma conta sincronizada encontrada para os filtros.
          </TableCell>
        </TableRow>
      );
    }

    if (visibleAccounts.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
            Nenhuma conta encontrada para este filtro.
          </TableCell>
        </TableRow>
      );
    }

    return visibleAccounts.map((account) => (
      <TableRow key={account.id} className={isManagerAccount(account.raw) ? "bg-yellow-50/40 dark:bg-yellow-900/10" : undefined}>
        <TableCell>{account.provider}</TableCell>
        <TableCell className="font-mono text-xs" title={account.connectionId || undefined}>{shortId(account.connectionId)}</TableCell>
        <TableCell className="font-mono text-xs">{account.accountId}</TableCell>
        <TableCell>
          <div className="flex flex-col">
            <span>{accountNameLabel(account)}</span>
            {!account.accountName && (
              <span className="text-xs text-muted-foreground">ID: {account.accountId}</span>
            )}
          </div>
        </TableCell>
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
            disabled={patchSelectionMutation.isPending || bulkSelectionMutation.isPending}
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
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">3. Contas que entram no sync</CardTitle>
            <InfoTip>
              Contas selecionadas aqui serão usadas nos próximos jobs de sincronização. Selecione todas as contas que você quer trazer para os dashboards.
            </InfoTip>
          </div>
          <p className="text-sm text-muted-foreground">
            {selectedCount} conta{selectedCount === 1 ? "" : "s"} selecionada{selectedCount === 1 ? "" : "s"} para sync.
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(180px,1fr)_minmax(220px,1fr)_minmax(180px,1fr)] xl:grid-cols-[minmax(220px,1fr)_minmax(260px,1fr)_minmax(220px,1fr)_auto]">
          <div className="space-y-1.5">
            <Label className="text-sm leading-none">Provider</Label>
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
            <div className="flex h-5 items-center gap-1.5">
              <Label className="text-sm leading-none">Conexão</Label>
              <InfoTip>Filtra as contas de uma autorização específica. Na maioria dos casos, use “Todas”.</InfoTip>
            </div>
            <Select value={connectionFilter} onValueChange={setConnectionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {connections.map((connection) => (
                  <SelectItem key={connection.id} value={connection.connectionId}>
                    {connection.selectedAccountName || connection.userName || shortId(connection.connectionId)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <div className="flex h-5 items-center gap-1.5">
              <Label className="text-sm leading-none">Visualização</Label>
              <InfoTip>Use para revisar só as contas selecionadas ou encontrar contas ainda fora do sync.</InfoTip>
            </div>
            <Select value={selectionFilter} onValueChange={setSelectionFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="selected">Selecionadas</SelectItem>
                <SelectItem value="available">Não selecionadas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2 pt-0 lg:col-span-3 lg:flex-row lg:items-end xl:col-span-1 xl:pt-5">
            <Button
              type="button"
              variant="outline"
              className="w-full whitespace-nowrap lg:w-auto"
              onClick={() => refreshAllMutation.mutate()}
              disabled={refreshAllMutation.isPending}
            >
              {refreshAllMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Sync global
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full whitespace-nowrap lg:w-auto"
              disabled={connectionFilter === "all" || refreshConnectionMutation.isPending}
              onClick={() => refreshConnectionMutation.mutate(connectionFilter)}
            >
              {refreshConnectionMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Sync conexao
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="whitespace-nowrap"
            disabled={accountsQuery.isLoading || bulkSelectionMutation.isPending || selectableVisibleAccounts.length === 0}
            onClick={() => bulkSelectionMutation.mutate(true)}
          >
            Selecionar contas visíveis
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="whitespace-nowrap"
            disabled={accountsQuery.isLoading || bulkSelectionMutation.isPending || selectableVisibleAccounts.length === 0}
            onClick={() => bulkSelectionMutation.mutate(false)}
          >
            Desselecionar contas visíveis
          </Button>
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
                <TableHead>Conexão</TableHead>
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
