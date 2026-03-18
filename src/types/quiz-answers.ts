export interface QuizAnswer {
  form_answer_id: string;
  question_id: string;
  question_key: string;
  question_text: string;
  input_type: string;
  option_id: string | null;
  option_key: string | null;
  option_text: string | null;
  answer_text: string | null;
  answer_number: number | null;
  answer_bool: boolean | null;
  answered_at: string;
}

export interface QuizAnswersResponse {
  capture_id: string;
  quiz_answered: boolean;
  form_version_id: string;
  form_response_id: string;
  submitted_at: string;
  score_total: number;
  faixa: string;
  answers: QuizAnswer[];
}
