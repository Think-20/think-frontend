import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { MatDialog } from "@angular/material";
import { BankAccount } from "app/bank-accounts/bank-account.model";
import { FinancialCreateComponent } from "app/components/smart/financial-create/financial-create.component";
import { FinancialService } from "app/financial/financial.service";
import { Job } from "app/jobs/job.model";
import { JobService } from "app/jobs/job.service";
import { EBank } from "app/shared/enums/bank.enum";
import { EFinancialStep } from "app/shared/enums/financial-step.enum";
import { FinancialTransaction } from "app/shared/models/financial-transaction.model";
import { BankAccountService } from "app/shared/services/bank-account.service";
import { CurrencyValueService } from "app/shared/services/currency-value.service";
import { FinancialTransactionsPdfExportService } from "app/shared/services/financial-transactions-pdf-export.service";
import {
  FINANCIAL_SELECTED_BANK_ACCOUNT_ID_STORAGE_KEY,
  normalizeTransactionsList,
  readStoredFinancialBankAccountId
} from "app/shared/utils/financial-transaction-api.mapper";

@Component({
  selector: "cb-financial-home",
  templateUrl: "./financial-home.component.html",
  styleUrls: ["./financial-home.component.scss"]
})
export class FinancialHomeComponent implements OnInit, OnChanges {
  @Input() job: Job;

  @Output() stepChange = new EventEmitter<EFinancialStep>();

  financialStep = EFinancialStep;

  selectedRevenueDate = "";

  selectedExpenseDate = "";

  selectedBankStatementPeriod = 7;

  showBankAccountsSidebar = false;

  selectedBankAccount: BankAccount | null = null;

  accounts: BankAccount[] = [];

  revenues: FinancialTransaction[] = [];

  expenses: FinancialTransaction[] = [];

  /** Total do card Receita (GET financeiro/transacao/total/...). */
  revenueCardAmount = 0;

  /** Total do card Despesa (GET financeiro/transacao/total/...). */
  expenseCardAmount = 0;

  bankStatements = [
    {
      date: "2026-06-13",
      income: 4200,
      expense: 750,
      result: 3450,
      balance: 12340
    },
    {
      date: "2026-06-14",
      income: 0,
      expense: 1320,
      result: -1320,
      balance: 11020
    },
    {
      date: "2026-06-15",
      income: 1850,
      expense: 480,
      result: 1370,
      balance: 12390
    },
    {
      date: "2026-06-16",
      income: 0,
      expense: 2150,
      result: -2150,
      balance: 10240
    },
    {
      date: "2026-06-17",
      income: 7600,
      expense: 970,
      result: 6630,
      balance: 16870
    },
    {
      date: "2026-06-18",
      income: 920,
      expense: 1240,
      result: -320,
      balance: 16550
    },
    {
      date: "2026-06-19",
      income: 3570,
      expense: 890,
      result: 2680,
      balance: 19230
    }
  ];

  constructor(
    private currencyValueService: CurrencyValueService,
    private dialog: MatDialog,
    private jobService: JobService,
    private bankAccountService: BankAccountService,
    private financialService: FinancialService,
    private financialTransactionsPdfExport: FinancialTransactionsPdfExportService
  ) {}

  get filteredBankStatements(): { date: string; income: number; expense: number; result: number; balance: number }[] {
    const minDate = this.getMinDateByPeriod(this.selectedBankStatementPeriod);
    if (!minDate) {
      return this.bankStatements;
    }
    const minTime = minDate.getTime();
    return this.bankStatements.filter(function (statement) {
      const statementTime = new Date(statement.date).getTime();
      return !isNaN(statementTime) && statementTime >= minTime;
    });
  }

  get bankStatementTotalBalance(): number {
    const list = this.filteredBankStatements;
    if (!list.length) {
      return 0;
    }
    return list[list.length - 1].balance;
  }

