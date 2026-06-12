import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import type { LaunchFunnelRow } from "@/types/launch-dashboard";

const PAGE_SIZE = 50;

function cur(v: number | null | undefined) {
  if (v == null) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
}

function int(v: number | null | undefined) {
  if (v == null) return "—";
  return v.toLocaleString("pt-BR");
}

function pct(v: number | null | undefined) {
  if (v == null) return "—";
  return `${(v * 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

interface Props {
  items: LaunchFunnelRow[];
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
}

export function LaunchFunnelTable({ items, isLoading, isError, onRetry }: Props) {
  const [page, setPage] = useState(0);

  useEffect(() => { setPage(0); }, [items]);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = items.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  if (isError) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <AlertCircle className="h-4 w-4" />
        Falha ao carregar tabela.{" "}
        {onRetry && (
          <button type="button" onClick={onRetry} className="underline">
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[160px]">Anúncio</TableHead>
              <TableHead className="min-w-[140px]">Campanha</TableHead>
              <TableHead className="text-right">Gasto</TableHead>
              <TableHead className="text-right">Impressões</TableHead>
              <TableHead className="text-right">Cliques</TableHead>
              <TableHead className="text-right">CTR</TableHead>
              <TableHead className="text-right">CPC</TableHead>
              <TableHead className="text-right">Pág. Vis.</TableHead>
              <TableHead className="text-right">Connect Rate</TableHead>
              <TableHead className="text-right">Init. Checkout</TableHead>
              <TableHead className="text-right">Tx PgV→CK</TableHead>
              <TableHead className="text-right">Leads</TableHead>
              <TableHead className="text-right">CPL</TableHead>
              <TableHead className="text-right font-semibold text-primary">Vendas</TableHead>
              <TableHead className="text-right font-semibold text-primary">Receita</TableHead>
              <TableHead className="text-right font-semibold text-primary">CPA</TableHead>
              <TableHead className="text-right font-semibold text-primary">Tx CK→Venda</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 17 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={17} className="py-10 text-center text-muted-foreground">
                  Nenhum dado encontrado para os filtros selecionados.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              pageItems.map((row) => (
                <TableRow key={row.externalAdId}>
                  <TableCell className="font-medium text-xs max-w-[200px] truncate" title={row.adName ?? row.externalAdId}>
                    {row.adName ?? row.externalAdId}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate" title={row.campaignName ?? undefined}>
                    {row.campaignName ?? "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{cur(row.spend)}</TableCell>
                  <TableCell className="text-right tabular-nums">{int(row.impressions)}</TableCell>
                  <TableCell className="text-right tabular-nums">{int(row.clicks)}</TableCell>
                  <TableCell className="text-right tabular-nums">{pct(row.ctr)}</TableCell>
                  <TableCell className="text-right tabular-nums">{cur(row.cpc)}</TableCell>
                  <TableCell className="text-right tabular-nums">{int(row.landingPageViews)}</TableCell>
                  <TableCell className="text-right tabular-nums">{pct(row.connectRate)}</TableCell>
                  <TableCell className="text-right tabular-nums">{int(row.initiateCheckouts)}</TableCell>
                  <TableCell className="text-right tabular-nums">{pct(row.txPgvCheckout)}</TableCell>
                  <TableCell className="text-right tabular-nums">{int(row.leads)}</TableCell>
                  <TableCell className="text-right tabular-nums">{cur(row.cpl)}</TableCell>
                  <TableCell className="text-right tabular-nums font-semibold text-primary">{int(row.sales)}</TableCell>
                  <TableCell className="text-right tabular-nums font-semibold text-primary">{cur(row.revenue)}</TableCell>
                  <TableCell className="text-right tabular-nums font-semibold text-primary">{cur(row.cpa)}</TableCell>
                  <TableCell className="text-right tabular-nums font-semibold text-primary">{pct(row.txCheckoutSale)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-muted-foreground">
            {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, items.length)} de {items.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs tabular-nums px-1">
              {safePage + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safePage >= totalPages - 1}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
