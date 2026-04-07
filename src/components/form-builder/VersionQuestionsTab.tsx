import { useState } from "react";
import { Plus, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  useFormQuestions, useVersionQuestions, useAddVersionQuestion, useDeleteVersionQuestion,
  useReorderVersionQuestions,
} from "@/hooks/use-form-builder";
import type { FormVersionQuestionResponse, UUID } from "@/types/form-builder";

interface Props {
  formId: UUID;
  versionId: UUID;
}

export function VersionQuestionsTab({ formId, versionId }: Props) {
  const { data: allQuestions } = useFormQuestions(formId);
  const { data: versionQuestions, isLoading } = useVersionQuestions(versionId);
  const addMut = useAddVersionQuestion(versionId);
  const deleteMut = useDeleteVersionQuestion(versionId);
  const reorderMut = useReorderVersionQuestions(versionId);

  const [addOpen, setAddOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [required, setRequired] = useState(false);

  const vqItems: FormVersionQuestionResponse[] = Array.isArray(versionQuestions) ? versionQuestions : [];
  const allQItems = Array.isArray(allQuestions) ? allQuestions : [];
  const linkedIds = new Set(vqItems.map((vq) => vq.question_id));
  const availableQuestions = allQItems.filter((q) => !linkedIds.has(q.id));

  if (!versionId) {
    return <div className="text-center text-muted-foreground py-12">Selecione uma versão primeiro.</div>;
  }

  const handleAdd = () => {
    addMut.mutate({ question_id: selectedQuestionId, display_order: displayOrder, required }, {
      onSuccess: () => { setAddOpen(false); setSelectedQuestionId(""); },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Perguntas da Versão</h3>
        <Button size="sm" onClick={() => { setDisplayOrder(vqItems.length); setRequired(false); setAddOpen(true); }} disabled={availableQuestions.length === 0}>
          <Plus className="h-4 w-4 mr-1" /> Vincular Pergunta
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-12 rounded-md bg-muted animate-pulse" />)}
        </div>
      ) : vqItems.length === 0 ? (
        <div className="text-center text-muted-foreground py-8 border border-dashed border-border rounded-lg">
          Nenhuma pergunta vinculada a esta versão.
        </div>
      ) : (
        <div className="space-y-2">
          {vqItems.sort((a, b) => a.display_order - b.display_order).map((vq) => (
            <div key={vq.question_id} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
              <Badge variant="outline" className="text-xs">#{vq.display_order}</Badge>
              <div className="flex-1">
                <span className="font-mono text-sm">{vq.question_key}</span>
                {vq.question_text && <span className="text-sm text-muted-foreground ml-2">— {vq.question_text}</span>}
              </div>
              {vq.required && <Badge>Obrigatória</Badge>}
              <Badge variant="outline">{vq.input_type || "text"}</Badge>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => deleteMut.mutate(vq.question_id)}>
                Desvincular
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader><DialogTitle>Vincular Pergunta</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Pergunta</label>
              <Select value={selectedQuestionId} onValueChange={setSelectedQuestionId}>
                <SelectTrigger><SelectValue placeholder="Selecione uma pergunta" /></SelectTrigger>
                <SelectContent>
                  {availableQuestions.map((q) => (
                    <SelectItem key={q.id} value={q.id}>{q.question_key} — {q.question_text || "Sem texto"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Ordem</label>
              <Input type="number" min={0} value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="required" checked={required} onCheckedChange={(v) => setRequired(!!v)} />
              <label htmlFor="required" className="text-sm text-foreground">Obrigatória</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancelar</Button>
            <Button onClick={handleAdd} disabled={addMut.isPending || !selectedQuestionId}>
              {addMut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Vincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
