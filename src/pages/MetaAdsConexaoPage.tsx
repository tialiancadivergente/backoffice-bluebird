import { ArrowLeft } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ConnectionsSection } from "@/components/admin/marketing-sync/ConnectionsSection";
import { AccountsSection } from "@/components/admin/marketing-sync/AccountsSection";
import { useOAuthConnections } from "@/hooks/use-marketing-sync";

export default function MetaAdsConexaoPage() {
  const connectionsQuery = useOAuthConnections();
  // Filter to only show Meta connections
  const metaConnections = (connectionsQuery.data ?? []).filter(
    (c) => c.provider === "meta_ads",
  );

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
          <h1 className="text-2xl font-bold tracking-tight">Conexão — Meta Ads</h1>
          <p className="text-muted-foreground text-sm">
            Autenticação OAuth e contas de anúncios do Facebook & Instagram
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-base font-semibold mb-3">Autenticação</h2>
          <ConnectionsSection
            connections={metaConnections}
            isLoading={connectionsQuery.isLoading}
            isError={connectionsQuery.isError}
            onRefetch={() => connectionsQuery.refetch()}
          />
        </div>
        <div>
          <h2 className="text-base font-semibold mb-3">Contas de Anúncios</h2>
          <AccountsSection connections={metaConnections} />
        </div>
      </div>
    </div>
  );
}
