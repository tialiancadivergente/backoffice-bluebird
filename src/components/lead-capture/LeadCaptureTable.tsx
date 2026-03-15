import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { LeadCapture } from "@/types/lead-capture";

interface Props {
  items: LeadCapture[];
  isLoading: boolean;
  isError: boolean;
}

const columns = [
  { key: "created_at", label: "Data" },
  { key: "person_email", label: "Email" },
  { key: "person_phone", label: "Telefone" },
  { key: "launch_name", label: "Launch" },
  { key: "season_name", label: "Season" },
  { key: "platform_name", label: "Plataforma" },
  { key: "strategy_name", label: "Estratégia" },
  { key: "temperature_name", label: "Temperatura" },
  { key: "page", label: "Page" },
  { key: "path", label: "Path" },
  { key: "utm_source", label: "UTM Source" },
  { key: "utm_medium", label: "UTM Medium" },
] as const;

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export function LeadCaptureTable({ items, isLoading, isError }: Props) {
  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-destructive text-sm">
        Erro ao carregar os leads. Tente novamente.
      </div>
    );
  }

  return (
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
                Nenhum lead encontrado.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="whitespace-nowrap">{formatDate(item.created_at)}</TableCell>
                <TableCell className="font-medium">{item.person_email || "—"}</TableCell>
                <TableCell>{item.person_phone || "—"}</TableCell>
                <TableCell>{item.launch_name || "—"}</TableCell>
                <TableCell>{item.season_name || "—"}</TableCell>
                <TableCell>{item.platform_name || "—"}</TableCell>
                <TableCell>{item.strategy_name || "—"}</TableCell>
                <TableCell>{item.temperature_name || "—"}</TableCell>
                <TruncatedCell value={item.page} />
                <TruncatedCell value={item.path} />
                <TruncatedCell value={item.utm_source} />
                <TruncatedCell value={item.utm_medium} />
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
