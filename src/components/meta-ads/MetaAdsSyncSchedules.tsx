import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, Play, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createMetaSyncSchedule,
  deleteMetaSyncSchedule,
  runMetaSyncSchedule,
} from "@/api/meta-ads";
import { useMetaSyncSchedules } from "@/hooks/use-meta-ads";
import type { CreateMetaSyncSchedulePayload } from "@/types/meta-ads";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PRESET_LABELS: Record<string, string> = {
  yesterday: "Ontem",
  last_7d: "Últimos 7 dias",
  last_30d: "Últimos 30 dias",
  last_90d: "Últimos 90 dias",
  custom: "Personalizado",
};

const STEP_LABELS: Record<string, string> = {
  insights_bulk: "Insights Bulk Async",
  insights: "Insights (Batch)",
  campaigns: "Campanhas",
  adsets: "Conjuntos de Anúncios",
  ads: "Anúncios",
  full: "Sync Completo",
};

const LEVEL_LABELS: Record<string, string> = {
  ad: "Anúncio",
  adset: "Conjunto",
  campaign: "Campanha",
};

const DEFAULT_FORM: CreateMetaSyncSchedulePayload = {
  name: "",
  sync_step: "insights_bulk",
  period_preset: "yesterday",
  date_from: "",
  date_to: "",
  level: "ad",
  scheduled_time: "06:00",
  active: true,
};

export function MetaAdsSyncSchedules() {
  const queryClient = useQueryClient();
  const { data: schedules, isLoading, isError } = useMetaSyncSchedules();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateMetaSyncSchedulePayload>(DEFAULT_FORM);

  const createMutation = useMutation({
    mutationFn: (payload: CreateMetaSyncSchedulePayload) =>
      createMetaSyncSchedule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meta-sync-schedules"] });
      toast.success("Agendamento criado com sucesso.");
      setOpen(false);
      setForm(DEFAULT_FORM);
    },
    onError: () => toast.error("Erro ao criar agendamento."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMetaSyncSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meta-sync-schedules"] });
      toast.success("Agendamento removido.");
    },
    onError: () => toast.error("Erro ao remover agendamento."),
  });

  const runMutation = useMutation({
    mutationFn: (id: string) => runMetaSyncSchedule(id),
    onSuccess: () => toast.success("Sync iniciado."),
    onError: () => toast.error("Erro ao iniciar sync."),
  });

  const showLevel =
    form.sync_step === "insights" || form.sync_step === "insights_bulk";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: CreateMetaSyncSchedulePayload = {
      ...(form.name ? { name: form.name } : {}),
      sync_step: form.sync_step,
      period_preset: form.period_preset,
      ...(form.period_preset === "custom" && form.date_from
        ? { date_from: form.date_from }
        : {}),
      ...(form.period_preset === "custom" && form.date_to
        ? { date_to: form.date_to }
        : {}),
      level: form.level ?? "ad",
      scheduled_time: form.scheduled_time,
      active: form.active ?? true,
    };
    createMutation.mutate(payload);
  }

  function formatLastRun(value?: string) {
    if (!value) return "Nunca";
    try {
      return format(new Date(value), "dd/MM/yyyy HH:mm");
    } catch {
      return value;
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Agendamentos de sync</CardTitle>
          <CardDescription>
            Configure sincronizações automáticas da Meta Ads em horários
            definidos (UTC).
          </CardDescription>
        </div>

        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) setForm(DEFAULT_FORM);
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              Novo agendamento
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Novo agendamento</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              {/* Nome */}
              <div className="space-y-1.5">
                <Label htmlFor="sched-name">Nome (opcional)</Label>
                <Input
                  id="sched-name"
                  placeholder="Ex: Insights diário 30 dias"
                  value={form.name ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>

              {/* Tipo de sync */}
              <div className="space-y-1.5">
                <Label>Tipo de sync</Label>
                <Select
                  value={form.sync_step}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      sync_step: v as CreateMetaSyncSchedulePayload["sync_step"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STEP_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Level (só para insights) */}
              {showLevel && (
                <div className="space-y-1.5">
                  <Label>Nível</Label>
                  <Select
                    value={form.level ?? "ad"}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, level: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LEVEL_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Período */}
              <div className="space-y-1.5">
                <Label>Período</Label>
                <Select
                  value={form.period_preset}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      period_preset:
                        v as CreateMetaSyncSchedulePayload["period_preset"],
                      date_from: "",
                      date_to: "",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yesterday">Ontem</SelectItem>
                    <SelectItem value="last_7d">Últimos 7 dias</SelectItem>
                    <SelectItem value="last_30d">Últimos 30 dias</SelectItem>
                    <SelectItem value="last_90d">Últimos 90 dias</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom date range */}
              {form.period_preset === "custom" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="sched-date-from">Data início</Label>
                    <Input
                      id="sched-date-from"
                      type="date"
                      value={form.date_from ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, date_from: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sched-date-to">Data fim</Label>
                    <Input
                      id="sched-date-to"
                      type="date"
                      value={form.date_to ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, date_to: e.target.value }))
                      }
                    />
                  </div>
                </div>
              )}

              {/* Horário */}
              <div className="space-y-1.5">
                <Label htmlFor="sched-time">Horário (UTC)</Label>
                <Input
                  id="sched-time"
                  type="time"
                  value={form.scheduled_time}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, scheduled_time: e.target.value }))
                  }
                  required
                />
              </div>

              {/* Active */}
              <div className="flex items-center gap-3">
                <Switch
                  id="sched-active"
                  checked={form.active ?? true}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, active: v }))
                  }
                />
                <Label htmlFor="sched-active">Ativo</Label>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    setForm(DEFAULT_FORM);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="gap-2"
                >
                  {createMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Criar agendamento
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Carregando agendamentos…</span>
          </div>
        )}

        {isError && (
          <p className="text-sm text-destructive py-4">
            Não foi possível carregar os agendamentos.
          </p>
        )}

        {!isLoading && !isError && (!schedules || schedules.length === 0) && (
          <p className="text-sm text-muted-foreground py-4">
            Nenhum agendamento configurado. Crie o primeiro usando o botão
            acima.
          </p>
        )}

        {!isLoading && !isError && schedules && schedules.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última execução</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">
                    {schedule.name || (
                      <span className="text-muted-foreground italic">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {STEP_LABELS[schedule.sync_step] ?? schedule.sync_step}
                    {(schedule.sync_step === "insights" ||
                      schedule.sync_step === "insights_bulk") && (
                      <span className="block text-xs text-muted-foreground">
                        nível: {LEVEL_LABELS[schedule.level] ?? schedule.level}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {PRESET_LABELS[schedule.period_preset] ??
                      schedule.period_preset}
                    {schedule.period_preset === "custom" &&
                      schedule.date_from && (
                        <span className="block text-xs text-muted-foreground">
                          {schedule.date_from} → {schedule.date_to ?? "…"}
                        </span>
                      )}
                  </TableCell>
                  <TableCell>{schedule.scheduled_time} UTC</TableCell>
                  <TableCell>
                    {schedule.active ? (
                      <Badge variant="default">Ativo</Badge>
                    ) : (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatLastRun(schedule.last_run_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        disabled={runMutation.isPending}
                        onClick={() => runMutation.mutate(schedule.id)}
                      >
                        {runMutation.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Play className="h-3.5 w-3.5" />
                        )}
                        Rodar agora
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate(schedule.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
