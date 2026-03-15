import { useState } from "react";
import { format } from "date-fns";
import { Download, FileSpreadsheet } from "lucide-react";
import { useLeadCaptures } from "@/hooks/use-lead-captures";
import { LeadCaptureTable } from "@/components/lead-capture/LeadCaptureTable";
import { LeadCapturePagination } from "@/components/lead-capture/LeadCapturePagination";
import { LeadCaptureFilters } from "@/components/lead-capture/LeadCaptureFilters";
import { Button } from "@/components/ui/button";
import { downloadCSV, downloadExcel } from "@/lib/export-leads";
import type { LeadCaptureParams } from "@/types/lead-capture";

const FIXED_PARAMS = {
  launch_id: "4c88a392-6e6f-417e-822a-5be7221900fd",
  temperature_id: "e80e6a86-6ad9-43ec-b30f-5bd45af522b4",
  season_id: "43494acc-cda4-4aaa-acad-c12929bd2eb0",
};

function toDateStr(d: Date) {
  return format(d, "yyyy-MM-dd");
}

export default function LeadCapturePage() {
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const params: LeadCaptureParams = {
    page,
    per_page: perPage,
    ...FIXED_PARAMS,
    ...(startDate ? { start_date: toDateStr(startDate) } : {}),
    ...(endDate ? { end_date: toDateStr(endDate) } : {}),
  } as LeadCaptureParams;

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
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!items.length}
            onClick={() => downloadCSV(items)}
          >
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!items.length}
            onClick={() => downloadExcel(items)}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Excel
          </Button>
        </div>
      </div>

      <LeadCaptureTable items={items} isLoading={isLoading} isError={isError} />
      {data?.meta && (
        <LeadCapturePagination meta={data.meta} onPageChange={setPage} />
      )}
    </div>
  );
}
