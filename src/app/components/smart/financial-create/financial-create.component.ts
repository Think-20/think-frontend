import { Component, Inject, Optional, ViewChild } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { EFinancialStep } from "app/shared/enums/financial-step.enum";
import { ETransactionPaymentMethod, transactionPaymentMethods } from "app/shared/enums/transaction-payment-method.enum";
import { ETransactionStatus } from "app/shared/enums/transaction-status.enum";
import {
  FinancialTransaction,
  FinancialTransactionBankAccount,
  FinancialTransactionCategory
} from "app/shared/models/financial-transaction.model";
import { FinancialFormComponent } from "../financial-form/financial-form.component";

@Component({
  selector: "cb-financial-create",
  templateUrl: "./financial-create.component.html",
  styleUrls: ["./financial-create.component.scss"]
})
export class FinancialCreateComponent {
  @ViewChild(FinancialFormComponent, { static: false })
  private financialForm: FinancialFormComponent;

  /** Opções de categoria (mesmo contrato que a API de cadastros). */
  categories: FinancialTransactionCategory[] = [
    { idcategoria: 1, nome: "Revestimento e acabamento", tema: 4 },
    { idcategoria: 2, nome: "Serviços de engenharia", tema: 14 },
    { idcategoria: 3, nome: "Consultoria técnica", tema: 8 },
    { idcategoria: 4, nome: "Mão de obra especializada", tema: 7 },
    { idcategoria: 5, nome: "Materiais e insumos", tema: 13 },
    { idcategoria: 6, nome: "Taxas e licenças", tema: 2 }
  ];

  /** Contas bancárias vinculadas ao job / empresa. */
  accounts: FinancialTransactionBankAccount[] = [
    {
      idcontabancaria: 1,
      nome: "Think PJ (Nubank)",
      banco: "260",
      agencia: "0001",
      conta: "60190-1",
      datacadastro: "2022-01-03T23:50:00"
    },
    {
      idcontabancaria: 2,
      nome: "Reserva operacional (Itaú)",
      banco: "341",
      agencia: "4521",
      conta: "130987-2",
      datacadastro: "2023-06-01T10:15:00"
    },
    {
      idcontabancaria: 3,
      nome: "Conta corrente Inter",
      banco: "077",
      agencia: "0001",
      conta: "987654-0",
      datacadastro: "2024-03-18T09:00:00"
    },
    {
      idcontabancaria: 4,
      nome: "Bradesco — convênio boletos",
      banco: "237",
      agencia: "1890",
      conta: "450012-8",
      datacadastro: "2021-11-22T16:40:00"
    }
  ];

  formasPagamento = Array.from(transactionPaymentMethods.entries()).map(function (entry) {
    return { id: entry[0], nome: entry[1] };
  });

  periodos = [
    { id: 1, nome: "Valor único" },
    { id: 2, nome: "Valor parcelado" }
  ];

  /** Rascunho inicial para o formulário (id `0` até persistir na API). */
  draft: FinancialTransaction;

  constructor(
    public dialog: MatDialogRef<FinancialCreateComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private dialogData: { transactionType?: EFinancialStep }
  ) {
    this.draft = this.buildEmptyDraft();
  }

  get resolvedTransactionType(): EFinancialStep {
    if (this.dialogData && this.dialogData.transactionType !== undefined && this.dialogData.transactionType !== null) {
      return this.dialogData.transactionType;
    }
    return EFinancialStep.revenues;
  }

  get createModalTitle(): string {
    return this.resolvedTransactionType === EFinancialStep.expenses ? "Nova despesa" : "Nova receita";
  }

  close(): void {
    this.dialog.close(undefined);
  }

  save(): void {
    if (this.financialForm) {
      this.financialForm.commit();
    }
  }

  onCreated(transaction: FinancialTransaction): void {
    this.dialog.close(transaction);
  }

  private buildEmptyDraft(): FinancialTransaction {
    const today = this.todayIsoDate();
    const isExpense = this.resolvedTransactionType === EFinancialStep.expenses;

    return {
      idtransacao: 0,
      idjob: 4281,
      tipotransacao: isExpense ? 2 : 1,
      descricao: "",
      observacao: "",
      status: ETransactionStatus.pending,
      datacriacao: today + "T12:00:00",
      datarecebimento: "",
      datavencimento: "",
      datarealizado: "",
      datacobranca: "",
      idcategoria: 0,
      categoria: null,
      idcontabancaria: 0,
      contabancaria: null,
      formapagamento: ETransactionPaymentMethod.pix,
      numparcelas: 1,
      valortotal: 0,
      periodo: 1,
      chavepix: "",
      banco: "",
      agencia: "",
      contacorrente: "",
      parcelas: [],
      tags: []
    } as FinancialTransaction;
  }

  private todayIsoDate(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const pad = function (n: number): string {
      return n < 10 ? "0" + String(n) : String(n);
    };
    return String(y) + "-" + pad(m) + "-" + pad(day);
  }
}
