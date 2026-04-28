import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { MatDialog } from "@angular/material";
import { BankAccount } from "app/bank-accounts/bank-account.model";
import { Bank } from "app/banks/bank.model";
import { FinancialCreateComponent } from "app/components/smart/financial-create/financial-create.component";
import { FinancialService } from "app/financial/financial.service";
import { Job } from "app/jobs/job.model";
import { JobService } from "app/jobs/job.service";
import { EBank, banks } from "app/shared/enums/bank.enum";
import { EFinancialStep } from "app/shared/enums/financial-step.enum";
import { FinancialTransaction } from "app/shared/models/financial-transaction.model";
import { BankAccountService } from "app/shared/services/bank-account.service";
import { CurrencyValueService } from "app/shared/services/currency-value.service";
import { FinancialTransactionsPdfExportService } from "app/shared/services/financial-transactions-pdf-export.service";

const SELECTED_BANK_ACCOUNT_ID_STORAGE_KEY = "think.financialHome.selectedBankAccountId";

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
    const dateIso = this.resolveTransactionQueryDate();
    this.financialService.transactionsByJobAndBankAccount(jobId, acc.id, dateIso).subscribe(
      function (res) {
        const list = self.normalizeTransactionsList(res.transacoes);
        const rev: FinancialTransaction[] = [];
        const exp: FinancialTransaction[] = [];
        let i = 0;
        for (i = 0; i < list.length; i++) {
          const t = list[i];
          if (t.tipotransacao === self.financialStep.revenues) {
            rev.push(t);
          } else if (t.tipotransacao === self.financialStep.expenses) {
            exp.push(t);
          }
        }
        self.revenues = rev;
        self.expenses = exp;
      },
      function () {
        self.revenues = [];
        self.expenses = [];
      }
    );
  }

  private resolveTransactionQueryDate(): string {
    const rev = this.normalizeToYyyyMmDd(this.selectedRevenueDate);
    if (rev) {
      return rev;
    }
    const exp = this.normalizeToYyyyMmDd(this.selectedExpenseDate);
    if (exp) {
      return exp;
    }
    return this.formatDateIsoYyyyMmDd(new Date());
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

  private normalizeTransactionsList(rawList: any[]): FinancialTransaction[] {
    if (!rawList || !rawList.length) {
      return [];
    }
    const out: FinancialTransaction[] = [];
    let i = 0;
    for (i = 0; i < rawList.length; i++) {
      out.push(this.normalizeTransactionFromApi(rawList[i]));
    }
    return out;
  }

  private normalizeTransactionFromApi(raw: any): FinancialTransaction {
    const cat = raw && raw.categoria ? raw.categoria : {};
    const idcategoria =
      typeof cat.idcategoria === "number"
        ? cat.idcategoria
        : typeof raw.idcategoria === "number"
        ? raw.idcategoria
        : 0;
    const nomeCat = cat.nome ? String(cat.nome) : "";
    const temaCat = typeof cat.tema === "number" ? cat.tema : 0;
    const conta = this.normalizeContaFromApi(raw.contabancaria);
    const idcb = typeof raw.idcontabancaria === "number" ? raw.idcontabancaria : conta.id;
    const t: FinancialTransaction = {
      idtransacao: typeof raw.idtransacao === "number" ? raw.idtransacao : 0,
      idjob: typeof raw.idjob === "number" ? raw.idjob : 0,
      tipotransacao: typeof raw.tipotransacao === "number" ? raw.tipotransacao : 0,
      descricao: raw.descricao ? String(raw.descricao) : "",
      observacao: raw.observacao !== undefined && raw.observacao !== null ? String(raw.observacao) : "",
      status: typeof raw.status === "number" ? raw.status : 0,
      datacriacao: raw.datacriacao ? String(raw.datacriacao) : "",
      datarecebimento: raw.datarecebimento ? String(raw.datarecebimento) : "",
      datavencimento: raw.datavencimento ? String(raw.datavencimento) : "",
      datarealizado: raw.datarealizado ? String(raw.datarealizado) : "",
      datacobranca: raw.datacobranca ? String(raw.datacobranca) : "",
      idcategoria: idcategoria,
      categoria: { idcategoria: idcategoria, nome: nomeCat, tema: temaCat },
      idcontabancaria: idcb,
      contabancaria: conta,
      formapagamento: typeof raw.formapagamento === "number" ? raw.formapagamento : 0,
      numparcelas: typeof raw.numparcelas === "number" ? raw.numparcelas : 0,
      valortotal: typeof raw.valortotal === "number" ? raw.valortotal : 0,
      periodo: typeof raw.periodo === "number" ? raw.periodo : 0,
      chavepix: raw.chavepix ? String(raw.chavepix) : "",
      banco: raw.banco ? String(raw.banco) : "",
      agencia: raw.agencia ? String(raw.agencia) : "",
      contacorrente: raw.contacorrente ? String(raw.contacorrente) : "",
      parcelas: raw.parcelas && raw.parcelas.length ? raw.parcelas : [],
      tags: raw.tags && raw.tags.length ? raw.tags : []
    };
    if (raw.arquivoboleto) {
      t.arquivoboleto = raw.arquivoboleto;
    }
    if (raw.arquivos && raw.arquivos.length) {
      t.arquivos = raw.arquivos;
    }
    return t;
  }

  private normalizeContaFromApi(api: any): BankAccount {
    const account = new BankAccount();
    if (!api) {
      account.id = 0;
      account.name = "";
      account.agency = "";
      account.account_number = "";
      account.bank = new Bank();
      account.bank.id = 0;
      account.bank.name = "";
      account.bank.code = EBank.default;
      return account;
    }
    account.id =
      typeof api.idcontabancaria === "number"
        ? api.idcontabancaria
        : typeof api.id === "number"
        ? api.id
        : 0;
    account.name = api.nome ? String(api.nome) : "";
    account.agency = api.agencia ? String(api.agencia) : "";
    account.account_number = api.conta ? String(api.conta) : "";
    account.bank = new Bank();
    const codeEnum = this.resolveBankCodeFromString(api.banco ? String(api.banco) : "");
    account.bank.code = codeEnum;
    const meta = banks.get(codeEnum);
    account.bank.name = meta && meta.name ? meta.name : "";
    account.bank.id = account.id;
    return account;
  }

  private resolveBankCodeFromString(codeStr: string): EBank {
    const s = codeStr ? String(codeStr).trim() : "";
    if (!s) {
      return EBank.default;
    }
    let found = EBank.default;
    banks.forEach(function (meta, key) {
      if (meta.code === s) {
        found = key;
      }
    });
    return found;
  }

  private readStoredBankAccountId(): number | null {
    try {
      const raw = localStorage.getItem(SELECTED_BANK_ACCOUNT_ID_STORAGE_KEY);
      if (raw === null || raw === "") {
        return null;
      }
      const parsed = parseInt(raw, 10);
      if (isNaN(parsed) || parsed < 1) {
        return null;
      }
      return parsed;
    } catch (e) {
      return null;
    }
  }

  private persistSelectedBankAccountId(id: number | null): void {
    try {
      if (id === null) {
        localStorage.removeItem(SELECTED_BANK_ACCOUNT_ID_STORAGE_KEY);
      } else {
        localStorage.setItem(SELECTED_BANK_ACCOUNT_ID_STORAGE_KEY, String(id));
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
