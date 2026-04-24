import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MatDialog } from "@angular/material";
import { FinancialCreateComponent } from "app/components/smart/financial-create/financial-create.component";
import { banks } from "app/shared/enums/bank.enum";
import { Job } from "app/jobs/job.model";
import { JobService } from "app/jobs/job.service";
import { EFinancialStep } from "app/shared/enums/financial-step.enum";
import { ETransactionPaymentMethod } from "app/shared/enums/transaction-payment-method.enum";
import { ETransactionStatus } from "app/shared/enums/transaction-status.enum";
import { FinancialTransaction } from "app/shared/models/financial-transaction.model";
import { CurrencyValueService } from "app/shared/services/currency-value.service";
import { FinancialTransactionsPdfExportService } from "app/shared/services/financial-transactions-pdf-export.service";

const MOCK_CONTA: FinancialTransaction["contabancaria"] = {
  idcontabancaria: 1,
  nome: "Think PJ (Nubank)",
  banco: "260",
  agencia: "0001",
  conta: "60190-1",
  datacadastro: "2022-01-03T23:50:00"
};

function mockRevenue(
  id: number,
  descricao: string,
  nomeCategoria: string,
  idcategoria: number,
  valortotal: number,
  dataIso: string
): FinancialTransaction {
  return {
    idtransacao: id,
    idjob: 1,
    tipotransacao: 1,
    descricao: descricao,
    observacao: "",
    status: ETransactionStatus.confirmed,
    datacriacao: dataIso + "T10:00:00",
    datarecebimento: dataIso,
    datavencimento: dataIso,
    datarealizado: dataIso,
    datacobranca: dataIso,
    idcategoria: idcategoria,
    categoria: { idcategoria: idcategoria, nome: nomeCategoria, tema: 4 },
    idcontabancaria: MOCK_CONTA.idcontabancaria,
    contabancaria: MOCK_CONTA,
    formapagamento: ETransactionPaymentMethod.pix,
    numparcelas: 1,
    valortotal: valortotal,
    periodo: 1,
    chavepix: "",
    banco: "",
    agencia: "",
    contacorrente: "",
    parcelas: [],
    tags: []
  };
}

function mockExpense(
  id: number,
  descricao: string,
  nomeCategoria: string,
  idcategoria: number,
  valortotal: number,
  dataIso: string
): FinancialTransaction {
  return {
    idtransacao: id,
    idjob: 1,
    tipotransacao: 2,
    descricao: descricao,
    observacao: "",
    status: ETransactionStatus.pending,
    datacriacao: dataIso + "T09:00:00",
    datarecebimento: "",
    datavencimento: dataIso,
    datarealizado: "",
    datacobranca: dataIso,
    idcategoria: idcategoria,
    categoria: { idcategoria: idcategoria, nome: nomeCategoria, tema: 8 },
    idcontabancaria: MOCK_CONTA.idcontabancaria,
    contabancaria: MOCK_CONTA,
    formapagamento: ETransactionPaymentMethod.money,
    numparcelas: 1,
    valortotal: valortotal,
    periodo: 1,
    chavepix: "",
    banco: "",
    agencia: "",
    contacorrente: "",
    parcelas: [],
    tags: []
  };
}

@Component({
  selector: "cb-financial-home",
  templateUrl: "./financial-home.component.html",
  styleUrls: ["./financial-home.component.scss"]
})
export class FinancialHomeComponent {
  @Input() job: Job;

  @Output() stepChange = new EventEmitter<EFinancialStep>();

  financialStep = EFinancialStep;

  selectedRevenueDate = "";

  selectedExpenseDate = "";

  selectedBankStatementPeriod = 7;

  showBankAccountsSidebar = false;

  bankAccounts: FinancialTransaction["contabancaria"][] = [
    MOCK_CONTA,
    {
      idcontabancaria: 2,
      nome: "Conta reserva (Itaú)",
      banco: "341",
      agencia: "4521",
      conta: "130987-2",
      datacadastro: "2023-06-01T10:15:00"
    },
    {
      idcontabancaria: 3,
      nome: "Conta operacional (Inter)",
      banco: "077",
      agencia: "0001",
      conta: "987654-0",
      datacadastro: "2024-03-18T09:00:00"
    }
  ];

