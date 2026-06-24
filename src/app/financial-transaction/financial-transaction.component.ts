import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from "@angular/core";
import { MatDialog } from "@angular/material";
import { FinancialCreateComponent } from "app/components/smart/financial-create/financial-create.component";
import {
  FinancialRevenuesModalComponent,
  FinancialRevenuesModalDeleteResult
} from "app/components/smart/financial-revenues-modal/financial-revenues-modal.component";
import { FinancialSummaryModalComponent } from "app/financial-summary-modal/financial-summary-modal.component";
import { FinancialService } from "app/financial/financial.service";
import { JobService } from "app/jobs/job.service";
import { Job } from "app/jobs/job.model";
import { EFinancialStep } from "app/shared/enums/financial-step.enum";
import { ETransactionPaymentMethod, transactionPaymentMethods } from "app/shared/enums/transaction-payment-method.enum";
import { ETransactionStatus, transactionStatuses } from "app/shared/enums/transaction-status.enum";
import { FinancialTransaction } from "app/shared/models/financial-transaction.model";
import { BankAccountService } from "app/shared/services/bank-account.service";
import { FinancialTransactionsPdfExportService } from "app/shared/services/financial-transactions-pdf-export.service";
import { normalizeTransactionsList, readStoredFinancialBankAccountId } from "app/shared/utils/financial-transaction-api.mapper";

@Component({
  selector: "cb-financial-transaction",
  templateUrl: "./financial-transaction.component.html",
  styleUrls: ["./financial-transaction.component.scss"]
})
export class FinancialTransactionComponent implements OnChanges, OnDestroy {
  /** Expõe o enum ao template (ex.: classes condicionais). */
  readonly financialStep = EFinancialStep;

  @Input() job: Job;

  @Input() transactionType: EFinancialStep;

  @Output() stepChange = new EventEmitter<EFinancialStep>();

  /** Título da tela, breadcrumb e PDF. */
  get controlPageTitle(): string {
    return this.transactionType === EFinancialStep.expenses ? "Controle de Despesas" : "Controle de Receitas";
  }

  get totalAmountLabel(): string {
    return this.transactionType === EFinancialStep.expenses ? "Total de Despesas" : "Total de Receitas";
  }

  get newTransactionButtonLabel(): string {
    return this.transactionType === EFinancialStep.expenses ? "Nova Despesa" : "Nova Receita";
  }

  get transactionNounPlural(): string {
    return this.transactionType === EFinancialStep.expenses ? "despesa(s)" : "receita(s)";
  }

  get filterPanelHint(): string {
    return this.transactionType === EFinancialStep.expenses
      ? "Os filtros abaixo são aplicados junto com a busca por descrição (despesas)."
      : "Os filtros abaixo são aplicados junto com a busca por descrição.";
  }

  get filterDateFromLabel(): string {
    return this.transactionType === EFinancialStep.expenses ? "Data de vencimento (de)" : "Data de recebimento (de)";
  }

  get filterDateToLabel(): string {
    return this.transactionType === EFinancialStep.expenses ? "Data de vencimento (até)" : "Data de recebimento (até)";
  }

  get summaryFooterLine(): string {
    return "Mostrando " + String(this.revenuesCount) + " de " + String(this.totalTransactionsCount) + " " + this.transactionNounPlural;
  }

  get summaryRealizedLabel(): string {
    return this.transactionType === EFinancialStep.expenses ? "Custo Total Realizado:" : "Total Realizado:";
  }

  get summaryToPayLabel(): string {
    return this.transactionType === EFinancialStep.expenses ? "Custo à Pagar:" : "À Receber:";
  }

  get summaryForecastLabel(): string {
    return this.transactionType === EFinancialStep.expenses ? "Custo Previsto:" : "Previsto:";
  }

  allTransactions: FinancialTransaction[] = [];

  filteredTransactions: FinancialTransaction[] = [];

