import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, Loader2, Square } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAbortMetaExecution } from "@/hooks/use-meta-ads";
import type { MetaSyncExecution } from "@/types/meta-ads";

type Props = {
  data?: MetaSyncExecution[];
  isLoading?: boolean;
};

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  completed: "default",
  running: "secondary",
  failed: "destructive",
  partial: "outline",
  aborted: "outline",
};

const STATUS_LABEL: Record<string, string> = {
  completed: "Concluído",
  running: "Executando",
  failed: "Falhou",
  partial: "Parcial",
  aborted: "Abortado",
};

const STEP_LABEL: Record<string, string> = {
  campaigns: "Campanhas",
  adsets: "Conjuntos",
  ads: "Anúncios",
  insights: "Insights",
  full: "Completo",
};

const LONG_RUNNING_MINUTES = 20;

function elapsedMinutes(startedAt: string, finishedAt?: string) {
  const start = new Date(startedAt).getTime();
  const end = finishedAt ? new Date(finishedAt).getTime() : Date.now();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return 0;
  return Math.floor((end - start) / 60_000);
}

function durationLabel(startedAt: string, finishedAt?: string) {
  const minutes = elapsedMinutes(startedAt, finishedAt);
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours}h ${rest}min` : `${hours}h`;
}

export function MetaExecutionsList({ data, isLoading }: Props) {
  const abort = useAbortMetaExecution();
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        Nenhuma execução registrada ainda.
      </div>
    );
  }

  const running = data.filter((ex) => ex.status === "running");
  const longRunning = running.filter(
    (ex) => elapsedMinutes(ex.started_at) >= LONG_RUNNING_MINUTES,
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge variant={running.length > 0 ? "secondary" : "outline"} className="gap-1.5">
          {running.length > 0 && <Loader2 className="h-3 w-3 animate-spin" />}
          {running.length} em andamento
        </Badge>
        {longRunning.length > 0 && (
          <Badge variant="destructive" className="gap-1.5">
            <AlertTriangle className="h-3 w-3" />
            {longRunning.length} há mais de {LONG_RUNNING_MINUTES} min
          </Badge>
        )}
        <span className="text-xs text-muted-foreground">
          Atualiza automaticamente enquanto houver execução em andamento.
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Início</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead className="text-right">Registros</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Acionado por</TableHead>
              <TableHead>Erro</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((ex) => {
              const isLongRunning =
                ex.status === "running" &&
                elapsedMinutes(ex.started_at) >= LONG_RUNNING_MINUTES;
              return (
                <TableRow key={ex.id}>
                  <TableCell className="text-sm tabular-nums whitespace-nowrap">
                    {format(new Date(ex.started_at), "dd/MM HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {STEP_LABEL[ex.step] ?? ex.step}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={isLongRunning ? "destructive" : STATUS_VARIANT[ex.status] ?? "outline"} className="gap-1.5">
                      {ex.status === "running" && !isLongRunning && <Loader2 className="h-3 w-3 animate-spin" />}
                      {isLongRunning && <AlertTriangle className="h-3 w-3" />}
                      {isLongRunning ? "Possível travamento" : STATUS_LABEL[ex.status] ?? ex.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs tabular-nums text-muted-foreground whitespace-nowrap">
                    {durationLabel(ex.started_at, ex.finished_at)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {ex.records_processed.toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {ex.date_from && ex.date_to
                      ? `${ex.date_from} → ${ex.date_to}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {ex.triggered_by}
                  </TableCell>
                  <TableCell
                    className="text-xs text-destructive max-w-[200px] truncate"
                    title={ex.error_message}
                  >
                    {ex.error_message ?? "—"}
                  </TableCell>
                  <TableCell>
                    {ex.status === "running" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1.5 text-xs text-destructive hover:text-destructive"
                        disabled={abort.isPending}
                        onClick={() => abort.mutate(ex.id)}
                      >
                        <Square className="h-3 w-3 fill-current" />
                        Abortar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
