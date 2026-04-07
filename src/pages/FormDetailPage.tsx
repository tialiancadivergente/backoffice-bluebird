import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFormDetail } from "@/hooks/use-form-builder";
import { VersionsTab } from "@/components/form-builder/VersionsTab";
import { QuestionsTab } from "@/components/form-builder/QuestionsTab";
import { ScoresTab } from "@/components/form-builder/ScoresTab";
import { VersionQuestionsTab } from "@/components/form-builder/VersionQuestionsTab";
import type { FormVersionResponse } from "@/types/form-builder";

export default function FormDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: form, isLoading, isError } = useFormDetail(id!);
  const [selectedVersion, setSelectedVersion] = useState<FormVersionResponse | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !form) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/forms")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-destructive text-sm">
          Erro ao carregar o formulário.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/forms")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{form.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            {form.type && <Badge variant="outline">{form.type}</Badge>}
            {selectedVersion && (
              <Badge variant="secondary">v{selectedVersion.version_number} {selectedVersion.active ? "(Ativa)" : ""}</Badge>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="versions">
        <TabsList>
          <TabsTrigger value="versions">Versões</TabsTrigger>
          <TabsTrigger value="questions">Perguntas</TabsTrigger>
          <TabsTrigger value="version-questions" disabled={!selectedVersion}>
            Perguntas da Versão
          </TabsTrigger>
          <TabsTrigger value="scores" disabled={!selectedVersion}>
            Pontuação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="versions">
          <VersionsTab
            formId={id!}
            onSelectVersion={setSelectedVersion}
            selectedVersionId={selectedVersion?.id}
          />
        </TabsContent>

        <TabsContent value="questions">
          <QuestionsTab formId={id!} />
        </TabsContent>

        <TabsContent value="version-questions">
          {selectedVersion ? (
            <VersionQuestionsTab formId={id!} versionId={selectedVersion.id} />
          ) : (
            <div className="text-center text-muted-foreground py-12">
              Selecione uma versão na aba "Versões" primeiro.
            </div>
          )}
        </TabsContent>

        <TabsContent value="scores">
          {selectedVersion ? (
            <ScoresTab versionId={selectedVersion.id} formId={id!} />
          ) : (
            <div className="text-center text-muted-foreground py-12">
              Selecione uma versão na aba "Versões" primeiro.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
