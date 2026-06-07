import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings } from "lucide-react";
import type { LaunchAwarenessMetrics, LaunchDashboardConfig } from "@/types/launch-dashboard";

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
    <span className={`inline-block h-2 w-2 rounded-full ${STATUS_DOT[status]}`} />
  );
}

function fmtPct(v: number | null | undefined) {
  if (v == null) return "—";
  return `${(v * 100).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

interface AwarenessCardProps {
  label: string;
  sublabel: string;
  value: string;
  status: MetricStatus;
  unconfigured?: boolean;
}

function AwarenessCard({ label, sublabel, value, status, unconfigured }: AwarenessCardProps) {
  return (
    <Card className={unconfigured ? "opacity-60 border-dashed" : undefined}>
      <CardContent className="pt-4 pb-3 px-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide leading-tight">
            {label}
          </p>
          <StatusDot status={status} />
        </div>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>
        {unconfigured && (
          <p className="text-xs text-muted-foreground/60 mt-1 flex items-center gap-1">
            <Settings className="h-3 w-3" />
            Configure a pergunta
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface Props {
  data?: LaunchAwarenessMetrics;
  config?: LaunchDashboardConfig | null;
  isLoading: boolean;
}

export function LaunchAwarenessCards({ data, config, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-4 pb-3 px-4 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const surveyStatus = computeStatus(
    data.surveyResponseRate,
    config?.targetSurveyResponseRate,
    "higher_better",
  );

  const consciousnessStatus = computeStatus(
    data.consciousnessRate,
    config?.targetConsciousnessRate,
    "higher_better",
  );

  const knowsEltonStatus = computeStatus(
    data.knowsEltonRate,
    config?.targetKnowsEltonRate,
    "higher_better",
  );

  const knowsAllianceStatus = computeStatus(
    data.knowsAllianceRate,
    config?.targetKnowsAllianceRate,
    "higher_better",
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <AwarenessCard
        label="Taxa Resposta Pesquisa"
        sublabel="Engajamento"
        value={fmtPct(data.surveyResponseRate)}
        status={surveyStatus}
      />
      <AwarenessCard
        label="Taxa de Consciência"
        sublabel="Métrica de Consciência"
        value={fmtPct(data.consciousnessRate)}
        status={consciousnessStatus}
        unconfigured={!data.configured.consciousness}
      />
      <AwarenessCard
        label="Taxa Conhece Elton"
        sublabel="Métrica de Consciência"
        value={fmtPct(data.knowsEltonRate)}
        status={knowsEltonStatus}
        unconfigured={!data.configured.knowsElton}
      />
      <AwarenessCard
        label="Taxa Conhece Aliança"
        sublabel="Métrica de Consciência"
        value={fmtPct(data.knowsAllianceRate)}
        status={knowsAllianceStatus}
        unconfigured={!data.configured.knowsAlliance}
      />
    </div>
  );
}
