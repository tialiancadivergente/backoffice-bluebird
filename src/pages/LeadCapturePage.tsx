import { useState } from "react";
import { useLeadCaptures } from "@/hooks/use-lead-captures";
import { LeadCaptureTable } from "@/components/lead-capture/LeadCaptureTable";
import { LeadCapturePagination } from "@/components/lead-capture/LeadCapturePagination";
import type { LeadCaptureParams } from "@/types/lead-capture";

const DEFAULT_PARAMS: Omit<LeadCaptureParams, "page" | "per_page"> = {
  start_date: "2026-03-10",
  end_date: new Date().toISOString().split("T")[0],
  launch_id: "4c88a392-6e6f-417e-822a-5be7221900fd",
  temperature_id: "e80e6a86-6ad9-43ec-b30f-5bd45af522b4",
  season_id: "43494acc-cda4-4aaa-acad-c12929bd2eb0",
};

export default function LeadCapturePage() {
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  const params: LeadCaptureParams = { page, per_page: perPage, ...DEFAULT_PARAMS };
  const { data, isLoading, isError } = useLeadCaptures(params);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Lead Capture</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerencie e visualize os leads capturados.</p>
      </div>

      {/* TODO: Filtros serão adicionados aqui */}

      <LeadCaptureTable items={data?.items ?? []} isLoading={isLoading} isError={isError} />

      {data?.meta && (
        <LeadCapturePagination meta={data.meta} onPageChange={setPage} />
      )}
    </div>
  );
}