  get selectedBank(): EBank | null {
    const account = this.selectedBankAccount;

    if (!account || !account.bank) {
      return EBank.default;
    }

    return account.bank.code;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.job) {
      return;
    }
    if (this.job && this.job.id) {
      this.refreshFinancialHomeApi();
    }
  }

  ngOnInit(): void {
    const self = this;
    this.bankAccountService.get().subscribe(function (response) {
      self.accounts = response.pagination.data;

      const storedId = self.readStoredBankAccountId();
      if (storedId !== null) {
        self.bankAccountService.getById(storedId).subscribe(function (detail: BankAccount | null) {
          if (detail && detail.id) {
            self.selectedBankAccount = detail;
            self.mergeAccountIntoList(detail);
          } else {
            self.applyDefaultSelectionFromList();
          }
          self.persistCurrentSelection();
          self.refreshFinancialHomeApi();
        });
      } else {
        self.applyDefaultSelectionFromList();
        self.persistCurrentSelection();
        self.refreshFinancialHomeApi();
      }
    });
  }

  showCurrencyValue(event: PointerEvent): void {
    event.stopPropagation();

    this.currencyValueService.toggle();
  }

  stepChangeFn(step: EFinancialStep): void {
    this.stepChange.emit(step);
  }

  onRevenueDateChange(dateIso: string): void {
    this.selectedRevenueDate = dateIso;
    this.refreshFinancialHomeApi();
  }

  onExpenseDateChange(dateIso: string): void {
    this.selectedExpenseDate = dateIso;
    this.refreshFinancialHomeApi();
  }

  onBankStatementPeriodChange(days: number): void {
    this.selectedBankStatementPeriod = days;
  }

  openFinancialRevenuesModal(): void {
    this.dialog.open(FinancialCreateComponent, {
      width: "768px",
      panelClass: "beautiful-modal",
      autoFocus: false,
      data: { transactionType: this.financialStep.revenues }
    });
  }

  openFinancialExpensesModal(): void {
    this.dialog.open(FinancialCreateComponent, {
      width: "768px",
      panelClass: "beautiful-modal",
      autoFocus: false,
      data: { transactionType: this.financialStep.expenses }
    });
  }

  openBankAccountsPanel(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showBankAccountsSidebar = true;
  }

  onBankAccountsPanelOpenChange(open: boolean): void {
    this.showBankAccountsSidebar = open;
  }

  onSelectedBankAccountChange(account: BankAccount | null): void {
    const self = this;
    if (!account) {
      this.selectedBankAccount = null;
      this.persistSelectedBankAccountId(null);
      this.refreshFinancialHomeApi();
      return;
    }
    this.bankAccountService.getById(account.id).subscribe(function (detail: BankAccount | null) {
      if (detail && detail.id) {
        self.selectedBankAccount = detail;
        self.mergeAccountIntoList(detail);
      } else {
        self.selectedBankAccount = account;
      }
      self.persistSelectedBankAccountId(self.selectedBankAccount ? self.selectedBankAccount.id : null);
      self.refreshFinancialHomeApi();
    });
  }

  exportRevenuesPdf(): void {
    this.financialTransactionsPdfExport.export({
      transactions: this.revenues,
      jobDisplayId: this.resolveJobDisplayId(),
      jobId: this.job && this.job.id ? this.job.id : 0,
      transactionType: this.financialStep.revenues,
      reportTitle: "Controle de Receitas",
      fileNamePrefix: "controle-receitas_"
    });
  }

  exportExpensesPdf(): void {
    this.financialTransactionsPdfExport.export({
      transactions: this.expenses,
      jobDisplayId: this.resolveJobDisplayId(),
      jobId: this.job && this.job.id ? this.job.id : 0,
      transactionType: this.financialStep.expenses,
      reportTitle: "Controle de Despesas",
      fileNamePrefix: "controle-despesas_"
    });
  }

  private refreshFinancialHomeApi(): void {
    this.loadTransactionsFromApi();
    this.loadTransactionCardTotals();
  }

  private loadTransactionCardTotals(): void {
    const self = this;
    const jobId = this.job && this.job.id ? this.job.id : 0;
    if (!jobId) {
      this.revenueCardAmount = 0;
      this.expenseCardAmount = 0;
      return;
    }
    const revenueDateArg = this.normalizeToYyyyMmDd(this.selectedRevenueDate);
    const expenseDateArg = this.normalizeToYyyyMmDd(this.selectedExpenseDate);
    const revenueDateOpt = revenueDateArg ? revenueDateArg : undefined;
    const expenseDateOpt = expenseDateArg ? expenseDateArg : undefined;
    this.financialService.transactionTotal(jobId, this.financialStep.revenues, revenueDateOpt).subscribe(
      function (n) {
        self.revenueCardAmount = n;
      },
      function () {
        self.revenueCardAmount = 0;
      }
    );
    this.financialService.transactionTotal(jobId, this.financialStep.expenses, expenseDateOpt).subscribe(
      function (n) {
        self.expenseCardAmount = n;
      },
      function () {
        self.expenseCardAmount = 0;
      }
    );
  }

  private loadTransactionsFromApi(): void {
    const self = this;
    const jobId = this.job && this.job.id ? this.job.id : 0;
    const acc = this.selectedBankAccount;
    if (!jobId || !acc || !acc.id) {
      this.revenues = [];
      this.expenses = [];
      return;
    }
    const revenueDateArg = this.normalizeToYyyyMmDd(this.selectedRevenueDate);
    const expenseDateArg = this.normalizeToYyyyMmDd(this.selectedExpenseDate);
    const revenueDateIso = revenueDateArg ? revenueDateArg : this.formatDateIsoYyyyMmDd(new Date());
    const expenseDateIso = expenseDateArg ? expenseDateArg : this.formatDateIsoYyyyMmDd(new Date());

    this.financialService
      .transactionsByJobAndBankAccount(jobId, this.financialStep.revenues, acc.id, revenueDateIso)
      .subscribe(
        function (res) {
          self.revenues = normalizeTransactionsList(res.transacoes);
        },
        function () {
          self.revenues = [];
        }
      );
    this.financialService
      .transactionsByJobAndBankAccount(jobId, this.financialStep.expenses, acc.id, expenseDateIso)
      .subscribe(
        function (res) {
          self.expenses = normalizeTransactionsList(res.transacoes);
        },
        function () {
          self.expenses = [];
        }
      );
  }

  private normalizeToYyyyMmDd(raw: string): string {
    if (!raw || !String(raw).trim()) {
      return "";
    }
    const s = String(raw).trim();
    if (s.indexOf("T") >= 0) {
      return s.split("T")[0];
    }
    return s;
  }

  private formatDateIsoYyyyMmDd(d: Date): string {
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const mm = m < 10 ? "0" + String(m) : String(m);
    const dd = day < 10 ? "0" + String(day) : String(day);
    return String(y) + "-" + mm + "-" + dd;
  }

  private readStoredBankAccountId(): number | null {
    return readStoredFinancialBankAccountId();
  }

  private persistSelectedBankAccountId(id: number | null): void {
    try {
      if (id === null) {
        localStorage.removeItem(FINANCIAL_SELECTED_BANK_ACCOUNT_ID_STORAGE_KEY);
      } else {
        localStorage.setItem(FINANCIAL_SELECTED_BANK_ACCOUNT_ID_STORAGE_KEY, String(id));
      }
    } catch (e) {
      // quota / private mode
    }
  }

  private applyDefaultSelectionFromList(): void {
    if (this.accounts.length > 0) {
      this.selectedBankAccount = this.accounts[0];
    } else {
      this.selectedBankAccount = null;
    }
  }

  private persistCurrentSelection(): void {
    if (this.selectedBankAccount) {
      this.persistSelectedBankAccountId(this.selectedBankAccount.id);
    } else {
      this.persistSelectedBankAccountId(null);
    }
  }

  private mergeAccountIntoList(account: BankAccount): void {
    if (!account) {
      return;
    }
    if (!this.accounts || !this.accounts.length) {
      this.accounts = [account];
      return;
    }
    let i = 0;
    for (i = 0; i < this.accounts.length; i++) {
      if (this.accounts[i].id === account.id) {
        this.accounts[i] = account;
        return;
      }
    }
    this.accounts = [account].concat(this.accounts);
  }

  private resolveJobDisplayId(): string {
    if (this.job) {
      return this.jobService.showId(this.job);
    }

    return "0";
  }

  private getMinDateByPeriod(days: number): Date | null {
    if (!days || days < 1) {
      return null;
    }
    const minDate = new Date();
    minDate.setHours(0, 0, 0, 0);
    minDate.setDate(minDate.getDate() - (days - 1));
    return minDate;
  }
}
