import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import {
  FinancialTransaction,
  FinancialTransactionParcela,
} from "app/shared/models/financial-transaction.model";
import { ETransactionPaymentMethod } from "app/shared/enums/transaction-payment-method.enum";
import { EFinancialStep } from "app/shared/enums/financial-step.enum";

@Component({
  selector: "cb-financial-details",
  templateUrl: "./financial-details.component.html",
  styleUrls: ["./financial-details.component.scss"],
})
export class FinancialDetailsComponent implements OnChanges {
  private readonly PERIODO_VALOR_UNICO = 1;
  private readonly PERIODO_PARCELADO = 2;

  @Input() transaction: FinancialTransaction;
  @Input() transactionType: EFinancialStep = EFinancialStep.revenues;
  @Input() formasPagamento: Array<{ id: number; nome: string }> = [];
  @Input() periodos: Array<{ id: number; nome: string }> = [];

  get isExpenseDetails(): boolean {
    return this.transactionType === EFinancialStep.expenses;
  }

  /**
   * Parcelas ordenadas espelhadas do @Input (referência estável).
   * Evita ExpressionChangedAfterItHasBeenCheckedError ao usar *ngFor com método
   * que retornava novo array a cada ciclo de detecção.
   */
  parcelasOrdenadas: FinancialTransactionParcela[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.transaction) {
      this.parcelasOrdenadas = this.computeParcelasOrdenadas(this.transaction);
    }
  }

  getFormaPagamentoNome(id: number): string {
    return this.nomePorId(this.formasPagamento, id);
  }

  getPeriodoNome(id: number): string {
    return this.nomePorId(this.periodos, id);
  }

  isDepositPayment(t: FinancialTransaction): boolean {
    return t.formapagamento === ETransactionPaymentMethod.deposit;
  }

  isPixPayment(t: FinancialTransaction): boolean {
    return t.formapagamento === ETransactionPaymentMethod.pix;
  }

  isCreditCardPayment(t: FinancialTransaction): boolean {
    return t.formapagamento === ETransactionPaymentMethod.creditCard;
  }

  isBankSlipPayment(t: FinancialTransaction): boolean {
    return t.formapagamento === ETransactionPaymentMethod.bankSlip;
  }

  isSingleValueLaunch(t: FinancialTransaction): boolean {
    if (!t) {
      return false;
    }
    return t.periodo === this.PERIODO_VALOR_UNICO;
  }

  isInstallmentLaunch(t: FinancialTransaction): boolean {
    if (!t) {
      return false;
    }
    return t.periodo === this.PERIODO_PARCELADO;
  }

  private computeParcelasOrdenadas(t: FinancialTransaction): FinancialTransactionParcela[] {
    if (!t || !t.parcelas || !t.parcelas.length) {
      return [];
    }
    const copy = t.parcelas.slice();
    copy.sort(function (a, b) {
      return a.ordem - b.ordem;
    });
    return copy;
  }

  trackByParcela(index: number, p: FinancialTransactionParcela): number {
    if (p && p.idparcela) {
      return p.idparcela;
    }
    return index;
  }

  hasArquivoboletoPrincipal(t: FinancialTransaction): boolean {
    if (!t || !t.arquivoboleto) {
      return false;
    }
    const ab = t.arquivoboleto;
    return !!(
      (ab.nomearquivo && String(ab.nomearquivo).length) ||
      (ab.diretorio && String(ab.diretorio).length)
    );
  }

  hasTransactionAnexos(t: FinancialTransaction): boolean {
    if (!t || !t.arquivos) {
      return false;
    }
    return t.arquivos.length > 0;
  }

  getBoletoArquivoNome(t: FinancialTransaction): string {
    if (!t || !t.arquivoboleto) {
      return "";
    }
    const ab = t.arquivoboleto;
    if (ab.nomearquivo) {
      return ab.nomearquivo;
    }
    if (ab.diretorio) {
      const str = String(ab.diretorio);
      const parts = str.split(/[/\\]/);
      const last = parts[parts.length - 1];
      return last ? last : str;
    }
    return "";
  }

  private nomePorId(lista: Array<{ id: number; nome: string }>, id: number): string {
    if (!lista || lista.length === 0) {
      return "";
    }
    for (let i = 0; i < lista.length; i++) {
      if (lista[i].id === id) {
        return lista[i].nome;
      }
    }
    return "";
  }
}
