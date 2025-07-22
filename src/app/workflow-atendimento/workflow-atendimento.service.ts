import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { IWorkflowService } from "app/workflow/services/workflow.service";
import { Job } from "app/jobs/job.model";
import { IWorkflowColumn } from "app/workflow/models/workflow-column.model";
import { IWorkflowFilter } from "app/workflow/models/workflow-filter.model";
import { JobService } from "app/jobs/job.service";
import { tap } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class WorkflowAtendimentoService implements IWorkflowService {
  form$ = new BehaviorSubject<IWorkflowFilter>({} as IWorkflowFilter);

  constructor(private jobService: JobService) {}

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
    return of({
      pagination: {
        data: [
          { attendance: { name: "Teste" } } as Job,
          { attendance: { name: "Teste" } } as Job,
        ],
        total: 2,
        last_page: 1,
      },
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
