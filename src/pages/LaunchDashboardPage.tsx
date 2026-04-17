import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketingDashboardFilters } from "@/components/marketing-dashboard/MarketingDashboardFilters";
import { MarketingDashboardSummaryCards } from "@/components/marketing-dashboard/MarketingDashboardSummaryCards";
import { MarketingDashboardTimeseriesChart } from "@/components/marketing-dashboard/MarketingDashboardTimeseriesChart";
import { MarketingDashboardTable } from "@/components/marketing-dashboard/MarketingDashboardTable";
import { MarketingDashboardTablePagination } from "@/components/marketing-dashboard/MarketingDashboardTablePagination";
import {
  useMarketingDashboardFilterOptions,
  useMarketingDashboardSummary,
  useMarketingDashboardTable,
  useMarketingDashboardTimeseries,
} from "@/hooks/use-marketing-dashboard";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type {
  MarketingDashboardFilterOptions,
  MarketingDashboardFilters as MarketingDashboardFiltersType,
  MarketingDashboardSortOrder,
  MarketingDashboardTableParams,
} from "@/types/marketing-dashboard";

function toDateParam(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDefaultDateFilters(): MarketingDashboardFiltersType {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  return {
    dateFrom: toDateParam(yesterday),
    dateTo: toDateParam(today),
  };
}

const INITIAL_SORT: {
  sortBy: MarketingDashboardTableParams["sortBy"];
  sortOrder: MarketingDashboardSortOrder;
} = {
  sortBy: "spend",
  sortOrder: "desc",
};

export default function LaunchDashboardPage() {
  const [filters, setFilters] = useState<MarketingDashboardFiltersType>(() => getDefaultDateFilters());

  const [selectedMetric, setSelectedMetric] = useState("spend");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<MarketingDashboardTableParams["sortBy"]>(INITIAL_SORT.sortBy);
  const [sortOrder, setSortOrder] = useState<MarketingDashboardSortOrder>(INITIAL_SORT.sortOrder);

  const debouncedFilters = useDebouncedValue(filters, 450);

  const filtersQuery = useMarketingDashboardFilterOptions(filters);

  const summaryQuery = useMarketingDashboardSummary(debouncedFilters);
  const timeseriesQuery = useMarketingDashboardTimeseries(debouncedFilters);

  const tableParams = useMemo(
    () => ({
      ...debouncedFilters,
      page,
      perPage,
      sortBy,
      sortOrder,
    }),
    [debouncedFilters, page, perPage, sortBy, sortOrder],
  );

  const tableQuery = useMarketingDashboardTable(tableParams);

  const filterOptions: MarketingDashboardFilterOptions = filtersQuery.data?.options ?? {
    providers: [],
    accounts: [],
    campaigns: [],
    adsets: [],
    ads: [],
    launches: [],
    seasons: [],
  };

  const hasAnyData =
    (summaryQuery.data?.summary.impressions ?? 0) > 0 ||
    (timeseriesQuery.data?.timeseries.length ?? 0) > 0 ||
    (tableQuery.data?.items.length ?? 0) > 0;

  const handleClearFilters = () => {
    const defaultDateFilters = getDefaultDateFilters();
    setFilters(defaultDateFilters);
    setPage(1);
  };

  const handleChangeFilters = (value: Partial<MarketingDashboardFiltersType>) => {
    setFilters((previous) => ({ ...previous, ...value }));
    setPage(1);
  };

  const handleSort = (nextSortBy: MarketingDashboardTableParams["sortBy"]) => {
    if (!nextSortBy) return;

    if (sortBy === nextSortBy) {
      setSortOrder((previousOrder) => (previousOrder === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(nextSortBy);
      setSortOrder("desc");
    }

    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard de Lancamentos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitoramento de performance de midia e cadastros por anuncio.
        </p>
      </div>

      <MarketingDashboardFilters
        filters={filters}
        options={filterOptions}
        onChange={handleChangeFilters}
        onClear={handleClearFilters}
        isLoadingOptions={filtersQuery.isLoading || filtersQuery.isFetching}
      />

      {!summaryQuery.isLoading && !timeseriesQuery.isLoading && !tableQuery.isLoading && !hasAnyData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nenhum dado encontrado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Nao encontramos registros para o periodo e filtros selecionados. Isso pode acontecer quando a trilha
              ad/day ainda esta em preenchimento ou quando os filtros estao restritivos.
            </p>
            <Button type="button" variant="outline" onClick={handleClearFilters}>
              Limpar filtros
            </Button>
          </CardContent>
        </Card>
      )}

      <section className="space-y-3" aria-label="Resumo de indicadores">
        <div>
          <h2 className="text-base font-semibold text-foreground">Resumo</h2>
          <p className="text-sm text-muted-foreground">Indicadores agregados retornados pelo backend.</p>
        </div>
        <MarketingDashboardSummaryCards
          data={summaryQuery.data?.summary}
          isLoading={summaryQuery.isLoading}
          isError={summaryQuery.isError}
          onRetry={() => summaryQuery.refetch()}
        />
      </section>

      <section className="space-y-3" aria-label="Evolucao das metricas">
        <MarketingDashboardTimeseriesChart
          data={timeseriesQuery.data?.timeseries ?? []}
          selectedMetric={selectedMetric}
          onMetricChange={setSelectedMetric}
          isLoading={timeseriesQuery.isLoading}
          isError={timeseriesQuery.isError}
          onRetry={() => timeseriesQuery.refetch()}
        />
      </section>

      <section className="space-y-3" aria-label="Tabela detalhada por anuncio">
        <div>
          <h2 className="text-base font-semibold text-foreground">Detalhamento por anuncio</h2>
          <p className="text-sm text-muted-foreground">Dados paginados e ordenados diretamente no backend.</p>
        </div>

        <MarketingDashboardTable
          items={tableQuery.data?.items ?? []}
          isLoading={tableQuery.isLoading}
          isError={tableQuery.isError}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onRetry={() => tableQuery.refetch()}
        />

        {tableQuery.data?.meta && tableQuery.data.meta.totalPages > 0 && (
          <MarketingDashboardTablePagination
            meta={tableQuery.data.meta}
            onPageChange={setPage}
            onPerPageChange={(nextPerPage) => {
              setPerPage(nextPerPage);
              setPage(1);
            }}
          />
        )}
      </section>
    </div>
  );
}
