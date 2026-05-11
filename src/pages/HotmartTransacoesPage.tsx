import { useState } from "react";
import { format } from "date-fns";
import { useHotmartSales } from "@/hooks/use-hotmart";
import { HotmartSalesFilters } from "@/components/hotmart/HotmartSalesFilters";
import { HotmartSalesTable } from "@/components/hotmart/HotmartSalesTable";
import { HotmartSalesPagination } from "@/components/hotmart/HotmartSalesPagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { HotmartSalesFilters as HotmartSalesFiltersType } from "@/types/hotmart";

function toDateParam(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export default function HotmartTransacoesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [from, setFrom] = useState<Date | undefined>(undefined);
  const [to, setTo] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [sourceAccount, setSourceAccount] = useState<string | undefined>(undefined);

  const filters: HotmartSalesFiltersType = {
    page,
    limit,
    ...(from ? { from: toDateParam(from) } : {}),
    ...(to ? { to: toDateParam(to) } : {}),
    ...(status ? { status } : {}),
    ...(sourceAccount ? { sourceAccount } : {}),
  };

  const { data, isLoading, isError } = useHotmartSales(filters);

  const items = data?.data ?? [];
  const total = data?.total ?? 0;

  const handleFromChange = (date: Date | undefined) => {
    setFrom(date);
    setPage(1);
  };

  const handleToChange = (date: Date | undefined) => {
    setTo(date);
    setPage(1);
  };

  const handleStatusChange = (val: string | undefined) => {
    setStatus(val);
    setPage(1);
  };

  const handleSourceAccountChange = (val: string | undefined) => {
    setSourceAccount(val);
    setPage(1);
  };

  const handleClear = () => {
    setFrom(undefined);
    setTo(undefined);
    setStatus(undefined);
    setSourceAccount(undefined);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Transações Hotmart</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Listagem de todas as transações registradas na Hotmart.
        </p>
      </div>

      <HotmartSalesFilters
        from={from}
        to={to}
        status={status}
        sourceAccount={sourceAccount}
        onFromChange={handleFromChange}
        onToChange={handleToChange}
        onStatusChange={handleStatusChange}
        onSourceAccountChange={handleSourceAccountChange}
        onClear={handleClear}
      />

      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>Não foi possível carregar as transações.</AlertDescription>
        </Alert>
      )}

      <HotmartSalesTable
        items={items}
        isLoading={isLoading}
        isError={isError}
        total={total}
        from={from ? toDateParam(from) : undefined}
        to={to ? toDateParam(to) : undefined}
      />

      <HotmartSalesPagination
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
        onLimitChange={(n) => {
          setLimit(n);
          setPage(1);
        }}
      />
    </div>
  );
}
