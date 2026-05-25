import { useState } from "react";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { MetaPerformanceFilters, MetaPublisherPlatform } from "@/types/meta-ads";

type Props = {
  filters: MetaPerformanceFilters;
  onChange: (f: MetaPerformanceFilters) => void;
  accounts?: Array<{ id: string; name: string }>;
};

export function MetaFilters({ filters, onChange, accounts }: Props) {
  function set(partial: Partial<MetaPerformanceFilters>) {
    onChange({ ...filters, ...partial });
  }

  function clear() {
    onChange({});
  }

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Date From */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "w-[130px] justify-start text-left font-normal",
              !filters.dateFrom && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.dateFrom
              ? format(new Date(filters.dateFrom + "T12:00:00"), "dd/MM/yyyy")
              : "De"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.dateFrom ? new Date(filters.dateFrom + "T12:00:00") : undefined}
            onSelect={(d) => set({ dateFrom: d ? format(d, "yyyy-MM-dd") : undefined })}
            locale={ptBR}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Date To */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "w-[130px] justify-start text-left font-normal",
              !filters.dateTo && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.dateTo
              ? format(new Date(filters.dateTo + "T12:00:00"), "dd/MM/yyyy")
              : "Até"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.dateTo ? new Date(filters.dateTo + "T12:00:00") : undefined}
            onSelect={(d) => set({ dateTo: d ? format(d, "yyyy-MM-dd") : undefined })}
            locale={ptBR}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Platform */}
      <Select
        value={filters.platform ?? "all"}
        onValueChange={(v) =>
          set({ platform: v === "all" ? undefined : (v as MetaPublisherPlatform) })
        }
      >
        <SelectTrigger className="w-[150px] h-9">
          <SelectValue placeholder="Plataforma" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas plataformas</SelectItem>
          <SelectItem value="total">Total (sem breakdown)</SelectItem>
          <SelectItem value="facebook">Facebook</SelectItem>
          <SelectItem value="instagram">Instagram</SelectItem>
          <SelectItem value="audience_network">Audience Network</SelectItem>
          <SelectItem value="messenger">Messenger</SelectItem>
        </SelectContent>
      </Select>

      {/* Account (optional) */}
      {accounts && accounts.length > 0 && (
        <Select
          value={filters.accountId ?? "all"}
          onValueChange={(v) => set({ accountId: v === "all" ? undefined : v })}
        >
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Conta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as contas</SelectItem>
            {accounts.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clear}>
          <X className="mr-1 h-3.5 w-3.5" />
          Limpar
        </Button>
      )}
    </div>
  );
}
