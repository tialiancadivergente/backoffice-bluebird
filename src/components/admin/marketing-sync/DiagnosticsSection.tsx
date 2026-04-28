import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useMarketingSyncPerformance, useMarketingSyncRaw } from "@/hooks/use-marketing-sync";
import type { OAuthConnection } from "@/types/syncs/marketing-sync";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface DiagnosticsSectionProps {
  connections: OAuthConnection[];
}

export function DiagnosticsSection({ connections }: Readonly<DiagnosticsSectionProps>) {
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [connectionFilter, setConnectionFilter] = useState<string>("all");
  const [accountFilter, setAccountFilter] = useState<string>("");
  const [limit, setLimit] = useState<number>(20);

  const providers = useMemo(() => {
    return Array.from(new Set(connections.map((item) => item.provider))).sort((a, b) => a.localeCompare(b));
  }, [connections]);

  const queryFilters = {
    provider: providerFilter === "all" ? undefined : providerFilter,
    connectionId: connectionFilter === "all" ? undefined : connectionFilter,
    accountId: accountFilter || undefined,
    limit,
  };

  const rawQuery = useMarketingSyncRaw(queryFilters);
  const performanceQuery = useMarketingSyncPerformance(queryFilters);

  const rawContent = (() => {
    if (rawQuery.isLoading) {
      return <Skeleton className="h-56 w-full" />;
    }

    if ((rawQuery.data?.length ?? 0) === 0) {
      return <p className="py-10 text-center text-sm text-muted-foreground">Sem registros raw para os filtros.</p>;
    }

    return (
      <pre className="max-h-80 overflow-auto rounded bg-muted p-3 text-xs leading-relaxed">
        {JSON.stringify(rawQuery.data, null, 2)}
      </pre>
    );
  })();

  const performanceContent = (() => {
    if (performanceQuery.isLoading) {
      return <Skeleton className="h-56 w-full" />;
    }

    if ((performanceQuery.data?.length ?? 0) === 0) {
      return <p className="py-10 text-center text-sm text-muted-foreground">Sem registros de performance para os filtros.</p>;
    }

    return (
      <pre className="max-h-80 overflow-auto rounded bg-muted p-3 text-xs leading-relaxed">
        {JSON.stringify(performanceQuery.data, null, 2)}
      </pre>
    );
  })();

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div>
          <CardTitle className="text-base">Diagnostico</CardTitle>
          <p className="text-sm text-muted-foreground">Consulta operacional de dados raw e performance legada.</p>
        </div>

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

          <div className="space-y-1.5">
            <Label>Account ID</Label>
            <Input value={accountFilter} onChange={(event) => setAccountFilter(event.target.value)} placeholder="Opcional" />
          </div>

          <div className="space-y-1.5">
            <Label>Limite</Label>
            <Input
              type="number"
              min={1}
              max={200}
              value={limit}
              onChange={(event) => setLimit(Math.max(1, Math.min(200, Number(event.target.value) || 20)))}
            />
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                rawQuery.refetch();
                performanceQuery.refetch();
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border p-3">
          <h4 className="mb-2 text-sm font-semibold">Raw</h4>
          {rawContent}
        </div>

        <div className="rounded-lg border border-border p-3">
          <h4 className="mb-2 text-sm font-semibold">Performance legada</h4>
          {performanceContent}
        </div>
      </CardContent>
    </Card>
  );
}
