import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import type { LaunchDashboardConfig, LaunchDashboardSummary } from "@/types/launch-dashboard";

// ─── Formatters ───────────────────────────────────────────────────────────────

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

// ─── Status ───────────────────────────────────────────────────────────────────

type MetricStatus = "on_target" | "attention" | "action_needed" | "no_target";

function computeStatus(
  actual: number | null | undefined,
  target: number | null | undefined,
  direction: "higher_better" | "lower_better",
): MetricStatus {
  if (actual == null || target == null || target === 0) return "no_target";
  const ratio = direction === "higher_better" ? actual / target : target / actual;
  if (ratio >= 1) return "on_target";
  if (ratio >= 0.9) return "attention";
  return "action_needed";
}

const STATUS_DOT: Record<MetricStatus, string> = {
  on_target: "bg-teal-500",
  attention: "bg-amber-500",
  action_needed: "bg-red-500",
  no_target: "bg-muted-foreground/30",
};

function StatusDot({ status }: { status: MetricStatus }) {
  return (
    <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[status]}`} />
  );
}

// ─── KpiCard ──────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  status?: MetricStatus;
  metaLine?: string;
  subStatus?: MetricStatus;
  subMetaLine?: string;
}

function KpiCard({ label, value, sub, highlight, status, metaLine, subStatus, subMetaLine }: KpiCardProps) {
  const dotStatus = status ?? subStatus ?? "no_target";
  return (
    <Card className={highlight ? "border-primary/40 bg-primary/5" : undefined}>
      <CardContent className="pt-4 pb-3 px-4">
        <div className="flex items-start justify-between gap-1 mb-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide leading-tight">
            {label}
          </p>
          <StatusDot status={dotStatus} />
        </div>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        {metaLine && (
          <p className="text-xs text-muted-foreground/70 mt-0.5 uppercase tracking-wide font-medium">
            {metaLine}
          </p>
        )}
        {sub && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {sub}
            {subStatus && subStatus !== "no_target" && (
              <span className={`inline-block h-1.5 w-1.5 rounded-full ml-1.5 mb-0.5 align-middle ${STATUS_DOT[subStatus]}`} />
            )}
          </p>
        )}
        {subMetaLine && (
          <p className="text-xs text-muted-foreground/60 uppercase tracking-wide font-medium">
            {subMetaLine}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  data?: LaunchDashboardSummary;
  config?: LaunchDashboardConfig | null;
  isLoading: boolean;
  isError: boolean;
}

export function LaunchKpiCards({ data, config, isLoading, isError }: Props) {
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

  const c = config;

  return (
    <div className="space-y-3">
      {/* Row 1 — Media */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard
          label="Gasto"
          value={fmtCurrency(data.spend)}
          status={computeStatus(data.spend, c?.targetSpend, "higher_better")}
          metaLine={c?.targetSpend ? `Meta: ${fmtCurrency(c.targetSpend)}` : undefined}
          sub={`CPM ${fmtCurrency(data.cpm)}`}
          subStatus={computeStatus(data.cpm, c?.targetCpm, "lower_better")}
          subMetaLine={c?.targetCpm ? `Meta CPM: ${fmtCurrency(c.targetCpm)}` : undefined}
        />
        <KpiCard
          label="Impressões"
          value={fmtInt(data.impressions)}
          sub={`CTR ${fmtPct(data.ctr)}`}
          subStatus={computeStatus(data.ctr, c?.targetCtr, "higher_better")}
          subMetaLine={c?.targetCtr ? `Meta CTR: ${fmtPct(c.targetCtr)}` : undefined}
        />
        <KpiCard
          label="Cliques"
          value={fmtInt(data.clicks)}
          sub={`CPC ${fmtCurrency(data.cpc)}`}
          subStatus={computeStatus(data.cpc, c?.targetCpc, "lower_better")}
          subMetaLine={c?.targetCpc ? `Meta CPC: ${fmtCurrency(c.targetCpc)}` : undefined}
        />
        <KpiCard
          label="Cliques Link"
          value={fmtInt(data.inlineLinkClicks)}
          sub={`Connect Rate ${fmtPct(data.connectRate)}`}
          subStatus={computeStatus(data.connectRate, c?.targetConnectRate, "higher_better")}
          subMetaLine={c?.targetConnectRate ? `Meta: ${fmtPct(c.targetConnectRate)}` : undefined}
        />
        <KpiCard
          label="Pág. Visualizadas"
          value={fmtInt(data.landingPageViews)}
          sub={`Tx PgV→Checkout ${fmtPct(data.txPgvCheckout)}`}
          subStatus={computeStatus(data.txPgvCheckout, c?.targetPageConversion, "higher_better")}
          subMetaLine={c?.targetPageConversion ? `Meta: ${fmtPct(c.targetPageConversion)}` : undefined}
        />
      </div>

      {/* Row 2 — Funil CRM + Hotmart */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard
          label="Leads"
          value={fmtInt(data.leads)}
          status={computeStatus(data.leads, c?.targetLeads, "higher_better")}
          metaLine={c?.targetLeads ? `Meta: ${fmtInt(c.targetLeads)}` : undefined}
          sub={`CPL ${fmtCurrency(data.cpl)}`}
          subStatus={computeStatus(data.cpl, c?.targetCpl, "lower_better")}
          subMetaLine={c?.targetCpl ? `Meta CPL: ${fmtCurrency(c.targetCpl)}` : undefined}
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
