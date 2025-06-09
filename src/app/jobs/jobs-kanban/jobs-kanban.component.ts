import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup } from '@angular/forms';
import { JobStatus } from "app/job-status/job-status.model";
import { JobStatusService } from "app/job-status/job-status.service";
import { Client } from '../../clients/client.model';
import { debounceTime, distinctUntilChanged, take, takeUntil } from 'rxjs/operators';
import { ClientService } from 'app/clients/client.service';
import { AuthService } from 'app/login/auth.service';
import { Employee } from 'app/employees/employee.model';
import { EmployeeService } from 'app/employees/employee.service';
import { JobTypeService } from 'app/job-types/job-type.service';
import { JobType } from 'app/job-types/job-type.model';
import { Subject } from 'rxjs';
import { JobService } from '../job.service';

@Component({
  selector: "cb-jobs-kanban",
  templateUrl: "./jobs-kanban.component.html",
  styleUrls: ["./jobs-kanban.component.scss"],
})
export class JobsKanbanComponent implements OnInit, OnDestroy {
  clients: Client[] = [];
  attendances: Employee[] = [];
  creations: Employee[] = [];
  jobTypes: JobType[] = [];
  
  allStatus: JobStatus[] = [];

  paramAttendance: Employee = null;
  
  isAdmin = false;

  filter = false;

  search = new FormControl('');
  searchForm = new FormGroup({
    search: this.search,
    creation: new FormControl(''),
    job_type: new FormControl(''),
    client: new FormControl(''),
    status: new FormControl(''),
    initial_date: new FormControl(''),
    final_date: new FormControl(''),
  });

  onDestroy$ = new Subject<void>();

  constructor(
    private jobService: JobService,
    private authService: AuthService,
    private jobStatus: JobStatusService,
    private clientService: ClientService,
    private jobTypeService: JobTypeService,
    private employeeService: EmployeeService,
  ) {}

  ngOnInit() {
    this.isAdmin = this.authService.hasAccess('job/save');

    if(this.isAdmin) {
      this.searchForm.addControl('attendance', new FormControl({ value: '' }));
    }

    if (this.authService.currentUser().employee.department.description === 'Atendimento') {
      this.paramAttendance = this.authService.currentUser().employee;
    }

    this.loadEmployees();

    this.loadJobTypes();

    this.observerClients();

    this.observerFormChanges();

    this.setDefaultSearchValues()
      .then(() => this.loadJobStatus());
  }

  private setDefaultSearchValues(): Promise<void> {
    return new Promise<void>((resolve) => {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
  
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setUTCDate(today.getUTCDate() - 30);
  
      this.searchForm.patchValue({
        ...this.jobService.searchValueKanban$.value as {
          [key: string]: any;
        },
        initial_date: thirtyDaysAgo,
        final_date: today,
      });
  
      this.jobService.searchValueKanban$.next(this.searchForm.value);

      this.searchForm.markAsDirty();

      resolve();
    });
  }

  private loadJobTypes(): void {
    this.jobTypeService.jobTypes().subscribe(jobTypes => this.jobTypes = jobTypes)
  }

  private loadEmployees(): void {
    this.employeeService.employees({
      paginate: false,
      deleted: true
    }).subscribe(dataInfo => {
      let employees = dataInfo.pagination.data;

      this.creations = employees.filter(employee => {
        return employee.department.description === 'Criação';
      });

      this.attendances = employees.filter(employee => {
        return employee.department.description === 'Atendimento' || employee.department.description === 'Diretoria';
      });
    });
  }

  private observerFormChanges(): void {
    this.searchForm.valueChanges
      .pipe(distinctUntilChanged(), debounceTime(500))
      .subscribe((searchValue) => {
        this.jobService.searchValueKanban$.next(searchValue);
      })
  }

  private observerClients(): void {
    this.searchForm.controls.client.valueChanges
      .pipe(
        distinctUntilChanged(),
        debounceTime(500),
        takeUntil(this.onDestroy$)
      )
      .subscribe(clientName => {
        this.clientService.clients({ search: clientName, attendance: this.paramAttendance }).subscribe((dataInfo) => {
          this.clients = dataInfo.pagination.data
        })
      });
  }

  private loadJobStatus(): void {
    const statusOrder = [1, 5, 3, 2, 4];
    
    this.jobStatus.jobStatus().subscribe((allStatus) => {
      allStatus.forEach(status => {
        const orderIndex = statusOrder.indexOf(status.id);

        status['order'] = orderIndex !== -1 ? orderIndex : Number.MAX_SAFE_INTEGER;
      });

      this.allStatus = allStatus.sort((a, b) => a['order'] - b['order']);
    });
  }

  clearFilter(): void {
    this.searchForm.reset();
  }

  compareAttendance(var1: Employee, var2: Employee) {
    return var1.id === var2.id;
  }

  compareJobType(var1: JobType, var2: JobType) {
    return var1.id === var2.id;
  }

  trackByColumn(index: number, status: JobStatus): number {
    return status.id;
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
