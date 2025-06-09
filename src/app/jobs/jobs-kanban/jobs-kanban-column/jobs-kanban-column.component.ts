import { JobService } from "app/jobs/job.service";
import { AfterViewInit, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { JobStatus } from "app/job-status/job-status.model";
import { Job } from "app/jobs/job.model";
import { AuthService } from "app/login/auth.service";
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: "cb-jobs-kanban-column",
  templateUrl: "./jobs-kanban-column.component.html",
  styleUrls: ["./jobs-kanban-column.component.scss"],
})
export class JobsKanbanColumnComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() status: JobStatus = new JobStatus();

  jobs: Job[] = [];

  private isAdmin = false;

  page = 1;
  hasNext = true;
  loading = false;
  total: number = null;

  private onDestroy$ = new Subject<void>();

  constructor(
    private jobService: JobService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isAdmin = this.authService.hasAccess("job/save");

    this.loadJobs('init');

    this.jobService.searchValueKanban$
      .pipe(
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => this.loadJobs('search'));
  }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !this.loading) {
          this.page++;

          this.loadJobs('pagination');
        }
      });
    }, { threshold: 0.1 });

    const element = document.getElementById(`kanban-column-loading--${this.status.id}`);

    if (!element) {
      return;
    }

    observer.observe(element);
  }

  private loadJobs(local: 'init' | 'search' | 'pagination'): void {
    if (this.loading) {
      return;
    }
    
    this.loading = true;
    
    if (['init', 'search'].includes(local)) {
      this.page = 1;

      this.hasNext = true;

      this.jobs = [];

      this.total = null;
    }

    const params = this.getParams(this.jobService.searchValueKanban$.value);

    this.jobService.jobs(params, this.page).subscribe({
      next: (dataInfo) => {
        local === 'pagination'
          ? this.jobs = [...this.jobs, ...dataInfo.pagination.data]
          : this.jobs = dataInfo.pagination.data;

        this.total = dataInfo.pagination.total;

        this.hasNext = dataInfo.pagination.last_page > this.page;

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  private getParams(searchValue) {
    let clientName = searchValue.client != ""
      ? searchValue.client
      : searchValue.search;

    let attendanceFilter = this.isAdmin
      ? { attendance: searchValue.attendance }
      : {};

    return {
      creation: searchValue.creation,
      job_type: searchValue.job_type,
      final_date: searchValue.final_date,
      initial_date: searchValue.initial_date,
      clientName: clientName,
      status: this.status.id,
      ...attendanceFilter,
    };
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
    job['loading'] = true;
    
    this.jobService.updateStatus(job.id, this.status).subscribe({
      next: (result) => {
        job['loading'] = false;

        if (result && result.status) {
          job.status = this.status;
          job.status_id = this.status.id;
        }
      },
      error: () => job['loading'] = false,
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
