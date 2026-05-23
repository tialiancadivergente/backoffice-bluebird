import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
};

const STATUS_LABEL: Record<string, string> = {
  completed: "Concluído",
  running: "Executando",
  failed: "Falhou",
  partial: "Parcial",
};

const STEP_LABEL: Record<string, string> = {
  campaigns: "Campanhas",
  adsets: "Conjuntos",
  ads: "Anúncios",
  insights: "Insights",
  full: "Completo",
};

export function MetaExecutionsList({ data, isLoading }: Props) {
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

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Início</TableHead>
            <TableHead>Etapa</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Registros</TableHead>
            <TableHead>Período</TableHead>
            <TableHead>Acionado por</TableHead>
            <TableHead>Erro</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((ex) => (
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
                <Badge variant={STATUS_VARIANT[ex.status] ?? "outline"}>
                  {STATUS_LABEL[ex.status] ?? ex.status}
                </Badge>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
