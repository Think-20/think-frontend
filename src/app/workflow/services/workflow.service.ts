import { BehaviorSubject, Observable } from "rxjs";
import { IWorkflowFilter } from "../models/workflow-filter.model";
import { IWorkflowColumn } from "../models/workflow-column.model";
import { Job } from "app/jobs/job.model";

export interface IWorkflowService {
  form$: BehaviorSubject<IWorkflowFilter>;

  get: (
    column: IWorkflowColumn,
    filter: IWorkflowFilter,
    page: number
  ) => Observable<{
    pagination: {
      data: Job[];
      total: number;
      last_page: number;
    };
  }>;

  updateStatus: (column: IWorkflowColumn, job: Job) => Observable<{ status: boolean }>;

  delete: (job: Job) => Observable<{ status: boolean }>;
}
