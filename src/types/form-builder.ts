export type UUID = string;

export type ListFormQuery = {
  launch_id?: UUID;
  season_id?: UUID;
  type?: string;
};

export type ListFormItem = {
  id: UUID;
  name: string;
  type: string | null;
  launch_id: UUID | null;
  season_id: UUID | null;
};

export type CreateFormDto = {
  name: string;
  type?: string;
  launch_id?: UUID;
  season_id?: UUID;
};

export type UpdateFormDto = {
  name?: string;
  type?: string;
  launch_id?: UUID;
  season_id?: UUID;
};

export type FormResponse = {
  id: UUID;
  name: string;
  type: string | null;
  launch_id: UUID | null;
  season_id: UUID | null;
  created_at: string;
  updated_at: string;
};

export type FormVersionResponse = {
  id: UUID;
  form_id: UUID;
  version_number: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateFormVersionDto = {
  version_number?: number;
  active?: boolean;
};

export type UpdateFormVersionDto = {
  version_number?: number;
  active?: boolean;
};

export type QuestionResponse = {
  id: UUID;
  form_id: UUID;
  question_key: string;
  question_text?: string;
  input_type?: string;
  created_at: string;
  updated_at: string;
};

export type CreateQuestionDto = {
  question_key: string;
  question_text?: string;
  input_type?: string;
};

export type UpdateQuestionDto = {
  question_key?: string;
  question_text?: string;
  input_type?: string;
};

export type QuestionOptionResponse = {
  id: UUID;
  question_id: UUID;
  option_key: string;
  option_text?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type CreateQuestionOptionDto = {
  option_key: string;
  option_text?: string;
  display_order?: number;
};

export type UpdateQuestionOptionDto = {
  option_key?: string;
  option_text?: string;
  display_order?: number;
};

export type FormVersionQuestionResponse = {
  form_version_id: UUID;
  question_id: UUID;
  display_order: number;
  required: boolean;
  question_key: string;
  question_text?: string;
  input_type?: string;
};

export type AddFormVersionQuestionDto = {
  question_id: UUID;
  display_order?: number;
  required?: boolean;
};

export type UpdateFormVersionQuestionDto = {
  display_order?: number;
  required?: boolean;
};

export type ReorderFormVersionQuestionsDto = {
  items: Array<{
    question_id: UUID;
    display_order: number;
    required?: boolean;
  }>;
};

export type LeadscoreResponse = {
  id: UUID;
  form_version_id: UUID;
  name: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateLeadscoreDto = {
  name: string;
  active?: boolean;
};

export type UpdateLeadscoreDto = {
  name?: string;
  active?: boolean;
};

export type LeadscoreOptionPointResponse = {
  leadscore_id: UUID;
  question_id: UUID;
  option_id: UUID;
  question_key: string;
  option_key: string;
  points: number;
};

export type ReplaceLeadscoreOptionPointsDto = {
  items: Array<{
    question_id: UUID;
    option_id: UUID;
    points: number;
  }>;
};

export type LeadscoreRangePointResponse = {
  leadscore_id: UUID;
  question_id: UUID;
  question_key: string;
  min_value?: number | null;
  max_value?: number | null;
  points: number;
};

export type ReplaceLeadscoreRangePointsDto = {
  items: Array<{
    question_id: UUID;
    min_value?: number;
    max_value?: number;
    points: number;
  }>;
};

export type CreateFullFormPayload = {
  name: string;
  type?: string;
  launch_id?: UUID;
  season_id?: UUID;
  version_number?: number;
  version_active?: boolean;
  questions: Array<{
    question_key: string;
    question_text?: string;
    input_type?: string;
    display_order?: number;
    required?: boolean;
    options: Array<{
      option_key: string;
      option_text?: string;
      display_order?: number;
    }>;
  }>;
  scores?: Array<{
    name: string;
    active?: boolean;
    option_points?: Array<{
      question_key: string;
      option_key: string;
      points: number;
    }>;
    range_points?: Array<{
      question_key: string;
      min_value?: number;
      max_value?: number;
      points: number;
    }>;
  }>;
};

export type CreateFullFormResponse = {
  form: FormResponse;
  version: FormVersionResponse;
  questions_count: number;
  options_count: number;
  scores: LeadscoreResponse[];
};

export type ApiError = {
  statusCode: number;
  message: string | string[];
  error: string;
};
