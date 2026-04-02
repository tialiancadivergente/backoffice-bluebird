import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForms } from "@/hooks/use-forms";
import { FormTable } from "@/components/form/FormTable";
import { CreateFormDialog } from "@/components/form/CreateFormDialog";

export default function FormPage() {
  const { data, isLoading, isError } = useForms();
  const items = Array.isArray(data) ? data : [];
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Formulários</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie os formulários.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Formulário
        </Button>
      </div>

      <FormTable items={items} isLoading={isLoading} isError={isError} />
      <CreateFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
