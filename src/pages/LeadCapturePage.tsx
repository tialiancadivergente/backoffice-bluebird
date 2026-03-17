import { useState } from "react";
import { format } from "date-fns";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { useLeadCaptures } from "@/hooks/use-lead-captures";
import { LeadCaptureTable } from "@/components/lead-capture/LeadCaptureTable";
import { LeadCapturePagination } from "@/components/lead-capture/LeadCapturePagination";
import { LeadCaptureFilters } from "@/components/lead-capture/LeadCaptureFilters";
import { Button } from "@/components/ui/button";
import { exportLeadsCsv, exportLeadsExcel } from "@/api/lead-capture";
import { toast } from "sonner";
import type { LeadCaptureParams, LeadExportParams } from "@/types/lead-capture";


function toDateStr(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function LeadCapturePage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [temperatureId, setTemperatureId] = useState<string | undefined>(undefined);
  const [launchId, setLaunchId] = useState<string | undefined>(undefined);
  const [seasonId, setSeasonId] = useState<string | undefined>(undefined);
  const [exporting, setExporting] = useState<"csv" | "excel" | null>(null);

  const params: LeadCaptureParams = {
    page,
    per_page: perPage,
    ...(startDate ? { start_date: toDateStr(startDate) } : {}),
    ...(endDate ? { end_date: toDateStr(endDate) } : {}),
    ...(temperatureId ? { temperature_id: temperatureId } : {}),
    ...(launchId ? { launch_id: launchId } : {}),
    ...(launchId && seasonId ? { season_id: seasonId } : {}),
  };

  const exportParams: LeadExportParams = {
    ...(startDate ? { start_date: toDateStr(startDate) } : {}),
    ...(endDate ? { end_date: toDateStr(endDate) } : {}),
    ...(temperatureId ? { temperature_id: temperatureId } : {}),
    ...(launchId ? { launch_id: launchId } : {}),
    ...(launchId && seasonId ? { season_id: seasonId } : {}),
  };

  const { data, isLoading, isError } = useLeadCaptures(params);
  const items = data?.items ?? [];

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    setPage(1);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    setPage(1);
  };

  const handleExportCsv = async () => {
    setExporting("csv");
    try {
      const blob = await exportLeadsCsv(exportParams);
      triggerBlobDownload(blob, "leads.csv");
      toast.success("CSV exportado com sucesso!");
    } catch {
      toast.error("Erro ao exportar CSV.");
    } finally {
      setExporting(null);
    }
  };

  const handleExportExcel = async () => {
    setExporting("excel");
    try {
      const blob = await exportLeadsExcel(exportParams);
      triggerBlobDownload(blob, "leads.xlsx");
      toast.success("Excel exportado com sucesso!");
    } catch {
      toast.error("Erro ao exportar Excel.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Lead Capture</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerencie e visualize os leads capturados.</p>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <LeadCaptureFilters
          startDate={startDate}
          endDate={endDate}
          temperatureId={temperatureId}
          launchId={launchId}
          seasonId={seasonId}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
          onTemperatureChange={(id) => { setTemperatureId(id); setPage(1); }}
          onLaunchChange={(id) => { setLaunchId(id); setSeasonId(undefined); setPage(1); }}
          onSeasonChange={(id) => { setSeasonId(id); setPage(1); }}
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={exporting !== null}
            onClick={handleExportCsv}
          >
            {exporting === "csv" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={exporting !== null}
            onClick={handleExportExcel}
          >
            {exporting === "excel" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}
            Excel
          </Button>
        </div>
      </div>

      <LeadCaptureTable items={items} isLoading={isLoading} isError={isError} />
      {data?.meta && (
        <LeadCapturePagination
          meta={data.meta}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={(val) => { setPerPage(val); setPage(1); }}
        />
      )}
    </div>
  );
}
