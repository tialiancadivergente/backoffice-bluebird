import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { LaunchTierDistribution } from "@/types/launch-dashboard";

const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "A+": { bg: "bg-teal-500/10", text: "text-teal-600 dark:text-teal-400", border: "border-teal-500/30" },
  A:   { bg: "bg-teal-500/10", text: "text-teal-600 dark:text-teal-400", border: "border-teal-500/30" },
  B:   { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/30" },
  C:   { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/30" },
  D:   { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", border: "border-orange-500/30" },
  E:   { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400", border: "border-red-500/30" },
};

function defaultColor() {
  return { bg: "bg-muted", text: "text-muted-foreground", border: "border-border" };
}

interface Props {
  data?: LaunchTierDistribution;
  isLoading: boolean;
}

export function LaunchTierDistribution({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-3 pb-3 px-3 space-y-2">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-6 w-14" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data || data.distribution.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
        Nenhum lead com leadscore calculado no período.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {data.distribution.map((item) => {
        const colors = TIER_COLORS[item.tier] ?? defaultColor();
        return (
          <Card
            key={item.tier}
            className={`border ${colors.border} ${colors.bg}`}
          >
            <CardContent className="pt-3 pb-3 px-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Faixa {item.tier}
              </p>
              <p className={`text-2xl font-bold tabular-nums mt-1 ${colors.text}`}>
                {item.percentage.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}%
              </p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
                <div
                  className={`h-1.5 rounded-full ${colors.text.replace("text-", "bg-").split(" ")[0]}`}
                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 tabular-nums">
                {item.count.toLocaleString("pt-BR")} leads
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
