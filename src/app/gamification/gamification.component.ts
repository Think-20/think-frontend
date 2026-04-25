import { Component, OnInit } from "@angular/core";
import { DatePipe } from "@angular/common";
import { MatSnackBar } from "@angular/material/snack-bar";

import { AuthService } from "../login/auth.service";
import { UserGoalService } from "./user-goal.service";
import { UserGoalProgressRequest } from "./user-goal-progress.model";
import { GamificationGoalView } from "./user-goal-progress.model";
import { mapUserGoalProgressToViews } from "./gamification-goals.mapper";
import { GamificationPdfExportService } from "app/shared/services/gamification-pdf-export.service";
import { EmployeeService } from "../employees/employee.service";
import { Employee } from "../employees/employee.model";

export type GamificationPeriodMode = "month" | "quarter" | "custom";

interface SelectOption<T> {
  value: T;
  label: string;
}

@Component({
  selector: "cb-gamification",
  templateUrl: "./gamification.component.html",
  styleUrls: ["./gamification.component.scss"]
})
export class GamificationComponent implements OnInit {
  periodMode: GamificationPeriodMode = "month";
  selectedYear: number;
  selectedMonth: number;
  selectedQuarter: number;

  customStartStr = "";
  customEndStr = "";

  goals: GamificationGoalView[] = [];
  rawResponse: any = null;
  loading = false;
  missingEmployee = false;
  lastRequest: UserGoalProgressRequest | null = null;

