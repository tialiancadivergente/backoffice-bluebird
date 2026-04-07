import { useState } from "react";
import { Plus, Loader2, Trash2, Pencil, CheckCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  useScores, useCreateScore, useUpdateScore, useActivateScore, useDeleteScore,
  useOptionPoints, useReplaceOptionPoints,
  useRangePoints, useReplaceRangePoints,
  useVersionQuestions,
} from "@/hooks/use-form-builder";
import type { LeadscoreResponse, UUID } from "@/types/form-builder";

interface Props { versionId: UUID; }

export function ScoresTab({ versionId }: Props) {
  const { data: scores, isLoading } = useScores(versionId);
  const createMut = useCreateScore(versionId);
  const updateMut = useUpdateScore(versionId);
  const activateMut = useActivateScore(versionId);
  const deleteMut = useDeleteScore(versionId);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<LeadscoreResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LeadscoreResponse | null>(null);
  const [configTarget, setConfigTarget] = useState<LeadscoreResponse | null>(null);
  const [scoreName, setScoreName] = useState("");

  const items = Array.isArray(scores) ? scores : [];

  if (!versionId) {
    return (
      <div className="text-center text-muted-foreground py-12">
        Selecione uma versão na aba "Versões" para gerenciar pontuações.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Pontuações (Leadscore)</h3>
        <Button size="sm" onClick={() => { setScoreName(""); setCreateOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Novo Score
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <TableRow key={i}>{[1,2,3,4].map(c => <TableCell key={c}><Skeleton className="h-4 w-full" /></TableCell>)}</TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhum score.</TableCell></TableRow>
            ) : (
              items.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>
                    <Badge variant={s.active ? "default" : "secondary"}>{s.active ? "Ativo" : "Inativo"}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(s.created_at).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" title="Configurar pontos" onClick={() => setConfigTarget(s)}>
                        <Settings className="h-4 w-4" />
                      </Button>
                      {!s.active && (
                        <Button variant="ghost" size="icon" title="Ativar" onClick={() => activateMut.mutate(s.id)}>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => { setScoreName(s.name); setEditTarget(s); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(s)}>
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
          <DialogHeader><DialogTitle>Novo Score</DialogTitle></DialogHeader>
          <div>
            <label className="text-sm font-medium text-foreground">Nome</label>
            <Input value={scoreName} onChange={(e) => setScoreName(e.target.value)} placeholder="Ex: Score Principal" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={() => createMut.mutate({ name: scoreName }, { onSuccess: () => setCreateOpen(false) })} disabled={createMut.isPending || !scoreName.trim()}>
              {createMut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="sm:max-w-[340px]">
          <DialogHeader><DialogTitle>Editar Score</DialogTitle></DialogHeader>
          <div>
            <label className="text-sm font-medium text-foreground">Nome</label>
            <Input value={scoreName} onChange={(e) => setScoreName(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancelar</Button>
            <Button onClick={() => editTarget && updateMut.mutate({ scoreId: editTarget.id, body: { name: scoreName } }, { onSuccess: () => setEditTarget(null) })} disabled={updateMut.isPending || !scoreName.trim()}>
              {updateMut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir score</AlertDialogTitle>
            <AlertDialogDescription>Excluir <strong>{deleteTarget?.name}</strong>?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && deleteMut.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Config Points Dialog */}
      {configTarget && (
        <ScorePointsDialog score={configTarget} versionId={versionId} onClose={() => setConfigTarget(null)} />
      )}
    </div>
  );
}

// ── Points Configuration Dialog ──
function ScorePointsDialog({ score, versionId, onClose }: { score: LeadscoreResponse; versionId: UUID; onClose: () => void }) {
  const { data: optionPoints, isLoading: optLoading } = useOptionPoints(score.id);
  const { data: rangePoints, isLoading: rangeLoading } = useRangePoints(score.id);
  const { data: versionQuestions } = useVersionQuestions(versionId);
  const replaceOptMut = useReplaceOptionPoints(score.id);
  const replaceRangeMut = useReplaceRangePoints(score.id);

  const optItems = Array.isArray(optionPoints) ? optionPoints : [];
  const rangeItems = Array.isArray(rangePoints) ? rangePoints : [];

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pontuação: {score.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Pontos por Opção</h4>
            {optLoading ? <Skeleton className="h-16 w-full" /> : optItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum ponto por opção configurado.</p>
            ) : (
              <div className="space-y-1">
                {optItems.map((op, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm rounded-md border border-border bg-background px-3 py-2">
                    <span className="font-mono text-xs text-muted-foreground">{op.question_key}</span>
                    <span>→</span>
                    <span className="font-mono text-xs">{op.option_key}</span>
                    <span className="ml-auto font-semibold">{op.points} pts</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Pontos por Range</h4>
            {rangeLoading ? <Skeleton className="h-16 w-full" /> : rangeItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum ponto por range configurado.</p>
            ) : (
              <div className="space-y-1">
                {rangeItems.map((rp, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm rounded-md border border-border bg-background px-3 py-2">
                    <span className="font-mono text-xs text-muted-foreground">{rp.question_key}</span>
                    <span>{rp.min_value ?? "∞"} – {rp.max_value ?? "∞"}</span>
                    <span className="ml-auto font-semibold">{rp.points} pts</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
