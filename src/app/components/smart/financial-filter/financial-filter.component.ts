import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges
} from "@angular/core";
import { transactionPaymentMethods } from "app/shared/enums/transaction-payment-method.enum";
import { ETransactionStatus, transactionStatuses } from "app/shared/enums/transaction-status.enum";
import { FinancialTransaction } from "app/shared/models/financial-transaction.model";
import { EFinancialStep } from "app/shared/enums/financial-step.enum";

export interface FinancialFilterIdNameOption {
  id: number;
  name: string;
}

@Component({
  selector: "cb-financial-filter",
  templateUrl: "./financial-filter.component.html",
  styleUrls: ["./financial-filter.component.scss"]
})
export class FinancialFilterComponent implements OnChanges, OnDestroy {
  private static readonly FILTER_ALL_ID = -1;

  @Input() transactions: FinancialTransaction[] = [];

  @Input() searchTerm = "";

  @Input() open = false;

  @Input() hintText = "Os filtros abaixo são aplicados junto com a busca por descrição.";

  @Input() dateFromLabel = "Data de recebimento (de)";

  @Input() dateToLabel = "Data de recebimento (até)";

  /** Define qual campo de data entra no intervalo (recebimento vs vencimento). */
  @Input() transactionType: EFinancialStep;

  @Output() openChange = new EventEmitter<boolean>();

  @Output() filteredTransactionsChange = new EventEmitter<FinancialTransaction[]>();

  /** `true` quando existe algum filtro do painel aplicado (exceto “todos” e datas vazias). */
  @Output() activeFiltersChange = new EventEmitter<boolean>();

  statusFilterOptions: FinancialFilterIdNameOption[] = [];

  paymentFilterOptions: FinancialFilterIdNameOption[] = [];

  accountFilterOptions: FinancialFilterIdNameOption[] = [];

  categoryFilterOptions: FinancialFilterIdNameOption[] = [];

  draftStatus: FinancialFilterIdNameOption;

  draftPayment: FinancialFilterIdNameOption;

  draftAccount: FinancialFilterIdNameOption;

  draftCategory: FinancialFilterIdNameOption;

  draftDateFrom = "";

  draftDateTo = "";

  appliedStatus: FinancialFilterIdNameOption;

  appliedPayment: FinancialFilterIdNameOption;

  appliedAccount: FinancialFilterIdNameOption;

  appliedCategory: FinancialFilterIdNameOption;

  appliedDateFrom = "";

  appliedDateTo = "";

  private activeFiltersEmitTimer: number | null = null;

  ngOnDestroy(): void {
    if (this.activeFiltersEmitTimer !== null) {
      window.clearTimeout(this.activeFiltersEmitTimer);
      this.activeFiltersEmitTimer = null;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.transactions) {
      this.buildStaticFilterOptions();
      this.extractDynamicFilterOptions();
      if (changes.transactions.firstChange) {
        this.resetAppliedFiltersToAll();
        this.syncDraftFromApplied();
      }
      this.emitFiltered();
      return;
    }
    if (changes.searchTerm) {
      this.emitFiltered();
    }
    if (changes.transactionType) {
      this.emitFiltered();
    }
    if (changes.open && this.open) {
      this.syncDraftFromApplied();
    }
  }

