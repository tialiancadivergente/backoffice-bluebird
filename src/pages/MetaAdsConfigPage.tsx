import { ArrowLeft } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetaExecutionsList } from "@/components/meta-ads/MetaExecutionsList";
import { useMetaExecutions } from "@/hooks/use-meta-ads";

export default function MetaAdsConfigPage() {
  const executions = useMetaExecutions({ limit: 30 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <NavLink to="/meta-ads">
            <ArrowLeft className="h-4 w-4" />
          </NavLink>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Configurações — Meta Ads
          </h1>
          <p className="text-muted-foreground text-sm">
            Sync automático e histórico de execuções
          </p>
        </div>
      </div>

      {/* Scheduler info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sync Automático</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-2">
            <p>
              O scheduler dedicado da Meta é configurado via variáveis de ambiente no
              servidor:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>
                <code className="text-xs bg-muted px-1 rounded">
                  META_SCHEDULER_ENABLED=true
                </code>{" "}
                — ativa o sync automático
              </li>
              <li>
                <code className="text-xs bg-muted px-1 rounded">
                  META_SCHEDULER_INTERVAL_MINUTES=60
                </code>{" "}
                — intervalo entre syncs (padrão: 60min)
              </li>
              <li>
                <code className="text-xs bg-muted px-1 rounded">
                  META_SCHEDULER_LOOKBACK_DAYS=7
                </code>{" "}
                — quantos dias retroativos buscar a cada sync (padrão: 7 dias)
              </li>
            </ul>
            <p className="text-muted-foreground">
              O scheduler executa campanhas, conjuntos, anúncios e insights em
              paralelo para todas as contas selecionadas.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Execution history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico de Execuções</CardTitle>
        </CardHeader>
        <CardContent>
          <MetaExecutionsList
            data={executions.data}
            isLoading={executions.isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
