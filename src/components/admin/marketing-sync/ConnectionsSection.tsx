import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Link as LinkIcon, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  getAuthorizeUrl,
  getConnectionAccounts,
  refreshConnectionMarketingSyncAccounts,
  selectConnectionAccount,
} from "@/api/syncs/marketing-sync";
import type { OAuthConnection, OAuthConnectionAccount } from "@/types/syncs/marketing-sync";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "./StatusBadge";

function isManagerAccount(raw: Record<string, unknown> | undefined): boolean {
  if (!raw) return false;
  if (raw.canManageClients === true || raw.manager === true) return true;
  const typeField = raw.accountType ?? raw.type;
  if (typeof typeField !== "string") return false;
  return typeField.toUpperCase().includes("MANAGER");
}

function AccountTypeBadge({ account }: { account: OAuthConnectionAccount }) {
  return isManagerAccount(account.raw) ? (
    <Badge variant="secondary" title="Conta gerenciadora (MCC). Nao suporta extracao direta de metricas.">
      MCC
    </Badge>
  ) : (
    <Badge variant="outline">Cliente</Badge>
  );
}

interface ConnectionsSectionProps {
  connections: OAuthConnection[];
  isLoading: boolean;
  isError: boolean;
  onRefetch: () => void;
}

export function ConnectionsSection({
  connections,
  isLoading,
  isError,
  onRefetch,
}: Readonly<ConnectionsSectionProps>) {
  const queryClient = useQueryClient();
  const [activeConnection, setActiveConnection] = useState<OAuthConnection | null>(null);

  const connectMutation = useMutation({
    mutationFn: (provider: "google_ads" | "meta_ads") => getAuthorizeUrl(provider),
    onSuccess: (url) => {
      globalThis.open(url, "_blank", "noopener,noreferrer");
      toast.success("Fluxo OAuth aberto em nova aba.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel iniciar OAuth.");
    },
  });

  const refreshConnectionAccountsMutation = useMutation({
    mutationFn: (connectionId: string) => refreshConnectionMarketingSyncAccounts(connectionId),
    onSuccess: () => {
      toast.success("Sincronizacao da conexao iniciada.");
      queryClient.invalidateQueries({ queryKey: ["marketing-sync", "accounts"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao sincronizar contas da conexao.");
    },
  });

  const connectionAccountsQuery = useQuery({
    queryKey: ["marketing-sync", "connection-accounts", activeConnection?.provider, activeConnection?.connectionId],
    queryFn: () => getConnectionAccounts(activeConnection!.provider, activeConnection!.connectionId),
    enabled: !!activeConnection,
  });

  const selectAccountMutation = useMutation({
    mutationFn: ({ provider, connectionId, accountId }: { provider: string; connectionId: string; accountId: string }) =>
      selectConnectionAccount(provider, connectionId, accountId),
    onSuccess: () => {
      toast.success("Conta oficial da conexao atualizada.");
      queryClient.invalidateQueries({ queryKey: ["marketing-sync", "oauth-connections"] });
      queryClient.invalidateQueries({ queryKey: ["marketing-sync", "connection-accounts"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao selecionar conta oficial.");
    },
  });

  const activeTitle = useMemo(() => {
    if (!activeConnection) return "Contas da conexao";
    return `Contas da conexao ${activeConnection.connectionId}`;
  }, [activeConnection]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="text-base">Conexoes OAuth</CardTitle>
          <p className="text-sm text-muted-foreground">Gerencie conexoes Google Ads e Meta Ads.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => connectMutation.mutate("google_ads")}
            disabled={connectMutation.isPending}
          >
            {connectMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LinkIcon className="mr-2 h-4 w-4" />}
            Conectar Google Ads
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => connectMutation.mutate("meta_ads")}
            disabled={connectMutation.isPending}
          >
            {connectMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LinkIcon className="mr-2 h-4 w-4" />}
            Conectar Meta Ads
          </Button>
          <Button type="button" variant="outline" onClick={onRefetch}>
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isError && (
          <Alert variant="destructive">
            <AlertTitle>Falha ao carregar conexoes</AlertTitle>
            <AlertDescription>Verifique a API de OAuth e tente novamente.</AlertDescription>
          </Alert>
        )}

        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Connection ID</TableHead>
                <TableHead>Conta selecionada</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                if (isLoading) {
                  return (["cl-a", "cl-b", "cl-c", "cl-d"] as const).map((key) => (
                    <TableRow key={key}>
                      <TableCell colSpan={6}><Skeleton className="h-6 w-full" /></TableCell>
                    </TableRow>
                  ));
                }
                if (connections.length === 0) {
                  return (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        Nenhuma conexao OAuth encontrada.
                      </TableCell>
                    </TableRow>
                  );
                }
                return connections.map((connection) => (
                  <TableRow key={connection.id}>
                    <TableCell>{connection.provider}</TableCell>
                    <TableCell>{connection.userName || "—"}</TableCell>
                    <TableCell>
                      <StatusBadge status={connection.status} />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{connection.connectionId}</TableCell>
                    <TableCell>{connection.selectedAccountName || connection.selectedAccountId || "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={() => setActiveConnection(connection)}>
                          Ver contas
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => refreshConnectionAccountsMutation.mutate(connection.connectionId)}
                          disabled={refreshConnectionAccountsMutation.isPending}
                        >
                          <RefreshCw className="mr-2 h-3.5 w-3.5" />
                          Sync
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ));
              })()}
            </TableBody>
          </Table>
        </div>

        {activeConnection && (
          <div className="rounded-lg border border-border p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold">{activeTitle}</h4>
              <Button type="button" variant="ghost" size="sm" onClick={() => connectionAccountsQuery.refetch()}>
                Atualizar contas
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Conta</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Moeda</TableHead>
                    <TableHead>Timezone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    if (connectionAccountsQuery.isLoading) {
                      return (["ca-a", "ca-b", "ca-c"] as const).map((key) => (
                        <TableRow key={key}>
                          <TableCell colSpan={7}><Skeleton className="h-6 w-full" /></TableCell>
                        </TableRow>
                      ));
                    }
                    if ((connectionAccountsQuery.data?.length ?? 0) === 0) {
                      return (
                        <TableRow>
                          <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                            Nenhuma conta acessivel para esta conexao.
                          </TableCell>
                        </TableRow>
                      );
                    }
                    return connectionAccountsQuery.data!.map((account) => (
                      <TableRow key={account.id} className={isManagerAccount(account.raw) ? "bg-yellow-50/40 dark:bg-yellow-900/10" : undefined}>
                        <TableCell className="font-mono text-xs">{account.accountId}</TableCell>
                        <TableCell>{account.accountName || "—"}</TableCell>
                        <TableCell><AccountTypeBadge account={account} /></TableCell>
                        <TableCell>{account.currency || "—"}</TableCell>
                        <TableCell>{account.timezone || "—"}</TableCell>
                        <TableCell>
                          <StatusBadge status={account.selected ? "selected" : "not_selected"} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant={isManagerAccount(account.raw) ? "destructive" : "outline"}
                            onClick={() =>
                              selectAccountMutation.mutate({
                                provider: activeConnection.provider,
                                connectionId: activeConnection.connectionId,
                                accountId: account.accountId,
                              })
                            }
                            disabled={selectAccountMutation.isPending}
                            title={isManagerAccount(account.raw) ? "Contas MCC nao suportam extracao de metricas. Selecione uma conta cliente." : undefined}
                          >
                            {isManagerAccount(account.raw) ? "⚠ Selecionar (MCC)" : "Selecionar conta oficial"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ));
                  })()}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
