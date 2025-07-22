import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { Job } from "app/jobs/job.model";
import { AuthService } from "app/login/auth.service";
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { IWorkflowColumn } from "app/workflow/models/workflow-column.model";
import { IWorkflowService } from "../services/workflow.service";
import { IWorkflowFilter } from '../models/workflow-filter.model';

@Component({
  selector: "cb-workflow-column",
  templateUrl: "./workflow-column.component.html",
  styleUrls: ["./workflow-column.component.scss"],
})
export class WorkflowColumnComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() column: IWorkflowColumn;
  @Input() service: IWorkflowService;

  jobs: Job[] = [];

  private isAdmin = false;

  page = 1;
  hasNext = true;
  loading = false;
  total: number = null;

  private onDestroy$ = new Subject<void>();

  constructor(
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isAdmin = this.authService.hasAccess("job/save");

    this.loadJobs("init");

    this.service.form$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(() => this.loadJobs("search"));
  }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.loading) {
            this.page++;

            this.loadJobs("pagination");
          }
        });
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(
      `workflow-column-loading--${this.column.id}`
    );

    if (!element) {
      return;
    }

    observer.observe(element);
  }

  private loadJobs(local: "init" | "search" | "pagination"): void {
    if (this.loading) {
      return;
    }

    this.loading = true;

    if (["init", "search"].includes(local)) {
      this.page = 1;

      this.hasNext = true;

      this.jobs = [];

      this.total = null;
    }

    const params = this.getFilter(this.service.form$.value);

    this.service.get(this.column, params, this.page).subscribe({
      next: (dataInfo) => {
        local === "pagination"
          ? (this.jobs = [...this.jobs, ...dataInfo.pagination.data])
          : (this.jobs = dataInfo.pagination.data);

        this.total = dataInfo.pagination.total;

        this.hasNext = dataInfo.pagination.last_page > this.page;

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  private getFilter(filter: IWorkflowFilter): IWorkflowFilter {
    let clientName =
      filter.client != "" ? filter.client : filter.search;

    let attendanceFilter = this.isAdmin
      ? { attendance: filter.attendance }
      : {};

    return {
      creation: filter.creation,
      job_type: filter.job_type,
      final_date: filter.final_date,
      initial_date: filter.initial_date,
      clientName: clientName,
      ...attendanceFilter,
    } as IWorkflowFilter;
  }

  drop(event: CdkDragDrop<Job[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      const movedJob = event.previousContainer.data[event.previousIndex];

      this.updateJobStatus(movedJob);

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  private updateJobStatus(job: Job): void {
    job["loading"] = true;

    this.service.updateStatus(this.column, job).subscribe({
      next: () => job["loading"] = false,
      error: () => (job["loading"] = false),
    });
  }

  delete(job: Job) {
    this.service.delete(job).subscribe((data) => {
      if (data.status) {
        this.jobs.splice(this.jobs.indexOf(job), 1);
      }
    });
  }

  trackByJob(index: number, job: Job): number {
    return job.id;
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
