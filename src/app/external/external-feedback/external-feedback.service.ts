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
export class ExternalFeedbackService {
  constructor(private http: Http, private snackBar: MatSnackBar) {}

  post(id: number, hash: string, feedback: FeedbackModel): Observable<{
    error: string,
    message: string,
  }> {
    const body = {
      job_id: id,
      feedback_hash: hash,
      ...feedback,
    };
    
    return this.http.post(`${API}/feedback`, body, new RequestOptions())
      .map(response => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        });

        return ErrorHandler.capture(err);
      });
  }
}
