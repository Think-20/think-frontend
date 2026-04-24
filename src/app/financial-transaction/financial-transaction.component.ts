import { Component, EventEmitter, Input, OnDestroy, Output } from "@angular/core";
import { MatDialog } from "@angular/material";
import { FinancialCreateComponent } from "app/components/smart/financial-create/financial-create.component";
import {
  FinancialRevenuesModalComponent,
  FinancialRevenuesModalDeleteResult
} from "app/components/smart/financial-revenues-modal/financial-revenues-modal.component";
import { FinancialSummaryModalComponent } from "app/financial-summary-modal/financial-summary-modal.component";
import { JobService } from "app/jobs/job.service";
import { Job } from "app/jobs/job.model";
import { EFinancialStep } from "app/shared/enums/financial-step.enum";
import { ETransactionPaymentMethod, transactionPaymentMethods } from "app/shared/enums/transaction-payment-method.enum";
import { ETransactionStatus, transactionStatuses } from "app/shared/enums/transaction-status.enum";
import { FinancialTransaction } from "app/shared/models/financial-transaction.model";
import { FinancialTransactionsPdfExportService } from "app/shared/services/financial-transactions-pdf-export.service";

/** Campos usados na listagem / PDF; o restante da entidade vem da API em produção. */
type FinancialTransactionRevenueListMock = Pick<
  FinancialTransaction,
  "datarecebimento" | "datavencimento" | "descricao" | "categoria" | "contabancaria" | "formapagamento" | "status" | "valortotal"
> &
  Partial<
    Pick<
      FinancialTransaction,
      | "idtransacao"
      | "idjob"
      | "tipotransacao"
      | "observacao"
      | "datacriacao"
      | "datacobranca"
      | "datarealizado"
      | "idcategoria"
      | "idcontabancaria"
      | "idcontabancariacartaocredito"
      | "contabancariacartaocredito"
      | "numparcelas"
      | "periodo"
      | "chavepix"
      | "banco"
      | "agencia"
      | "contacorrente"
      | "arquivoboleto"
      | "arquivos"
      | "parcelas"
      | "tags"
    >
  >;

function asFinancialTransaction(row: FinancialTransactionRevenueListMock): FinancialTransaction {
  const base = row as FinancialTransaction;
  const id = base.idtransacao ? base.idtransacao : Math.floor(Math.random() * 1000000);
  const idjob = base.idjob ? base.idjob : 4281;
  const datarecebimento = base.datarecebimento ? base.datarecebimento : "";
  const datavencimento = base.datavencimento ? base.datavencimento : "";
  const datacobranca =
    base.datacobranca !== undefined && base.datacobranca !== null && base.datacobranca !== "" ? base.datacobranca : datarecebimento;
  const datarealizado =
    base.datarealizado !== undefined && base.datarealizado !== null && base.datarealizado !== "" ? base.datarealizado : datarecebimento;
  const datacriacao =
    base.datacriacao !== undefined && base.datacriacao !== null && base.datacriacao !== ""
      ? base.datacriacao
      : (datarecebimento ? datarecebimento : datavencimento) + "T09:00:00";
  const categoria = base.categoria ? base.categoria : mockCategoria(1);
  const contabancaria = base.contabancaria ? base.contabancaria : mockConta("Banco Inter");
  const idcategoria = base.idcategoria !== undefined && base.idcategoria !== null ? base.idcategoria : categoria.idcategoria;
  const idcontabancaria =
    base.idcontabancaria !== undefined && base.idcontabancaria !== null ? base.idcontabancaria : contabancaria.idcontabancaria;
  const numparcelas = base.numparcelas !== undefined && base.numparcelas !== null ? base.numparcelas : 1;
  const periodo = base.periodo !== undefined && base.periodo !== null ? base.periodo : 1;
  const valortotal = typeof base.valortotal === "number" ? base.valortotal : 0;
  const tipotransacao = base.tipotransacao !== undefined && base.tipotransacao !== null ? base.tipotransacao : valortotal >= 0 ? 1 : 2;
  const parcelas = base.parcelas
    ? base.parcelas
    : [
        {
          idparcela: 0,
          idtransacao: id,
          valor: valortotal,
          data: (datavencimento ? datavencimento : datarecebimento) + "T00:00:00",
          ordem: 1
        }
      ];
  const tags = base.tags ? base.tags : [{ idtag: id, descricao: "mock-" + String(id) }];
  const arquivos = base.arquivos ? base.arquivos : [];
  return Object.assign({}, base, {
    idtransacao: id,
    idjob: idjob,
    tipotransacao: tipotransacao,
    observacao: base.observacao ? base.observacao : "Observação de mock da transação " + String(id),
    datacriacao: datacriacao,
    datarecebimento: datarecebimento,
    datavencimento: datavencimento,
    datacobranca: datacobranca,
    datarealizado: datarealizado,
    idcategoria: idcategoria,
    categoria: categoria,
    idcontabancaria: idcontabancaria,
    contabancaria: contabancaria,
    idcontabancariacartaocredito: base.idcontabancariacartaocredito !== undefined ? base.idcontabancariacartaocredito : undefined,
    contabancariacartaocredito: base.contabancariacartaocredito !== undefined ? base.contabancariacartaocredito : undefined,
    numparcelas: numparcelas,
    valortotal: valortotal,
    periodo: periodo,
    chavepix: base.chavepix ? base.chavepix : "",
    banco: base.banco ? base.banco : "",
    agencia: base.agencia ? base.agencia : "",
    contacorrente: base.contacorrente ? base.contacorrente : "",
    arquivoboleto: base.arquivoboleto ? base.arquivoboleto : undefined,
    arquivos: arquivos,
    parcelas: parcelas,
    tags: tags
  }) as FinancialTransaction;
}

