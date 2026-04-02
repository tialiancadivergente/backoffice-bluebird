import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteSeason } from "@/api/season";
import { EditSeasonDialog } from "./EditSeasonDialog";
import type { Season } from "@/types/season";
import type { Launch } from "@/types/launch";

interface Props {
  items: Season[];
  launches: Launch[];
  isLoading: boolean;
  isError: boolean;
}

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <Badge variant={active ? "default" : "outline"} className={active ? "bg-emerald-600 hover:bg-emerald-700" : ""}>
      {active ? "Ativo" : "Inativo"}
    </Badge>
  );
}

const columns = [
  { key: "name", label: "Nome" },
  { key: "launch", label: "Launch" },
  { key: "active", label: "Status" },
  { key: "actions", label: "Ações" },
] as const;

export function SeasonTable({ items, launches, isLoading, isError }: Props) {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<Season | null>(null);
  const [editTarget, setEditTarget] = useState<Season | null>(null);

  const launchMap = new Map(launches.map((l) => [l.id, l.name]));

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSeason(id),
    onSuccess: () => {
      toast.success("Season excluída com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["seasons"] });
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error("Erro ao excluir a season.");
    },
  });

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-destructive text-sm">
        Erro ao carregar as seasons. Tente novamente.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key}>{col.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
                  Nenhuma season encontrada.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{launchMap.get(item.launch_id) ?? item.launch_id}</TableCell>
                  <TableCell><ActiveBadge active={item.active} /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditTarget(item)} title="Editar">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => setDeleteTarget(item)} title="Excluir"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir season</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a season <strong>{deleteTarget?.name}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditSeasonDialog
        season={editTarget}
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
      />
    </>
  );
}
