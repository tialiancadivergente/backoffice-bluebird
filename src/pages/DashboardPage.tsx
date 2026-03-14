import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Package } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ElementType;
}

function StatCard({ title, value, change, trend, icon: Icon }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card hover:shadow-elevated transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div className="p-2 rounded-lg bg-muted">
          <Icon className="w-4 h-4 text-accent" />
        </div>
      </div>
      <p className="text-2xl font-semibold text-foreground mb-1">{value}</p>
      <div className="flex items-center gap-1">
        {trend === "up" ? (
          <TrendingUp className="w-4 h-4 text-accent" />
        ) : (
          <TrendingDown className="w-4 h-4 text-destructive" />
        )}
        <span className={trend === "up" ? "text-sm text-accent" : "text-sm text-destructive"}>
          {change}
        </span>
        <span className="text-sm text-muted-foreground ml-1">vs mês anterior</span>
      </div>
    </div>
  );
}

const stats: StatCardProps[] = [
  { title: "Receita Total", value: "R$ 45.231,89", change: "+20.1%", trend: "up", icon: DollarSign },
  { title: "Clientes Ativos", value: "2.350", change: "+18.2%", trend: "up", icon: Users },
  { title: "Pedidos", value: "1.234", change: "-4.5%", trend: "down", icon: ShoppingCart },
  { title: "Produtos", value: "573", change: "+12.3%", trend: "up", icon: Package },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Visão geral do seu negócio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Placeholder for future charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-6 h-80 shadow-card flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Gráfico de Vendas — em breve</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 h-80 shadow-card flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Pedidos Recentes — em breve</p>
        </div>
      </div>
    </div>
  );
}
