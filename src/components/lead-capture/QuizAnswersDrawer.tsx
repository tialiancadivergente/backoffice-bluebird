import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ClipboardList, Loader2 } from "lucide-react";
import { fetchQuizAnswers } from "@/api/lead-capture";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { QuizAnswer } from "@/types/quiz-answers";

interface Props {
  captureId: string | null;
  leadName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatAnswerValue(answer: QuizAnswer): string {
  if (answer.option_text) return answer.option_text;
  if (answer.answer_text) return answer.answer_text;
  if (answer.answer_number !== null) return String(answer.answer_number);
  if (answer.answer_bool !== null) return answer.answer_bool ? "Sim" : "Não";
  return "—";
}

function inputTypeLabel(type: string): string {
  const map: Record<string, string> = {
    single: "Escolha única",
    multiple: "Múltipla escolha",
    text: "Texto",
    number: "Número",
    boolean: "Sim/Não",
  };
  return map[type] ?? type;
}

export function QuizAnswersDrawer({ captureId, leadName, open, onOpenChange }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["quiz-answers", captureId],
    queryFn: () => fetchQuizAnswers(captureId!),
    enabled: open && !!captureId,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg w-full p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <SheetTitle>Respostas do Quiz</SheetTitle>
          </div>
          <SheetDescription>
            {leadName ? `Respostas de ${leadName}` : "Respostas do lead"}
            {data?.submitted_at && (
              <span className="block text-xs mt-1">
                Enviado em {format(new Date(data.submitted_at), "dd/MM/yyyy 'às' HH:mm")}
              </span>
            )}
          </SheetDescription>
          {data && (
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="outline" className="text-xs">
                Score: {data.score_total}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Faixa: {data.faixa}
              </Badge>
            </div>
          )}
        </SheetHeader>

        <Separator />

        <ScrollArea className="flex-1 px-6 py-4">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {isError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-center text-destructive text-sm">
              Erro ao carregar respostas.
            </div>
          )}

          {data && (
            <div className="space-y-4">
              {[...data.answers].sort((a, b) => a.question_key.localeCompare(b.question_key, undefined, { numeric: true })).map((answer, index) => (
                <div
                  key={answer.form_answer_id}
                  className="rounded-lg border border-border bg-muted/30 p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground leading-snug">
                      <span className="text-muted-foreground mr-1.5">{index + 1}.</span>
                      {answer.question_text}
                    </p>
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      {inputTypeLabel(answer.input_type)}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground/80 bg-background rounded-md px-3 py-2 border border-border">
                    {formatAnswerValue(answer)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
