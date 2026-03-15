import { useState } from "react";
import { format } from "date-fns";
import { useLeadCaptures } from "@/hooks/use-lead-captures";
import { LeadCaptureTable } from "@/components/lead-capture/LeadCaptureTable";
import { LeadCapturePagination } from "@/components/lead-capture/LeadCapturePagination";
import { LeadCaptureFilters } from "@/components/lead-capture/LeadCaptureFilters";
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

  const canFetch = !!startDate && !!endDate;

  const params: LeadCaptureParams | null = canFetch
    ? {
        page,
        per_page: perPage,
        start_date: toDateStr(startDate),
        end_date: toDateStr(endDate),
        ...FIXED_PARAMS,
      }
    : null;

  const { data, isLoading, isError } = useLeadCaptures(params);

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

      <LeadCaptureFilters
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
      />

      {!canFetch ? (
        <p className="text-sm text-muted-foreground">Selecione o período para visualizar os leads.</p>
      ) : (
        <>
          <LeadCaptureTable items={data?.items ?? []} isLoading={isLoading} isError={isError} />
          {data?.meta && (
            <LeadCapturePagination meta={data.meta} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
