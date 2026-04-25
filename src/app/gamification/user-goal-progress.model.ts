export interface UserGoalProgressRequest {
  attendance_id: number;
  date_init: string;
  date_end: string;
}

/** Resposta do `GamifiedGoalsService::evaluateForPeriod` (Laravel). */
export interface GamifiedGoalPeriodDto {
  date_init: string;
  date_end: string;
  months: number;
  quarters: number;
}

export interface GamifiedGoalItemDto {
  key: string;
  label: string;
  target: number | string | null;
  target_label?: string | null;
  current?: number | string | null;
  current_label?: string | null;
  current_raw?: number;
  percentage: number;
  achieved: boolean;
  not_evaluated?: boolean;
  message?: string;
  total_jobs?: number;
  approved_jobs?: number;
}

export interface GamifiedGoalsApiResponse {
  period?: GamifiedGoalPeriodDto;
  attendance_id?: number;
  jobs_count?: number;
  goals?: GamifiedGoalItemDto[];
}

export type GamificationGoalKind =
  | "currency"
  | "count"
  | "percent"
  | "boolean"
  | "unevaluated";

export interface GamificationGoalView {
  id: string;
  order: number;
  title: string;
  hint: string;
  kind: GamificationGoalKind;
  current: number;
  target: number;
  percent: number;
  statusLabel: string;
  statusModifier: string;
  detailLine: string;
  missingTarget: boolean;
  /** Quando o backend já marcou a meta como atingida. */
  achievedFromApi?: boolean;
  /** Quando o backend indica que a meta ainda não foi avaliada. */
  notEvaluated?: boolean;
  /** Exibir rótulos formatados vindos do PHP (ex.: conversão "12,3%"). */
  useLabelsFromApi?: boolean;
  currentDisplay?: string;
  targetDisplay?: string;
}
