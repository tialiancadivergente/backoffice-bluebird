import { ConfigurationsSection } from "@/components/admin/marketing-sync/ConfigurationsSection";

export default function MarketingSyncConfigurationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Configuracoes de Syncs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie as configuracoes persistidas para os syncs de marketing. As alteracoes ficam salvas no banco e
          estarao prontas para uso operacional quando ativadas pelo backend.
        </p>
      </div>
      <ConfigurationsSection />
    </div>
  );
}