  selectedBankAccountId: number | null = MOCK_CONTA.idcontabancaria;

  revenues: FinancialTransaction[] = [
    mockRevenue(101, "Serviço 1", "Venda", 1, 1200, "2026-06-19"),
    mockRevenue(102, "Serviço 2", "Venda", 1, 2578, "2026-06-19"),
    mockRevenue(103, "Serviço 3", "Venda", 1, 1987, "2026-06-19"),
    mockRevenue(104, "Serviço 4", "Venda", 1, 3284, "2026-06-19"),
    mockRevenue(105, "Serviço 5", "Venda", 1, 894, "2026-06-19"),
    mockRevenue(106, "Serviço 6", "Venda", 1, 225000, "2026-06-19")
  ];

  expenses: FinancialTransaction[] = [
    mockExpense(201, "Vidros", "Vidraçaria", 10, 20, "2026-06-19"),
    mockExpense(202, "Placas Madeira", "Marcenaria", 11, 8, "2026-06-19"),
    mockExpense(203, "Limpeza", "Assinaturas", 12, 4500, "2026-06-19")
  ];

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
    private financialTransactionsPdfExport: FinancialTransactionsPdfExportService
  ) {}

  get revenueCardAmount(): number {
    return this.sumTransactionsByDate(this.revenues, this.selectedRevenueDate, true);
  }

  get expenseCardAmount(): number {
    return this.sumTransactionsByDate(this.expenses, this.selectedExpenseDate, false);
  }

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

  get selectedBankAccount(): FinancialTransaction["contabancaria"] | null {
    for (let i = 0; i < this.bankAccounts.length; i++) {
      if (this.bankAccounts[i].idcontabancaria === this.selectedBankAccountId) {
        return this.bankAccounts[i];
      }
    }
    return null;
  }

  get selectedBankImage(): { code: string; name: string; image: string } | null {
    const account = this.selectedBankAccount;
    if (!account) {
      return null;
    }
    const bankData = banks.get(account.banco as any);
    return bankData ? bankData : null;
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
  }

  onExpenseDateChange(dateIso: string): void {
    this.selectedExpenseDate = dateIso;
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

  onBankAccountsChange(accounts: FinancialTransaction["contabancaria"][]): void {
    this.bankAccounts = accounts;
    if (!accounts.length) {
      this.selectedBankAccountId = null;
      return;
    }
    const selectedExists = accounts.some(
      function (account) {
        return account.idcontabancaria === this.selectedBankAccountId;
      }.bind(this)
    );
    if (!selectedExists) {
      this.selectedBankAccountId = accounts[0].idcontabancaria;
    }
  }

  onSelectedBankAccountChange(account: FinancialTransaction["contabancaria"] | null): void {
    this.selectedBankAccountId = account ? account.idcontabancaria : null;
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

  private resolveJobDisplayId(): string {
    if (this.job) {
      return this.jobService.showId(this.job);
    }

    return "0";
  }

  private sumTransactionsByDate(transactions: FinancialTransaction[], selectedDate: string, isRevenue: boolean): number {
    let total = 0;
    for (let i = 0; i < transactions.length; i++) {
      const transaction = transactions[i];
      const transactionDate = this.resolveTransactionDate(transaction, isRevenue);
      if (selectedDate && transactionDate !== selectedDate) {
        continue;
      }
      total += transaction.valortotal || 0;
    }
    return total;
  }

  private resolveTransactionDate(transaction: FinancialTransaction, isRevenue: boolean): string {
    const iso = isRevenue ? transaction.datarecebimento : transaction.datavencimento;
    if (!iso) {
      return "";
    }
    if (iso.indexOf("T") >= 0) {
      return iso.split("T")[0];
    }
    return iso;
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
