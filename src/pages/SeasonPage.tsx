import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSeasons } from "@/hooks/use-seasons";
import { useLaunches } from "@/hooks/use-launches";
import { SeasonTable } from "@/components/season/SeasonTable";
import { CreateSeasonDialog } from "@/components/season/CreateSeasonDialog";

export default function SeasonPage() {
  const { data: seasonsData, isLoading, isError } = useSeasons();
  const { data: launchesData } = useLaunches();
  const items = Array.isArray(seasonsData) ? seasonsData : [];
  const launches = Array.isArray(launchesData) ? launchesData : [];
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Seasons</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie as seasons dos launches.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Season
        </Button>
      </div>

      <SeasonTable items={items} launches={launches} isLoading={isLoading} isError={isError} />
      <CreateSeasonDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
