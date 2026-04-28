import { ArrowDown, ArrowUp, ArrowUpDown, AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatCurrencyBRL,
  formatInteger,
  formatPercent,
} from "@/lib/marketing-dashboard-formatters";
import type {
  MarketingDashboardSortOrder,
  MarketingDashboardTableItem,
  MarketingDashboardTableParams,
} from "@/types/marketing-dashboard";

interface MarketingDashboardTableProps {
  items: MarketingDashboardTableItem[];
  isLoading: boolean;
  isError: boolean;
  sortBy?: MarketingDashboardTableParams["sortBy"];
  sortOrder?: MarketingDashboardSortOrder;
  onSort: (sortBy: MarketingDashboardTableParams["sortBy"]) => void;
  onRetry: () => void;
}

const LOADING_ROW_KEYS = [
  "loading-a",
  "loading-b",
  "loading-c",
  "loading-d",
  "loading-e",
  "loading-f",
];

type Column = {
  key: keyof MarketingDashboardTableItem;
  label: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  format?: (value: number | null | undefined) => string;
};

const COLUMNS: Column[] = [
  { key: "provider", label: "Provider", sortable: true },
  { key: "accountName", label: "Conta", sortable: true },
  { key: "campaignName", label: "Campanha", sortable: true },
  { key: "adsetName", label: "Adset", sortable: true },
  { key: "adName", label: "Anuncio", sortable: true },
  { key: "spend", label: "Investimento", sortable: true, align: "right", format: formatCurrencyBRL },
  { key: "impressions", label: "Impressoes", sortable: true, align: "right", format: formatInteger },
  { key: "clicks", label: "Cliques", sortable: true, align: "right", format: formatInteger },
  { key: "conversions", label: "Conversoes", sortable: true, align: "right", format: formatInteger },
  { key: "registrations", label: "Cadastros", sortable: true, align: "right", format: formatInteger },
  { key: "cpc", label: "CPC", sortable: true, align: "right", format: formatCurrencyBRL },
  { key: "ctr", label: "CTR", sortable: true, align: "right", format: formatPercent },
  { key: "cpm", label: "CPM", sortable: true, align: "right", format: formatCurrencyBRL },
  { key: "cpl", label: "CPL", sortable: true, align: "right", format: formatCurrencyBRL },
];

function renderSortIcon(isActive: boolean, order?: MarketingDashboardSortOrder) {
  if (!isActive) {
    return <ArrowUpDown className="ml-1 h-3.5 w-3.5" aria-hidden="true" />;
  }

  if (order === "asc") {
    return <ArrowUp className="ml-1 h-3.5 w-3.5" aria-hidden="true" />;
  }

  return <ArrowDown className="ml-1 h-3.5 w-3.5" aria-hidden="true" />;
}

function getCellAlignment(align?: Column["align"]) {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return "text-left";
}

export function MarketingDashboardTable({
  items,
  isLoading,
  isError,
  sortBy,
  sortOrder,
  onSort,
  onRetry,
}: Readonly<MarketingDashboardTableProps>) {
  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Nao foi possivel carregar a tabela.
          </p>
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  const bodyContent = (() => {
    if (isLoading) {
      return LOADING_ROW_KEYS.map((rowKey) => (
        <TableRow key={rowKey}>
          {COLUMNS.map((column) => (
            <TableCell key={`${rowKey}-${column.key}`}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ));
    }

    if (items.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={COLUMNS.length} className="py-10 text-center text-muted-foreground">
            Nenhum resultado encontrado para os filtros aplicados.
          </TableCell>
        </TableRow>
      );
    }

    return items.map((item) => (
      <TableRow
        key={[
          item.provider ?? "provider",
          item.externalAccountId ?? "account",
          item.externalCampaignId ?? "campaign",
          item.externalAdsetId ?? "adset",
          item.externalAdId ?? "ad",
        ].join("-")}
      >
        {COLUMNS.map((column) => {
          const value = item[column.key];
          const content =
            typeof value === "number" || value === null
              ? column.format?.(value) ?? String(value)
              : value || "—";

          return (
            <TableCell key={`${item.externalAdId ?? "ad"}-${column.key}`} className={getCellAlignment(column.align)}>
              {content}
            </TableCell>
          );
        })}
      </TableRow>
    ));
  })();

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {COLUMNS.map((column) => (
                <TableHead key={column.key} className={getCellAlignment(column.align)}>
                  {column.sortable ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-auto px-0 py-0.5 text-xs font-semibold text-muted-foreground hover:bg-transparent hover:text-foreground"
                      onClick={() => onSort(column.key)}
                    >
                      {column.label}
                      {renderSortIcon(sortBy === column.key, sortOrder)}
                    </Button>
                  ) : (
                    column.label
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {bodyContent}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
