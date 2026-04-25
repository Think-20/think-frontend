import { GamificationGoalView, GamificationGoalKind } from "./user-goal-progress.model";

export interface GoalDefinition {
  id: string;
  order: number;
  title: string;
  hint: string;
  kind: GamificationGoalKind;
  apiKeys: string[];
  defaultTarget: number | null;
}

export const GAMIFICATION_GOAL_DEFINITIONS: GoalDefinition[] = [
  {
    id: "internal_month_value",
    order: 1,
    title: "Valor de jobs internos no período",
    hint: "Soma do valor dos jobs internos no intervalo selecionado (conforme regras do sistema).",
    kind: "currency",
    apiKeys: [
      "internal_month_value",
      "internal_jobs_value_month",
      "valor_jobs_internos_mes",
      "month_internal_value",
      "internal_value_month",
      "internal_value_per_month"
    ],
    defaultTarget: null
  },
  {
    id: "internal_jobs_over_150k",
    order: 2,
    title: "Jobs internos acima de R$ 150 mil",
    hint: "Meta: pelo menos 2 jobs internos com valor maior que R$ 150.000 no período.",
    kind: "count",
    apiKeys: [
      "internal_jobs_over_150k",
      "internal_high_value_150k",
      "jobs_internos_150k",
      "internal_150k_count",
      "internal_projects_above_150k"
    ],
    defaultTarget: 2
  },
  {
    id: "internal_approved_300k",
    order: 3,
    title: "Job interno aprovado acima de R$ 300 mil",
    hint: "Meta: pelo menos um job interno aprovado com valor maior que R$ 300.000.",
    kind: "boolean",
    apiKeys: [
      "internal_approved_300k",
      "internal_approved_over_300k",
      "job_interno_300k",
      "internal_projects_above_300k"
    ],
    defaultTarget: 1
  },
  {
    id: "internal_approved_600k",
    order: 4,
    title: "Job interno aprovado acima de R$ 600 mil",
    hint: "Meta: pelo menos um job interno aprovado com valor maior que R$ 600.000.",
    kind: "boolean",
    apiKeys: [
      "internal_approved_600k",
      "internal_approved_over_600k",
      "job_interno_600k",
      "internal_projects_above_600k"
    ],
    defaultTarget: 1
  },
  {
    id: "internal_approved_1500k",
    order: 5,
    title: "Job interno aprovado acima de R$ 1,5 mi",
    hint: "Meta: pelo menos um job interno aprovado com valor maior que R$ 1.500.000.",
    kind: "boolean",
    apiKeys: [
      "internal_approved_1500k",
      "internal_approved_over_1500k",
      "job_interno_1500k",
      "internal_projects_above_1500k"
    ],
    defaultTarget: 1
  },
  {
    id: "external_conversion_percent",
    order: 7,
    title: "Conversão de jobs externos",
    hint: "Meta: converter pelo menos 15% dos jobs externos em aprovados no período.",
    kind: "percent",
    apiKeys: [
      "external_conversion_percent",
      "external_approved_percent",
      "percentual_externos_aprovados",
      "conversion_external_15"
    ],
    defaultTarget: 15
  },
  {
    id: "internal_approval_percent",
    order: 8,
    title: "Taxa de aprovação de jobs internos",
    hint: "Meta: ter pelo menos 25% dos jobs internos aprovados no período.",
    kind: "percent",
    apiKeys: [
      "internal_approval_percent",
      "internal_approved_percent",
      "percentual_internos_aprovados",
      "conversion_internal_25"
    ],
    defaultTarget: 25
  },
  {
    id: "approved_jobs_quarter",
    order: 9,
    title: "Jobs aprovados (janela de 3 meses)",
    hint: "Meta: pelo menos 6 jobs aprovados a cada 3 meses (o período enviado deve refletir a janela avaliada).",
    kind: "count",
    apiKeys: [
      "approved_jobs_quarter",
      "approved_jobs_3_months",
      "jobs_aprovados_trimestre",
      "approved_count_period",
      "min_approvals_per_quarter"
    ],
    defaultTarget: 6
  }
];

