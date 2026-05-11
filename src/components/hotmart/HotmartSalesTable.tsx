import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { HotmartSale, HotmartPurchaseStatus, HotmartPaymentType } from "@/types/hotmart";

// ── Status ────────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<HotmartPurchaseStatus, string> = {
  APPROVED: "Aprovada",
  COMPLETE: "Completa",
  WAITING_PAYMENT: "Aguardando",
  PRINTED_BILLET: "Boleto gerado",
  CANCELLED: "Cancelada",
  REFUNDED: "Reembolsada",
};

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

function statusVariant(s: HotmartPurchaseStatus): BadgeVariant {
  if (s === "APPROVED" || s === "COMPLETE") return "default";
  if (s === "WAITING_PAYMENT" || s === "PRINTED_BILLET") return "secondary";
  return "destructive";
}

function StatusBadge({ status }: Readonly<{ status: HotmartPurchaseStatus }>) {
  return (
    <Badge variant={statusVariant(status)} className="whitespace-nowrap text-xs">
      {STATUS_LABEL[status] ?? status}
    </Badge>
  );
}

// ── Payment ───────────────────────────────────────────────────────────────────

const PAYMENT_LABEL: Record<HotmartPaymentType, string> = {
  PIX: "PIX",
  CREDIT_CARD: "Cartão",
  BILLET: "Boleto",
};

function resolvePaymentIcon(type: HotmartPaymentType) {
  if (type === "PIX") {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400 font-bold text-[10px]">
        P
      </span>
    );
  }
  if (type === "CREDIT_CARD") {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold text-[10px]">
        CC
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 font-bold text-[10px]">
      B
    </span>
  );
}

function PaymentIcon({ type }: Readonly<{ type: HotmartPaymentType | null }>) {
  if (!type) return <span className="text-muted-foreground">—</span>;

  const label = PAYMENT_LABEL[type] ?? type;
  const icon = resolvePaymentIcon(type);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1.5">
          {icon}
          <span className="text-xs text-muted-foreground">{label}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(value: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value);
}

function resolveSourceAccount(account: string | null) {
  if (!account) return "—";
  if (account === "alianca_divergente") return "Aliança Divergente";
  return account;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  items: HotmartSale[];
  isLoading: boolean;
  isError: boolean;
  total: number;
  from?: string;
  to?: string;
}

const COLUMNS = [
  "Transação",
  "Comprador",
  "Produto",
  "Vendedor",
  "Data da Compra",
  "Pagamento",
  "Valor",
  "Status",
];

export function HotmartSalesTable({ items, isLoading, isError, total, from, to }: Readonly<Props>) {
  return (
    <div className="space-y-2">
      {/* Total info */}
      <p className="text-xs text-muted-foreground">
        {from && to
          ? `Total de ${total} registros entre ${formatDate(from)} e ${formatDate(to)}`
          : `Total de ${total} registros`}
      </p>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {COLUMNS.map((col) => (
                <TableHead key={col} className="whitespace-nowrap">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading &&
              COLUMNS.map((col) => (
                <TableRow key={`skeleton-${col}`}>
                  {COLUMNS.map((c) => (
                    <TableCell key={c}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {isError && !isLoading && (
              <TableRow>
                <TableCell colSpan={COLUMNS.length} className="text-center text-destructive py-8">
                  Erro ao carregar transações.
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={COLUMNS.length} className="text-center text-muted-foreground py-8">
                  Nenhuma transação encontrada.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              !isError &&
              items.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-mono text-xs">{sale.transaction_code}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{sale.buyer_name ?? "—"}</span>
                      {sale.buyer_email && (
                        <span className="text-xs text-muted-foreground">{sale.buyer_email}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[180px]">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="block truncate text-sm">{sale.product_name}</span>
                      </TooltipTrigger>
                      <TooltipContent>{sale.product_name}</TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="text-sm">
                    {resolveSourceAccount(sale.source_account)}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {formatDate(sale.order_date)}
                  </TableCell>
                  <TableCell>
                    <PaymentIcon type={sale.payment_type} />
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {formatCurrency(sale.price, sale.currency_code)}
                    {sale.installments && sale.installments > 1 && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        {sale.installments}x
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={sale.purchase_status} />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
