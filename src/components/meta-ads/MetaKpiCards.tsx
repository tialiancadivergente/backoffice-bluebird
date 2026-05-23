import { TrendingUp, Eye, MousePointer, DollarSign, Users, ShoppingCart, Play, Link } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MetaPerformanceSummary } from "@/types/meta-ads";

type Props = {
  summary?: MetaPerformanceSummary;
  isLoading?: boolean;
};

function fmtNum(n: number) {
  return new Intl.NumberFormat("pt-BR").format(n);
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(n);
}

function fmtPct(s: string | null) {
  if (!s) return "—";
  return `${parseFloat(s).toFixed(2)}%`;
}

function fmtDecimal(s: string | null, prefix = "") {
  if (!s) return "—";
  return `${prefix}${parseFloat(s).toFixed(2)}`;
}

type KpiCardProps = {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color?: string;
};

function KpiCard({ label, value, sub, icon: Icon, color = "text-primary" }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide truncate">
              {label}
            </p>
            <p className="text-2xl font-bold tabular-nums">{value}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div className={`rounded-lg p-2 bg-muted/50 ${color} shrink-0 ml-2`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function KpiSkeleton() {
  return (
    <Card>
      <CardContent className="pt-4 pb-4 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-3 w-16" />
      </CardContent>
    </Card>
  );
}

export function MetaKpiCards({ summary, isLoading }: Props) {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <KpiSkeleton key={i} />
        ))}
      </div>
    );
  }

  const cards: KpiCardProps[] = [
    {
      label: "Gasto",
      value: fmtCurrency(summary.spend),
      sub: `CPM ${fmtDecimal(summary.cpm, "R$")}`,
      icon: DollarSign,
      color: "text-emerald-500",
    },
    {
      label: "Impressões",
      value: fmtNum(summary.impressions),
      sub: `CTR ${fmtPct(summary.ctr)}`,
      icon: Eye,
      color: "text-blue-500",
    },
    {
      label: "Cliques",
      value: fmtNum(summary.clicks),
      sub: `CPC ${fmtDecimal(summary.cpc, "R$")}`,
      icon: MousePointer,
      color: "text-violet-500",
    },
    {
      label: "Cliques (link)",
      value: fmtNum(summary.link_clicks),
      sub: `Connect Rate ${fmtPct(summary.connect_rate)}`,
      icon: Link,
      color: "text-cyan-500",
    },
    {
      label: "Pág. Visualizadas",
      value: fmtNum(summary.landing_page_views),
      sub: `Tx PgV→Checkout ${fmtPct(summary.checkout_rate)}`,
      icon: TrendingUp,
      color: "text-orange-500",
    },
    {
      label: "Leads",
      value: fmtNum(summary.leads),
      sub: `CPL ${fmtDecimal(summary.cpl, "R$")}`,
      icon: Users,
      color: "text-pink-500",
    },
    {
      label: "Inicios Checkout",
      value: fmtNum(summary.initiate_checkouts),
      icon: ShoppingCart,
      color: "text-amber-500",
    },
    {
      label: "Alcance",
      value: fmtNum(summary.reach),
      icon: Eye,
      color: "text-teal-500",
    },
    {
      label: "Thruplay",
      value: fmtNum(summary.video_thruplay),
      sub: "vídeos assistidos até o fim",
      icon: Play,
      color: "text-rose-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {cards.map((c) => (
        <KpiCard key={c.label} {...c} />
      ))}
    </div>
  );
}
