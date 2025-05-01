import { Http, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Observable, of } from 'rxjs';
import { FeedbackModel } from 'app/shared/models/feedback.model';
import { delay } from 'rxjs/operators';
import { API } from 'app/app.api';
import { ErrorHandler } from 'app/shared/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  constructor(private http: Http, private snackBar: MatSnackBar) {}

  send(id: number, name: string, email: string, phone: string): Observable<{
    error: string,
    message: string,
  }> {
    const body = {
      job_id: id,
      feedback_user_name: name,
      feedback_user_email: email,
      feedback_user_phone: phone,
    };

    return this.http.post(`${API}/feedback/email`, body, new RequestOptions())
      .map(response => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        });

        return ErrorHandler.capture(err);
      });
  }
}
