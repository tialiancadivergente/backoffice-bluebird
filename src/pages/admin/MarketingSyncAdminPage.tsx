import { AlertCircle } from "lucide-react";
import { ConnectionsSection } from "@/components/admin/marketing-sync/ConnectionsSection";
import { AccountsSection } from "@/components/admin/marketing-sync/AccountsSection";
import { CsvFallbackSection } from "@/components/admin/marketing-sync/CsvFallbackSection";
import { JobsSection } from "@/components/admin/marketing-sync/JobsSection";
import { DiagnosticsSection } from "@/components/admin/marketing-sync/DiagnosticsSection";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOAuthConnections } from "@/hooks/use-marketing-sync";

export default function MarketingSyncAdminPage() {
  const connectionsQuery = useOAuthConnections();
  const connections = connectionsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Integracoes e Syncs de Marketing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Area operacional para OAuth, contas conectadas, jobs diarios e diagnostico de marketing.
        </p>
      </div>

      {connectionsQuery.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Falha ao carregar conexoes</AlertTitle>
          <AlertDescription>
            A area segue funcional para operacoes pontuais, mas confirme se a API OAuth esta disponivel.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="connections" className="space-y-3">
        <TabsList>
          <TabsTrigger value="connections">Conexoes</TabsTrigger>
          <TabsTrigger value="accounts">Contas</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="csv-fallback">Fallback CSV</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostico</TabsTrigger>
        </TabsList>

        <TabsContent value="connections">
          <ConnectionsSection
            connections={connections}
            isLoading={connectionsQuery.isLoading}
            isError={connectionsQuery.isError}
            onRefetch={() => connectionsQuery.refetch()}
          />
        </TabsContent>

        <TabsContent value="accounts">
          <AccountsSection connections={connections} />
        </TabsContent>

        <TabsContent value="jobs">
          <JobsSection connections={connections} />
        </TabsContent>

        <TabsContent value="csv-fallback">
          <CsvFallbackSection connections={connections} />
        </TabsContent>

        <TabsContent value="diagnostics">
          <DiagnosticsSection connections={connections} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