function resolveDataRoot(raw: any): any {
  if (!raw || typeof raw !== "object") {
    return {};
  }
  if (raw.data && typeof raw.data === "object") {
    return raw.data;
  }
  if (raw.progress && typeof raw.progress === "object") {
    return raw.progress;
  }
  return raw;
}

function getPhpGoalsArray(raw: any): any[] | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  if (Array.isArray(raw.goals) && raw.goals.length > 0) {
    return raw.goals;
  }
  if (raw.data && Array.isArray(raw.data.goals) && raw.data.goals.length > 0) {
    return raw.data.goals;
  }
  return null;
}

function clampPercentValue(p: number): number {
  if (isNaN(p) || p < 0) {
    return 0;
  }
  if (p > 100) {
    return 100;
  }
  return p;
}

/** Interpreta "15%", "15,5%" ou número. */
function parsePercentLike(value: any): number {
  if (typeof value === "number" && !isNaN(value)) {
    return value;
  }
  if (typeof value !== "string") {
    return NaN;
  }
  var s = value.replace(/\s/g, "").replace("%", "");
  if (s.indexOf(",") >= 0 && s.indexOf(".") >= 0) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else {
    s = s.replace(",", ".");
  }
  var n = Number(s);
  return isNaN(n) ? NaN : n;
}

function statusFromProgress(percent: number, achieved: boolean): { label: string; modifier: string } {
  if (achieved) {
    return { label: "Meta cumprida", modifier: "gamification-goal-card--met" };
  }
  var p = clampPercentValue(percent);
  if (p >= 80) {
    return { label: "Quase lá", modifier: "gamification-goal-card--close" };
  }
  if (p >= 40) {
    return { label: "No caminho", modifier: "gamification-goal-card--progress" };
  }
  return { label: "Abaixo da meta", modifier: "gamification-goal-card--far" };
}

function mapPhpGoalItem(item: any, index: number): GamificationGoalView {
  var key = item && item.key ? String(item.key) : "goal-" + index;
  var label = item && item.label ? String(item.label) : key;
  var pctRaw = item && typeof item.percentage === "number" ? item.percentage : 0;
  var percent = clampPercentValue(pctRaw);
  var achieved = item && item.achieved === true;

  if (item && item.not_evaluated === true) {
    var msg = item.message ? String(item.message) : "Avaliação ainda não disponível no sistema.";
    return {
      id: key,
      order: index + 1,
      title: label,
      hint: "",
      kind: "unevaluated",
      current: 0,
      target: 0,
      percent: 0,
      statusLabel: "Não avaliado",
      statusModifier: "gamification-goal-card--neutral",
      detailLine: msg,
      missingTarget: true,
      notEvaluated: true,
      achievedFromApi: false
    };
  }

  var kind: GamificationGoalKind = "count";
  var current = 0;
  var target = 0;
  var useLabels = false;
  var currentDisplay = "";
  var targetDisplay = "";
  var hint = item && item.target_label ? String(item.target_label) : "";
  var detailLine = "";

  if (key === "internal_value_per_month") {
    kind = "currency";
    current = typeof item.current === "number" ? item.current : Number(item.current);
    target = typeof item.target === "number" ? item.target : Number(item.target);
    if (isNaN(current)) {
      current = 0;
    }
    if (isNaN(target)) {
      target = 0;
    }
    if (item.current_label) {
      detailLine =
        "Total aprovado (interno) no período: R$ " +
        String(item.current_label) +
        ". Meta do período: " +
        (item.target_label ? String(item.target_label) : "") +
        ".";
    } else if (item.target_label) {
      detailLine = "Meta de referência do período: " + String(item.target_label) + ".";
    }
  } else if (key === "conversion_external_15" || key === "conversion_internal_25") {
    kind = "percent";
    useLabels = true;
    var rawConv = typeof item.current_raw === "number" ? item.current_raw : parsePercentLike(item.current);
    if (isNaN(rawConv)) {
      rawConv = 0;
    }
    current = rawConv;
    target = parsePercentLike(item.target);
    if (isNaN(target)) {
      target = key === "conversion_external_15" ? 15 : 25;
    }
    currentDisplay = typeof item.current === "string" ? String(item.current) : current.toFixed(1) + "%";
    targetDisplay = typeof item.target === "string" ? String(item.target) : target.toFixed(0) + "%";
    var tj = item.total_jobs;
    var aj = item.approved_jobs;
    if (tj !== undefined && tj !== null) {
      detailLine =
        "Jobs no período: " +
        String(tj) +
        (aj !== undefined && aj !== null ? " — aprovados: " + String(aj) + "." : ".");
    }
  } else {
    kind = "count";
    current = typeof item.current === "number" ? item.current : Number(item.current);
    target = typeof item.target === "number" ? item.target : Number(item.target);
    if (isNaN(current)) {
      current = 0;
    }
    if (isNaN(target)) {
      target = 0;
    }
    if (item.target_label) {
      detailLine = "Escala da meta neste intervalo: " + String(item.target_label) + ".";
    } else if (key === "presencial_2x_week") {
      detailLine = "Presenças no escritório conforme registros do sistema no período selecionado.";
    }
  }

  var st = statusFromProgress(percent, achieved);

  return {
    id: key,
    order: index + 1,
    title: label,
    hint: hint,
    kind: kind,
    current: current,
    target: target,
    percent: percent,
    statusLabel: st.label,
    statusModifier: st.modifier,
    detailLine: detailLine,
    missingTarget: false,
    achievedFromApi: achieved,
    useLabelsFromApi: useLabels,
    currentDisplay: useLabels ? currentDisplay : undefined,
    targetDisplay: useLabels ? targetDisplay : undefined
  };
}

