import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, Trash2, Pencil, CheckCircle, Settings, Save, PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  useScores, useCreateScore, useUpdateScore, useActivateScore, useDeleteScore,
  useOptionPoints, useReplaceOptionPoints,
  useRangePoints, useReplaceRangePoints,
  useFormQuestions, useQuestionOptions,
} from "@/hooks/use-form-builder";
import type {
  LeadscoreResponse, UUID, QuestionResponse, QuestionOptionResponse,
  LeadscoreOptionPointResponse, LeadscoreRangePointResponse,
} from "@/types/form-builder";
import { toast } from "sonner";

interface Props { versionId: UUID; formId: UUID; }

export function ScoresTab({ versionId, formId }: Props) {
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
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhum score. Crie um para configurar pontuação.</TableCell></TableRow>
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
            <Button onClick={() => createMut.mutate({ name: scoreName, active: true }, { onSuccess: () => setCreateOpen(false) })} disabled={createMut.isPending || !scoreName.trim()}>
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
        <ScorePointsDialog score={configTarget} formId={formId} onClose={() => setConfigTarget(null)} />
      )}
    </div>
  );
}

// ── Editable Points Configuration Dialog ──
type OptionPointRow = { question_id: UUID; option_id: UUID; points: number; question_key: string; option_key: string };
type RangePointRow = { question_id: UUID; question_key: string; min_value: string; max_value: string; points: string };

