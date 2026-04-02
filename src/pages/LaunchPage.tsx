import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLaunches } from "@/hooks/use-launches";
import { LaunchTable } from "@/components/launch/LaunchTable";
import { CreateLaunchDialog } from "@/components/launch/CreateLaunchDialog";

export default function LaunchPage() {
  const { data, isLoading, isError } = useLaunches();
  const items = Array.isArray(data) ? data : [];
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Launches</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie os launches.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Launch
        </Button>
      </div>

      <LaunchTable items={items} isLoading={isLoading} isError={isError} />
      <CreateLaunchDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
