import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScrollText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { MetaSyncExecution } from "@/types/meta-ads";

type Props = {
  execution: MetaSyncExecution | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const STATUS_LABEL: Record<string, string> = {
  running: "Executando",
  completed: "Concluído",
  failed: "Falhou",
  partial: "Parcial",
  aborted: "Abortado",
};

export function MetaExecutionLogsSheet({ execution, open, onOpenChange }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (execution?.status === "running") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [execution?.metadata?.logs?.length, execution?.status]);

  if (!execution) return null;

  const logs = execution.metadata?.logs ?? [];
  const totalJobs = execution.metadata?.totalJobs;
  const doneJobs = execution.metadata?.doneJobs ?? 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:w-[700px] sm:max-w-none flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 py-4 border-b border-border shrink-0">
          <SheetTitle className="flex items-center gap-2 text-base">
            <ScrollText className="h-4 w-4" />
            Logs da execução
          </SheetTitle>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>
              {format(new Date(execution.started_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
            </span>
            <Badge variant="outline" className="text-xs h-5">
              {execution.step}
            </Badge>
            <Badge
              variant={execution.status === "running" ? "secondary" : execution.status === "failed" || execution.status === "aborted" ? "destructive" : "default"}
              className="text-xs h-5"
            >
              {STATUS_LABEL[execution.status] ?? execution.status}
            </Badge>
            {totalJobs != null && (
              <span className="font-mono">
                {doneJobs}/{totalJobs} jobs
              </span>
            )}
            {execution.records_processed > 0 && (
              <span className="font-mono">
                {execution.records_processed.toLocaleString("pt-BR")} registros
              </span>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {logs.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              {execution.status === "running"
                ? "Aguardando primeiros logs..."
                : "Nenhum log disponível para esta execução."}
            </p>
          ) : (
            <div className="font-mono text-xs space-y-0.5">
              {logs.map((line, i) => (
                <div
                  key={i}
                  className={
                    line.includes("✗")
                      ? "text-destructive"
                      : line.includes("Iniciando") || line.includes("Finalizado")
                      ? "text-muted-foreground"
                      : "text-foreground"
                  }
                >
                  {line}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {execution.error_message && (
          <div className="px-6 py-3 border-t border-border bg-destructive/5 shrink-0">
            <p className="text-xs text-destructive font-mono break-all">
              {execution.error_message}
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