  readonly monthOptions: SelectOption<number>[] = [
    { value: 1, label: "Janeiro" },
    { value: 2, label: "Fevereiro" },
    { value: 3, label: "Março" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Maio" },
    { value: 6, label: "Junho" },
    { value: 7, label: "Julho" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" },
    { value: 11, label: "Novembro" },
    { value: 12, label: "Dezembro" }
  ];

  readonly quarterOptions: SelectOption<number>[] = [
    { value: 1, label: "T1 (jan–mar)" },
    { value: 2, label: "T2 (abr–jun)" },
    { value: 3, label: "T3 (jul–set)" },
    { value: 4, label: "T4 (out–dez)" }
  ];

  readonly periodModeSelectOptions: SelectOption<GamificationPeriodMode>[] = [
    { value: "month", label: "Mês" },
    { value: "quarter", label: "Trimestre" },
    { value: "custom", label: "Intervalo" }
  ];

  yearSelectOptions: SelectOption<number>[] = [];
  selectedYearOption: SelectOption<number> | null = null;
  selectedMonthOption: SelectOption<number> | null = null;
  selectedQuarterOption: SelectOption<number> | null = null;
  selectedPeriodModeOption: SelectOption<GamificationPeriodMode> | null = null;

  /** Diretoria: funcionários retornados por `EmployeeService.employees` para o select. */
  collaboratorEmployees: Employee[] = [];
  collaboratorSelectOptions: SelectOption<number>[] = [];
  selectedCollaboratorOption: SelectOption<number> | null = null;

  constructor(
    private auth: AuthService,
    private userGoalService: UserGoalService,
    private employeeService: EmployeeService,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar,
    private gamificationPdfExport: GamificationPdfExportService
  ) {
    var now = new Date();
    this.selectedYear = now.getFullYear();
    this.selectedMonth = now.getMonth() + 1;
    this.selectedQuarter = Math.floor(now.getMonth() / 3) + 1;
    this.yearSelectOptions = this.buildYearSelectOptions(this.selectedYear);
    this.selectedYearOption = this.findOptionByValue(this.yearSelectOptions, this.selectedYear);
    this.selectedMonthOption = this.findOptionByValue(this.monthOptions, this.selectedMonth);
    this.selectedQuarterOption = this.findOptionByValue(this.quarterOptions, this.selectedQuarter);
    this.selectedPeriodModeOption = this.findOptionByValue(this.periodModeSelectOptions, this.periodMode);
    this.customStartStr = this.toYmd(new Date(this.selectedYear, this.selectedMonth - 1, 1));
    this.customEndStr = this.toYmd(new Date(this.selectedYear, this.selectedMonth, 0));
  }

  ngOnInit() {
    if (this.isDiretoriaUser()) {
      this.loadCollaboratorsForDiretoria();
    } else {
      this.applyPeriod();
    }
  }

  isDiretoriaUser(): boolean {
    var u = this.auth.currentUser();
    return !!(u && u.employee && u.employee.department_id === 1);
  }

  get missingCollaboratorSelection(): boolean {
    if (!this.isDiretoriaUser()) {
      return false;
    }
    if (!this.selectedCollaboratorOption) {
      return true;
    }
    var v = this.selectedCollaboratorOption.value;
    return v === undefined || v === null || (typeof v === "number" && isNaN(v));
  }

  onCollaboratorOptionChange(opt: SelectOption<number> | null): void {
    this.selectedCollaboratorOption = opt;
    this.applyPeriod();
  }

  private loadCollaboratorsForDiretoria(): void {
    this.employeeService.employees({ paginate: false }).subscribe(
      (dataInfo) => {
        var raw = (dataInfo.pagination && dataInfo.pagination.data ? dataInfo.pagination.data : []) as Employee[];
        this.collaboratorEmployees = raw.filter(function (emp) {
          return emp && emp.id !== undefined && emp.id !== null;
        });
        this.collaboratorEmployees.sort(function (a, b) {
          return (a.name || "").localeCompare(b.name || "", "pt");
        });
        this.collaboratorSelectOptions = this.collaboratorEmployees.map(function (emp) {
          return { value: emp.id, label: emp.name || "—" };
        });
      },
      () => {
        this.collaboratorEmployees = [];
        this.collaboratorSelectOptions = [];
      }
    );
  }

  get goalsTotalCount(): number {
    return this.goals.length;
  }

  get goalsMetCount(): number {
    var c = 0;
    var i: number;
    for (i = 0; i < this.goals.length; i++) {
      if (this.isGoalMet(this.goals[i])) {
        c++;
      }
    }
    return c;
  }

  get goalsMetRatioRounded(): number {
    if (this.goalsTotalCount === 0) {
      return 0;
    }
    return Math.round((this.goalsMetCount / this.goalsTotalCount) * 100);
  }

  isGoalMet(goal: GamificationGoalView): boolean {
    if (this.presencialManualOverride(goal)) {
      return true;
    }
    if (goal.kind === "unevaluated") {
      return false;
    }
    if (goal.achievedFromApi) {
      return true;
    }
    if (!goal.missingTarget && goal.target > 0 && goal.current >= goal.target) {
      return true;
    }
    return false;
  }

  onPeriodModeOptionChange(opt: SelectOption<GamificationPeriodMode> | null): void {
    if (opt && opt.value) {
      this.periodMode = opt.value;
      if (this.periodMode === "custom" && (!this.customStartStr || !this.customEndStr)) {
        var startM = new Date(this.selectedYear, this.selectedMonth - 1, 1);
        var endM = new Date(this.selectedYear, this.selectedMonth, 0);
        this.customStartStr = this.toYmd(startM);
        this.customEndStr = this.toYmd(endM);
      }
    }
  }

  onYearOptionChange(opt: SelectOption<number> | null): void {
    if (opt && opt.value !== undefined && opt.value !== null) {
      this.selectedYear = opt.value;
      this.yearSelectOptions = this.buildYearSelectOptions(this.selectedYear);
      this.selectedYearOption = this.findOptionByValue(this.yearSelectOptions, this.selectedYear);
    }
  }

  onMonthOptionChange(opt: SelectOption<number> | null): void {
    if (opt && opt.value !== undefined && opt.value !== null) {
      this.selectedMonth = opt.value;
    }
  }

  onQuarterOptionChange(opt: SelectOption<number> | null): void {
    if (opt && opt.value !== undefined && opt.value !== null) {
      this.selectedQuarter = opt.value;
    }
  }

  getAttendanceId(): number | null {
    var user = this.auth.currentUser();
    if (!user) {
      return null;
    }
    if (this.isDiretoriaUser()) {
      if (
        this.selectedCollaboratorOption &&
        this.selectedCollaboratorOption.value !== undefined &&
        this.selectedCollaboratorOption.value !== null
      ) {
        return Number(this.selectedCollaboratorOption.value);
      }
      return null;
    }
    if (user.employee && user.employee.id) {
      return user.employee.id;
    }
    if (user.employee_id) {
      return user.employee_id;
    }
    return null;
  }

  applyPeriod() {
    var attendanceId = this.getAttendanceId();
    if (!attendanceId) {
      if (this.isDiretoriaUser()) {
        this.missingEmployee = false;
        this.goals = [];
        this.rawResponse = null;
        this.lastRequest = null;
        this.loading = false;
        return;
      }
      this.missingEmployee = true;
      this.goals = [];
      this.lastRequest = null;
      this.rawResponse = null;
      return;
    }
    this.missingEmployee = false;

    var range = this.computeRange();
    if (!range) {
      this.snackBar.open("Datas inválidas. Verifique o período selecionado.", "", { duration: 3500 });
      return;
    }

    var body: UserGoalProgressRequest = {
      attendance_id: attendanceId,
      date_init: range.date_init,
      date_end: range.date_end
    };
    this.lastRequest = body;

    var snack = this.snackBar.open("Carregando metas…");
    this.loading = true;
    this.userGoalService.getProgress(body).subscribe(
      (res) => {
        this.rawResponse = res;
        this.goals = mapUserGoalProgressToViews(res);
        snack.dismiss();
        this.loading = false;
      },
      () => {
        snack.dismiss();
        this.loading = false;
        this.rawResponse = null;
        this.goals = [];
      }
    );
  }

  computeRange(): { date_init: string; date_end: string } | null {
    if (this.periodMode === "month") {
      var startM = new Date(this.selectedYear, this.selectedMonth - 1, 1);
      var endM = new Date(this.selectedYear, this.selectedMonth, 0);
      return {
        date_init: this.toYmd(startM),
        date_end: this.toYmd(endM)
      };
    }
    if (this.periodMode === "quarter") {
      var startQ = new Date(this.selectedYear, (this.selectedQuarter - 1) * 3, 1);
      var endQ = new Date(this.selectedYear, this.selectedQuarter * 3, 0);
      return {
        date_init: this.toYmd(startQ),
        date_end: this.toYmd(endQ)
      };
    }
    if (this.periodMode === "custom") {
      if (!this.customStartStr || !this.customEndStr) {
        return null;
      }
      var a = this.parseYmd(this.customStartStr);
      var b = this.parseYmd(this.customEndStr);
      if (!a || !b) {
        return null;
      }
      if (a.getTime() > b.getTime()) {
        return null;
      }
      return {
        date_init: this.toYmd(a),
        date_end: this.toYmd(b)
      };
    }
    return null;
  }

  toYmd(d: Date): string {
    var s = this.datePipe.transform(d, "yyyy-MM-dd");
    return s ? s : "";
  }

  parseYmd(s: string): Date | null {
    if (!s || s.length < 10) {
      return null;
    }
    var p = s.substring(0, 10).split("-");
    if (p.length !== 3) {
      return null;
    }
    var y = Number(p[0]);
    var m = Number(p[1]);
    var day = Number(p[2]);
    if (isNaN(y) || isNaN(m) || isNaN(day)) {
      return null;
    }
    return new Date(y, m - 1, day);
  }

  progressColor(goal: GamificationGoalView): "primary" | "accent" | "warn" {
    if (this.presencialManualOverride(goal)) {
      return "primary";
    }
    if (goal.kind === "unevaluated" || goal.notEvaluated) {
      return "accent";
    }
    if (goal.missingTarget) {
      return "accent";
    }
    if (goal.achievedFromApi || (goal.target > 0 && goal.current >= goal.target)) {
      return "primary";
    }
    if (goal.percent < 40 && goal.target > 0) {
      return "warn";
    }
    return "accent";
  }

  starFilledArray(goal: GamificationGoalView): boolean[] {
    if (this.presencialManualOverride(goal)) {
      return [true, true, true, true, true];
    }
    if (goal.kind === "unevaluated") {
      return [false, false, false, false, false];
    }
    var filled = Math.round(this.displayPercent(goal) / 20);
    if (filled > 5) {
      filled = 5;
    }
    if (filled < 0) {
      filled = 0;
    }
    var out: boolean[] = [];
    var i: number;
    for (i = 0; i < 5; i++) {
      out.push(i < filled);
    }
    return out;
  }

  trackGoal(_index: number, goal: GamificationGoalView) {
    return goal.id;
  }

  print(): void {
    window.print();
  }

  exportReportPdf(): void {
    if (this.missingEmployee || this.missingCollaboratorSelection) {
      return;
    }
    var range = this.resolveFilterDatesForReport();
    if (!range) {
      this.snackBar.open("Defina um período válido antes de exportar.", "", { duration: 3500 });
      return;
    }
    var self = this;
    var goalsForPdf = this.goals.map(function (g) {
      return self.cloneGoalForExport(g);
    });
    this.gamificationPdfExport.export({
      userId: this.getReportSubjectUserId(),
      userName: this.getReportUserName(),
      userDepartment: this.getReportUserDepartment(),
      dateInit: range.date_init,
      dateEnd: range.date_end,
      goals: goalsForPdf,
      goalsMetCount: this.goalsMetCount,
      goalsTotalCount: this.goalsTotalCount
    });
  }

  /**
   * Identificador para o nome do PDF: preferência pelo `user_id` / `user.id` do funcionário avaliado.
   * Sem isso no `employee` da sessão (comum quando não há select de colaborador), usa o id da conta logada.
   * Na diretoria, se o item da lista não trouxer vínculo de usuário, usa `attendance_id` da consulta.
   */
  getReportSubjectUserId(): number | null {
    var e = this.getReportSubjectEmployee();
    if (e) {
      if (e.user_id !== undefined && e.user_id !== null && !isNaN(Number(e.user_id))) {
        return Math.floor(Number(e.user_id));
      }
      if (e.user && e.user.id !== undefined && e.user.id !== null && !isNaN(Number(e.user.id))) {
        return Math.floor(Number(e.user.id));
      }
    }
    var u = this.auth.currentUser();
    if (!this.isDiretoriaUser() && u && u.id !== undefined && u.id !== null && !isNaN(Number(u.id))) {
      return Math.floor(Number(u.id));
    }
    if (this.lastRequest && this.lastRequest.attendance_id !== undefined && this.lastRequest.attendance_id !== null) {
      var aid = Number(this.lastRequest.attendance_id);
      if (!isNaN(aid)) {
        return Math.floor(aid);
      }
    }
    return null;
  }

  /** Colaborador cujas metas constam no relatório (selecionado na diretoria ou o próprio usuário). */
  private getReportSubjectEmployee(): Employee | null {
    if (this.isDiretoriaUser() && this.selectedCollaboratorOption) {
      var id = Number(this.selectedCollaboratorOption.value);
      if (!isNaN(id)) {
        var i: number;
        for (i = 0; i < this.collaboratorEmployees.length; i++) {
          if (this.collaboratorEmployees[i].id === id) {
            return this.collaboratorEmployees[i];
          }
        }
      }
    }
    var u = this.auth.currentUser();
    return u && u.employee ? u.employee : null;
  }

  getReportUserName(): string {
    var e = this.getReportSubjectEmployee();
    if (e && e.name) {
      return String(e.name);
    }
    return "";
  }

  getReportUserDepartment(): string {
    var e = this.getReportSubjectEmployee();
    if (e && e.department && e.department.description) {
      return String(e.department.description);
    }
    return "";
  }

  private static readonly PRESENCIAL_LS_PREFIX = "gamification_presencial_diretoria_v1:";

  isPresencialGoal(goal: GamificationGoalView): boolean {
    return !!(goal && goal.id === "presencial_2x_week");
  }

  showPresencialManualCheckbox(goal: GamificationGoalView): boolean {
    return this.isDiretoriaUser() && !this.missingCollaboratorSelection && !!this.lastRequest && this.isPresencialGoal(goal);
  }

  presencialManualOverride(goal: GamificationGoalView): boolean {
    return this.showPresencialManualCheckbox(goal) && this.isPresencialManualMet();
  }

  private presencialManualStorageKey(): string | null {
    if (!this.lastRequest || !this.lastRequest.date_init || !this.lastRequest.date_end) {
      return null;
    }
    var id = this.lastRequest.attendance_id;
    if (id === undefined || id === null || isNaN(Number(id))) {
      return null;
    }
    return (
      GamificationComponent.PRESENCIAL_LS_PREFIX +
      String(Math.floor(Number(id))) +
      ":" +
      this.lastRequest.date_init +
      ":" +
      this.lastRequest.date_end
    );
  }

  isPresencialManualMet(): boolean {
    var k = this.presencialManualStorageKey();
    if (!k) {
      return false;
    }
    try {
      return window.localStorage.getItem(k) === "1";
    } catch (_e) {
      return false;
    }
  }

  private setPresencialManualMet(val: boolean): void {
    var k = this.presencialManualStorageKey();
    if (!k) {
      return;
    }
    try {
      if (val) {
        window.localStorage.setItem(k, "1");
      } else {
        window.localStorage.removeItem(k);
      }
    } catch (_e) {}
  }

  onPresencialManualChange(ev: Event, goal: GamificationGoalView): void {
    if (!this.isPresencialGoal(goal)) {
      return;
    }
    var t = ev.target as HTMLInputElement;
    this.setPresencialManualMet(!!(t && t.checked));
  }

  displayPercent(goal: GamificationGoalView): number {
    if (this.presencialManualOverride(goal)) {
      return 100;
    }
    return goal.percent;
  }

  displayStatusLabel(goal: GamificationGoalView): string {
    if (this.presencialManualOverride(goal)) {
      return "Meta cumprida";
    }
    return goal.statusLabel;
  }

  rowStatusModifier(goal: GamificationGoalView): string {
    if (this.presencialManualOverride(goal)) {
      return "gamification-goal-card--met";
    }
    return goal.statusModifier;
  }

  /**
   * Cópia da meta para o PDF, aplicando registro local de presença (diretoria).
   */
  cloneGoalForExport(goal: GamificationGoalView): GamificationGoalView {
    if (!this.presencialManualOverride(goal)) {
      return goal;
    }
    if (goal.kind === "unevaluated") {
      var one = 1;
      return Object.assign({}, goal, {
        kind: "count" as GamificationGoalView["kind"],
        current: one,
        target: one,
        percent: 100,
        missingTarget: false,
        notEvaluated: false,
        detailLine: "Presença indicada pela diretoria (memória local).",
        statusLabel: "Meta cumprida",
        statusModifier: "gamification-goal-card--met",
        achievedFromApi: true
      });
    }
    var tgt = typeof goal.target === "number" && !isNaN(goal.target) && goal.target > 0 ? goal.target : 1;
    var cur = typeof goal.current === "number" && !isNaN(goal.current) ? Math.max(goal.current, tgt) : tgt;
    return Object.assign({}, goal, {
      current: cur,
      target: tgt,
      percent: 100,
      missingTarget: false,
      statusLabel: "Meta cumprida",
      statusModifier: "gamification-goal-card--met",
      achievedFromApi: true
    });
  }

  /** Datas exibidas no relatório: última consulta aplicada ou intervalo atual do filtro. */
  resolveFilterDatesForReport(): { date_init: string; date_end: string } | null {
    if (this.lastRequest && this.lastRequest.date_init && this.lastRequest.date_end) {
      return {
        date_init: this.lastRequest.date_init,
        date_end: this.lastRequest.date_end
      };
    }
    return this.computeRange();
  }

  /** Dez anos consecutivos centrados no ano selecionado (inclusive). */
  private buildYearSelectOptions(center: number): SelectOption<number>[] {
    var list: SelectOption<number>[] = [];
    var start = center - 5;
    var end = center + 4;
    var y: number;
    for (y = start; y <= end; y++) {
      list.push({ value: y, label: String(y) });
    }
    return list;
  }

  private findOptionByValue<T>(options: SelectOption<T>[], value: T): SelectOption<T> | null {
    var i: number;
    for (i = 0; i < options.length; i++) {
      if (options[i].value === value) {
        return options[i];
      }
    }
    return options.length ? options[0] : null;
  }
}
