import { useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { QuizAnswersDrawer } from "./QuizAnswersDrawer";
import type { LeadCapture } from "@/types/lead-capture";

interface Props {
  items: LeadCapture[];
  isLoading: boolean;
  isError: boolean;
}

const columns = [
  { key: "quiz_answered", label: "Quiz" },
  { key: "created_at", label: "Data" },
  { key: "name", label: "Nome" },
  { key: "person_email", label: "Email" },
  { key: "person_phone", label: "Telefone" },
  { key: "launch_name", label: "Launch" },
  { key: "season_name", label: "Season" },
  { key: "platform_name", label: "Plataforma" },
  { key: "strategy_name", label: "Estratégia" },
  { key: "temperature_name", label: "Temperatura" },
  { key: "page", label: "Page" },
  { key: "path", label: "Path" },
  { key: "full_url", label: "URL" },
  { key: "utm_source", label: "UTM Source" },
  { key: "utm_medium", label: "UTM Medium" },
  { key: "utm_campaign", label: "UTM Campaign" },
  { key: "utm_content", label: "UTM Content" },
  { key: "utm_term", label: "UTM Term" },
  { key: "utm_id", label: "UTM ID" },
] as const;

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function TruncatedCell({ value }: { value: string }) {
  const text = value || "—";
  return (
    <TableCell className="max-w-[200px]">
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="block truncate">{text}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[400px] break-all">
          {text}
        </TooltipContent>
      </Tooltip>
    </TableCell>
  );
}

function UrlCell({ page, path }: { page: string; path: string }) {
  const fullUrl = page && path ? `${page}${path}` : page || path || "—";
  const isLink = page && path;
  return (
    <TableCell className="max-w-[280px]">
      <Tooltip>
        <TooltipTrigger asChild>
          {isLink ? (
            <a
              href={fullUrl.startsWith("http") ? fullUrl : `https://${fullUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              {fullUrl}
            </a>
          ) : (
            <span className="block truncate">{fullUrl}</span>
          )}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[500px] break-all">
          {fullUrl}
        </TooltipContent>
      </Tooltip>
    </TableCell>
  );
}

export function LeadCaptureTable({ items, isLoading, isError }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCapture, setSelectedCapture] = useState<{ id: string; name: string } | null>(null);

  const handleQuizClick = (item: LeadCapture) => {
    if (!item.quiz_answered) return;
    setSelectedCapture({ id: item.id, name: item.name });
    setDrawerOpen(true);
  };

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-destructive text-sm">
        Erro ao carregar os leads. Tente novamente.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key}>{col.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
                  Nenhum lead encontrado.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {item.quiz_answered ? (
                          <button
                            type="button"
                            onClick={() => handleQuizClick(item)}
                            className="inline-flex cursor-pointer hover:scale-110 transition-transform"
                          >
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          </button>
                        ) : (
                          <CircleDashed className="h-4 w-4 text-muted-foreground inline-block" />
                        )}
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        {item.quiz_answered ? "Ver respostas do quiz" : "Não respondeu"}
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{formatDate(item.created_at)}</TableCell>
                  <TruncatedCell value={item.name} />
                  <TableCell className="font-medium">{item.person_email || "—"}</TableCell>
                  <TableCell>{item.person_phone || "—"}</TableCell>
                  <TableCell>{item.launch_name || "—"}</TableCell>
                  <TableCell>{item.season_name || "—"}</TableCell>
                  <TableCell>{item.platform_name || "—"}</TableCell>
                  <TableCell>{item.strategy_name || "—"}</TableCell>
                  <TableCell>{item.temperature_name || "—"}</TableCell>
                  <TruncatedCell value={item.page} />
                  <TruncatedCell value={item.path} />
                  <UrlCell page={item.page} path={item.path} />
                  <TruncatedCell value={item.utm_source} />
                  <TruncatedCell value={item.utm_medium} />
                  <TruncatedCell value={item.utm_campaign} />
                  <TruncatedCell value={item.utm_content} />
                  <TruncatedCell value={item.utm_term} />
                  <TruncatedCell value={item.utm_id} />
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <QuizAnswersDrawer
        captureId={selectedCapture?.id ?? null}
        leadName={selectedCapture?.name}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  );
}
