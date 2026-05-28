import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, HelpCircle, Loader2, Link as LinkIcon, RefreshCw, Unlink } from "lucide-react";
import { toast } from "sonner";
import {
  disconnectOAuthConnection,
  getAuthorizeUrl,
  getConnectionAccounts,
  refreshConnectionMarketingSyncAccounts,
  selectConnectionAccount,
} from "@/api/syncs/marketing-sync";
import type { OAuthConnection, OAuthConnectionAccount } from "@/types/syncs/marketing-sync";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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

function accountLabel(account: OAuthConnectionAccount) {
  return account.accountName || `Conta ${account.accountId}`;
}

function connectionLabel(connection: OAuthConnection) {
  return connection.selectedAccountName || connection.userName || `${connection.provider} conectado`;
}

interface ConnectionsSectionProps {
  connections: OAuthConnection[];
  isLoading: boolean;
  isError: boolean;
  onRefetch: () => void;
  provider?: "google_ads" | "meta_ads";
}

export function ConnectionsSection({
  connections,
  isLoading,
  isError,
  onRefetch,
  provider,
}: Readonly<ConnectionsSectionProps>) {
  const queryClient = useQueryClient();
  const [activeConnection, setActiveConnection] = useState<OAuthConnection | null>(null);
  const [disconnectTarget, setDisconnectTarget] = useState<OAuthConnection | null>(null);

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
    mutationFn: ({
      provider,
      connectionId,
      accountId,
      accountName,
    }: {
      provider: string;
      connectionId: string;
      accountId: string;
      accountName?: string | null;
    }) =>
      selectConnectionAccount(provider, connectionId, accountId, accountName),
    onSuccess: () => {
      toast.success("Conta oficial da conexao atualizada.");
      queryClient.invalidateQueries({ queryKey: ["marketing-sync", "oauth-connections"] });
      queryClient.invalidateQueries({ queryKey: ["marketing-sync", "connection-accounts"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao selecionar conta oficial.");
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: (connection: OAuthConnection) =>
      disconnectOAuthConnection(connection.provider, connection.connectionId),
    onSuccess: async (_, connection) => {
      toast.success("Conexao desconectada.");
      setDisconnectTarget(null);
      if (activeConnection?.connectionId === connection.connectionId) {
        setActiveConnection(null);
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["marketing-sync", "oauth-connections"] }),
        queryClient.invalidateQueries({ queryKey: ["marketing-sync", "accounts"] }),
        queryClient.invalidateQueries({ queryKey: ["marketing-sync", "connection-accounts"] }),
      ]);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Falha ao desconectar a conexao.");
    },
  });

  const activeTitle = useMemo(() => {
    if (!activeConnection) return "2. Conta padrão da conexão";
    return `2. Conta padrão da conexão`;
  }, [activeConnection]);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-base">1. Conexão com a Meta</CardTitle>
            <p className="text-sm text-muted-foreground">Autorize o acesso OAuth e escolha uma conta padrão para identificar a conexão.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(!provider || provider === "google_ads") && (
              <Button
                type="button"
                variant="outline"
                onClick={() => connectMutation.mutate("google_ads")}
                disabled={connectMutation.isPending}
              >
                {connectMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LinkIcon className="mr-2 h-4 w-4" />}
                Conectar Google Ads
              </Button>
            )}
            {(!provider || provider === "meta_ads") && (
              <Button
                type="button"
                variant="outline"
                onClick={() => connectMutation.mutate("meta_ads")}
                disabled={connectMutation.isPending}
              >
                {connectMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LinkIcon className="mr-2 h-4 w-4" />}
                Conectar Meta Ads
              </Button>
            )}
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
                <TableHead>Conexão</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>ID técnico</TableHead>
                <TableHead>Conta padrão</TableHead>
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
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{connectionLabel(connection)}</span>
                        <span className="text-xs text-muted-foreground">{connection.provider}</span>
                      </div>
                    </TableCell>
                    <TableCell>{connection.userName || "—"}</TableCell>
                    <TableCell>
                      <StatusBadge status={connection.status} />
                    </TableCell>
                    <TableCell className="font-mono text-xs" title={connection.connectionId}>{shortId(connection.connectionId)}</TableCell>
                    <TableCell>
                      {connection.selectedAccountName || connection.selectedAccountId ? (
                        <div className="flex flex-col">
                          <span>{connection.selectedAccountName || "Nome não sincronizado"}</span>
                          {connection.selectedAccountId && (
                            <span className="text-xs text-muted-foreground">ID: {connection.selectedAccountId}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Nenhuma definida</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveConnection(connection)}
                          disabled={connection.status === "disconnected"}
                        >
                          Ver contas
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => refreshConnectionAccountsMutation.mutate(connection.connectionId)}
                          disabled={refreshConnectionAccountsMutation.isPending || connection.status === "disconnected"}
                        >
                          <RefreshCw className="mr-2 h-3.5 w-3.5" />
                          Sync
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDisconnectTarget(connection)}
                          disabled={connection.status === "disconnected"}
                        >
                          <Unlink className="mr-2 h-3.5 w-3.5" />
                          Desconectar
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
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold">{activeTitle}</h4>
                  <InfoTip>Escolha uma conta padrão para identificar esta conexão. Isso não limita o sync; as contas usadas nos jobs são selecionadas na seção “Contas que entram no sync”.</InfoTip>
                </div>
                <p className="text-xs text-muted-foreground">
                  Conexão {shortId(activeConnection.connectionId)}. A conta padrão é única.
                </p>
              </div>
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
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{accountLabel(account)}</span>
                            {!account.accountName && (
                              <span className="text-xs text-muted-foreground">Nome não veio da Meta; usando ID.</span>
                            )}
                          </div>
                        </TableCell>
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
                                accountName: account.accountName,
                              })
                            }
                            disabled={selectAccountMutation.isPending}
                            title={isManagerAccount(account.raw) ? "Contas MCC nao suportam extracao de metricas. Selecione uma conta cliente." : undefined}
                          >
                            {account.selected ? (
                              <span className="inline-flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Conta padrão
                              </span>
                            ) : isManagerAccount(account.raw) ? "⚠ Definir padrão (MCC)" : "Definir como padrão"}
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

      <AlertDialog open={!!disconnectTarget} onOpenChange={(open) => !open && setDisconnectTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desconectar conta?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso remove os tokens salvos e a conta selecionada desta conexao. Os dados historicos ja sincronizados
              permanecem salvos, mas novos syncs exigirao uma nova conexao OAuth.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={disconnectMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={disconnectMutation.isPending}
              onClick={() => disconnectTarget && disconnectMutation.mutate(disconnectTarget)}
            >
              {disconnectMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Desconectar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
