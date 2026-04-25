import { Injectable } from "@angular/core";
import { Http, RequestOptions } from "@angular/http";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";

import { API } from "../app.api";
import { ErrorHandler } from "../shared/error-handler.service";
import { UserGoalProgressRequest } from "./user-goal-progress.model";

@Injectable()
export class UserGoalService {
  private readonly url = "user-goal/progress";

  constructor(private http: Http, private snackBar: MatSnackBar) {}

  /**
   * Progresso das metas do atendente.
   * O backend pode retornar um objeto livre; o componente normaliza via `mapUserGoalProgressToViews`.
   */
  getProgress(body: UserGoalProgressRequest): Observable<any> {
    return this.http
      .post(`${API}/${this.url}`, JSON.stringify(body), new RequestOptions())
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 4000
        });
        return ErrorHandler.capture(err);
      });
  }
}
