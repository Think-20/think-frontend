import { Injectable } from "@angular/core";
import { Http, RequestOptions } from "@angular/http";
import { MatSnackBar } from "@angular/material/snack-bar";

import { Observable } from "rxjs/Observable";

import { API } from "../../app.api";
import { ErrorHandler } from "../error-handler.service";
import { ExtraModel } from '../models/extra.model';

@Injectable()
export class ExtrasService {
  constructor(private http: Http, private snackBar: MatSnackBar) {}

  extras(): Observable<ExtraModel[]> {
    return this.http
      .get(`${API}/extra`)
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }

  post(extra: ExtraModel): Observable<{
    message?: string,
    object?: ExtraModel
  }> {
    return this.http
      .post(
        `${API}/extra`,
        JSON.stringify(extra),
        new RequestOptions()
      )
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }

  put(extra: ExtraModel): Observable<{
    message?: string,
    object?: ExtraModel
  }> {
    return this.http
      .put(
        `${API}/extra`,
        JSON.stringify(extra),
        new RequestOptions()
      )
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }

  delete(extraId: number): Observable<any> {
    return this.http
      .delete(`${API}/extra/${extraId}`)
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }
}