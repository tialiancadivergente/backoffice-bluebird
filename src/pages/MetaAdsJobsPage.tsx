import { useState } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetaJobForm } from "@/components/meta-ads/MetaJobForm";
import { MetaExecutionsList } from "@/components/meta-ads/MetaExecutionsList";
import { useMetaExecutions } from "@/hooks/use-meta-ads";
import { useQueryClient } from "@tanstack/react-query";
import { metaKeys } from "@/hooks/use-meta-ads";

export default function MetaAdsJobsPage() {
  const [execTab, setExecTab] = useState("all");
  const qc = useQueryClient();

  const executions = useMetaExecutions({
    step: execTab === "all" ? undefined : execTab,
    limit: 50,
  });

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
          <h1 className="text-2xl font-bold tracking-tight">Jobs de Sync — Meta Ads</h1>
          <p className="text-muted-foreground text-sm">
            Execute sincronizações manuais ou acompanhe o histórico automático
          </p>
        </div>
      </div>

      {/* Job creation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Criar Job de Sincronização</CardTitle>
        </CardHeader>
        <CardContent>
          <MetaJobForm />
        </CardContent>
      </Card>

      {/* Info box */}
      <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">Como funciona cada tipo:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li><strong>Insights (Batch)</strong> — Busca métricas de performance diária (CPC, CTR, CPM, vídeo). Recomendado para até 30 dias.</li>
          <li><strong>Campanhas / Conjuntos / Anúncios</strong> — Sincroniza estrutura (status, orçamento, criativos). Não tem filtro de data obrigatório.</li>
          <li><strong>Job Assíncrono</strong> — Inicia um job na Meta para períodos longos (&gt;30 dias). Retorna um report_run_id para polling.</li>
          <li><strong>Sync Completo</strong> — Executa os 4 tipos em paralelo.</li>
        </ul>
      </div>

      {/* Execution history */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Histórico de Execuções</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              qc.invalidateQueries({ queryKey: metaKeys.executions() })
            }
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <Tabs value={execTab} onValueChange={setExecTab}>
          <TabsList className="h-8 text-xs">
            <TabsTrigger value="all" className="text-xs">Todos</TabsTrigger>
            <TabsTrigger value="insights" className="text-xs">Insights</TabsTrigger>
            <TabsTrigger value="campaigns" className="text-xs">Campanhas</TabsTrigger>
            <TabsTrigger value="adsets" className="text-xs">Conjuntos</TabsTrigger>
            <TabsTrigger value="ads" className="text-xs">Anúncios</TabsTrigger>
          </TabsList>
          <TabsContent value={execTab} className="mt-3">
            <MetaExecutionsList
              data={executions.data}
              isLoading={executions.isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
