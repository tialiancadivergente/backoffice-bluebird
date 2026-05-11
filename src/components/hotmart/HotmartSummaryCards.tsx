import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { HotmartSummary } from "@/types/hotmart";

interface Props {
  data: HotmartSummary | undefined;
  isLoading: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function StatCard({
  title,
  value,
  isLoading,
}: Readonly<{
  title: string;
  value: string | number;
  isLoading: boolean;
}>) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function HotmartSummaryCards({ data, isLoading }: Readonly<Props>) {
  const approvedRevenue =
    (data?.by_status["APPROVED"] ?? 0) + (data?.by_status["COMPLETE"] ?? 0);

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Vendas"
          value={isLoading ? "—" : (data?.total_sales ?? 0)}
          isLoading={isLoading}
        />
        <StatCard
          title="Receita Total"
          value={isLoading ? "—" : formatCurrency(data?.total_revenue ?? 0)}
          isLoading={isLoading}
        />
        <StatCard
          title="Aprovadas / Completas"
          value={isLoading ? "—" : approvedRevenue}
          isLoading={isLoading}
        />
        <StatCard
          title="Canceladas / Reembolsadas"
          value={
            isLoading
              ? "—"
              : (data?.by_status["CANCELLED"] ?? 0) + (data?.by_status["REFUNDED"] ?? 0)
          }
          isLoading={isLoading}
        />
      </div>

      {/* Por produto */}
      {(isLoading || (data?.by_product && data.by_product.length > 0)) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vendas por Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Qtd. Vendas</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading &&
                    ["produto-1", "produto-2", "produto-3"].map((key) => (
                      <TableRow key={key}>
                        <TableCell>
                          <Skeleton className="h-4 w-40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-12 ml-auto" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))}

                  {!isLoading &&
                    data?.by_product.map((item) => (
                      <TableRow key={item.product_id}>
                        <TableCell className="text-sm">{item.product_name}</TableCell>
                        <TableCell className="text-right text-sm">{item.count}</TableCell>
                        <TableCell className="text-right text-sm">
                          {formatCurrency(item.revenue)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