function mockCategoria(tema: number): FinancialTransaction["categoria"] {
  return { idcategoria: 1, nome: "Venda", tema: tema };
}

function mockConta(nome: string): FinancialTransaction["contabancaria"] {
  return {
    idcontabancaria: nome === "Conta Inter" ? 2 : 1,
    nome: nome,
    banco: "",
    agencia: "",
    conta: "",
    datacadastro: "2024-01-01"
  };
}

@Component({
  selector: "cb-financial-transaction",
  templateUrl: "./financial-transaction.component.html",
  styleUrls: ["./financial-transaction.component.scss"]
})
export class FinancialTransactionComponent implements OnDestroy {
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

  allTransactions: FinancialTransaction[] = [
    asFinancialTransaction({
      datarecebimento: "2024-06-19",
      datavencimento: "2024-06-25",
      descricao: "Serviço 1",
      categoria: mockCategoria(1),
      formapagamento: ETransactionPaymentMethod.deposit,
      contabancaria: mockConta("Banco Inter"),
      status: ETransactionStatus.reconciled,
      valortotal: 1200
    }),
    asFinancialTransaction({
      datarecebimento: "2024-06-19",
      datavencimento: "2024-06-26",
      descricao: "Serviço 2",
      categoria: mockCategoria(2),
      formapagamento: ETransactionPaymentMethod.pix,
      contabancaria: mockConta("Banco Inter"),
      status: ETransactionStatus.confirmed,
      valortotal: 2578
    }),
    asFinancialTransaction({
      datarecebimento: "2024-06-19",
      datavencimento: "2024-06-30",
      descricao: "Serviço 3",
      categoria: mockCategoria(3),
      formapagamento: ETransactionPaymentMethod.creditCard,
      contabancaria: mockConta("Conta Inter"),
      status: ETransactionStatus.pending,
      valortotal: 1987
    }),
    asFinancialTransaction({
      datarecebimento: "2024-06-19",
      datavencimento: "2024-06-27",
      descricao: "Serviço 4",
      categoria: mockCategoria(4),
      formapagamento: ETransactionPaymentMethod.deposit,
      contabancaria: mockConta("Banco Inter"),
      status: ETransactionStatus.reconciled,
      valortotal: 3284
    }),
    asFinancialTransaction({
      datarecebimento: "2024-06-19",
      datavencimento: "2024-06-28",
      descricao: "Serviço 5",
      categoria: mockCategoria(5),
      formapagamento: ETransactionPaymentMethod.pix,
      contabancaria: mockConta("Banco Inter"),
      status: ETransactionStatus.confirmed,
      valortotal: 894
    }),
    asFinancialTransaction({
      datarecebimento: "2024-06-18",
      datavencimento: "2024-06-25",
      descricao: "Serviço 6",
      categoria: mockCategoria(6),
      formapagamento: ETransactionPaymentMethod.deposit,
      contabancaria: mockConta("Banco Inter"),
      status: ETransactionStatus.reconciled,
      valortotal: 1540
    }),
    asFinancialTransaction({
      datarecebimento: "2024-06-18",
      datavencimento: "2024-06-29",
      descricao: "Serviço 7",
      categoria: mockCategoria(7),
      formapagamento: ETransactionPaymentMethod.pix,
      contabancaria: mockConta("Banco Inter"),
      status: ETransactionStatus.confirmed,
      valortotal: 2100
    }),
    asFinancialTransaction({
      datarecebimento: "2024-06-17",
      datavencimento: "2024-07-02",
      descricao: "Serviço 8",
      categoria: mockCategoria(8),
      formapagamento: ETransactionPaymentMethod.creditCard,
      contabancaria: mockConta("Conta Inter"),
      status: ETransactionStatus.pending,
      valortotal: 980
    }),
    asFinancialTransaction({
      datarecebimento: "2024-06-17",
      datavencimento: "2024-06-24",
      descricao: "Serviço 9",
      categoria: mockCategoria(9),
      formapagamento: ETransactionPaymentMethod.deposit,
      contabancaria: mockConta("Banco Inter"),
      status: ETransactionStatus.reconciled,
      valortotal: 3500
    }),
    asFinancialTransaction({
      datarecebimento: "2024-06-16",
      datavencimento: "2024-06-26",
      descricao: "Serviço 10",
      categoria: mockCategoria(10),
      formapagamento: ETransactionPaymentMethod.pix,
      contabancaria: mockConta("Banco Inter"),
      status: ETransactionStatus.confirmed,
      valortotal: 1750
    }),
    asFinancialTransaction({
      datarecebimento: "2024-06-16",
      datavencimento: "2024-06-26",
      descricao: "Serviço 11",
      categoria: mockCategoria(11),
      formapagamento: ETransactionPaymentMethod.pix,
      contabancaria: mockConta("Banco Inter"),
      status: ETransactionStatus.confirmed,
      valortotal: 1750
    }),
    asFinancialTransaction({
      datarecebimento: "2024-06-16",
      datavencimento: "2024-06-26",
      descricao: "Serviço 12",
      categoria: mockCategoria(12),
      formapagamento: ETransactionPaymentMethod.pix,
      contabancaria: mockConta("Banco Inter"),
      status: ETransactionStatus.confirmed,
      valortotal: 1750
    }),
    asFinancialTransaction({
      datarecebimento: "2024-06-16",
      datavencimento: "2024-06-26",
      descricao: "Serviço 13",
      categoria: mockCategoria(13),
      formapagamento: ETransactionPaymentMethod.pix,
      contabancaria: mockConta("Banco Inter"),
      status: ETransactionStatus.confirmed,
      valortotal: 1750
    }),
    asFinancialTransaction({
      datarecebimento: "2024-06-16",
      datavencimento: "2024-06-26",
      descricao: "Serviço 14",
      categoria: mockCategoria(14),
      formapagamento: ETransactionPaymentMethod.pix,
      contabancaria: mockConta("Banco Inter"),
      status: ETransactionStatus.confirmed,
      valortotal: 1750
    }),
    asFinancialTransaction({
      datarecebimento: "2024-06-16",
      datavencimento: "2024-06-26",
      descricao: "Serviço 15",
      categoria: mockCategoria(15),
      formapagamento: ETransactionPaymentMethod.pix,
      contabancaria: mockConta("Banco Inter"),
      status: ETransactionStatus.confirmed,
      valortotal: 1750
    }),
    asFinancialTransaction({
      datarecebimento: "2024-06-16",
      datavencimento: "2024-06-26",
      descricao: "Serviço 16",
      categoria: mockCategoria(16),
      formapagamento: ETransactionPaymentMethod.pix,
      contabancaria: mockConta("Banco Inter"),
      status: ETransactionStatus.confirmed,
      valortotal: 1750
    }),
    asFinancialTransaction({
      datarecebimento: "2024-06-16",
      datavencimento: "2024-06-26",
      descricao: "Serviço 17",
      categoria: mockCategoria(17),
      formapagamento: ETransactionPaymentMethod.pix,
      contabancaria: mockConta("Banco Inter"),
      status: ETransactionStatus.confirmed,
      valortotal: 1750
    }),
    asFinancialTransaction({
      datarecebimento: "2024-06-16",
      datavencimento: "2024-06-26",
      descricao: "Serviço 18",
      categoria: mockCategoria(18),
      formapagamento: ETransactionPaymentMethod.pix,
      contabancaria: mockConta("Banco Inter"),
      status: ETransactionStatus.confirmed,
      valortotal: 1750
    })
  ];

  filteredTransactions: FinancialTransaction[] = [];

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
    private financialTransactionsPdfExport: FinancialTransactionsPdfExportService
  ) {}

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
    return this.filteredTransactions.reduce(function (sum, t) {
      return sum + (typeof t.valortotal === "number" ? t.valortotal : 0);
    }, 0);
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
        self.removeTransactionById(result.transaction.idtransacao);
      });
  }

  private removeTransactionById(idtransacao: number): void {
    this.allTransactions = this.allTransactions.filter(function (t) {
      return t.idtransacao !== idtransacao;
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
        created.idtransacao = self.nextTransactionId();
        if (self.transactionType === EFinancialStep.revenues) {
          if (!created.datavencimento && created.datarecebimento) {
            created.datavencimento = created.datarecebimento;
          }
        }
        self.allTransactions = [created].concat(self.allTransactions);
      });
  }

  private nextTransactionId(): number {
    let max = 0;
    let i = 0;
    for (i = 0; i < this.allTransactions.length; i++) {
      const t = this.allTransactions[i];
      if (t && t.idtransacao && t.idtransacao > max) {
        max = t.idtransacao;
      }
    }
    return max + 1;
  }
}