function ScorePointsDialog({ score, formId, onClose }: { score: LeadscoreResponse; formId: UUID; onClose: () => void }) {
  const { data: optionPoints, isLoading: optLoading } = useOptionPoints(score.id);
  const { data: rangePoints, isLoading: rangeLoading } = useRangePoints(score.id);
  const { data: questions, isLoading: qLoading } = useFormQuestions(formId);
  const replaceOptMut = useReplaceOptionPoints(score.id);
  const replaceRangeMut = useReplaceRangePoints(score.id);

  const [optRows, setOptRows] = useState<OptionPointRow[]>([]);
  const [rangeRows, setRangeRows] = useState<RangePointRow[]>([]);
  const [optDirty, setOptDirty] = useState(false);
  const [rangeDirty, setRangeDirty] = useState(false);

  // Map of questionId -> options (loaded lazily)
  const [questionOptionsMap, setQuestionOptionsMap] = useState<Record<UUID, QuestionOptionResponse[]>>({});
  const [loadingOptions, setLoadingOptions] = useState<Set<UUID>>(new Set());

  const questionsList = Array.isArray(questions) ? questions : [];

  // Load options for a question
  const loadOptionsForQuestion = useCallback(async (questionId: UUID) => {
    if (questionOptionsMap[questionId] || loadingOptions.has(questionId)) return;
    setLoadingOptions(prev => new Set(prev).add(questionId));
    try {
      const { listQuestionOptions } = await import("@/api/form-builder");
      const opts = await listQuestionOptions(questionId);
      setQuestionOptionsMap(prev => ({ ...prev, [questionId]: Array.isArray(opts) ? opts : [] }));
    } catch {
      // ignore
    } finally {
      setLoadingOptions(prev => { const s = new Set(prev); s.delete(questionId); return s; });
    }
  }, [questionOptionsMap, loadingOptions]);

  // Initialize option points from server data
  useEffect(() => {
    if (optionPoints && !optDirty) {
      const items = Array.isArray(optionPoints) ? optionPoints : [];
      setOptRows(items.map(op => ({
        question_id: op.question_id,
        option_id: op.option_id,
        points: op.points,
        question_key: op.question_key,
        option_key: op.option_key,
      })));
      // Load options for all questions that have points
      items.forEach(op => loadOptionsForQuestion(op.question_id));
    }
  }, [optionPoints, optDirty, loadOptionsForQuestion]);

  // Initialize range points from server data
  useEffect(() => {
    if (rangePoints && !rangeDirty) {
      const items = Array.isArray(rangePoints) ? rangePoints : [];
      setRangeRows(items.map(rp => ({
        question_id: rp.question_id,
        question_key: rp.question_key,
        min_value: rp.min_value != null ? String(rp.min_value) : "",
        max_value: rp.max_value != null ? String(rp.max_value) : "",
        points: String(rp.points),
      })));
    }
  }, [rangePoints, rangeDirty]);

  // ── Option Points handlers ──
  const updateOptPoint = (idx: number, points: number) => {
    setOptRows(prev => prev.map((r, i) => i === idx ? { ...r, points } : r));
    setOptDirty(true);
  };

  const addOptRow = (questionId: UUID, optionId: UUID) => {
    const q = questionsList.find(q => q.id === questionId);
    const o = questionOptionsMap[questionId]?.find(o => o.id === optionId);
    if (!q || !o) return;
    // Don't add duplicate
    if (optRows.some(r => r.question_id === questionId && r.option_id === optionId)) {
      toast.error("Essa combinação já existe.");
      return;
    }
    setOptRows(prev => [...prev, { question_id: questionId, option_id: optionId, points: 0, question_key: q.question_key, option_key: o.option_key }]);
    setOptDirty(true);
  };

  const removeOptRow = (idx: number) => {
    setOptRows(prev => prev.filter((_, i) => i !== idx));
    setOptDirty(true);
  };

  const saveOptionPoints = () => {
    replaceOptMut.mutate(
      { items: optRows.map(r => ({ question_id: r.question_id, option_id: r.option_id, points: r.points })) },
      { onSuccess: () => setOptDirty(false) }
    );
  };

  // ── Range Points handlers ──
  const updateRangeRow = (idx: number, field: keyof RangePointRow, value: string) => {
    setRangeRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
    setRangeDirty(true);
  };

  const addRangeRow = () => {
    setRangeRows(prev => [...prev, { question_id: "", question_key: "", min_value: "", max_value: "", points: "0" }]);
    setRangeDirty(true);
  };

  const removeRangeRow = (idx: number) => {
    setRangeRows(prev => prev.filter((_, i) => i !== idx));
    setRangeDirty(true);
  };

  const setRangeQuestion = (idx: number, questionId: UUID) => {
    const q = questionsList.find(q => q.id === questionId);
    setRangeRows(prev => prev.map((r, i) => i === idx ? { ...r, question_id: questionId, question_key: q?.question_key ?? "" } : r));
    setRangeDirty(true);
  };

  const validateRangeRows = (): boolean => {
    for (const row of rangeRows) {
      if (!row.question_id) { toast.error("Selecione uma pergunta para todas as linhas de faixa."); return false; }
      const pts = Number(row.points);
      if (isNaN(pts)) { toast.error("Pontos deve ser um número válido."); return false; }
      const min = row.min_value !== "" ? Number(row.min_value) : undefined;
      const max = row.max_value !== "" ? Number(row.max_value) : undefined;
      if (min !== undefined && isNaN(min)) { toast.error("Valor mínimo inválido."); return false; }
      if (max !== undefined && isNaN(max)) { toast.error("Valor máximo inválido."); return false; }
      if (min !== undefined && max !== undefined && min > max) { toast.error(`Min (${min}) deve ser ≤ Max (${max}).`); return false; }
    }
    return true;
  };

  const saveRangePoints = () => {
    if (!validateRangeRows()) return;
    replaceRangeMut.mutate(
      {
        items: rangeRows.map(r => ({
          question_id: r.question_id,
          min_value: r.min_value !== "" ? Number(r.min_value) : undefined,
          max_value: r.max_value !== "" ? Number(r.max_value) : undefined,
          points: Number(r.points),
        })),
      },
      { onSuccess: () => setRangeDirty(false) }
    );
  };

  const isLoading = optLoading || rangeLoading || qLoading;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[750px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pontuação: {score.name}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="option-points">
            <TabsList className="w-full">
              <TabsTrigger value="option-points" className="flex-1">Pontos por Opção</TabsTrigger>
              <TabsTrigger value="range-points" className="flex-1">Pontos por Faixa</TabsTrigger>
            </TabsList>

            {/* ── Option Points Tab ── */}
            <TabsContent value="option-points" className="space-y-4">
              <OptionPointsAddRow
                questions={questionsList}
                questionOptionsMap={questionOptionsMap}
                onLoadOptions={loadOptionsForQuestion}
                onAdd={addOptRow}
              />

              {optRows.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhum ponto por opção. Adicione acima.</p>
              ) : (
                <div className="rounded-lg border border-border bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pergunta</TableHead>
                        <TableHead>Opção</TableHead>
                        <TableHead className="w-[100px]">Pontos</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {optRows.map((row, idx) => (
                        <TableRow key={`${row.question_id}-${row.option_id}`}>
                          <TableCell className="font-mono text-xs">{row.question_key}</TableCell>
                          <TableCell className="font-mono text-xs">{row.option_key}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={row.points}
                              onChange={(e) => updateOptPoint(idx, Number(e.target.value) || 0)}
                              className="h-8 w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeOptRow(idx)}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={saveOptionPoints} disabled={!optDirty || replaceOptMut.isPending}>
                  {replaceOptMut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-1" /> Salvar Pontos por Opção
                </Button>
              </div>
            </TabsContent>

            {/* ── Range Points Tab ── */}
            <TabsContent value="range-points" className="space-y-4">
              <div className="flex justify-end">
                <Button size="sm" variant="outline" onClick={addRangeRow}>
                  <PlusCircle className="h-4 w-4 mr-1" /> Adicionar Faixa
                </Button>
              </div>

              {rangeRows.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhum ponto por faixa. Clique em "Adicionar Faixa".</p>
              ) : (
                <div className="rounded-lg border border-border bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pergunta</TableHead>
                        <TableHead className="w-[100px]">Mín</TableHead>
                        <TableHead className="w-[100px]">Máx</TableHead>
                        <TableHead className="w-[100px]">Pontos</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rangeRows.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <Select value={row.question_id} onValueChange={(v) => setRangeQuestion(idx, v)}>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Selecionar..." />
                              </SelectTrigger>
                              <SelectContent>
                                {questionsList.map(q => (
                                  <SelectItem key={q.id} value={q.id}>{q.question_key}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input type="number" value={row.min_value} onChange={(e) => updateRangeRow(idx, "min_value", e.target.value)} className="h-8 w-20" placeholder="∞" />
                          </TableCell>
                          <TableCell>
                            <Input type="number" value={row.max_value} onChange={(e) => updateRangeRow(idx, "max_value", e.target.value)} className="h-8 w-20" placeholder="∞" />
                          </TableCell>
                          <TableCell>
                            <Input type="number" value={row.points} onChange={(e) => updateRangeRow(idx, "points", e.target.value)} className="h-8 w-20" />
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeRangeRow(idx)}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={saveRangePoints} disabled={!rangeDirty || replaceRangeMut.isPending}>
                  {replaceRangeMut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-1" /> Salvar Pontos por Faixa
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Add Option Point Row ──
function OptionPointsAddRow({
  questions, questionOptionsMap, onLoadOptions, onAdd,
}: {
  questions: QuestionResponse[];
  questionOptionsMap: Record<UUID, QuestionOptionResponse[]>;
  onLoadOptions: (qId: UUID) => void;
  onAdd: (qId: UUID, oId: UUID) => void;
}) {
  const [selQ, setSelQ] = useState("");
  const [selO, setSelO] = useState("");

  const handleSelectQuestion = (qId: string) => {
    setSelQ(qId);
    setSelO("");
    onLoadOptions(qId);
  };

  const options = selQ ? (questionOptionsMap[selQ] ?? []) : [];

  return (
    <div className="flex items-end gap-2 flex-wrap">
      <div className="space-y-1 min-w-[180px]">
        <label className="text-xs font-medium text-muted-foreground">Pergunta</label>
        <Select value={selQ} onValueChange={handleSelectQuestion}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Selecionar pergunta..." />
          </SelectTrigger>
          <SelectContent>
            {questions.map(q => (
              <SelectItem key={q.id} value={q.id}>{q.question_key}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1 min-w-[180px]">
        <label className="text-xs font-medium text-muted-foreground">Opção</label>
        <Select value={selO} onValueChange={setSelO} disabled={!selQ || options.length === 0}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder={!selQ ? "Selecione pergunta primeiro" : options.length === 0 ? "Carregando..." : "Selecionar opção..."} />
          </SelectTrigger>
          <SelectContent>
            {options.map(o => (
              <SelectItem key={o.id} value={o.id}>{o.option_key}{o.option_text ? ` – ${o.option_text}` : ""}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button size="sm" variant="outline" disabled={!selQ || !selO} onClick={() => { onAdd(selQ, selO); setSelO(""); }}>
        <PlusCircle className="h-4 w-4 mr-1" /> Adicionar
      </Button>
    </div>
  );
}