  @HostListener("document:keydown", ["$event"])
  handleDocumentKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape" && this.open) {
      this.closePanel();
    }
  }

  closePanel(): void {
    this.openChange.emit(false);
  }

  applyFiltersFromPanel(): void {
    this.appliedStatus = this.draftStatus;
    this.appliedPayment = this.draftPayment;
    this.appliedAccount = this.draftAccount;
    this.appliedCategory = this.draftCategory;
    this.appliedDateFrom = this.draftDateFrom;
    this.appliedDateTo = this.draftDateTo;
    this.emitFiltered();
    this.openChange.emit(false);
  }

  clearPanelFilters(): void {
    this.resetAppliedFiltersToAll();
    this.syncDraftFromApplied();
    this.emitFiltered();
  }

  private statusLabel(status: number): string {
    const label = transactionStatuses.get(status as ETransactionStatus);
    return label ? label : "";
  }

  private buildStaticFilterOptions(): void {
    const allId = FinancialFilterComponent.FILTER_ALL_ID;
    this.statusFilterOptions = [
      { id: allId, name: "Todos os status" },
      { id: ETransactionStatus.pending, name: this.statusLabel(ETransactionStatus.pending) },
      { id: ETransactionStatus.confirmed, name: this.statusLabel(ETransactionStatus.confirmed) },
      { id: ETransactionStatus.reconciled, name: this.statusLabel(ETransactionStatus.reconciled) }
    ];
    this.paymentFilterOptions = [{ id: allId, name: "Todas as formas" }];
    transactionPaymentMethods.forEach(function (label, method) {
      this.paymentFilterOptions.push({ id: method as number, name: label });
    }, this);
  }

  private extractDynamicFilterOptions(): void {
    const allId = FinancialFilterComponent.FILTER_ALL_ID;
    const categoryById = new Map<number, string>();
    const accountById = new Map<number, string>();
    for (let i = 0; i < this.transactions.length; i++) {
      const t = this.transactions[i];
      if (t.categoria) {
        categoryById.set(t.categoria.idcategoria, t.categoria.nome);
      }
      if (t.contabancaria) {
        accountById.set(t.contabancaria.idcontabancaria, t.contabancaria.nome);
      }
    }
    this.categoryFilterOptions = [{ id: allId, name: "Todas as categorias" }];
    categoryById.forEach(function (name, id) {
      this.categoryFilterOptions.push({ id: id, name: name });
    }, this);
    this.accountFilterOptions = [{ id: allId, name: "Todas as contas" }];
    accountById.forEach(function (name, id) {
      this.accountFilterOptions.push({ id: id, name: name });
    }, this);
  }

  private resetAppliedFiltersToAll(): void {
    this.appliedStatus = this.statusFilterOptions[0];
    this.appliedPayment = this.paymentFilterOptions[0];
    this.appliedAccount = this.accountFilterOptions[0];
    this.appliedCategory = this.categoryFilterOptions[0];
    this.appliedDateFrom = "";
    this.appliedDateTo = "";
  }

  private syncDraftFromApplied(): void {
    this.draftStatus = this.appliedStatus;
    this.draftPayment = this.appliedPayment;
    this.draftAccount = this.appliedAccount;
    this.draftCategory = this.appliedCategory;
    this.draftDateFrom = this.appliedDateFrom;
    this.draftDateTo = this.appliedDateTo;
  }

  private emitFiltered(): void {
    const self = this;
    const term = this.searchTerm.trim().toLowerCase();
    const list = this.transactions.filter(function (t) {
      if (term) {
        const desc = t.descricao ? t.descricao.toLowerCase() : "";
        if (desc.indexOf(term) < 0) {
          return false;
        }
      }
      if (self.appliedStatus.id !== FinancialFilterComponent.FILTER_ALL_ID) {
        if (t.status !== self.appliedStatus.id) {
          return false;
        }
      }
      if (self.appliedPayment.id !== FinancialFilterComponent.FILTER_ALL_ID) {
        if (t.formapagamento !== self.appliedPayment.id) {
          return false;
        }
      }
      if (self.appliedAccount.id !== FinancialFilterComponent.FILTER_ALL_ID) {
        if (!t.contabancaria || t.contabancaria.idcontabancaria !== self.appliedAccount.id) {
          return false;
        }
      }
      if (self.appliedCategory.id !== FinancialFilterComponent.FILTER_ALL_ID) {
        if (!t.categoria || t.categoria.idcategoria !== self.appliedCategory.id) {
          return false;
        }
      }
      if (!self.isDateInAppliedRange(self.isoDateForFilter(t))) {
        return false;
      }
      return true;
    });
    this.filteredTransactionsChange.emit(list);
    this.emitActiveFiltersState();
  }

  private isAppliedFilterClean(): boolean {
    if (!this.appliedStatus || !this.appliedPayment || !this.appliedAccount || !this.appliedCategory) {
      return true;
    }
    const allId = FinancialFilterComponent.FILTER_ALL_ID;
    return (
      this.appliedStatus.id === allId &&
      this.appliedPayment.id === allId &&
      this.appliedAccount.id === allId &&
      this.appliedCategory.id === allId &&
      !this.appliedDateFrom &&
      !this.appliedDateTo
    );
  }

  private emitActiveFiltersState(): void {
    if (this.activeFiltersEmitTimer !== null) {
      window.clearTimeout(this.activeFiltersEmitTimer);
      this.activeFiltersEmitTimer = null;
    }
    const active = !this.isAppliedFilterClean();
    const self = this;
    // Evita atualizar o pai no mesmo ciclo de CD do ngOnChanges (badge não refletia).
    this.activeFiltersEmitTimer = window.setTimeout(function () {
      self.activeFiltersEmitTimer = null;
      self.activeFiltersChange.emit(active);
    }, 0);
  }

  private isDateInAppliedRange(iso: string): boolean {
    const from = this.appliedDateFrom;
    const to = this.appliedDateTo;
    if (!from && !to) {
      return true;
    }
    const part = this.isoDatePart(iso);
    if (!part) {
      return false;
    }
    if (from && part < from) {
      return false;
    }
    if (to && part > to) {
      return false;
    }
    return true;
  }

  private isoDatePart(iso: string): string {
    if (!iso) {
      return "";
    }
    const datePart = iso.indexOf("T") >= 0 ? iso.split("T")[0] : iso;
    return datePart;
  }

  /** Data usada no filtro por intervalo: vencimento (despesa) ou recebimento (receita). */
  private isoDateForFilter(t: FinancialTransaction): string {
    if (this.transactionType === EFinancialStep.expenses) {
      if (t.datavencimento) {
        return t.datavencimento;
      }
      return "";
    }
    if (t.datarecebimento) {
      return t.datarecebimento;
    }
    return "";
  }
}
