import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, RefreshCw, Zap } from "lucide-react";
import { toast } from "sonner";
import { syncHistory, processBatch } from "@/api/hotmart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS = [
  { value: "APPROVED", label: "Aprovada" },
  { value: "COMPLETE", label: "Completa" },
  { value: "WAITING_PAYMENT", label: "Aguardando" },
  { value: "PRINTED_BILLET", label: "Boleto gerado" },
  { value: "CANCELLED", label: "Cancelada" },
  { value: "REFUNDED", label: "Reembolsada" },
];

export function HotmartSyncSection() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [transactionStatus, setTransactionStatus] = useState<string>("all");
  const [batchLimit, setBatchLimit] = useState<string>("");

  const syncMutation = useMutation({
    mutationFn: () =>
      syncHistory({
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
        ...(transactionStatus && transactionStatus !== "all"
          ? { transactionStatus }
          : {}),
      }),
    onSuccess: (data) => {
      toast.success(data.message ?? "Sync iniciado com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao iniciar sincronização do histórico.");
    },
  });

  const batchMutation = useMutation({
    mutationFn: () =>
      processBatch(batchLimit ? Number(batchLimit) : undefined),
    onSuccess: (data) => {
      toast.success(`${data.processed} processados, ${data.failed} falhos.`);
    },
    onError: () => {
      toast.error("Erro ao processar pendentes.");
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 font-bold text-xs">{"H"}</span>
          {"Hotmart"}
        </CardTitle>
        <CardDescription>
          Sincronize o histórico de transações ou processe vendas pendentes.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Sync histórico */}
        <div className="space-y-4">
          <p className="text-sm font-semibold">Sincronizar histórico</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="hotmart-start-date">Data início</Label>
              <Input
                id="hotmart-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hotmart-end-date">Data fim</Label>
              <Input
                id="hotmart-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={transactionStatus} onValueChange={setTransactionStatus}>
                <SelectTrigger>
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
          </div>

          {syncMutation.isError && (
            <Alert variant="destructive">
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>Falha ao iniciar sincronização.</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="gap-2"
          >
            {syncMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Sincronizar histórico
          </Button>
        </div>

        <hr className="border-border" />

        {/* Processar pendentes */}
        <div className="space-y-4">
          <p className="text-sm font-semibold">Processar pendentes</p>
          <div className="flex items-end gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="hotmart-batch-limit">Limite (opcional)</Label>
              <Input
                id="hotmart-batch-limit"
                type="number"
                min={1}
                placeholder="Sem limite"
                value={batchLimit}
                onChange={(e) => setBatchLimit(e.target.value)}
                className="w-[160px]"
              />
            </div>

            <Button
              onClick={() => batchMutation.mutate()}
              disabled={batchMutation.isPending}
              variant="outline"
              className="gap-2"
            >
              {batchMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              Processar pendentes
            </Button>
          </div>

          {batchMutation.isError && (
            <Alert variant="destructive">
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>Falha ao processar pendentes.</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
