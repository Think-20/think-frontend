import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import {
  FinancialTransaction,
  FinancialTransactionBankAccount,
  FinancialTransactionCategory,
} from "app/shared/models/financial-transaction.model";

@Component({
  selector: "cb-financial-form",
  templateUrl: "./financial-form.component.html",
  styleUrls: ["./financial-form.component.scss"],
})
export class FinancialFormComponent implements OnInit, OnChanges {
  @Input() transaction: FinancialTransaction;
  @Input() categories: FinancialTransactionCategory[] = [];
  @Input() accounts: FinancialTransactionBankAccount[] = [];
  @Input() formasPagamento: Array<{ id: number; nome: string }> = [];
  @Input() periodos: Array<{ id: number; nome: string }> = [];

  @Output() saved = new EventEmitter<FinancialTransaction>();

  form: FormGroup;

  ngOnInit(): void {
    this.buildForm();
    this.patchFormFromTransaction();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.form && changes.transaction && !changes.transaction.firstChange) {
      this.patchFormFromTransaction();
    }
  }

  commit(): void {
    if (!this.form || !this.transaction) {
      return;
    }

    const value = this.form.value;
    const base = this.transaction;
    const categoria: FinancialTransactionCategory = value.categoria
      ? value.categoria
      : base.categoria;
    const contabancaria: FinancialTransactionBankAccount = value.contabancaria
      ? value.contabancaria
      : base.contabancaria;

    const formaCtrl = value.formapagamento;
    const periodoCtrl = value.periodo;

    const formapagamentoId =
      formaCtrl && formaCtrl.id !== undefined && formaCtrl.id !== null
        ? formaCtrl.id
        : base.formapagamento;
    const periodoId =
      periodoCtrl && periodoCtrl.id !== undefined && periodoCtrl.id !== null
        ? periodoCtrl.id
        : base.periodo;

    const payload: FinancialTransaction = Object.assign({}, base, {
      descricao: value.descricao ? value.descricao : "",
      datarecebimento: value.datarecebimento ? value.datarecebimento : "",
      datacobranca: value.datacobranca ? value.datacobranca : "",
      idcategoria: categoria && categoria.idcategoria ? categoria.idcategoria : base.idcategoria,
      categoria: categoria,
      idcontabancaria:
        contabancaria && contabancaria.idcontabancaria
          ? contabancaria.idcontabancaria
          : base.idcontabancaria,
      contabancaria: contabancaria,
      formapagamento: formapagamentoId,
      periodo: periodoId,
      banco: value.banco ? value.banco : "",
      agencia: value.agencia ? value.agencia : "",
      contacorrente: value.contacorrente ? value.contacorrente : "",
      observacao: value.observacao ? value.observacao : "",
    });

    this.saved.emit(payload);
  }

  private buildForm(): void {
    this.form = new FormGroup({
      descricao: new FormControl(""),
      datarecebimento: new FormControl(""),
      datacobranca: new FormControl(""),
      categoria: new FormControl(null),
      contabancaria: new FormControl(null),
      formapagamento: new FormControl(null),
      periodo: new FormControl(null),
      banco: new FormControl(""),
      agencia: new FormControl(""),
      contacorrente: new FormControl(""),
      observacao: new FormControl(""),
    });
  }

  private patchFormFromTransaction(): void {
    if (!this.form || !this.transaction) {
      return;
    }

    const t = this.transaction;

    this.form.patchValue({
      descricao: t.descricao,
      datarecebimento: t.datarecebimento,
      datacobranca: t.datacobranca,
      categoria: t.categoria,
      contabancaria: t.contabancaria,
      formapagamento: this.findOptionById(this.formasPagamento, t.formapagamento),
      periodo: this.findOptionById(this.periodos, t.periodo),
      banco: t.banco,
      agencia: t.agencia,
      contacorrente: t.contacorrente,
      observacao: t.observacao,
    });
  }

  private findOptionById(
    options: Array<{ id: number; nome: string }>,
    id: number
  ): { id: number; nome: string } | null {
    if (!options || options.length === 0) {
      return null;
    }

    for (let i = 0; i < options.length; i++) {
      if (options[i].id === id) {
        return options[i];
      }
    }

    return options[0];
  }
}
