import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import {
  formatCurrencyBRL,
  formatDatePtBr,
  formatInteger,
  formatPercent,
} from "@/lib/marketing-dashboard-formatters";
import type { MarketingDashboardTimeseriesPoint } from "@/types/marketing-dashboard";

interface MarketingDashboardTimeseriesChartProps {
  data: MarketingDashboardTimeseriesPoint[];
  selectedMetric: string;
  onMetricChange: (metric: string) => void;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

type MetricConfig = {
  key: keyof MarketingDashboardTimeseriesPoint;
  label: string;
  format: (value: number | null | undefined) => string;
};

const METRIC_OPTIONS: MetricConfig[] = [
  { key: "spend", label: "Investimento", format: formatCurrencyBRL },
  { key: "registrations", label: "Cadastros", format: formatInteger },
  { key: "conversions", label: "Conversoes", format: formatInteger },
  { key: "cpl", label: "CPL", format: formatCurrencyBRL },
  { key: "ctr", label: "CTR", format: formatPercent },
  { key: "clicks", label: "Cliques", format: formatInteger },
  { key: "impressions", label: "Impressoes", format: formatInteger },
  { key: "cpc", label: "CPC", format: formatCurrencyBRL },
  { key: "cpm", label: "CPM", format: formatCurrencyBRL },
];

const chartConfig: ChartConfig = {
  value: {
    label: "Valor",
    color: "hsl(var(--primary))",
  },
};

function resolveMetric(key: string) {
  return METRIC_OPTIONS.find((item) => item.key === key) ?? METRIC_OPTIONS[0];
}

export function MarketingDashboardTimeseriesChart({
  data,
  selectedMetric,
  onMetricChange,
  isLoading,
  isError,
  onRetry,
}: MarketingDashboardTimeseriesChartProps) {
  const metric = useMemo(() => resolveMetric(selectedMetric), [selectedMetric]);

  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      labelDate: formatDatePtBr(item.date),
      value: item[metric.key] == null ? null : Number(item[metric.key]),
    }));
  }, [data, metric.key]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <CardTitle className="text-base">Evolucao temporal</CardTitle>
          <p className="text-sm text-muted-foreground">Serie diaria da metrica selecionada.</p>
        </div>
        <div className="w-full sm:w-[220px]">
          <Select value={metric.key} onValueChange={onMetricChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a metrica" />
            </SelectTrigger>
            <SelectContent>
              {METRIC_OPTIONS.map((option) => (
                <SelectItem key={option.key} value={option.key}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" />
                Nao foi possivel carregar o grafico.
              </p>
              <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                Tentar novamente
              </Button>
            </div>
          </div>
        ) : isLoading ? (
          <Skeleton className="h-[320px] w-full" />
        ) : chartData.length === 0 ? (
          <div className="flex h-[320px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
            Sem dados para o periodo e filtros selecionados.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[320px] w-full">
            <AreaChart data={chartData} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="labelDate"
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => metric.format(Number(value))}
                width={90}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelKey="labelDate"
                    formatter={(value) => (
                      <span className="font-mono font-medium text-foreground">{metric.format(Number(value))}</span>
                    )}
                  />
                }
              />
              <Area
                dataKey="value"
                type="monotone"
                stroke="var(--color-value)"
                fill="var(--color-value)"
                fillOpacity={0.2}
                connectNulls
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
