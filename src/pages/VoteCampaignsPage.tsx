import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoteCampaigns } from "@/hooks/use-vote-campaigns";
import { VoteCampaignTable } from "@/components/vote-campaigns/VoteCampaignTable";

export default function VoteCampaignsPage() {
  const { data, isLoading, isError } = useVoteCampaigns();
  const items = Array.isArray(data) ? data : (data as any)?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Vote Campaigns</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie as campanhas de votação.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      <VoteCampaignTable items={items} isLoading={isLoading} isError={isError} />
    </div>
  );
}
