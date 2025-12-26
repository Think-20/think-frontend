import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { IWorkflowService } from "app/workflow/services/workflow.service";
import { Job } from "app/jobs/job.model";
import { IWorkflowColumn } from "app/workflow/models/workflow-column.model";
import { IWorkflowFilter } from "app/workflow/models/workflow-filter.model";
import { JobService } from "app/jobs/job.service";
import { tap } from "rxjs/operators";
import { Http, RequestOptions } from "@angular/http";
import { ErrorHandler } from "app/shared/error-handler.service";
import { API } from "app/app.api";
import { MatSnackBar } from "@angular/material";

@Injectable({
  providedIn: "root",
})
export class WorkflowAtendimentoService implements IWorkflowService {
  form$ = new BehaviorSubject<IWorkflowFilter>({} as IWorkflowFilter);

  constructor(
    private http: Http,
    private snackBar: MatSnackBar,
    private jobService: JobService
  ) {}

  get(
    column: IWorkflowColumn,
    filter: IWorkflowFilter,
    page: number
  ): Observable<{
    pagination: {
      data: Job[];
      total: number;
      last_page: number;
    };
  }> {
    return this.http
      .post(
        `${API}/workflow-atendimento?page=${page}`,
        JSON.stringify({ ...filter, creation_status: column.id }),
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

  updateStatus(
    column: IWorkflowColumn,
    job: Job
  ): Observable<{ status: boolean }> {
    return this.jobService.updateStatus(job.id, Number(column.id)).pipe(
      tap((response) => {
        if (response && response.status) {
          job.status_id = Number(column.id);
        }
      })
    );
  }

  delete(job: Job): Observable<{ status: boolean }> {
    return this.jobService.delete(job.id);
  }
}
