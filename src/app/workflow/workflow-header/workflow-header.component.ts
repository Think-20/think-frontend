import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Client } from "app/clients/client.model";
import { ClientService } from "app/clients/client.service";
import { Employee } from "app/employees/employee.model";
import { EmployeeService } from "app/employees/employee.service";
import { JobStatus } from "app/job-status/job-status.model";
import { JobType } from "app/job-types/job-type.model";
import { JobTypeService } from "app/job-types/job-type.service";
import { JobService } from "app/jobs/job.service";
import { AuthService } from "app/login/auth.service";
import { IWorkflowFilter } from 'app/workflow/models/workflow-filter.model';
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";

@Component({
  selector: "cb-workflow-header",
  templateUrl: "./workflow-header.component.html",
  styleUrls: ["./workflow-header.component.scss"],
})
export class WorkflowHeaderComponent implements OnInit, OnDestroy {
  @Input() title = "Workflow";

  @Output() formChanged = new EventEmitter<IWorkflowFilter>();

  clients: Client[] = [];
  attendances: Employee[] = [];
  creations: Employee[] = [];
  jobTypes: JobType[] = [];

  paramAttendance: Employee = null;

  isAdmin = false;

  filter = false;

  search = new FormControl("");

  searchForm = new FormGroup({
    search: this.search,
    creation: new FormControl(""),
    job_type: new FormControl(""),
    client: new FormControl(""),
    initial_date: new FormControl(""),
    final_date: new FormControl(""),
  });

  onDestroy$ = new Subject<void>();

  constructor(
    private jobService: JobService,
    private authService: AuthService,
    private clientService: ClientService,
    private jobTypeService: JobTypeService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit() {
    this.isAdmin = this.authService.hasAccess("job/save");

    if (this.isAdmin) {
      this.searchForm.addControl("attendance", new FormControl({ value: "" }));
    }

    if (
      this.authService.currentUser().employee.department.description ===
      "Atendimento"
    ) {
      this.paramAttendance = this.authService.currentUser().employee;
    }

    this.loadEmployees();

    this.loadJobTypes();

    this.observerClients();

    this.observerFormChanges();

    this.setDefaultSearchValues();
  }

  private setDefaultSearchValues(): void {
    const today = new Date();

    today.setUTCHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setUTCDate(today.getUTCDate() - 30);

    this.searchForm.patchValue({
      initial_date: thirtyDaysAgo,
      final_date: today,
    });

    this.searchForm.markAsDirty();
  }

  private loadJobTypes(): void {
    this.jobTypeService
      .jobTypes()
      .subscribe((jobTypes) => (this.jobTypes = jobTypes));
  }

  private loadEmployees(): void {
    this.employeeService
      .employees({
        paginate: false,
        deleted: true,
      })
      .subscribe((dataInfo) => {
        let employees = dataInfo.pagination.data;

        this.creations = employees.filter((employee) => {
          return employee.department.description === "Criação";
        });

        this.attendances = employees.filter((employee) => {
          return (
            employee.department.description === "Atendimento" ||
            employee.department.description === "Diretoria"
          );
        });
      });
  }

  private observerFormChanges(): void {
    this.searchForm.valueChanges
      .pipe(distinctUntilChanged(), debounceTime(500))
      .subscribe((searchValue) => {
        this.formChanged.emit(searchValue);
      });
  }

  private observerClients(): void {
    this.searchForm.controls.client.valueChanges
      .pipe(
        distinctUntilChanged(),
        debounceTime(500),
        takeUntil(this.onDestroy$)
      )
      .subscribe((clientName) => {
        this.clientService
          .clients({ search: clientName, attendance: this.paramAttendance })
          .subscribe((dataInfo) => {
            this.clients = dataInfo.pagination.data;
          });
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
