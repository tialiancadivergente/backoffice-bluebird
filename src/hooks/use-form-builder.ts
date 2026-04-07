import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "@/api/form-builder";
import type { UUID } from "@/types/form-builder";

// ── Forms ──
export const useFormDetail = (id: UUID) =>
  useQuery({ queryKey: ["form", id], queryFn: () => api.getForm(id), enabled: !!id });

// ── Versions ──
export const useFormVersions = (formId: UUID) =>
  useQuery({ queryKey: ["form-versions", formId], queryFn: () => api.listVersions(formId), enabled: !!formId });

export const useFormVersion = (versionId: UUID) =>
  useQuery({ queryKey: ["form-version", versionId], queryFn: () => api.getVersion(versionId), enabled: !!versionId });

export const useCreateVersion = (formId: UUID) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof api.createVersion>[1]) => api.createVersion(formId, body),
    onSuccess: () => { toast.success("Versão criada!"); qc.invalidateQueries({ queryKey: ["form-versions", formId] }); },
    onError: () => toast.error("Erro ao criar versão."),
  });
};

export const useUpdateVersion = (formId: UUID) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ versionId, body }: { versionId: UUID; body: Parameters<typeof api.updateVersion>[1] }) => api.updateVersion(versionId, body),
    onSuccess: () => { toast.success("Versão atualizada!"); qc.invalidateQueries({ queryKey: ["form-versions", formId] }); },
    onError: () => toast.error("Erro ao atualizar versão."),
  });
};

export const useActivateVersion = (formId: UUID) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (versionId: UUID) => api.activateVersion(versionId),
    onSuccess: () => { toast.success("Versão ativada!"); qc.invalidateQueries({ queryKey: ["form-versions", formId] }); },
    onError: () => toast.error("Erro ao ativar versão."),
  });
};

export const useDeleteVersion = (formId: UUID) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (versionId: UUID) => api.deleteVersion(versionId),
    onSuccess: () => { toast.success("Versão excluída!"); qc.invalidateQueries({ queryKey: ["form-versions", formId] }); },
    onError: () => toast.error("Erro ao excluir versão."),
  });
};

// ── Questions ──
export const useFormQuestions = (formId: UUID) =>
  useQuery({ queryKey: ["form-questions", formId], queryFn: () => api.listQuestions(formId), enabled: !!formId });

export const useCreateQuestion = (formId: UUID) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof api.createQuestion>[1]) => api.createQuestion(formId, body),
    onSuccess: () => { toast.success("Pergunta criada!"); qc.invalidateQueries({ queryKey: ["form-questions", formId] }); },
    onError: () => toast.error("Erro ao criar pergunta."),
  });
};

export const useUpdateQuestion = (formId: UUID) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, body }: { questionId: UUID; body: Parameters<typeof api.updateQuestion>[1] }) => api.updateQuestion(questionId, body),
    onSuccess: () => { toast.success("Pergunta atualizada!"); qc.invalidateQueries({ queryKey: ["form-questions", formId] }); },
    onError: () => toast.error("Erro ao atualizar pergunta."),
  });
};

export const useDeleteQuestion = (formId: UUID) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (questionId: UUID) => api.deleteQuestion(questionId),
    onSuccess: () => { toast.success("Pergunta excluída!"); qc.invalidateQueries({ queryKey: ["form-questions", formId] }); },
    onError: () => toast.error("Erro ao excluir pergunta."),
  });
};

// ── Question Options ──
export const useQuestionOptions = (questionId: UUID) =>
  useQuery({ queryKey: ["question-options", questionId], queryFn: () => api.listQuestionOptions(questionId), enabled: !!questionId });

export const useCreateQuestionOption = (questionId: UUID) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof api.createQuestionOption>[1]) => api.createQuestionOption(questionId, body),
    onSuccess: () => { toast.success("Opção criada!"); qc.invalidateQueries({ queryKey: ["question-options", questionId] }); },
    onError: () => toast.error("Erro ao criar opção."),
  });
};

export const useUpdateQuestionOption = (questionId: UUID) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ optionId, body }: { optionId: UUID; body: Parameters<typeof api.updateQuestionOption>[1] }) => api.updateQuestionOption(optionId, body),
    onSuccess: () => { toast.success("Opção atualizada!"); qc.invalidateQueries({ queryKey: ["question-options", questionId] }); },
    onError: () => toast.error("Erro ao atualizar opção."),
  });
};

export const useDeleteQuestionOption = (questionId: UUID) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (optionId: UUID) => api.deleteQuestionOption(optionId),
    onSuccess: () => { toast.success("Opção excluída!"); qc.invalidateQueries({ queryKey: ["question-options", questionId] }); },
    onError: () => toast.error("Erro ao excluir opção."),
  });
};

