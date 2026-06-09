import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Separator } from "@/components/ui/separator";
import { useAvailableQuestions, useLaunchConfig, useUpsertLaunchConfig } from "@/hooks/use-launch-dashboard";
import type { AvailableQuestion, LaunchDashboardConfig } from "@/types/launch-dashboard";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  launchId: string | undefined;
  launchName?: string;
}

function num(v: string): number | undefined {
  const n = parseFloat(v.replace(",", "."));
  return isNaN(n) ? undefined : n;
}

function fmtNum(v: number | null | undefined): string {
  if (v == null) return "";
  return String(v);
}

function QuestionSelect({
  value,
  onChange,
  questions,
  placeholder,
}: {
  value: string | null | undefined;
  onChange: (v: string | undefined) => void;
  questions: AvailableQuestion[];
  placeholder: string;
}) {
  const current = value ?? "__none__";
  return (
    <Select
      value={current}
      onValueChange={(v) => onChange(v === "__none__" ? undefined : v)}
    >
      <SelectTrigger className="h-8 text-xs">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__none__">— Não configurado —</SelectItem>
        {questions.map((q) => (
          <SelectItem key={q.questionKey} value={q.questionKey}>
            {q.questionText ?? q.questionKey}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function OptionSelect({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string | null | undefined;
  onChange: (v: string | undefined) => void;
  options: { optionKey: string; optionText: string | null }[];
  disabled: boolean;
}) {
  const current = value ?? "__none__";
  return (
    <Select
      value={current}
      onValueChange={(v) => onChange(v === "__none__" ? undefined : v)}
      disabled={disabled}
    >
      <SelectTrigger className="h-8 text-xs">
        <SelectValue placeholder="Opção positiva" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__none__">— Não configurado —</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.optionKey} value={o.optionKey}>
            {o.optionText ?? o.optionKey}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input
        className="h-8 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="—"
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function LaunchConfigModal({ open, onOpenChange, launchId, launchName }: Props) {
  const configQuery = useLaunchConfig(launchId);
  const questionsQuery = useAvailableQuestions();
  const upsert = useUpsertLaunchConfig(launchId);

  const questions = questionsQuery.data ?? [];

  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    const c = configQuery.data;
    setForm({
      targetSpend: fmtNum(c?.targetSpend),
      targetLeads: fmtNum(c?.targetLeads),
      targetCpl: fmtNum(c?.targetCpl),
      targetConnectRate: fmtNum(c?.targetConnectRate),
      targetPageConversion: fmtNum(c?.targetPageConversion),
      targetCpc: fmtNum(c?.targetCpc),
      targetCpm: fmtNum(c?.targetCpm),
      targetCtr: fmtNum(c?.targetCtr),
      targetSurveyResponseRate: fmtNum(c?.targetSurveyResponseRate),
      targetConsciousnessRate: fmtNum(c?.targetConsciousnessRate),
      targetKnowsEltonRate: fmtNum(c?.targetKnowsEltonRate),
      targetKnowsAllianceRate: fmtNum(c?.targetKnowsAllianceRate),
    });
    setConfig({
      questionKeyConsciousness: c?.questionKeyConsciousness ?? undefined,
      positiveOptionKeyConsciousness: c?.positiveOptionKeyConsciousness ?? undefined,
      questionKeyKnowsElton: c?.questionKeyKnowsElton ?? undefined,
      positiveOptionKeyKnowsElton: c?.positiveOptionKeyKnowsElton ?? undefined,
      questionKeyKnowsAlliance: c?.questionKeyKnowsAlliance ?? undefined,
      positiveOptionKeyKnowsAlliance: c?.positiveOptionKeyKnowsAlliance ?? undefined,
    });
  }, [configQuery.data]);

  const [config, setConfig] = useState<Partial<LaunchDashboardConfig>>({});

  function optionsFor(qKey: string | null | undefined) {
    return questions.find((q) => q.questionKey === qKey)?.options ?? [];
  }

  function handleSave() {
    if (!launchId) return;
    const payload: LaunchDashboardConfig = {
      targetSpend: num(form.targetSpend),
      targetLeads: num(form.targetLeads),
      targetCpl: num(form.targetCpl),
      targetConnectRate: num(form.targetConnectRate),
      targetPageConversion: num(form.targetPageConversion),
      targetCpc: num(form.targetCpc),
      targetCpm: num(form.targetCpm),
      targetCtr: num(form.targetCtr),
      targetSurveyResponseRate: num(form.targetSurveyResponseRate),
      targetConsciousnessRate: num(form.targetConsciousnessRate),
      targetKnowsEltonRate: num(form.targetKnowsEltonRate),
      targetKnowsAllianceRate: num(form.targetKnowsAllianceRate),
      ...config,
    };
    upsert.mutate(payload, { onSuccess: () => onOpenChange(false) });
  }

  if (!launchId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurações do Dashboard</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Selecione um lançamento no filtro para configurar suas metas e métricas de consciência.
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurações do Dashboard</DialogTitle>
          <DialogDescription>
            {launchName ? `Lançamento: ${launchName}` : launchId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* ── Metas de mídia ── */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Metas — Mídia</h3>
            <div className="grid grid-cols-2 gap-3">
              <NumberInput
                label="Investimento Total (R$)"
                value={form.targetSpend ?? ""}
                onChange={(v) => setForm((p) => ({ ...p, targetSpend: v }))}
              />
              <NumberInput
                label="CPC Meta (R$)"
                value={form.targetCpc ?? ""}
                onChange={(v) => setForm((p) => ({ ...p, targetCpc: v }))}
              />
              <NumberInput
                label="CPM Meta (R$)"
                value={form.targetCpm ?? ""}
                onChange={(v) => setForm((p) => ({ ...p, targetCpm: v }))}
              />
              <NumberInput
                label="CTR Meta (ex: 0.02 = 2%)"
                value={form.targetCtr ?? ""}
                onChange={(v) => setForm((p) => ({ ...p, targetCtr: v }))}
                hint="Valor entre 0 e 1"
              />
              <NumberInput
                label="Connect Rate Meta (ex: 0.75)"
                value={form.targetConnectRate ?? ""}
                onChange={(v) => setForm((p) => ({ ...p, targetConnectRate: v }))}
                hint="Valor entre 0 e 1"
              />
              <NumberInput
                label="Conversão de Páginas Meta (ex: 0.10)"
                value={form.targetPageConversion ?? ""}
                onChange={(v) => setForm((p) => ({ ...p, targetPageConversion: v }))}
                hint="Valor entre 0 e 1"
              />
            </div>
          </div>

          <Separator />

          {/* ── Metas de leads ── */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Metas — Cadastros e Custo</h3>
            <div className="grid grid-cols-2 gap-3">
              <NumberInput
                label="Cadastros Gerados Meta"
                value={form.targetLeads ?? ""}
                onChange={(v) => setForm((p) => ({ ...p, targetLeads: v }))}
              />
              <NumberInput
                label="CPL Meta (R$)"
                value={form.targetCpl ?? ""}
                onChange={(v) => setForm((p) => ({ ...p, targetCpl: v }))}
              />
            </div>
          </div>

          <Separator />

          {/* ── Metas de consciência ── */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Metas — Engajamento e Consciência</h3>
            <div className="grid grid-cols-2 gap-3">
              <NumberInput
                label="Taxa Resposta Pesquisa Meta (ex: 0.20)"
                value={form.targetSurveyResponseRate ?? ""}
                onChange={(v) => setForm((p) => ({ ...p, targetSurveyResponseRate: v }))}
                hint="Valor entre 0 e 1"
              />
              <NumberInput
                label="Taxa Consciência Meta (ex: 0.30)"
                value={form.targetConsciousnessRate ?? ""}
                onChange={(v) => setForm((p) => ({ ...p, targetConsciousnessRate: v }))}
                hint="Valor entre 0 e 1"
              />
              <NumberInput
                label="Taxa Conhece Elton Meta (ex: 0.25)"
                value={form.targetKnowsEltonRate ?? ""}
                onChange={(v) => setForm((p) => ({ ...p, targetKnowsEltonRate: v }))}
                hint="Valor entre 0 e 1"
              />
              <NumberInput
                label="Taxa Conhece Aliança Meta (ex: 0.25)"
                value={form.targetKnowsAllianceRate ?? ""}
                onChange={(v) => setForm((p) => ({ ...p, targetKnowsAllianceRate: v }))}
                hint="Valor entre 0 e 1"
              />
            </div>
          </div>

          <Separator />

          {/* ── Perguntas de consciência ── */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold">Perguntas de Consciência</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Vincule perguntas do quiz às métricas de consciência. O denominador é o total de respondentes da pesquisa.
              </p>
            </div>

            {questionsQuery.isLoading && (
              <p className="text-xs text-muted-foreground">Carregando perguntas...</p>
            )}

            {/* Consciência geral */}
            <div className="space-y-2 rounded-lg border border-border p-3">
              <p className="text-xs font-medium">Taxa de Consciência Geral</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Pergunta</Label>
                  <QuestionSelect
                    value={config.questionKeyConsciousness}
                    onChange={(v) =>
                      setConfig((p) => ({
                        ...p,
                        questionKeyConsciousness: v,
                        positiveOptionKeyConsciousness: undefined,
                      }))
                    }
                    questions={questions}
                    placeholder="Selecionar pergunta"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Opção positiva</Label>
                  <OptionSelect
                    value={config.positiveOptionKeyConsciousness}
                    onChange={(v) =>
                      setConfig((p) => ({ ...p, positiveOptionKeyConsciousness: v }))
                    }
                    options={optionsFor(config.questionKeyConsciousness)}
                    disabled={!config.questionKeyConsciousness}
                  />
                </div>
              </div>
            </div>

            {/* Conhece Elton */}
            <div className="space-y-2 rounded-lg border border-border p-3">
              <p className="text-xs font-medium">Taxa Conhece Elton</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Pergunta</Label>
                  <QuestionSelect
                    value={config.questionKeyKnowsElton}
                    onChange={(v) =>
                      setConfig((p) => ({
                        ...p,
                        questionKeyKnowsElton: v,
                        positiveOptionKeyKnowsElton: undefined,
                      }))
                    }
                    questions={questions}
                    placeholder="Selecionar pergunta"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Opção positiva</Label>
                  <OptionSelect
                    value={config.positiveOptionKeyKnowsElton}
                    onChange={(v) =>
                      setConfig((p) => ({ ...p, positiveOptionKeyKnowsElton: v }))
                    }
                    options={optionsFor(config.questionKeyKnowsElton)}
                    disabled={!config.questionKeyKnowsElton}
                  />
                </div>
              </div>
            </div>

            {/* Conhece Aliança */}
            <div className="space-y-2 rounded-lg border border-border p-3">
              <p className="text-xs font-medium">Taxa Conhece Aliança</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Pergunta</Label>
                  <QuestionSelect
                    value={config.questionKeyKnowsAlliance}
                    onChange={(v) =>
                      setConfig((p) => ({
                        ...p,
                        questionKeyKnowsAlliance: v,
                        positiveOptionKeyKnowsAlliance: undefined,
                      }))
                    }
                    questions={questions}
                    placeholder="Selecionar pergunta"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Opção positiva</Label>
                  <OptionSelect
                    value={config.positiveOptionKeyKnowsAlliance}
                    onChange={(v) =>
                      setConfig((p) => ({ ...p, positiveOptionKeyKnowsAlliance: v }))
                    }
                    options={optionsFor(config.questionKeyKnowsAlliance)}
                    disabled={!config.questionKeyKnowsAlliance}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={upsert.isPending}>
            {upsert.isPending ? "Salvando..." : "Salvar configurações"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
