import axios from "axios";
import type {
  ListFormQuery, ListFormItem, CreateFormDto, UpdateFormDto, FormResponse,
  FormVersionResponse, CreateFormVersionDto, UpdateFormVersionDto,
  QuestionResponse, CreateQuestionDto, UpdateQuestionDto,
  QuestionOptionResponse, CreateQuestionOptionDto, UpdateQuestionOptionDto,
  FormVersionQuestionResponse, AddFormVersionQuestionDto, UpdateFormVersionQuestionDto,
  ReorderFormVersionQuestionsDto,
  LeadscoreResponse, CreateLeadscoreDto, UpdateLeadscoreDto,
  LeadscoreOptionPointResponse, ReplaceLeadscoreOptionPointsDto,
  LeadscoreRangePointResponse, ReplaceLeadscoreRangePointsDto,
  CreateFullFormPayload, CreateFullFormResponse,
  UUID,
} from "@/types/form-builder";

const client = axios.create({
  baseURL: "https://leads-api.aliancadivergente.com.br",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "lsk_prod_v1_W7mQ9nX2fK8rT4yP6cV3uJ1hD5sL0aB8eR2qN7tY4zM9pC6xG1kF5vH3jS8dU2",
  },
});

// ── Forms ──
export const listForms = async (params?: ListFormQuery) => {
  const { data } = await client.get<ListFormItem[]>("/form", { params });
  return Array.isArray(data) ? data : (data as any)?.items ?? [];
};
export const getForm = async (id: UUID) => (await client.get<FormResponse>(`/form/${id}`)).data;
export const createForm = async (body: CreateFormDto) => (await client.post<FormResponse>("/form", body)).data;
export const updateForm = async (id: UUID, body: UpdateFormDto) => (await client.patch<FormResponse>(`/form/${id}`, body)).data;
export const deleteForm = async (id: UUID) => { await client.delete(`/form/${id}`); };

// ── Versions ──
export const listVersions = async (formId: UUID) => (await client.get<FormVersionResponse[]>(`/form/${formId}/versions`)).data;
export const getVersion = async (versionId: UUID) => (await client.get<FormVersionResponse>(`/form/versions/${versionId}`)).data;
export const createVersion = async (formId: UUID, body: CreateFormVersionDto) => (await client.post<FormVersionResponse>(`/form/${formId}/versions`, body)).data;
export const updateVersion = async (versionId: UUID, body: UpdateFormVersionDto) => (await client.patch<FormVersionResponse>(`/form/versions/${versionId}`, body)).data;
export const activateVersion = async (versionId: UUID) => (await client.post<FormVersionResponse>(`/form/versions/${versionId}/activate`)).data;
export const deleteVersion = async (versionId: UUID) => { await client.delete(`/form/versions/${versionId}`); };

// ── Questions ──
export const listQuestions = async (formId: UUID) => (await client.get<QuestionResponse[]>(`/form/${formId}/questions`)).data;
export const getQuestion = async (questionId: UUID) => (await client.get<QuestionResponse>(`/form/questions/${questionId}`)).data;
export const createQuestion = async (formId: UUID, body: CreateQuestionDto) => (await client.post<QuestionResponse>(`/form/${formId}/questions`, body)).data;
export const updateQuestion = async (questionId: UUID, body: UpdateQuestionDto) => (await client.patch<QuestionResponse>(`/form/questions/${questionId}`, body)).data;
export const deleteQuestion = async (questionId: UUID) => { await client.delete(`/form/questions/${questionId}`); };

// ── Question Options ──
export const listQuestionOptions = async (questionId: UUID) => (await client.get<QuestionOptionResponse[]>(`/form/questions/${questionId}/options`)).data;
export const createQuestionOption = async (questionId: UUID, body: CreateQuestionOptionDto) => (await client.post<QuestionOptionResponse>(`/form/questions/${questionId}/options`, body)).data;
export const updateQuestionOption = async (optionId: UUID, body: UpdateQuestionOptionDto) => (await client.patch<QuestionOptionResponse>(`/form/options/${optionId}`, body)).data;
export const deleteQuestionOption = async (optionId: UUID) => { await client.delete(`/form/options/${optionId}`); };

// ── Version Questions ──
export const listVersionQuestions = async (versionId: UUID) => (await client.get<FormVersionQuestionResponse[]>(`/form/versions/${versionId}/questions`)).data;
export const addVersionQuestion = async (versionId: UUID, body: AddFormVersionQuestionDto) => (await client.post<FormVersionQuestionResponse>(`/form/versions/${versionId}/questions`, body)).data;
export const updateVersionQuestion = async (versionId: UUID, questionId: UUID, body: UpdateFormVersionQuestionDto) => (await client.patch<FormVersionQuestionResponse>(`/form/versions/${versionId}/questions/${questionId}`, body)).data;
export const deleteVersionQuestion = async (versionId: UUID, questionId: UUID) => { await client.delete(`/form/versions/${versionId}/questions/${questionId}`); };
export const reorderVersionQuestions = async (versionId: UUID, body: ReorderFormVersionQuestionsDto) => (await client.put<FormVersionQuestionResponse[]>(`/form/versions/${versionId}/questions/reorder`, body)).data;

// ── Scores ──
export const listScores = async (versionId: UUID) => (await client.get<LeadscoreResponse[]>(`/form/versions/${versionId}/scores`)).data;
export const createScore = async (versionId: UUID, body: CreateLeadscoreDto) => (await client.post<LeadscoreResponse>(`/form/versions/${versionId}/scores`, body)).data;
export const updateScore = async (scoreId: UUID, body: UpdateLeadscoreDto) => (await client.patch<LeadscoreResponse>(`/form/scores/${scoreId}`, body)).data;
export const activateScore = async (scoreId: UUID) => (await client.post<LeadscoreResponse>(`/form/scores/${scoreId}/activate`)).data;
export const deleteScore = async (scoreId: UUID) => { await client.delete(`/form/scores/${scoreId}`); };

// ── Score Points ──
export const listOptionPoints = async (scoreId: UUID) => (await client.get<LeadscoreOptionPointResponse[]>(`/form/scores/${scoreId}/option-points`)).data;
export const replaceOptionPoints = async (scoreId: UUID, body: ReplaceLeadscoreOptionPointsDto) => (await client.put<LeadscoreOptionPointResponse[]>(`/form/scores/${scoreId}/option-points`, body)).data;
export const listRangePoints = async (scoreId: UUID) => (await client.get<LeadscoreRangePointResponse[]>(`/form/scores/${scoreId}/range-points`)).data;
export const replaceRangePoints = async (scoreId: UUID, body: ReplaceLeadscoreRangePointsDto) => (await client.put<LeadscoreRangePointResponse[]>(`/form/scores/${scoreId}/range-points`, body)).data;

// ── Full Form ──
export const createFullForm = async (body: CreateFullFormPayload) => (await client.post<CreateFullFormResponse>("/form/full", body)).data;
