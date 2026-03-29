import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { VoteCampaign } from "@/types/vote-campaign";

interface Props {
  items: VoteCampaign[];
  isLoading: boolean;
  isError: boolean;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function formatDateTime(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: string }) {
  const variant = status === "PUBLISHED" ? "default" : "secondary";
  return <Badge variant={variant}>{status}</Badge>;
}

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <Badge variant={active ? "default" : "outline"} className={active ? "bg-emerald-600 hover:bg-emerald-700" : ""}>
      {active ? "Ativo" : "Inativo"}
    </Badge>
  );
}

const columns = [
  { key: "name", label: "Nome" },
  { key: "slug", label: "Slug" },
  { key: "status", label: "Status" },
  { key: "active", label: "Ativo" },
  { key: "starts_at", label: "Início" },
  { key: "ends_at", label: "Fim" },
  { key: "category_count", label: "Categorias" },
  { key: "candidate_count", label: "Candidatos" },
  { key: "vote_count", label: "Votos" },
  { key: "created_at", label: "Criado em" },
] as const;

export function VoteCampaignTable({ items, isLoading, isError }: Props) {
  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-destructive text-sm">
        Erro ao carregar as campanhas. Tente novamente.
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
                Nenhuma campanha encontrada.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-muted-foreground">{item.slug}</TableCell>
                <TableCell><StatusBadge status={item.status} /></TableCell>
                <TableCell><ActiveBadge active={item.active} /></TableCell>
                <TableCell className="whitespace-nowrap">{formatDate(item.starts_at)}</TableCell>
                <TableCell className="whitespace-nowrap">{formatDate(item.ends_at)}</TableCell>
                <TableCell className="text-center">{item.category_count}</TableCell>
                <TableCell className="text-center">{item.candidate_count}</TableCell>
                <TableCell className="text-center">{item.vote_count}</TableCell>
                <TableCell className="whitespace-nowrap">{formatDateTime(item.created_at)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
