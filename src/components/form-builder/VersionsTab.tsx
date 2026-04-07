import { useState } from "react";
import { Plus, Loader2, CheckCircle, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useFormVersions, useCreateVersion, useUpdateVersion, useActivateVersion, useDeleteVersion,
} from "@/hooks/use-form-builder";
import type { FormVersionResponse, UUID } from "@/types/form-builder";

interface Props {
  formId: UUID;
  onSelectVersion: (v: FormVersionResponse) => void;
  selectedVersionId?: UUID;
}

export function VersionsTab({ formId, onSelectVersion, selectedVersionId }: Props) {
  const { data: versions, isLoading } = useFormVersions(formId);
  const createMut = useCreateVersion(formId);
  const updateMut = useUpdateVersion(formId);
  const activateMut = useActivateVersion(formId);
  const deleteMut = useDeleteVersion(formId);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FormVersionResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FormVersionResponse | null>(null);
  const [versionNumber, setVersionNumber] = useState<number>(1);

  const items = Array.isArray(versions) ? versions : [];

  const handleCreate = () => {
    createMut.mutate({ version_number: versionNumber }, {
      onSuccess: () => { setCreateOpen(false); setVersionNumber(1); },
    });
  };

  const handleUpdate = () => {
    if (!editTarget) return;
    updateMut.mutate({ versionId: editTarget.id, body: { version_number: versionNumber } }, {
      onSuccess: () => { setEditTarget(null); },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Versões</h3>
        <Button size="sm" onClick={() => { setVersionNumber((items.length || 0) + 1); setCreateOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Nova Versão
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nº</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criada em</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {[1,2,3,4].map(c => <TableCell key={c}><Skeleton className="h-4 w-full" /></TableCell>)}
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Nenhuma versão encontrada.
                </TableCell>
              </TableRow>
            ) : (
              items.map((v) => (
                <TableRow
                  key={v.id}
                  className={`cursor-pointer ${selectedVersionId === v.id ? "bg-accent" : ""}`}
                  onClick={() => onSelectVersion(v)}
                >
                  <TableCell className="font-medium">v{v.version_number}</TableCell>
                  <TableCell>
                    <Badge variant={v.active ? "default" : "secondary"}>
                      {v.active ? "Ativa" : "Inativa"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(v.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {!v.active && (
                        <Button variant="ghost" size="icon" title="Ativar" onClick={() => activateMut.mutate(v.id)} disabled={activateMut.isPending}>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" title="Editar" onClick={() => { setVersionNumber(v.version_number); setEditTarget(v); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Excluir" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(v)}>
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

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[340px]">
          <DialogHeader><DialogTitle>Nova Versão</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Número da Versão</label>
              <Input type="number" min={1} value={versionNumber} onChange={(e) => setVersionNumber(Number(e.target.value))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={createMut.isPending}>
              {createMut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="sm:max-w-[340px]">
          <DialogHeader><DialogTitle>Editar Versão</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Número da Versão</label>
              <Input type="number" min={1} value={versionNumber} onChange={(e) => setVersionNumber(Number(e.target.value))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancelar</Button>
            <Button onClick={handleUpdate} disabled={updateMut.isPending}>
              {updateMut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir versão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a versão <strong>v{deleteTarget?.version_number}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMut.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