/**
 * Mapeia a resposta do `GamifiedGoalsService` (array `goals` com `key`, `percentage`, `achieved`, etc.).
 */
export function mapPhpGamifiedGoalsResponse(raw: any): GamificationGoalView[] | null {
  var arr = getPhpGoalsArray(raw);
  if (!arr) {
    return null;
  }
  var out: GamificationGoalView[] = [];
  var i: number;
  for (i = 0; i < arr.length; i++) {
    out.push(mapPhpGoalItem(arr[i], i));
  }
  return out;
}

function readNumberFromObject(source: any, keys: string[]): number {
  if (!source || typeof source !== "object") {
    return NaN;
  }
  var i: number;
  for (i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (!Object.prototype.hasOwnProperty.call(source, k)) {
      continue;
    }
    var v = source[k];
    if (typeof v === "number" && !isNaN(v)) {
      return v;
    }
    if (typeof v === "string" && v !== "" && !isNaN(Number(v))) {
      return Number(v);
    }
  }
  return NaN;
}

function parseSlice(slice: any, defaultTarget: number | null): { current: number; target: number } {
  var current = 0;
  var target = defaultTarget !== null && defaultTarget !== undefined ? defaultTarget : 0;

  if (slice === null || slice === undefined) {
    return { current: current, target: target };
  }

  if (typeof slice === "number" && !isNaN(slice)) {
    return { current: slice, target: target };
  }

  if (typeof slice === "boolean") {
    return { current: slice ? 1 : 0, target: target > 0 ? target : 1 };
  }

  if (typeof slice === "string" && slice !== "" && !isNaN(Number(slice))) {
    return { current: Number(slice), target: target };
  }

  if (typeof slice === "object") {
    var c = readNumberFromObject(slice, [
      "current",
      "value",
      "atual",
      "conquistado",
      "count",
      "total",
      "quantidade",
      "realizado"
    ]);
    var t = readNumberFromObject(slice, ["target", "meta", "goal", "objetivo"]);

    if (slice.achieved === true || slice.completed === true || slice.cumprido === true) {
      c = 1;
    } else if (slice.achieved === false || slice.completed === false) {
      if (isNaN(c)) {
        c = 0;
      }
    }

    if (!isNaN(c)) {
      current = c;
    }
    if (!isNaN(t)) {
      target = t;
    } else if (defaultTarget !== null && defaultTarget !== undefined) {
      target = defaultTarget;
    }

    return { current: current, target: target };
  }

  return { current: 0, target: target };
}

