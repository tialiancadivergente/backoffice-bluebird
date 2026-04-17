import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import type { MarketingDashboardSummaryMetrics } from "@/types/marketing-dashboard";
import {
  formatCurrencyBRL,
  formatInteger,
  formatPercent,
} from "@/lib/marketing-dashboard-formatters";

interface MarketingDashboardSummaryCardsProps {
  data?: MarketingDashboardSummaryMetrics;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

type MetricConfig = {
  key: keyof MarketingDashboardSummaryMetrics;
  label: string;
  format: (value: number | null | undefined) => string;
};

const METRICS: MetricConfig[] = [
  { key: "spend", label: "Investimento", format: formatCurrencyBRL },
  { key: "impressions", label: "Impressoes", format: formatInteger },
  { key: "clicks", label: "Cliques", format: formatInteger },
  { key: "conversions", label: "Conversoes", format: formatInteger },
  { key: "registrations", label: "Cadastros", format: formatInteger },
  { key: "cpc", label: "CPC", format: formatCurrencyBRL },
  { key: "ctr", label: "CTR", format: formatPercent },
  { key: "cpm", label: "CPM", format: formatCurrencyBRL },
  { key: "cpl", label: "CPL", format: formatCurrencyBRL },
];

export function MarketingDashboardSummaryCards({
  data,
  isLoading,
  isError,
  onRetry,
}: MarketingDashboardSummaryCardsProps) {
  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Nao foi possivel carregar os indicadores.
          </p>
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {METRICS.map((metric) => (
        <Card key={metric.key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-28" />
            ) : (
              <p className="text-2xl font-semibold text-foreground">{metric.format(data?.[metric.key])}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
