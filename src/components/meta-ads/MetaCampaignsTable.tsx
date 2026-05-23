import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MetaCampaignBreakdown } from "@/types/meta-ads";

type Props = {
  data?: MetaCampaignBreakdown[];
  isLoading?: boolean;
};

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

function fmtNum(n: number) {
  return new Intl.NumberFormat("pt-BR").format(n);
}

function fmtPct(s: string | null) {
  if (!s) return "—";
  return `${parseFloat(s).toFixed(2)}%`;
}

function fmtR(s: string | null) {
  if (!s) return "—";
  return `R$ ${parseFloat(s).toFixed(2)}`;
}

export function MetaCampaignsTable({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm">
        Nenhum dado disponível. Execute um sync de insights para carregar os dados.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campanha</TableHead>
            <TableHead className="text-right">Gasto</TableHead>
            <TableHead className="text-right">Impressões</TableHead>
            <TableHead className="text-right">Cliques</TableHead>
            <TableHead className="text-right">CTR</TableHead>
            <TableHead className="text-right">CPC</TableHead>
            <TableHead className="text-right">CPM</TableHead>
            <TableHead className="text-right">Pág. Vis.</TableHead>
            <TableHead className="text-right">Connect Rate</TableHead>
            <TableHead className="text-right">Leads</TableHead>
            <TableHead className="text-right">CPL</TableHead>
            <TableHead className="text-right">Checkouts</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.campaign_id}>
              <TableCell className="font-medium max-w-[200px] truncate">
                {row.campaign_name || row.campaign_id}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {fmtCurrency(row.spend)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {fmtNum(row.impressions)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {fmtNum(row.clicks)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {fmtPct(row.ctr)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {fmtR(row.cpc)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {fmtR(row.cpm)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {fmtNum(row.landing_page_views)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {fmtPct(row.connect_rate)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {fmtNum(row.leads)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {fmtR(row.cpl)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {fmtNum(row.initiate_checkouts)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
