import { useState } from "react";
import { Plus, Loader2, Trash2, Pencil, ChevronDown, ChevronRight, GripVertical } from "lucide-react";
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  useFormQuestions, useCreateQuestion, useUpdateQuestion, useDeleteQuestion,
  useQuestionOptions, useCreateQuestionOption, useUpdateQuestionOption, useDeleteQuestionOption,
} from "@/hooks/use-form-builder";
import type { QuestionResponse, QuestionOptionResponse, UUID } from "@/types/form-builder";

const inputTypes = [
  { value: "text", label: "Texto" },
  { value: "number", label: "Número" },
  { value: "select", label: "Seleção" },
  { value: "radio", label: "Rádio" },
  { value: "checkbox", label: "Checkbox" },
  { value: "textarea", label: "Texto longo" },
  { value: "date", label: "Data" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Telefone" },
];

interface Props { formId: UUID; }

export function QuestionsTab({ formId }: Props) {
  const { data: questions, isLoading } = useFormQuestions(formId);
  const createMut = useCreateQuestion(formId);
  const updateMut = useUpdateQuestion(formId);
  const deleteMut = useDeleteQuestion(formId);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<QuestionResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<QuestionResponse | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const [formKey, setFormKey] = useState("");
  const [formText, setFormText] = useState("");
  const [formInputType, setFormInputType] = useState("text");

  const items = Array.isArray(questions) ? questions : [];

  const resetForm = () => { setFormKey(""); setFormText(""); setFormInputType("text"); };

  const handleCreate = () => {
    createMut.mutate({ question_key: formKey, question_text: formText || undefined, input_type: formInputType }, {
      onSuccess: () => { setCreateOpen(false); resetForm(); },
    });
  };

  const handleUpdate = () => {
    if (!editTarget) return;
    updateMut.mutate({ questionId: editTarget.id, body: { question_key: formKey, question_text: formText || undefined, input_type: formInputType } }, {
      onSuccess: () => { setEditTarget(null); resetForm(); },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Perguntas</h3>
        <Button size="sm" onClick={() => { resetForm(); setCreateOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Nova Pergunta
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Texto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>{[1,2,3,4,5].map(c => <TableCell key={c}><Skeleton className="h-4 w-full" /></TableCell>)}</TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhuma pergunta.</TableCell></TableRow>
            ) : (
              items.map((q) => (
                <>
                  <TableRow key={q.id}>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}>
                        {expandedQuestion === q.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{q.question_key}</TableCell>
                    <TableCell>{q.question_text || <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell><Badge variant="outline">{q.input_type || "text"}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setFormKey(q.question_key); setFormText(q.question_text || ""); setFormInputType(q.input_type || "text"); setEditTarget(q); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(q)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedQuestion === q.id && (
                    <TableRow key={`${q.id}-opts`}>
                      <TableCell colSpan={5} className="bg-muted/30 p-4">
                        <OptionsPanel questionId={q.id} />
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialogs */}
      {[
        { open: createOpen, onClose: () => setCreateOpen(false), title: "Nova Pergunta", onSubmit: handleCreate, isPending: createMut.isPending, btnLabel: "Criar" },
        { open: !!editTarget, onClose: () => { setEditTarget(null); resetForm(); }, title: "Editar Pergunta", onSubmit: handleUpdate, isPending: updateMut.isPending, btnLabel: "Salvar" },
      ].map((d, i) => (
        <Dialog key={i} open={d.open} onOpenChange={(o) => !o && d.onClose()}>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader><DialogTitle>{d.title}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground">Key</label>
                <Input value={formKey} onChange={(e) => setFormKey(e.target.value)} placeholder="ex: nome_completo" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Texto da pergunta</label>
                <Input value={formText} onChange={(e) => setFormText(e.target.value)} placeholder="Qual o seu nome completo?" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Tipo de input</label>
                <Select value={formInputType} onValueChange={setFormInputType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {inputTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={d.onClose}>Cancelar</Button>
              <Button onClick={d.onSubmit} disabled={d.isPending || !formKey.trim()}>
                {d.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} {d.btnLabel}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))}

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir pergunta</AlertDialogTitle>
            <AlertDialogDescription>
              Excluir <strong>{deleteTarget?.question_key}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMut.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Options sub-panel ──
function OptionsPanel({ questionId }: { questionId: UUID }) {
  const { data: options, isLoading } = useQuestionOptions(questionId);
  const createMut = useCreateQuestionOption(questionId);
  const updateMut = useUpdateQuestionOption(questionId);
  const deleteMut = useDeleteQuestionOption(questionId);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<QuestionOptionResponse | null>(null);
  const [optKey, setOptKey] = useState("");
  const [optText, setOptText] = useState("");
  const [optOrder, setOptOrder] = useState(0);

  const items = Array.isArray(options) ? options : [];
  const reset = () => { setOptKey(""); setOptText(""); setOptOrder(0); };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-foreground">Opções</span>
        <Button size="sm" variant="outline" onClick={() => { reset(); setOptOrder(items.length); setCreateOpen(true); }}>
          <Plus className="h-3 w-3 mr-1" /> Opção
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-8 w-full" />
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma opção.</p>
      ) : (
        <div className="space-y-1">
          {items.sort((a, b) => a.display_order - b.display_order).map((opt) => (
            <div key={opt.id} className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
              <GripVertical className="h-3 w-3 text-muted-foreground" />
              <span className="font-mono text-xs text-muted-foreground">{opt.option_key}</span>
              <span className="flex-1">{opt.option_text || "—"}</span>
              <Badge variant="outline" className="text-xs">#{opt.display_order}</Badge>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setOptKey(opt.option_key); setOptText(opt.option_text || ""); setOptOrder(opt.display_order); setEditTarget(opt); }}>
                <Pencil className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteMut.mutate(opt.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit option dialogs */}
      {[
        { open: createOpen, onClose: () => { setCreateOpen(false); reset(); }, title: "Nova Opção", onSubmit: () => createMut.mutate({ option_key: optKey, option_text: optText || undefined, display_order: optOrder }, { onSuccess: () => { setCreateOpen(false); reset(); } }), isPending: createMut.isPending, btn: "Criar" },
        { open: !!editTarget, onClose: () => { setEditTarget(null); reset(); }, title: "Editar Opção", onSubmit: () => editTarget && updateMut.mutate({ optionId: editTarget.id, body: { option_key: optKey, option_text: optText || undefined, display_order: optOrder } }, { onSuccess: () => { setEditTarget(null); reset(); } }), isPending: updateMut.isPending, btn: "Salvar" },
      ].map((d, i) => (
        <Dialog key={i} open={d.open} onOpenChange={(o) => !o && d.onClose()}>
          <DialogContent className="sm:max-w-[360px]">
            <DialogHeader><DialogTitle>{d.title}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground">Key</label>
                <Input value={optKey} onChange={(e) => setOptKey(e.target.value)} placeholder="ex: opcao_a" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Texto</label>
                <Input value={optText} onChange={(e) => setOptText(e.target.value)} placeholder="Opção A" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Ordem</label>
                <Input type="number" min={0} value={optOrder} onChange={(e) => setOptOrder(Number(e.target.value))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={d.onClose}>Cancelar</Button>
              <Button onClick={d.onSubmit} disabled={d.isPending || !optKey.trim()}>
                {d.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} {d.btn}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
