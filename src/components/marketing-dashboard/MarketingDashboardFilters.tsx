import { useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { MarketingDashboardFilterOptions, MarketingDashboardFilters } from "@/types/marketing-dashboard";

interface MarketingDashboardFiltersProps {
  filters: MarketingDashboardFilters;
  options: MarketingDashboardFilterOptions;
  onChange: (value: Partial<MarketingDashboardFilters>) => void;
  onClear: () => void;
  isLoadingOptions: boolean;
}

function parseDate(value?: string) {
  if (!value) return undefined;

  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function toDateParam(date?: Date) {
  if (!date) return undefined;
  return format(date, "yyyy-MM-dd");
}

export function MarketingDashboardFilters({
  filters,
  options,
  onChange,
  onClear,
  isLoadingOptions,
}: Readonly<MarketingDashboardFiltersProps>) {
  const startDate = useMemo(() => parseDate(filters.dateFrom), [filters.dateFrom]);
  const endDate = useMemo(() => parseDate(filters.dateTo), [filters.dateTo]);

  const selectsDisabled = isLoadingOptions;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <div className="space-y-1.5">
          <Label htmlFor="md-date-from">Periodo - de</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="md-date-from"
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => onChange({ dateFrom: toDateParam(date) })}
                disabled={(date) => date > new Date()}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="md-date-to">Periodo - ate</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="md-date-to"
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => onChange({ dateTo: toDateParam(date) })}
                disabled={(date) => date > new Date()}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="md-provider">Provider</Label>
          <Select
            value={filters.provider ?? "all"}
            onValueChange={(value) => onChange({ provider: value === "all" ? undefined : value })}
            disabled={selectsDisabled}
          >
            <SelectTrigger id="md-provider">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {options.providers.map((provider) => (
                <SelectItem key={provider.value} value={provider.value}>
                  {provider.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="md-account">Conta</Label>
          <Select
            value={filters.externalAccountId ?? "all"}
            onValueChange={(value) => onChange({ externalAccountId: value === "all" ? undefined : value })}
            disabled={selectsDisabled}
          >
            <SelectTrigger id="md-account">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {options.accounts.map((account) => (
                <SelectItem key={account.value} value={account.value}>
                  {account.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="md-campaign">Campanha</Label>
          <Select
            value={filters.externalCampaignId ?? "all"}
            onValueChange={(value) => onChange({ externalCampaignId: value === "all" ? undefined : value })}
            disabled={selectsDisabled}
          >
            <SelectTrigger id="md-campaign">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {options.campaigns.map((campaign) => (
                <SelectItem key={campaign.value} value={campaign.value}>
                  {campaign.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="md-adset">Adset</Label>
          <Select
            value={filters.externalAdsetId ?? "all"}
            onValueChange={(value) => onChange({ externalAdsetId: value === "all" ? undefined : value })}
            disabled={selectsDisabled}
          >
            <SelectTrigger id="md-adset">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {options.adsets.map((adset) => (
                <SelectItem key={adset.value} value={adset.value}>
                  {adset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="md-ad">Anuncio</Label>
          <Select
            value={filters.externalAdId ?? "all"}
            onValueChange={(value) => onChange({ externalAdId: value === "all" ? undefined : value })}
            disabled={selectsDisabled}
          >
            <SelectTrigger id="md-ad">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {options.ads.map((ad) => (
                <SelectItem key={ad.value} value={ad.value}>
                  {ad.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="md-launch">Launch</Label>
          <Select
            value={filters.launchId ?? "all"}
            onValueChange={(value) =>
              onChange({
                launchId: value === "all" ? undefined : value,
                seasonId: value === "all" ? undefined : filters.seasonId,
              })
            }
            disabled={selectsDisabled}
          >
            <SelectTrigger id="md-launch">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {options.launches.map((launch) => (
                <SelectItem key={launch.value} value={launch.value}>
                  {launch.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="md-season">Season</Label>
          <Select
            value={filters.seasonId ?? "all"}
            onValueChange={(value) => onChange({ seasonId: value === "all" ? undefined : value })}
            disabled={selectsDisabled || !filters.launchId}
          >
            <SelectTrigger id="md-season">
              <SelectValue placeholder={filters.launchId ? "Todas" : "Selecione um launch"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {options.seasons.map((season) => (
                <SelectItem key={season.value} value={season.value}>
                  {season.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClear}>
          <FilterX className="mr-2 h-4 w-4" />
          Limpar filtros
        </Button>
      </div>
    </div>
  );
}
