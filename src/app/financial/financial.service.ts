import { Injectable } from "@angular/core";
import { Headers, Http, RequestOptions } from "@angular/http";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/map";

import { API } from "app/app.api";
import { ErrorHandler } from "app/shared/error-handler.service";
import {
  FinancialTransaction,
  FinancialTransactionBankAccount,
  FinancialTransactionTag
} from "app/shared/models/financial-transaction.model";

/** Resposta de GET financeiro/transacao/{jobId}/{tipoTransacao}?contaBancariaId= (&date= opcional) */
export interface FinancialTransactionsByAccountResponse {
  totalRealizado: number;
  totalReceber: number;
  totalPrevisto: number;
  transacoes: any[];
}

@Injectable()
export class FinancialService {
  constructor(private http: Http, private snackBar: MatSnackBar) {}

  /**
   * Transações do job/tipo/conta. `dateIso` opcional (YYYY-MM-DD); omitido na listagem completa.
   */
  transactionsByJobAndBankAccount(
    jobId: number,
    tipoTransacao: number,
    contaBancariaId: number,
    dateIso?: string
  ): Observable<FinancialTransactionsByAccountResponse> {
    let query = "contaBancariaId=" + String(contaBancariaId);
    if (dateIso !== undefined && dateIso !== null && String(dateIso).trim()) {
      query = "date=" + encodeURIComponent(String(dateIso).trim()) + "&" + query;
    }
    const url = "financeiro/transacao/" + String(jobId) + "/" + String(tipoTransacao) + "?" + query;

    return this.http
      .get(API + "/" + url)
      .map(function (response) {
        const body = response.json();
        if (!body) {
          return {
            totalRealizado: 0,
            totalReceber: 0,
            totalPrevisto: 0,
            transacoes: []
          };
        }
        return {
          totalRealizado: typeof body.totalRealizado === "number" ? body.totalRealizado : 0,
          totalReceber: typeof body.totalReceber === "number" ? body.totalReceber : 0,
          totalPrevisto: typeof body.totalPrevisto === "number" ? body.totalPrevisto : 0,
          transacoes: body.transacoes && body.transacoes.length ? body.transacoes : []
        };
      })
      .catch(
        function (err) {
          this.snackBar.open(ErrorHandler.message(err), "", {
            duration: 3000
          });
          return ErrorHandler.capture(err);
        }.bind(this)
      );
  }

  /**
   * Total por job e tipo de transação (receita/despesa). `dateIso` em YYYY-MM-DD; se omitido, usa a data atual.
   */
  /**
   * Cria transação (POST financeiro/transacao).
   */
  createTransaction(transaction: FinancialTransaction): Observable<FinancialTransaction> {
    const body = this.serializeTransactionForApi(transaction);

    delete body.idtransacao;

    return this.http
      .post(API + "/financeiro/transacao", JSON.stringify(body), new RequestOptions())
      .map(function (response) {
        return response.json() as FinancialTransaction;
      })
      .catch(
        function (err) {
          this.snackBar.open(ErrorHandler.message(err), "", {
            duration: 3000
          });
          return ErrorHandler.capture(err);
        }.bind(this)
      );
  }

  /**
   * Atualiza transação (PUT financeiro/transacao).
   */
  updateTransaction(transaction: FinancialTransaction): Observable<FinancialTransaction> {
    const body = this.serializeTransactionForApi(transaction);
    return this.http
      .put(API + "/financeiro/transacao", JSON.stringify(body), new RequestOptions())
      .map(function (response) {
        return response.json() as FinancialTransaction;
      })
      .catch(
        function (err) {
          this.snackBar.open(ErrorHandler.message(err), "", {
            duration: 3000
          });
          return ErrorHandler.capture(err);
        }.bind(this)
      );
  }

