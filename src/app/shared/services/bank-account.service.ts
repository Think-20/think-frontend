import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { MatSnackBar } from "@angular/material";
import { API } from "app/app.api";
import { BankAccount } from "app/bank-accounts/bank-account.model";
import { of } from "rxjs";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/of";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/map";
import { tap } from "rxjs/operators";
import { ErrorHandler } from "../error-handler.service";
import { Pagination } from "../pagination.model";

@Injectable()
export class BankAccountService {
  private bankAccounts = new Map<number, BankAccount>();

  private paginatedBankAccounts = new Map<number, Pagination<BankAccount>>();

  constructor(private http: Http, private snackBar: MatSnackBar) {}

  get(page: number = 1, search: string = ""): Observable<{ pagination: Pagination<BankAccount> }> {
    const pageNumber = page && page > 0 ? page : 1;
    const query = search ? String(search).trim() : "";
    const payload = query ? { search: query } : {};

    if (this.bankAccounts.size > 0 && !query && this.paginatedBankAccounts.has(pageNumber)) {
      return of({ pagination: this.paginatedBankAccounts.get(pageNumber)! });
    }

    return this.http
      .post(`${API}/bank-accounts/all?page=${pageNumber}`, payload)
      .map((response) => response.json() as { pagination: Pagination<BankAccount> })
      .pipe(
        tap((response) => {
          const pagination = response.pagination;

          if (pagination.data && pagination.data.length > 0) {
            pagination.data.forEach((account) => {
              this.bankAccounts.set(account.id, account);
            });

            if (query) {
              this.paginatedBankAccounts.set(pageNumber, pagination);
            }
          }
        })
      )
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
   * Detalhe da conta por id. Em falha ou corpo inválido retorna null (sem snackbar — uso com fallback).
   */
  getById(id: number): Observable<BankAccount | null> {
    const safeId = id && id > 0 ? id : 0;

    if (!safeId) {
      return Observable.of(null);
    }

    if (this.bankAccounts.has(safeId)) {
      return of(this.bankAccounts.get(safeId)!);
    }

    return this.http
      .get(`${API}/bank-accounts/get/${safeId}`)
      .map(
        function (response) {
          const body = response.json();

          const account = body && body.bankAccount ? (body.bankAccount as BankAccount) : (body as BankAccount);

          if (!account) {
            return null;
          }

          this.bankAccounts.set(safeId, account);

          return account;
        }.bind(this)
      )
      .catch(function () {
        return of(null);
      });
  }

  post(bankAccount: BankAccount): Observable<{
    bankAccount: BankAccount;
    message: string;
    status: boolean;
  }> {
    return this.http
      .post(`${API}/bank-account/save`, bankAccount)
      .map((response) => response.json())
      .catch(
        function (err) {
          this.snackBar.open(ErrorHandler.message(err), "", {
            duration: 3000
          });
          return ErrorHandler.capture(err);
        }.bind(this)
      );
  }

  put(bankAccount: BankAccount): Observable<{
    bankAccount: BankAccount;
    message: string;
    status: boolean;
  }> {
    return this.http
      .put(`${API}/bank-account/edit`, bankAccount)
      .map((response) => response.json())
      .catch(
        function (err) {
          this.snackBar.open(ErrorHandler.message(err), "", {
            duration: 3000
          });
          return ErrorHandler.capture(err);
        }.bind(this)
      );
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete(`${API}/bank-account/remove/${id}`)
      .map((response) => response.json())
      .catch(
        function (err) {
          this.snackBar.open(ErrorHandler.message(err), "", {
            duration: 3000
          });
          return ErrorHandler.capture(err);
        }.bind(this)
      );
  }
}
