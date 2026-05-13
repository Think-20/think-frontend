import { Injectable } from "@angular/core";
import { Http, RequestOptions } from "@angular/http";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/map";

import { API } from "../app.api";
import { ErrorHandler } from "../shared/error-handler.service";
import { UserGoalEvaluationRequest, UserGoalProgressRequest } from "./user-goal-progress.model";

@Injectable()
export class UserGoalService {
  private readonly progressUrl = "user-goal/progress";
  private readonly evaluationUrl = "user-goal/evaluation";

  constructor(private http: Http, private snackBar: MatSnackBar) {}

  /**
   * Progresso das metas do atendente.
   * O backend pode retornar um objeto livre; o componente normaliza via `mapUserGoalProgressToViews`.
   */
  getProgress(body: UserGoalProgressRequest): Observable<any> {
    return this.http
      .post(`${API}/${this.progressUrl}`, JSON.stringify(body), new RequestOptions())
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 4000
        });
        return ErrorHandler.capture(err);
      });
  }

  /**
   * Persiste avaliação manual (ex.: meta presencial) para o colaborador e período informados.
   */
  putEvaluation(body: UserGoalEvaluationRequest): Observable<any> {
    return this.http
      .put(`${API}/${this.evaluationUrl}`, JSON.stringify(body), new RequestOptions())
      .map((response) => {
        try {
          return response.json();
        } catch (_e) {
          return {};
        }
      })
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 4000
        });
        return ErrorHandler.capture(err);
      });
  }
}