  /**
   * Lista todas as tags cadastradas (POST tags/all).
   */
  getAllTags(): Observable<FinancialTransactionTag[]> {
    const self = this;
    return this.http
      .post(API + "/tags/all", JSON.stringify({}), new RequestOptions())
      .map(function (response): FinancialTransactionTag[] {
        return self.normalizeTagsList(response.json());
      })
      .catch(function (err): Observable<FinancialTransactionTag[]> {
        self.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000
        });
        return ErrorHandler.capture(err);
      });
  }

  /**
   * Cadastra ou atualiza uma tag (POST tag/save).
   */
  saveTag(tag: FinancialTransactionTag): Observable<FinancialTransactionTag> {
    const self = this;
    const payload = {
      idtag: tag && tag.idtag ? tag.idtag : 0,
      descricao: tag && tag.descricao ? tag.descricao : ""
    };

    return this.http
      .post(API + "/tag/save", JSON.stringify(payload), new RequestOptions())
      .map(function (response): FinancialTransactionTag {
        return self.normalizeTagFromApi(response.json());
      })
      .catch(function (err): Observable<FinancialTransactionTag> {
        self.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000
        });
        return ErrorHandler.capture(err);
      });
  }

  transactionTotal(jobId: number, tipoTransacao: number, dateIso?: string): Observable<number> {
    const resolvedDate = this.resolveDateQueryParam(dateIso);
    const url = "financeiro/transacao/total/" + String(jobId) + "/" + String(tipoTransacao) + "?date=" + encodeURIComponent(resolvedDate);

    return this.http
      .get(API + "/" + url)
      .map(function (response) {
        const body = response.json();

        if (!body) {
          return 0;
        }

        if (typeof body.total === "number") {
          return body.total;
        }

        return 0;
      })
      .catch(
        function (err) {
          this.snackBar.open(ErrorHandler.message(err), "", {
            duration: 3000
          });
          return ErrorHandler.capture(err);
        }.bind(this)
      );
  }

  private jsonRequestOptions(): RequestOptions {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    return new RequestOptions({ headers: headers });
  }

  /**
   * Corpo JSON alinhado ao backend (conta bancária em formato API, não instância de classe).
   */
  private serializeTransactionForApi(t: FinancialTransaction): any {
    const body: any = {
      idtransacao: t.idtransacao,
      idjob: t.idjob,
      tipotransacao: t.tipotransacao,
      descricao: t.descricao,
      observacao: t.observacao,
      status: t.status,
      datacriacao: t.datacriacao,
      datarecebimento: t.datarecebimento,
      datavencimento: t.datavencimento,
      datarealizado: t.datarealizado,
      datacobranca: t.datacobranca,
      idcategoria: t.idcategoria,
      categoria: t.categoria,
      idcontabancaria: t.idcontabancaria,
      contabancaria: this.serializeContaBancariaForApi(t.contabancaria),
      formapagamento: t.formapagamento,
      numparcelas: t.numparcelas,
      valortotal: t.valortotal,
      periodo: t.periodo,
      chavepix: t.chavepix,
      banco: t.banco,
      agencia: t.agencia,
      contacorrente: t.contacorrente,
      parcelas: t.parcelas && t.parcelas.length ? t.parcelas : [],
      tags: t.tags && t.tags.length ? t.tags : []
    };

    if (t.idcontabancariacartaocredito !== undefined && t.idcontabancariacartaocredito !== null) {
      body.idcontabancariacartaocredito = t.idcontabancariacartaocredito;
    }
    if (t.contabancariacartaocredito) {
      body.contabancariacartaocredito = this.clonePlainBankAccountRef(t.contabancariacartaocredito);
    }
    if (t.arquivoboleto) {
      body.arquivoboleto = t.arquivoboleto;
    }
    if (t.arquivos && t.arquivos.length) {
      body.arquivos = t.arquivos;
    }

    return body;
  }

  private clonePlainBankAccountRef(ref: FinancialTransactionBankAccount): FinancialTransactionBankAccount {
    return {
      idcontabancaria: ref.idcontabancaria,
      nome: ref.nome,
      banco: ref.banco ? String(ref.banco) : "",
      agencia: ref.agencia ? ref.agencia : "",
      conta: ref.conta ? ref.conta : "",
      datacadastro: ref.datacadastro
    };
  }

  private serializeContaBancariaForApi(conta: any): FinancialTransactionBankAccount | null {
    if (!conta) {
      return null;
    }
    if (conta.bank) {
      const idVal =
        conta.id !== undefined && conta.id !== null
          ? conta.id
          : conta.idcontabancaria !== undefined && conta.idcontabancaria !== null
          ? conta.idcontabancaria
          : 0;
      const bankCode = conta.bank && conta.bank.code !== undefined && conta.bank.code !== null ? String(conta.bank.code) : "";
      return {
        idcontabancaria: typeof idVal === "number" ? idVal : 0,
        nome: conta.name ? String(conta.name) : "",
        banco: bankCode,
        agencia: conta.agency ? String(conta.agency) : "",
        conta: conta.account_number ? String(conta.account_number) : "",
        datacadastro: conta.datacadastro
      };
    }
    return {
      idcontabancaria: typeof conta.idcontabancaria === "number" ? conta.idcontabancaria : typeof conta.id === "number" ? conta.id : 0,
      nome: conta.nome ? String(conta.nome) : "",
      banco: conta.banco ? String(conta.banco) : "",
      agencia: conta.agencia ? String(conta.agencia) : "",
      conta: conta.conta ? String(conta.conta) : "",
      datacadastro: conta.datacadastro
    };
  }

  private normalizeTagsList(body: any): FinancialTransactionTag[] {
    if (!body) {
      return [];
    }
    if (body instanceof Array) {
      return this.mapTagsArray(body);
    }
    if (body.pagination && body.pagination.data && body.pagination.data.length) {
      return this.mapTagsArray(body.pagination.data);
    }
    if (body.data && body.data.length) {
      return this.mapTagsArray(body.data);
    }
    if (body.tags && body.tags.length) {
      return this.mapTagsArray(body.tags);
    }
    return [];
  }

  private mapTagsArray(rawList: any[]): FinancialTransactionTag[] {
    const out: FinancialTransactionTag[] = [];
    if (!rawList || !rawList.length) {
      return out;
    }
    let i = 0;
    for (i = 0; i < rawList.length; i++) {
      out.push(this.normalizeTagFromApi(rawList[i]));
    }
    return out;
  }

  private normalizeTagFromApi(raw: any): FinancialTransactionTag {
    if (!raw) {
      return { idtag: 0, descricao: "" };
    }
    const idtag =
      typeof raw.idtag === "number" ? raw.idtag : typeof raw.id === "number" ? raw.id : 0;
    const descricao = raw.descricao ? String(raw.descricao) : raw.nome ? String(raw.nome) : "";
    return { idtag: idtag, descricao: descricao };
  }

  private resolveDateQueryParam(dateIso: string | undefined): string {
    if (dateIso !== undefined && dateIso !== null && String(dateIso).trim()) {
      const s = String(dateIso).trim();
      if (s.indexOf("T") >= 0) {
        return s.split("T")[0];
      }
      return s;
    }
    return this.formatDateIso(new Date());
  }

  private formatDateIso(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const monthPadded = month < 10 ? "0" + String(month) : String(month);
    const dayPadded = day < 10 ? "0" + String(day) : String(day);
    return String(year) + "-" + monthPadded + "-" + dayPadded;
  }
}