// ── Version Questions ──
export const useVersionQuestions = (versionId: UUID) =>
  useQuery({ queryKey: ["version-questions", versionId], queryFn: () => api.listVersionQuestions(versionId), enabled: !!versionId });

export const useAddVersionQuestion = (versionId: UUID) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof api.addVersionQuestion>[1]) => api.addVersionQuestion(versionId, body),
    onSuccess: () => { toast.success("Pergunta vinculada!"); qc.invalidateQueries({ queryKey: ["version-questions", versionId] }); },
    onError: () => toast.error("Erro ao vincular pergunta."),
  });
};

export const useUpdateVersionQuestion = (versionId: UUID) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, body }: { questionId: UUID; body: Parameters<typeof api.updateVersionQuestion>[2] }) => api.updateVersionQuestion(versionId, questionId, body),
    onSuccess: () => { toast.success("Atualizado!"); qc.invalidateQueries({ queryKey: ["version-questions", versionId] }); },
    onError: () => toast.error("Erro ao atualizar."),
  });
};

export const useDeleteVersionQuestion = (versionId: UUID) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (questionId: UUID) => api.deleteVersionQuestion(versionId, questionId),
    onSuccess: () => { toast.success("Pergunta desvinculada!"); qc.invalidateQueries({ queryKey: ["version-questions", versionId] }); },
    onError: () => toast.error("Erro ao desvincular."),
  });
};

export const useReorderVersionQuestions = (versionId: UUID) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof api.reorderVersionQuestions>[1]) => api.reorderVersionQuestions(versionId, body),
    onSuccess: () => { toast.success("Ordem atualizada!"); qc.invalidateQueries({ queryKey: ["version-questions", versionId] }); },
    onError: () => toast.error("Erro ao reordenar."),
  });
};

// ── Scores ──
export const useScores = (versionId: UUID) =>
  useQuery({ queryKey: ["scores", versionId], queryFn: () => api.listScores(versionId), enabled: !!versionId });

export const useCreateScore = (versionId: UUID) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof api.createScore>[1]) => api.createScore(versionId, body),
    onSuccess: () => { toast.success("Score criado!"); qc.invalidateQueries({ queryKey: ["scores", versionId] }); },
    onError: () => toast.error("Erro ao criar score."),
  });
};

export const useUpdateScore = (versionId: UUID) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ scoreId, body }: { scoreId: UUID; body: Parameters<typeof api.updateScore>[1] }) => api.updateScore(scoreId, body),
    onSuccess: () => { toast.success("Score atualizado!"); qc.invalidateQueries({ queryKey: ["scores", versionId] }); },
    onError: () => toast.error("Erro ao atualizar score."),
  });
};

export const useActivateScore = (versionId: UUID) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (scoreId: UUID) => api.activateScore(scoreId),
    onSuccess: () => { toast.success("Score ativado!"); qc.invalidateQueries({ queryKey: ["scores", versionId] }); },
    onError: () => toast.error("Erro ao ativar score."),
  });
};

export const useDeleteScore = (versionId: UUID) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (scoreId: UUID) => api.deleteScore(scoreId),
    onSuccess: () => { toast.success("Score excluído!"); qc.invalidateQueries({ queryKey: ["scores", versionId] }); },
    onError: () => toast.error("Erro ao excluir score."),
  });
};

// ── Score Points ──
export const useOptionPoints = (scoreId: UUID) =>
  useQuery({ queryKey: ["option-points", scoreId], queryFn: () => api.listOptionPoints(scoreId), enabled: !!scoreId });

export const useReplaceOptionPoints = (scoreId: UUID) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof api.replaceOptionPoints>[1]) => api.replaceOptionPoints(scoreId, body),
    onSuccess: () => { toast.success("Pontos atualizados!"); qc.invalidateQueries({ queryKey: ["option-points", scoreId] }); },
    onError: () => toast.error("Erro ao atualizar pontos."),
  });
};

export const useRangePoints = (scoreId: UUID) =>
  useQuery({ queryKey: ["range-points", scoreId], queryFn: () => api.listRangePoints(scoreId), enabled: !!scoreId });

export const useReplaceRangePoints = (scoreId: UUID) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof api.replaceRangePoints>[1]) => api.replaceRangePoints(scoreId, body),
    onSuccess: () => { toast.success("Ranges atualizados!"); qc.invalidateQueries({ queryKey: ["range-points", scoreId] }); },
    onError: () => toast.error("Erro ao atualizar ranges."),
  });
};

// ── Full Form ──
export const useCreateFullForm = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof api.createFullForm>[0]) => api.createFullForm(body),
    onSuccess: () => { toast.success("Formulário completo criado!"); qc.invalidateQueries({ queryKey: ["forms"] }); },
    onError: () => toast.error("Erro ao criar formulário completo."),
  });
};
