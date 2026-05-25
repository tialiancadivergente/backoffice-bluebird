import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConnectionsSection } from "@/components/admin/marketing-sync/ConnectionsSection";
import { AccountsSection } from "@/components/admin/marketing-sync/AccountsSection";
import { JobsSection } from "@/components/admin/marketing-sync/JobsSection";
import { DiagnosticsSection } from "@/components/admin/marketing-sync/DiagnosticsSection";
import { ConfigurationsSection } from "@/components/admin/marketing-sync/ConfigurationsSection";
import { CsvFallbackSection } from "@/components/admin/marketing-sync/CsvFallbackSection";
import { useOAuthConnections } from "@/hooks/use-marketing-sync";

export default function GoogleAdsDashboardPage() {
  const connectionsQuery = useOAuthConnections();
  const googleConnections = (connectionsQuery.data ?? []).filter(
    (c) => c.provider === "google_ads",
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Google Ads</h1>
        <p className="text-muted-foreground text-sm">
          Conexão, sincronização e diagnóstico — Google Ads
        </p>
      </div>

      <Tabs defaultValue="conexao">
        <TabsList>
          <TabsTrigger value="conexao">Conexão</TabsTrigger>
          <TabsTrigger value="sincronizacao">Sincronização</TabsTrigger>
          <TabsTrigger value="csv">CSV Fallback</TabsTrigger>
          <TabsTrigger value="diagnostico">Diagnóstico</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        {/* ── Conexão ─────────────────────────────────────────────── */}
        <TabsContent value="conexao" className="space-y-6 mt-4">
          <div>
            <h2 className="text-base font-semibold mb-3">Autenticação</h2>
            <ConnectionsSection
              connections={googleConnections}
              isLoading={connectionsQuery.isLoading}
              isError={connectionsQuery.isError}
              onRefetch={() => connectionsQuery.refetch()}
              provider="google_ads"
            />
          </div>
          <div>
            <h2 className="text-base font-semibold mb-3">Contas de Anúncios</h2>
            <AccountsSection connections={googleConnections} />
          </div>
        </TabsContent>

        {/* ── Sincronização ───────────────────────────────────────── */}
        <TabsContent value="sincronizacao" className="mt-4">
          <JobsSection connections={googleConnections} />
        </TabsContent>

        {/* ── CSV Fallback ────────────────────────────────────────── */}
        <TabsContent value="csv" className="mt-4">
          <CsvFallbackSection connections={googleConnections} />
        </TabsContent>

        {/* ── Diagnóstico ─────────────────────────────────────────── */}
        <TabsContent value="diagnostico" className="mt-4">
          <DiagnosticsSection connections={googleConnections} />
        </TabsContent>

        {/* ── Configurações ───────────────────────────────────────── */}
        <TabsContent value="configuracoes" className="mt-4">
          <ConfigurationsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
