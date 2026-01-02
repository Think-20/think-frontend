import { JobStatusService } from "./../../job-status/job-status.service";
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Client } from "app/clients/client.model";
import { ClientService } from "app/clients/client.service";
import { SearchComponent } from "app/components/search/search.component";
import { Employee } from "app/employees/employee.model";
import { EmployeeService } from "app/employees/employee.service";
import { JobStatus } from "app/job-status/job-status.model";
import { JobType } from "app/job-types/job-type.model";
import { JobTypeService } from "app/job-types/job-type.service";
import { JobService } from 'app/jobs/job.service';
import { AuthService } from "app/login/auth.service";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";

@Component({
  selector: "cb-job-header",
  templateUrl: "./job-header.component.html",
  styleUrls: ["./job-header.component.scss"],
})
export class JobHeaderComponent implements OnInit, AfterViewInit {
  @ViewChild("search", { static: false }) search: SearchComponent;

  @Input() isFinancial = false;

  @Input() from = 0;
  @Input() to = 0;
  @Input() total = 0;
  @Input() totalPerPage = 0;
  @Input() hasNext = false;

  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  opened = false;

  isAdmin = false;

  clients: Client[] = [];
  attendances: Employee[] = [];
  creations: Employee[] = [];
  jobTypes: JobType[] = [];
  status: JobStatus[] = [];

  paramAttendance: Employee = null;

  form = new FormGroup({
    search: new FormControl(""),
    creation: new FormControl(""),
    job_type: new FormControl(""),
    client: new FormControl(""),
    status: new FormControl(""),
    initial_date: new FormControl(""),
    final_date: new FormControl(""),
  });

  constructor(
    private jobService: JobService,
    private authService: AuthService,
    private clientService: ClientService,
    private jobTypeService: JobTypeService,
    private employeeService: EmployeeService,
    private jobStatusService: JobStatusService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.hasAccess("job/save");

    if (this.isAdmin) {
      this.form.addControl("attendance", new FormControl({ value: "" }));
    }

    this.paramAttendance =
      this.authService.currentUser().employee.department.description ===
      "Atendimento"
        ? this.authService.currentUser().employee
        : null;

    this.clientObserver();

    this.loadEmployees();

    this.loadJobTypes();

    this.loadStatus();
  }

  ngAfterViewInit(): void {
    this.formObserver();

    if (JSON.stringify(this.jobService.formValue$.value) == JSON.stringify({})) {
      this.jobService.formValue$.next(this.form.value);
    } else {
      this.form.patchValue(this.jobService.formValue$.value);

      this.form.markAsDirty();
    }
  }

  private clientObserver(): void {
    this.form.controls.client.valueChanges
      .pipe(distinctUntilChanged(), debounceTime(500))
      .subscribe((clientName) => {
        this.clientService
          .clients({ search: clientName, attendance: this.paramAttendance })
          .subscribe((dataInfo) => {
            this.clients = dataInfo.pagination.data;
          });
      });
  }

  private formObserver(): void {
    this.form.valueChanges
      .pipe(distinctUntilChanged(), debounceTime(500))
      .subscribe((form) => {
        this.jobService.formValue$.next(form);
      });
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

  private loadJobTypes(): void {
    this.jobTypeService
      .jobTypes()
      .subscribe((jobTypes) => (this.jobTypes = jobTypes));
  }

  private loadStatus(): void {
    this.jobStatusService
      .jobStatus()
      .subscribe((status) => (this.status = status));
  }

  focus(): void {
    if (!this.search || !this.search.focus) {
      return;
    }

    this.search.focus();
  }

  showForm(): void {
    this.opened = !this.opened;
  }

  clear(): void {
    this.form.reset();
  }

  previousPage(): void {
    this.previous.emit();
  }

  nextPage(): void {
    this.next.emit();
  }

  compareAttendance(var1: Employee, var2: Employee) {
    return var1.id === var2.id;
  }

  compareStatus(var1: JobStatus, var2: JobStatus) {
    return var1.id === var2.id;
  }

  compareJobType(var1: JobType, var2: JobType) {
    return var1.id === var2.id;
  }
}
