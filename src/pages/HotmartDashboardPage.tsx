import { useState } from "react";
import { format } from "date-fns";
import { useHotmartSummary, useHotmartSales } from "@/hooks/use-hotmart";
import { HotmartSummaryCards } from "@/components/hotmart/HotmartSummaryCards";
import { HotmartSalesFilters } from "@/components/hotmart/HotmartSalesFilters";
import { HotmartSalesTable } from "@/components/hotmart/HotmartSalesTable";
import { HotmartSalesPagination } from "@/components/hotmart/HotmartSalesPagination";
import { HotmartProductConfig } from "@/components/hotmart/HotmartProductConfig";
import { HotmartSyncSection } from "@/components/admin/hotmart/HotmartSyncSection";
import { HotmartSyncSchedules } from "@/components/hotmart/HotmartSyncSchedules";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import type { HotmartSalesFilters as HotmartSalesFiltersType } from "@/types/hotmart";

function toDateParam(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export default function HotmartDashboardPage() {
  const [activeTab, setActiveTab] = useState("resumo");

  // Shared filters (both tabs)
  const [from, setFrom] = useState<Date | undefined>(undefined);
  const [to, setTo] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [sourceAccount, setSourceAccount] = useState<string | undefined>(undefined);

  // Transactions-specific filters
  const [productId, setProductId] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const summaryFilters = {
    ...(from ? { from: toDateParam(from) } : {}),
    ...(to ? { to: toDateParam(to) } : {}),
    ...(sourceAccount ? { sourceAccount } : {}),
  };

  const salesFilters: HotmartSalesFiltersType = {
    page,
    limit,
    ...(from ? { from: toDateParam(from) } : {}),
    ...(to ? { to: toDateParam(to) } : {}),
    ...(status ? { status } : {}),
    ...(sourceAccount ? { sourceAccount } : {}),
    ...(productId ? { productId } : {}),
  };

  const summaryQuery = useHotmartSummary(summaryFilters);
  const salesQuery = useHotmartSales(salesFilters, activeTab === "transacoes");

  const products = summaryQuery.data?.by_product ?? [];

  const handleFromChange = (date: Date | undefined) => { setFrom(date); setPage(1); };
  const handleToChange = (date: Date | undefined) => { setTo(date); setPage(1); };
  const handleStatusChange = (val: string | undefined) => { setStatus(val); setPage(1); };
  const handleSourceAccountChange = (val: string | undefined) => { setSourceAccount(val); setPage(1); };

  const handleClear = () => {
    setFrom(undefined);
    setTo(undefined);
    setStatus(undefined);
    setSourceAccount(undefined);
    setProductId(undefined);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Vendas Hotmart</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Resumo de vendas e receita da plataforma Hotmart.
        </p>
      </div>

      {/* Shared filters — applied to resumo and transacoes tabs only */}
      {activeTab !== "configuracao" && <HotmartSalesFilters
        from={from}
        to={to}
        status={status}
        sourceAccount={sourceAccount}
        onFromChange={handleFromChange}
        onToChange={handleToChange}
        onStatusChange={handleStatusChange}
        onSourceAccountChange={handleSourceAccountChange}
        onClear={handleClear}
      />}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="transacoes">Transações</TabsTrigger>
          <TabsTrigger value="configuracao">Configuração</TabsTrigger>
          <TabsTrigger value="sincronizacao">Sincronização</TabsTrigger>
        </TabsList>

        {/* ── Resumo ──────────────────────────────────────────────── */}
        <TabsContent value="resumo" className="space-y-4 mt-4">
          {summaryQuery.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>Não foi possível carregar o resumo de vendas.</AlertDescription>
            </Alert>
          )}
          <HotmartSummaryCards data={summaryQuery.data} isLoading={summaryQuery.isLoading} />
        </TabsContent>

        {/* ── Transações ──────────────────────────────────────────── */}
        <TabsContent value="transacoes" className="space-y-4 mt-4">
          {/* Product filter (populated from summary) */}
          {products.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-foreground">Produto</span>
              <Select
                value={productId ? String(productId) : "all"}
                onValueChange={(val) => {
                  setProductId(val === "all" ? undefined : Number(val));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Todos os produtos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os produtos</SelectItem>
                  {products.map((p) => (
                    <SelectItem key={p.product_id} value={String(p.product_id)}>
                      {p.product_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {salesQuery.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>Não foi possível carregar as transações.</AlertDescription>
            </Alert>
          )}

          <HotmartSalesTable
            items={salesQuery.data?.data ?? []}
            isLoading={salesQuery.isLoading}
            isError={salesQuery.isError}
            total={salesQuery.data?.total ?? 0}
            from={from ? toDateParam(from) : undefined}
            to={to ? toDateParam(to) : undefined}
          />

          <HotmartSalesPagination
            page={page}
            limit={limit}
            total={salesQuery.data?.total ?? 0}
            onPageChange={setPage}
            onLimitChange={(n) => { setLimit(n); setPage(1); }}
          />
        </TabsContent>

        {/* ── Configuração ────────────────────────────────────────── */}
        <TabsContent value="configuracao" className="mt-4">
          <HotmartProductConfig />
        </TabsContent>

        {/* ── Sincronização ───────────────────────────────────────── */}
        <TabsContent value="sincronizacao" className="space-y-6 mt-4">
          <HotmartSyncSection />
          <HotmartSyncSchedules />
        </TabsContent>
      </Tabs>
    </div>
  );
}