function findSlice(root: any, keys: string[]): any {
  if (!root) {
    return null;
  }
  var i: number;
  for (i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (Object.prototype.hasOwnProperty.call(root, k) && root[k] !== undefined && root[k] !== null) {
      return root[k];
    }
  }
  return null;
}

function clampPercentInt(value: number): number {
  if (isNaN(value) || value < 0) {
    return 0;
  }
  if (value > 100) {
    return 100;
  }
  return Math.round(value);
}

function buildStatus(
  percent: number,
  current: number,
  target: number,
  missingTarget: boolean
): { label: string; modifier: string } {
  if (missingTarget) {
    return { label: "Meta não informada", modifier: "gamification-goal-card--neutral" };
  }
  if (target <= 0 && current > 0) {
    return { label: "Em acompanhamento", modifier: "gamification-goal-card--progress" };
  }
  if (target <= 0) {
    return { label: "Sem referência", modifier: "gamification-goal-card--neutral" };
  }
  if (current >= target) {
    return { label: "Meta cumprida", modifier: "gamification-goal-card--met" };
  }
  if (percent >= 80) {
    return { label: "Quase lá", modifier: "gamification-goal-card--close" };
  }
  if (percent >= 40) {
    return { label: "No caminho", modifier: "gamification-goal-card--progress" };
  }
  return { label: "Abaixo da meta", modifier: "gamification-goal-card--far" };
}

function buildDetailLine(
  kind: GamificationGoalKind,
  current: number,
  target: number,
  missingTarget: boolean
): string {
  if (missingTarget) {
    return "Aguardando meta do sistema para comparar o seu resultado.";
  }
  if (kind === "currency") {
    return (
      "Resultado no período frente à meta definida (valores em R$). " +
      "Acompanhe o preenchimento da barra e o resumo numérico abaixo."
    );
  }
  if (kind === "percent") {
    return (
      "Atual: " +
      clampPercentInt(current).toString() +
      "% — Meta: " +
      clampPercentInt(target).toString() +
      "%."
    );
  }
  if (kind === "boolean") {
    return (
      "Conquistas: " +
      Math.floor(current).toString() +
      " de " +
      Math.floor(target).toString() +
      " exigida(s)."
    );
  }
  return (
    "Atual: " +
    Math.floor(current).toString() +
    " — Meta: " +
    Math.floor(target).toString() +
    "."
  );
}

function mapLegacyUserGoalProgressToViews(raw: any): GamificationGoalView[] {
  var root = resolveDataRoot(raw);
  var out: GamificationGoalView[] = [];
  var di: number;

  for (di = 0; di < GAMIFICATION_GOAL_DEFINITIONS.length; di++) {
    var def = GAMIFICATION_GOAL_DEFINITIONS[di];
    var slice = findSlice(root, def.apiKeys);
    var parsed = parseSlice(slice, def.defaultTarget);
    var current = parsed.current;
    var target = parsed.target;
    var missingTarget = def.defaultTarget === null && (target === 0 || isNaN(target));

    if (missingTarget) {
      target = 0;
    }

    var percent = 0;
    if (target > 0) {
      percent = clampPercentInt((current / target) * 100);
    } else if (current > 0 && !missingTarget) {
      percent = 100;
    }

    var st = buildStatus(percent, current, target, missingTarget);

    out.push({
      id: def.id,
      order: def.order,
      title: def.title,
      hint: def.hint,
      kind: def.kind,
      current: current,
      target: target,
      percent: percent,
      statusLabel: st.label,
      statusModifier: st.modifier,
      detailLine: buildDetailLine(def.kind, current, target, missingTarget),
      missingTarget: missingTarget
    });
  }

  return out;
}

/**
 * Prioriza o formato `GamifiedGoalsService` (`goals[]`). Caso não exista, usa o mapeamento legado por chaves soltas.
 */
export function mapUserGoalProgressToViews(raw: any): GamificationGoalView[] {
  var php = mapPhpGamifiedGoalsResponse(raw);
  if (php && php.length > 0) {
    return php;
  }
  return mapLegacyUserGoalProgressToViews(raw);
}
