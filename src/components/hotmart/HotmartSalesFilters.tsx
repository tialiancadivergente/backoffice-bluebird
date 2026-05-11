import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_OPTIONS = [
  { value: "APPROVED", label: "Aprovada" },
  { value: "COMPLETE", label: "Completa" },
  { value: "WAITING_PAYMENT", label: "Aguardando" },
  { value: "PRINTED_BILLET", label: "Boleto gerado" },
  { value: "CANCELLED", label: "Cancelada" },
  { value: "REFUNDED", label: "Reembolsada" },
];

interface HotmartSalesFiltersProps {
  from: Date | undefined;
  to: Date | undefined;
  status: string | undefined;
  sourceAccount: string | undefined;
  onFromChange: (date: Date | undefined) => void;
  onToChange: (date: Date | undefined) => void;
  onStatusChange: (status: string | undefined) => void;
  onSourceAccountChange: (account: string | undefined) => void;
  onClear: () => void;
}

export function HotmartSalesFilters({
  from,
  to,
  status,
  sourceAccount,
  onFromChange,
  onToChange,
  onStatusChange,
  onSourceAccountChange,
  onClear,
}: Readonly<HotmartSalesFiltersProps>) {
  const hasFilters = !!(from || to || status || sourceAccount);

  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Data início */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium text-foreground">Data Início</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[180px] justify-start text-left font-normal",
                !from && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {from ? format(from, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={from}
              onSelect={onFromChange}
              disabled={(date) => date > new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Data fim */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium text-foreground">Data Fim</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[180px] justify-start text-left font-normal",
                !to && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {to ? format(to, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={to}
              onSelect={onToChange}
              disabled={(date) => date > new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Status */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium text-foreground">Status</span>
        <Select
          value={status ?? "all"}
          onValueChange={(val) => onStatusChange(val === "all" ? undefined : val)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Conta */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium text-foreground">Conta</span>
        <Select
          value={sourceAccount ?? "all"}
          onValueChange={(val) => onSourceAccountChange(val === "all" ? undefined : val)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todas as contas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as contas</SelectItem>
            <SelectItem value="alianca_divergente">Aliança Divergente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear} className="gap-1.5">
          <X className="h-3.5 w-3.5" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
