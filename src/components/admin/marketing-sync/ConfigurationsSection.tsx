import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { saveMarketingSyncConfiguration } from "@/api/syncs/marketing-sync";
import { useMarketingSyncConfigurations } from "@/hooks/use-marketing-sync";
import type { MarketingSyncConfiguration, MarketingSyncConfigurationPayload } from "@/types/syncs/marketing-sync";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

const KNOWN_SYNC_KEYS = [
  "marketing_extract",
  "marketing_performance",
  "marketing_accounts_refresh",
  "marketing_connections_sync",
];

const PROVIDERS = [
  { value: "google_ads", label: "Google Ads" },
  { value: "meta_ads", label: "Meta Ads" },
];

function emptyPayload(): MarketingSyncConfigurationPayload {
  return {
    syncKey: "",
    provider: null,
    enabled: true,
    scheduleEnabled: false,
    scheduleIntervalMinutes: null,
    config: null,
    metadata: null,
  };
}

function tryParseJson(value: string): Record<string, unknown> | null {
  if (!value.trim()) return null;
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

function formatDateShort(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

interface FormState {
  syncKey: string;
  customSyncKey: string;
  provider: string;
  enabled: boolean;
  scheduleEnabled: boolean;
  scheduleIntervalMinutes: string;
  configText: string;
  metadataText: string;
}

function configurationToForm(cfg: MarketingSyncConfiguration): FormState {
  const isKnown = KNOWN_SYNC_KEYS.includes(cfg.syncKey);
  return {
    syncKey: isKnown ? cfg.syncKey : "custom",
    customSyncKey: isKnown ? "" : cfg.syncKey,
    provider: cfg.provider ?? "global",
    enabled: cfg.enabled,
    scheduleEnabled: cfg.scheduleEnabled,
    scheduleIntervalMinutes: cfg.scheduleIntervalMinutes === null ? "" : String(cfg.scheduleIntervalMinutes),
    configText: cfg.config ? JSON.stringify(cfg.config, null, 2) : "",
    metadataText: cfg.metadata ? JSON.stringify(cfg.metadata, null, 2) : "",
  };
}

function formToPayload(form: FormState): MarketingSyncConfigurationPayload | null {
  const syncKey = form.syncKey === "custom" ? form.customSyncKey.trim() : form.syncKey;
  if (!syncKey) return null;

  const intervalNum = form.scheduleIntervalMinutes.trim() ? Number.parseInt(form.scheduleIntervalMinutes, 10) : null;
  if (intervalNum !== null && Number.isNaN(intervalNum)) return null;

  const config = form.configText.trim() ? tryParseJson(form.configText) : null;
  const metadata = form.metadataText.trim() ? tryParseJson(form.metadataText) : null;

  if (form.configText.trim() && config === null) return null;
  if (form.metadataText.trim() && metadata === null) return null;

  return {
    syncKey,
    provider: form.provider === "global" ? null : form.provider,
    enabled: form.enabled,
    scheduleEnabled: form.scheduleEnabled,
    scheduleIntervalMinutes: intervalNum,
    config,
    metadata,
  };
}

export function ConfigurationsSection() {
  const queryClient = useQueryClient();
  const configurationsQuery = useMarketingSyncConfigurations();
  const configurations = configurationsQuery.data ?? [];

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => configurationToForm({ ...emptyPayload(), id: "", createdAt: "", updatedAt: "" }));
  const [jsonErrors, setJsonErrors] = useState<{ config?: string; metadata?: string }>({});

  const saveMutation = useMutation({
    mutationFn: (payload: MarketingSyncConfigurationPayload) => saveMarketingSyncConfiguration(payload),
    onSuccess: () => {
      toast.success("Configuracao salva com sucesso.");
      void queryClient.invalidateQueries({ queryKey: ["marketing-sync", "configurations"] });
      setSheetOpen(false);
    },
    onError: () => {
      toast.error("Erro ao salvar configuracao.");
    },
  });

  function openNew() {
    setEditingId(null);
    setForm(configurationToForm({ ...emptyPayload(), id: "", createdAt: "", updatedAt: "" }));
    setJsonErrors({});
    setSheetOpen(true);
  }

  function openEdit(cfg: MarketingSyncConfiguration) {
    setEditingId(cfg.id);
    setForm(configurationToForm(cfg));
    setJsonErrors({});
    setSheetOpen(true);
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "configText") {
      const text = value as string;
      setJsonErrors((prev) => ({
        ...prev,
        config: text.trim() && tryParseJson(text) === null ? "JSON inválido" : undefined,
      }));
    }
    if (key === "metadataText") {
      const text = value as string;
      setJsonErrors((prev) => ({
        ...prev,
        metadata: text.trim() && tryParseJson(text) === null ? "JSON inválido" : undefined,
      }));
    }
  }

  function handleSave() {
    const payload = formToPayload(form);
    if (!payload) {
      toast.error("Preencha os campos obrigatorios corretamente.");
      return;
    }
    saveMutation.mutate(payload);
  }

  const enabledCount = configurations.filter((c) => c.enabled).length;
  const scheduledCount = configurations.filter((c) => c.scheduleEnabled).length;

  return (
    <div className="space-y-4">
      {/* status cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-1 pt-3">
            <CardDescription>Total de configuracoes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{configurationsQuery.isLoading ? "—" : configurations.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-3">
            <CardDescription>Ativas (enabled)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {configurationsQuery.isLoading ? "—" : enabledCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-3">
            <CardDescription>Com agendamento</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {configurationsQuery.isLoading ? "—" : scheduledCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* info banner */}
      <Alert>
        <AlertTitle>Configuracao persistida disponivel</AlertTitle>
        <AlertDescription>
          As configuracoes salvas aqui ficam registradas no banco de dados e estao{" "}
          <strong>prontas para uso operacional e futura ativacao pelo backend</strong>. O runtime ainda nao consome esta
          tabela como fonte efetiva para substituir envs e o comportamento do scheduler — isso sera ativado em uma
          proxima versao do servico.
        </AlertDescription>
      </Alert>

      {/* table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
          <CardTitle className="text-base">Configuracoes</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              disabled={configurationsQuery.isFetching}
              onClick={() => configurationsQuery.refetch()}
            >
              {configurationsQuery.isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCw className="h-4 w-4" />
              )}
            </Button>
            <Button size="sm" onClick={openNew}>
              <Plus className="mr-1 h-4 w-4" />
              Nova configuracao
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {configurationsQuery.isError && (
            <div className="px-4 py-6 text-sm text-destructive">Erro ao carregar configuracoes.</div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>syncKey</TableHead>
                <TableHead>provider</TableHead>
                <TableHead>enabled</TableHead>
                <TableHead>schedule</TableHead>
                <TableHead>intervalo (min)</TableHead>
                <TableHead>atualizado em</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {configurationsQuery.isLoading
                ? (["sk-a", "sk-b", "sk-c"] as const).map((rowKey) => (
                    <TableRow key={rowKey}>
                      {(["c1", "c2", "c3", "c4", "c5", "c6", "c7"] as const).map((colKey) => (
                        <TableCell key={`${rowKey}-${colKey}`}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : configurations.map((cfg) => (
                    <TableRow key={cfg.id}>
                      <TableCell className="font-mono text-xs">{cfg.syncKey}</TableCell>
                      <TableCell>
                        {cfg.provider ? (
                          <Badge variant="outline">{cfg.provider}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">global</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={cfg.enabled ? "default" : "secondary"}>
                          {cfg.enabled ? "sim" : "nao"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={cfg.scheduleEnabled ? "default" : "secondary"}>
                          {cfg.scheduleEnabled ? "sim" : "nao"}
                        </Badge>
                      </TableCell>
                      <TableCell>{cfg.scheduleIntervalMinutes ?? "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDateShort(cfg.updatedAt)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(cfg)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              {!configurationsQuery.isLoading && configurations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-6 text-center text-sm text-muted-foreground">
                    Nenhuma configuracao encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* edit sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{editingId ? "Editar configuracao" : "Nova configuracao"}</SheetTitle>
            <SheetDescription>
              Preencha os campos abaixo e salve. A configuracao sera persistida no banco.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4 grid gap-4">
            {/* syncKey */}
            <div className="grid gap-1.5">
              <Label htmlFor="syncKey">syncKey *</Label>
              <Select value={form.syncKey} onValueChange={(v) => updateField("syncKey", v)}>
                <SelectTrigger id="syncKey">
                  <SelectValue placeholder="Selecione ou custom" />
                </SelectTrigger>
                <SelectContent>
                  {KNOWN_SYNC_KEYS.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">custom…</SelectItem>
                </SelectContent>
              </Select>
              {form.syncKey === "custom" && (
                <Input
                  placeholder="ex: marketing_custom_job"
                  value={form.customSyncKey}
                  onChange={(e) => updateField("customSyncKey", e.target.value)}
                />
              )}
            </div>

            {/* provider */}
            <div className="grid gap-1.5">
              <Label htmlFor="provider">provider</Label>
              <Select value={form.provider} onValueChange={(v) => updateField("provider", v)}>
                <SelectTrigger id="provider">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">global (sem provider)</SelectItem>
                  {PROVIDERS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* enabled + scheduleEnabled */}
            <div className="flex items-center justify-between rounded-md border px-4 py-3">
              <Label htmlFor="enabled">enabled</Label>
              <Switch
                id="enabled"
                checked={form.enabled}
                onCheckedChange={(v) => updateField("enabled", v)}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border px-4 py-3">
              <Label htmlFor="scheduleEnabled">scheduleEnabled</Label>
              <Switch
                id="scheduleEnabled"
                checked={form.scheduleEnabled}
                onCheckedChange={(v) => updateField("scheduleEnabled", v)}
              />
            </div>

            {/* scheduleIntervalMinutes */}
            {form.scheduleEnabled && (
              <div className="grid gap-1.5">
                <Label htmlFor="intervalMinutes">scheduleIntervalMinutes</Label>
                <Input
                  id="intervalMinutes"
                  type="number"
                  min={1}
                  placeholder="ex: 60"
                  value={form.scheduleIntervalMinutes}
                  onChange={(e) => updateField("scheduleIntervalMinutes", e.target.value)}
                />
              </div>
            )}

            {/* config JSON */}
            <div className="grid gap-1.5">
              <Label htmlFor="configJson">config (JSON)</Label>
              <Textarea
                id="configJson"
                rows={4}
                placeholder={'{\n  "includeToday": true\n}'}
                value={form.configText}
                onChange={(e) => updateField("configText", e.target.value)}
                className="font-mono text-xs"
              />
              {jsonErrors.config && <p className="text-xs text-destructive">{jsonErrors.config}</p>}
            </div>

            {/* metadata JSON */}
            <div className="grid gap-1.5">
              <Label htmlFor="metadataJson">metadata (JSON)</Label>
              <Textarea
                id="metadataJson"
                rows={4}
                placeholder={'{\n  "managedBy": "backoffice"\n}'}
                value={form.metadataText}
                onChange={(e) => updateField("metadataText", e.target.value)}
                className="font-mono text-xs"
              />
              {jsonErrors.metadata && <p className="text-xs text-destructive">{jsonErrors.metadata}</p>}
            </div>
          </div>

          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
