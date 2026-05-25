import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import type { LaunchDashboardSummary } from "@/types/launch-dashboard";

function fmt(value: number | null | undefined, decimals = 2): string {
  if (value == null) return "—";
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtPct(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${(value * 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

function fmtCurrency(value: number | null | undefined): string {
  if (value == null) return "—";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

function fmtInt(value: number | null | undefined): string {
  if (value == null) return "—";
  return value.toLocaleString("pt-BR");
}

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}

function KpiCard({ label, value, sub, highlight }: KpiCardProps) {
  return (
    <Card className={highlight ? "border-primary/40 bg-primary/5" : undefined}>
      <CardContent className="pt-4 pb-3 px-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold mt-1 tabular-nums">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

interface Props {
  data?: LaunchDashboardSummary;
  isLoading: boolean;
  isError: boolean;
}

export function LaunchKpiCards({ data, isLoading, isError }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-4 pb-3 px-4 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <AlertCircle className="h-4 w-4" />
        Falha ao carregar indicadores.
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-3">
      {/* Row 1 — Media */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard
          label="Gasto"
          value={fmtCurrency(data.spend)}
          sub={`CPM ${fmtCurrency(data.cpm)}`}
        />
        <KpiCard
          label="Impressões"
          value={fmtInt(data.impressions)}
          sub={`CTR ${fmtPct(data.ctr)}`}
        />
        <KpiCard
          label="Cliques"
          value={fmtInt(data.clicks)}
          sub={`CPC ${fmtCurrency(data.cpc)}`}
        />
        <KpiCard
          label="Cliques link"
          value={fmtInt(data.inlineLinkClicks)}
          sub={`Connect Rate ${fmtPct(data.connectRate)}`}
        />
        <KpiCard
          label="Pág. Visualizadas"
          value={fmtInt(data.landingPageViews)}
          sub={`Tx PgV→Checkout ${fmtPct(data.txPgvCheckout)}`}
        />
      </div>

      {/* Row 2 — Funil CRM + Hotmart */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard
          label="Leads"
          value={fmtInt(data.leads)}
          sub={`CPL ${fmtCurrency(data.cpl)}`}
        />
        <KpiCard
          label="Inicios Checkout"
          value={fmtInt(data.initiateCheckouts)}
        />
        <KpiCard
          label="Vendas Hotmart"
          value={fmtInt(data.sales)}
          sub={`CPA ${fmtCurrency(data.cpa)}`}
          highlight
        />
        <KpiCard
          label="Receita"
          value={fmtCurrency(data.revenue)}
          highlight
        />
        <KpiCard
          label="Tx Checkout→Venda"
          value={fmtPct(data.txCheckoutSale)}
          highlight
        />
      </div>
    </div>
  );
}
