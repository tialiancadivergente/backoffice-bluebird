import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoteCampaigns } from "@/hooks/use-vote-campaigns";
import { VoteCampaignTable } from "@/components/vote-campaigns/VoteCampaignTable";
import { CreateCampaignDialog } from "@/components/vote-campaigns/CreateCampaignDialog";

export default function VoteCampaignsPage() {
  const { data, isLoading, isError } = useVoteCampaigns();
  const items = Array.isArray(data) ? data : (data as { items?: unknown[] } | undefined)?.items ?? [];
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Vote Campaigns</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie as campanhas de votação.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      <VoteCampaignTable items={items} isLoading={isLoading} isError={isError} />
      <CreateCampaignDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