  summaryTotalRealizado: number | null = null;

  summaryTotalReceber: number | null = null;

  summaryTotalPrevisto: number | null = null;

  filtersPanelOpen = false;

  /** Indicador no botão “Filtros”: há filtros do painel aplicados (não inclui busca por texto). */
  filterHasActiveSelection = false;

  searchTerm = "";

  debouncedSearchTerm = "";

  private readonly searchDebounceMs = 300;

  private searchDebounceTimer: number | null = null;

  constructor(
    private dialog: MatDialog,
    private jobService: JobService,
    private bankAccountService: BankAccountService,
    private financialTransactionsPdfExport: FinancialTransactionsPdfExportService,
    private financialService: FinancialService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.job && this.job && this.job.id) {
      this.loadTransactionsFromApi();
    }
  }

  ngOnDestroy(): void {
    this.clearSearchDebounceTimer();
  }

  scheduleSearchDebounce(): void {
    this.clearSearchDebounceTimer();
    const self = this;
    this.searchDebounceTimer = window.setTimeout(function () {
      self.searchDebounceTimer = null;
      self.debouncedSearchTerm = self.searchTerm;
    }, this.searchDebounceMs);
  }

  private clearSearchDebounceTimer(): void {
    if (this.searchDebounceTimer !== null) {
      window.clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = null;
    }
  }

  get revenuesTotal(): number {
    if (this.summaryTotalPrevisto !== null) {
      return this.summaryTotalPrevisto;
    }

    return this.filteredTransactions.reduce(function (sum, t) {
      return sum + (typeof t.valortotal === "number" ? t.valortotal : 0);
    }, 0);
  }

  private loadTransactionsFromApi(): void {
    const self = this;
    const jobId = this.job && this.job.id ? this.job.id : 0;
    if (!jobId || this.transactionType === undefined || this.transactionType === null) {
      this.allTransactions = [];
      this.resetSummaryTotals();
      return;
    }

    this.resolveContaBancariaId(function (contaBancariaId: number | null) {
      if (!contaBancariaId) {
        self.allTransactions = [];
        self.resetSummaryTotals();
        return;
      }

      self.financialService.transactionsByJobAndBankAccount(jobId, self.transactionType, contaBancariaId).subscribe(
        function (res) {
          self.allTransactions = normalizeTransactionsList(res.transacoes);
          self.summaryTotalRealizado = res.totalRealizado;
          self.summaryTotalReceber = res.totalReceber;
          self.summaryTotalPrevisto = res.totalPrevisto;
        },
        function () {
          self.allTransactions = [];
          self.resetSummaryTotals();
        }
      );
    });
  }

  private resolveContaBancariaId(callback: (id: number | null) => void): void {
    const storedId = readStoredFinancialBankAccountId();
    if (storedId !== null) {
      callback(storedId);
      return;
    }

    this.bankAccountService.get().subscribe(
      function (response) {
        const accounts = response.pagination.data;
        if (accounts && accounts.length > 0 && accounts[0].id) {
          callback(accounts[0].id);
        } else {
          callback(null);
        }
      },
      function () {
        callback(null);
      }
    );
  }

  private resetSummaryTotals(): void {
    this.summaryTotalRealizado = null;
    this.summaryTotalReceber = null;
    this.summaryTotalPrevisto = null;
  }

  statusLabel(status: number): string {
    const label = transactionStatuses.get(status as ETransactionStatus);
    return label ? label : "";
  }

  paymentMethodLabel(method: number): string {
    const label = transactionPaymentMethods.get(method as ETransactionPaymentMethod);
    return label ? label : "";
  }

  get revenuesCount(): number {
    return this.filteredTransactions.length;
  }

  get totalTransactionsCount(): number {
    return this.allTransactions.length;
  }

  toHome(): void {
    this.stepChange.emit(EFinancialStep.home);
  }

  openFiltersPanel(): void {
    this.filtersPanelOpen = true;
  }

  print() {
    window.print();
  }

  exportToPdf(): void {
    this.financialTransactionsPdfExport.export({
      transactions: this.filteredTransactions,
      jobDisplayId: this.resolveJobDisplayId(),
      jobId: this.resolveExportJobId(),
      transactionType: this.transactionType,
      reportTitle: this.controlPageTitle
    });
  }

  private resolveJobDisplayId(): string {
    if (this.job && this.job.code && this.job.created_at) {
      return this.jobService.showId(this.job);
    }
    const jobId = this.resolveExportJobId();
    return jobId !== null ? String(jobId) : "";
  }

  private resolveExportJobId(): number | null {
    if (this.job && this.job.id) {
      return this.job.id;
    }
    let i = 0;
    for (i = 0; i < this.filteredTransactions.length; i++) {
      const t = this.filteredTransactions[i];
      if (t && t.idjob) {
        return t.idjob;
      }
    }
    for (i = 0; i < this.allTransactions.length; i++) {
      const row = this.allTransactions[i];
      if (row && row.idjob) {
        return row.idjob;
      }
    }
    return null;
  }

  openSummaryModal(): void {
    this.dialog.open(FinancialSummaryModalComponent, {
      width: "1024px",
      panelClass: "beautiful-modal",
      data: { transactionType: this.transactionType }
    });
  }

  openRevenueModal(transaction: FinancialTransaction): void {
    const self = this;
    this.dialog
      .open(FinancialRevenuesModalComponent, {
        width: "768px",
        panelClass: "beautiful-modal",
        autoFocus: false,
        data: { transactionType: this.transactionType, transaction: transaction }
      })
      .afterClosed()
      .subscribe(function (result: FinancialRevenuesModalDeleteResult | undefined) {
        if (!result || result.deleted !== true || !result.transaction) {
          return;
        }
        self.loadTransactionsFromApi();
      });
  }

  onTransactionRowKeydown(event: KeyboardEvent, transaction: FinancialTransaction): void {
    const key = event.key;
    if (key === "Enter" || key === " ") {
      event.preventDefault();
      this.openRevenueModal(transaction);
      return;
    }

    if (key !== "ArrowDown" && key !== "ArrowUp" && key !== "Home" && key !== "End") {
      return;
    }

    const current = event.currentTarget as HTMLElement;
    if (!current) {
      return;
    }
    const tbody = current.parentElement;
    if (!tbody) {
      return;
    }
    const focusables = tbody.querySelectorAll("tr[tabindex='0']");
    if (!focusables || !focusables.length) {
      return;
    }

    let currentIndex = -1;
    let i = 0;
    for (i = 0; i < focusables.length; i++) {
      if (focusables[i] === current) {
        currentIndex = i;
        break;
      }
    }
    if (currentIndex < 0) {
      return;
    }

    let nextIndex = currentIndex;
    if (key === "ArrowDown" && currentIndex < focusables.length - 1) {
      nextIndex = currentIndex + 1;
    } else if (key === "ArrowUp" && currentIndex > 0) {
      nextIndex = currentIndex - 1;
    } else if (key === "Home") {
      nextIndex = 0;
    } else if (key === "End") {
      nextIndex = focusables.length - 1;
    }

    if (nextIndex !== currentIndex) {
      event.preventDefault();
      const target = focusables[nextIndex] as HTMLElement;
      if (target) {
        target.focus();
      }
    }
  }

  openCreateRevenueModal(): void {
    const self = this;
    this.dialog
      .open(FinancialCreateComponent, {
        width: "768px",
        panelClass: "beautiful-modal",
        autoFocus: false,
        data: { transactionType: this.transactionType }
      })
      .afterClosed()
      .subscribe(function (created: FinancialTransaction | undefined) {
        if (!created) {
          return;
        }
        self.loadTransactionsFromApi();
      });
  }
}
