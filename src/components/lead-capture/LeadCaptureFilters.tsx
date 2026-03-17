import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchTemperatures, fetchLaunches, fetchSeasons } from "@/api/lead-capture";

interface LeadCaptureFiltersProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  temperatureId: string | undefined;
  launchId: string | undefined;
  seasonId: string | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onTemperatureChange: (id: string | undefined) => void;
  onLaunchChange: (id: string | undefined) => void;
  onSeasonChange: (id: string | undefined) => void;
}

export function LeadCaptureFilters({
  startDate,
  endDate,
  temperatureId,
  launchId,
  seasonId,
  onStartDateChange,
  onEndDateChange,
  onTemperatureChange,
  onLaunchChange,
  onSeasonChange,
}: LeadCaptureFiltersProps) {
  const { data: temperatures = [] } = useQuery({
    queryKey: ["temperatures"],
    queryFn: fetchTemperatures,
  });

  const { data: launches = [] } = useQuery({
    queryKey: ["launches"],
    queryFn: fetchLaunches,
  });

  const { data: seasons = [] } = useQuery({
    queryKey: ["seasons", launchId],
    queryFn: () => fetchSeasons(launchId!),
    enabled: !!launchId,
  });

  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Start Date */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-medium text-foreground">Data Início</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[180px] justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={onStartDateChange}
              disabled={(date) => date > new Date()}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* End Date */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-medium text-foreground">Data Fim</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[180px] justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={onEndDateChange}
              disabled={(date) => date > new Date()}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Temperature */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-medium text-foreground">Temperatura</label>
        <Select
          value={temperatureId ?? "all"}
          onValueChange={(val) => onTemperatureChange(val === "all" ? undefined : val)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {temperatures.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Launch */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-medium text-foreground">Launch</label>
        <Select
          value={launchId ?? "all"}
          onValueChange={(val) => onLaunchChange(val === "all" ? undefined : val)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {launches.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Season */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-medium text-foreground">Season</label>
        <Select
          value={seasonId ?? "all"}
          onValueChange={(val) => onSeasonChange(val === "all" ? undefined : val)}
          disabled={!launchId}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={!launchId ? "Selecione um Launch" : "Todos"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {seasons.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
