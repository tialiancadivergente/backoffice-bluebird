import { utils, writeFileXLSX } from "xlsx";
import type { LeadCapture } from "@/types/lead-capture";

const HEADERS: { key: keyof LeadCapture; label: string }[] = [
  { key: "created_at", label: "Data" },
  { key: "person_email", label: "Email" },
  { key: "person_phone", label: "Telefone" },
  { key: "launch_name", label: "Launch" },
  { key: "season_name", label: "Season" },
  { key: "platform_name", label: "Plataforma" },
  { key: "strategy_name", label: "Estratégia" },
  { key: "temperature_name", label: "Temperatura" },
  { key: "page", label: "Page" },
  { key: "path", label: "Path" },
  { key: "utm_source", label: "UTM Source" },
  { key: "utm_medium", label: "UTM Medium" },
  { key: "utm_campaign", label: "UTM Campaign" },
  { key: "utm_content", label: "UTM Content" },
  { key: "utm_term", label: "UTM Term" },
  { key: "utm_id", label: "UTM ID" },
];

function toRows(items: LeadCapture[]) {
  return items.map((item) =>
    HEADERS.reduce((row, h) => {
      row[h.label] = item[h.key] || "—";
      return row;
    }, {} as Record<string, string>)
  );
}

export function downloadCSV(items: LeadCapture[]) {
  const ws = utils.json_to_sheet(toRows(items));
  const csv = utils.sheet_to_csv(ws);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, "leads.csv");
}

export function downloadExcel(items: LeadCapture[]) {
  const ws = utils.json_to_sheet(toRows(items));
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Leads");
  writeFileXLSX(wb, "leads.xlsx");
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
