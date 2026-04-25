import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { MatSnackBar } from '@angular/material';
import { API } from 'app/app.api';
import { AuthService } from 'app/login/auth.service';
import { ErrorHandler } from 'app/shared/error-handler.service';
import { Observable, of } from 'rxjs';
import { Goal } from './goals.model';
import { HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable()
export class GoalsService {
  searchValue: any = {}
  pageIndex = 0
  layoutGrid: string;
  layoutGrid2: string;
  private url = 'goal';

  constructor(
    private http: Http,
    private snackBar: MatSnackBar,
    private auth: AuthService
  ) { }

  getGoals(): Observable<Goal[]> {
    return this.http.get(`${API}/${this.url}`, { body: JSON.stringify({ id: 1 })})
      .map(response => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        })
        return ErrorHandler.capture(err)
      })
  }


  updateGoals(goal: Goal): Observable<Goal> {
    return this.http.put(`${API}/${this.url}`,
      JSON.stringify(goal),
      new RequestOptions()
    )
      .map(response => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        })
        return ErrorHandler.capture(err)
      })
  }

  postGoals(goal: Goal): Observable<Goal> {
    return this.http.post(`${API}/${this.url}`,
      JSON.stringify(goal),
      new RequestOptions()
    )
      .map(response => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        })
        return ErrorHandler.capture(err)
      })
  }
}