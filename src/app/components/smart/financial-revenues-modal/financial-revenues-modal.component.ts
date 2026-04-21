import { Component, ViewChild } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { ETransactionStatus } from "app/shared/enums/transaction-status.enum";
import {
  FinancialTransaction,
  FinancialTransactionBankAccount,
  FinancialTransactionCategory,
} from "app/shared/models/financial-transaction.model";
import { FinancialFormComponent } from "../financial-form/financial-form.component";

@Component({
  selector: "cb-financial-revenues-modal",
  templateUrl: "./financial-revenues-modal.component.html",
  styleUrls: ["./financial-revenues-modal.component.scss"],
})
export class FinancialRevenuesModalComponent {
  @ViewChild(FinancialFormComponent, { static: false })
  private financialForm: FinancialFormComponent;

  isEditing = false;

  /** Opções de categoria (mesmo contrato que a API de cadastros). */
  categories: FinancialTransactionCategory[] = [
    { idcategoria: 1, nome: "Revestimento e acabamento", tema: 4 },
    { idcategoria: 2, nome: "Serviços de engenharia", tema: 14 },
    { idcategoria: 3, nome: "Consultoria técnica", tema: 8 },
    { idcategoria: 4, nome: "Mão de obra especializada", tema: 7 },
    { idcategoria: 5, nome: "Materiais e insumos", tema: 13 },
    { idcategoria: 6, nome: "Taxas e licenças", tema: 2 },
  ];

  /** Contas bancárias vinculadas ao job / empresa. */
  accounts: FinancialTransactionBankAccount[] = [
    {
      idcontabancaria: 1,
      nome: "Think Engenharia — PJ (Nubank)",
      banco: "260",
      agencia: "0001",
      conta: "60190-1",
      datacadastro: "2022-01-03T23:50:00",
    },
    {
      idcontabancaria: 2,
      nome: "Reserva operacional (Itaú)",
      banco: "341",
      agencia: "4521",
      conta: "130987-2",
      datacadastro: "2023-06-01T10:15:00",
    },
    {
      idcontabancaria: 3,
      nome: "Conta corrente Inter",
      banco: "077",
      agencia: "0001",
      conta: "987654-0",
      datacadastro: "2024-03-18T09:00:00",
    },
    {
      idcontabancaria: 4,
      nome: "Bradesco — convênio boletos",
      banco: "237",
      agencia: "1890",
      conta: "450012-8",
      datacadastro: "2021-11-22T16:40:00",
    },
  ];

  formasPagamento = [
    { id: 1, nome: "Depósito identificado" },
    { id: 2, nome: "Pix" },
    { id: 3, nome: "TED / transferência" },
    { id: 4, nome: "Boleto bancário" },
    { id: 5, nome: "Cartão de crédito" },
    { id: 6, nome: "Dinheiro" },
  ];

  periodos = [
    { id: 1, nome: "Custo fixo (mensal)" },
    { id: 2, nome: "Custo variável" },
    { id: 3, nome: "Receita única" },
    { id: 4, nome: "Parcelado (contrato)" },
  ];

  /**
   * Transação de exemplo: receita parcelada, já conciliada, com anexo de boleto e histórico de datas coerente.
   */
  transaction: FinancialTransaction = {
    idtransacao: 1847,
    idjob: 4281,
    tipotransacao: 1,
    descricao:
      "Projeto executivo + acompanhamento de obra — Residencial Jardim Europa (fase 1)",
    observacao:
      "Valores acordados em proposta comercial #2026-0142. Primeira parcela vinculada à entrega do memorial descritivo; demais parcelas atreladas às medições mensais. " +
      "NF-e prevista para emissão até 5 dias após cada liquidação. Contato financeiro: financeiro@think.eng.br.",
    status: ETransactionStatus.reconciled,
    datacriacao: "2026-02-18T14:32:00",
    datarecebimento: "2026-03-12T11:05:00",
    datavencimento: "2026-06-10T23:59:59",
    datarealizado: "2026-03-12T11:08:00",
    datacobranca: "2026-03-05T08:00:00",
    idcategoria: 2,
    categoria: {
      idcategoria: 2,
      nome: "Serviços de engenharia",
      tema: 14,
    },
    idcontabancaria: 1,
    contabancaria: {
      idcontabancaria: 1,
      nome: "Think Engenharia — PJ (Nubank)",
      banco: "260",
      agencia: "0001",
      conta: "60190-1",
      datacadastro: "2022-01-03T23:50:00",
    },
    formapagamento: 2,
    numparcelas: 4,
    valortotal: 2820,
    periodo: 4,
    chavepix: "recebimentos@thinkengenharia.com.br",
    banco: "",
    agencia: "",
    contacorrente: "",
    diretorioarquivoboleto:
      "/storage/jobs/4281/financeiro/boletos/BOLETO_TRANSACAO_1847_20260301.pdf",
    parcelas: [
      {
        idparcela: 9101,
        idtransacao: 1847,
        valor: 705,
        data: "2026-03-10T00:00:00",
        ordem: 1,
      },
      {
        idparcela: 9102,
        idtransacao: 1847,
        valor: 705,
        data: "2026-04-10T00:00:00",
        ordem: 2,
      },
      {
        idparcela: 9103,
        idtransacao: 1847,
        valor: 705,
        data: "2026-05-12T00:00:00",
        ordem: 3,
      },
      {
        idparcela: 9104,
        idtransacao: 1847,
        valor: 705,
        data: "2026-06-10T00:00:00",
        ordem: 4,
      },
    ],
    tags: [
      { idtag: 12, descricao: "projeto-4281" },
      { idtag: 34, descricao: "aprovado-cliente" },
      { idtag: 41, descricao: "medição-fase-1" },
      { idtag: 55, descricao: "pix-liberado" },
      { idtag: 60, descricao: "nf-pendente-parcela-2" },
    ],
  };

  constructor(public dialog: MatDialogRef<FinancialRevenuesModalComponent>) {}

  close(): void {
    this.dialog.close();
  }

  edit(): void {
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.isEditing = false;
  }

  save(): void {
    if (this.financialForm) {
      this.financialForm.commit();
    }
  }

  onTransactionSaved(updated: FinancialTransaction): void {
    this.transaction = updated;
    this.isEditing = false;
  }
}
