import { Component, Input } from "@angular/core";
import { FinancialTransaction } from "app/shared/models/financial-transaction.model";

@Component({
  selector: "cb-financial-details",
  templateUrl: "./financial-details.component.html",
  styleUrls: ["./financial-details.component.scss"],
})
export class FinancialDetailsComponent {
  @Input() transaction: FinancialTransaction;
  @Input() formasPagamento: Array<{ id: number; nome: string }> = [];
  @Input() periodos: Array<{ id: number; nome: string }> = [];

  getFormaPagamentoNome(id: number): string {
    return this.nomePorId(this.formasPagamento, id);
  }

  getPeriodoNome(id: number): string {
    return this.nomePorId(this.periodos, id);
  }

  bancoExibicao(t: FinancialTransaction): string {
    if (t.banco) {
      return t.banco;
    }
    return t.contabancaria && t.contabancaria.banco ? t.contabancaria.banco : "";
  }

  agenciaExibicao(t: FinancialTransaction): string {
    if (t.agencia) {
      return t.agencia;
    }
    return t.contabancaria && t.contabancaria.agencia ? t.contabancaria.agencia : "";
  }

  contaExibicao(t: FinancialTransaction): string {
    if (t.contacorrente) {
      return t.contacorrente;
    }
    return t.contabancaria && t.contabancaria.conta ? t.contabancaria.conta : "";
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
