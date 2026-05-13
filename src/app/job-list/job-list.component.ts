import { AfterViewInit, Component, OnDestroy, OnInit } from "@angular/core";
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute } from "@angular/router";
import { Job } from "app/jobs/job.model";
import { JobService } from "app/jobs/job.service";
import { AuthService } from "app/login/auth.service";
import { race, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "cb-job-list",
  templateUrl: "./job-list.component.html",
  styleUrls: ["./job-list.component.scss"],
})
export class JobListComponent implements OnInit, AfterViewInit, OnDestroy {
  jobs: Job[] = [];

  title = "Jobs";

  page = 1;
  hasNext = true;
  loading = false;
  from = 0;
  to = 0;
  total = 0;
  totalPerPage = 0;

  isFinancial = false;

  private isAdmin = false;

  private onDestroy$ = new Subject<void>();

  private cancel$ = new Subject<{ canceled: boolean }>();

  get hasJobs() {
    return this.jobs && this.jobs.length > 0;
  }

  constructor(
    public jobService: JobService,
    private authService: AuthService,
    private matSnackBar: MatSnackBar,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.isAdmin = this.authService.hasAccess("job/save");

    this.isFinancial =
      this.activatedRoute.snapshot.data["path"] === "financial";

    this.title = this.isFinancial ? "Jobs aprovados" : "Jobs";
  }
  
  ngAfterViewInit(): void {
    this.jobService.formValue$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(() => this.loadJobs());
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
    this.cancel$.complete();
  }

  private loadJobs(): void {
    this.cancel$.next({ canceled: true });

    this.loading = true;

    const params = this.getParams(this.jobService.formValue$.value);

    let loader = this.matSnackBar.open("Carregando...");

    race([
      this.jobService.jobs(params, this.page),
      this.cancel$.asObservable(),
    ])
      .pipe(takeUntil(this.onDestroy$))
      .subscribe({
        next: (dataInfo: any) => {
          if (dataInfo && dataInfo.canceled) {
            this.loading = false;
            loader.dismiss();
            return;
          }

          this.jobs = dataInfo.pagination.data;

          this.from = dataInfo.pagination.from || 0;
          this.to = dataInfo.pagination.to || 0;
          this.total = dataInfo.pagination.total || 0;
          this.totalPerPage = dataInfo.pagination.per_page || 0;

          this.hasNext = dataInfo.pagination.last_page > this.page;

          this.loading = false;

          loader.dismiss();
        },
        error: () => {
          this.loading = false;

          loader.dismiss();
        },
      });
  }

  private getParams(searchValue) {
    let status = searchValue.status != undefined ? searchValue.status.id : null;

    let clientName =
      searchValue.client != "" ? searchValue.client : searchValue.search;

    let attendanceFilter = this.isAdmin
      ? { attendance: searchValue.attendance }
      : {};

    if (this.isFinancial) {
      status = 3;
    }

    return {
      creation: searchValue.creation,
      job_type: searchValue.job_type,
      final_date: searchValue.final_date,
      initial_date: searchValue.initial_date,
      clientName: clientName,
      status: status,
      ...attendanceFilter,
    };
  }

  permissionVerify(module: string, job: Job): boolean {
    let access = false;

    const employee = this.authService.currentUser().employee;

    const object = {
      new: () => this.authService.hasAccess("job/save"),
      show: () =>
        job.attendance.id != employee.id
          ? this.authService.hasAccess("jobs/get/{id}")
          : true,
      edit: () =>
        job.attendance.id != employee.id
          ? this.authService.hasAccess("job/edit")
          : true,
      delete: () =>
        job.attendance.id != employee.id
          ? this.authService.hasAccess("job/remove/{id}")
          : true,
    };

    if (object[module]) {
      access = object[module]();
    }

    return access;
  }

  delete(job: Job): void {
    job["isLoading"] = true;

    this.jobService.delete(job.id).subscribe((data) => {
      this.matSnackBar.open(data.message, "", {
        duration: 5000,
      });

      if (data.status) {
        this.jobs.splice(this.jobs.indexOf(job), 1);

        this.total = this.total - 1;
      }
    });
  }

  next(): void {
    if (this.hasNext) {
      this.page++;

      this.loadJobs();
    }
  }

  previous(): void {
    if (this.page > 1) {
      this.page--;

      this.loadJobs();
    }
  }
}
