import { Component, OnInit, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ReportService } from '../service-report/report-list.service';
import { Job, JobsDateFilter, ReportData } from '../service-report/report-list.model';
import { Pagination } from 'app/shared/pagination.model';
import { Employee } from '../../employees/employee.model';
import { EmployeeService } from '../../employees/employee.service';
import { JobStatus } from 'app/job-status/job-status.model';
import { JobStatusService } from 'app/job-status/job-status.service';
import { distinctUntilChanged, debounceTime, tap, isEmpty } from 'rxjs/operators';
import { Client } from '../../clients/client.model';
import { AuthService } from '../../login/auth.service';
import { ClientService } from '../../clients/client.service';
import { JobType } from '../../job-types/job-type.model';
import { JobTypeService } from '../../job-types/job-type.service';
import { DataInfo } from '../../shared/data-info.model';
import { Month, MONTHS } from 'app/shared/date/months';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { EventService } from 'app/events/event.service';
import { Event } from 'app/events/event.model';
import { JobEventsService } from 'app/job-events/job-events.service';
import { JobEvents } from 'app/job-events/job-events-model';

@Component({
  selector: 'cb-job-list',
  templateUrl: './service-list/job-list.component.html',
  styleUrls: ['./service-list/job-list.component.css'],
  animations: [
    trigger('rowAppeared', [
      state('ready', style({ opacity: 1 })),
      transition('void => ready', animate('300ms 0s ease-in', keyframes([
        style({ opacity: 0, transform: 'translateX(-30px)', offset: 0 }),
        style({ opacity: 0.8, transform: 'translateX(10px)', offset: 0.8 }),
        style({ opacity: 1, transform: 'translateX(0px)', offset: 1 })
      ]))),
      transition('ready => void', animate('300ms 0s ease-out', keyframes([
        style({ opacity: 1, transform: 'translateX(0px)', offset: 0 }),
        style({ opacity: 0.8, transform: 'translateX(-10px)', offset: 0.2 }),
        style({ opacity: 0, transform: 'translateX(30px)', offset: 1 })
      ])))
    ])
  ]
})
@Injectable()
export class ServiceReportComponent implements OnInit {

  rowAppearedState: string = 'ready'
  searchForm: FormGroup
  formCopy: any
  search: FormControl
  pagination: Pagination
  jobs: Job[] = []
  dataInfo: DataInfo
  paramAttendance: Employee = null
  attendances: Employee[]
  creations: Employee[]
  clients: Client[]
  status: JobStatus[]
  job_types: JobType[]
  events: JobEvents[]
  searching = false
  pageIndex: number
  pageSize = 30;
  filter = false
  params = {}
  hasFilterActive = false
  isAdmin: boolean = false
  reportData: ReportData;
  date: Date;
  month: Month;
  nextMonth: Month;
  year: number;
  years: number[] = []
  jobsDateFilter: JobsDateFilter[];
  iniDate: Date;
  finDate: Date;
  months: Month[] = MONTHS
  nextMonthName: string = '';
  nextYear: number = 0;
  creationFilter: any;
  jobTypeFilter: any;
  nameFilter: any;
  statusFilter: any;
  eventFilter: any;
  attendanceFilterStatus: { attendance: any; } | { attendance?: undefined; };
  
  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private clientService: ClientService,
    private jobService: ReportService,
    private jobTypeService: JobTypeService,
    private jobStatus: JobStatusService,
    private jobEventsService: JobEventsService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute,
    ) { }

  ngOnInit() {
    this.isAdmin = this.authService.hasAccess('job/save')

    this.pageIndex = this.jobService.pageIndex;

    this.paramAttendance = this.authService.currentUser().employee.department.description === 'Atendimento'
      ? this.authService.currentUser().employee : null;

    this.createForm();
    this.setYears();
    this.loadInitialData();
    this.loadFilterData();
  }

  createForm() {
    this.search = this.fb.control('')
    this.searchForm = this.fb.group({
      search: this.search,
      creation: this.fb.control(''),
      job_type: this.fb.control(''),
      client: this.fb.control(''),
      status: this.fb.control(''),
      event: this.fb.control(''),
      date_init: this.fb.control(''),
      date_end: this.fb.control(''),
    })

    if(this.isAdmin)
      this.searchForm.addControl('attendance', this.fb.control({ value: '' }));

    this.formCopy = this.searchForm.value;

    if(JSON.stringify(this.jobService.searchValue) == JSON.stringify({})) {
      this.jobService.searchValue = this.searchForm.value;
    } else {
      this.searchForm.setValue(this.jobService.searchValue);
    }

    this.searchForm.controls.client.valueChanges
      .pipe(distinctUntilChanged(), debounceTime(500))
      .subscribe(clientName => {
        this.clientService.clients({ search: clientName, attendance: this.paramAttendance }).subscribe((dataInfo) => {
          this.clients = dataInfo.pagination.data;
        })
      })

    this.searchForm.valueChanges
      .pipe(distinctUntilChanged(), debounceTime(500))
      .subscribe((searchValue) => {
        this.params = this.getParams(searchValue);
        this.loadJobs(this.params, 1);

        this.pageIndex = 0;
        this.jobService.pageIndex = 0;
        this.jobService.searchValue = searchValue;
        this.updateFilterActive();
        this.changeMonth();
      })
  }

  getParams(searchValue) {
    let status = searchValue.status != undefined ? searchValue.status.id : null;
    let clientName = searchValue.client != '' ? searchValue.client : searchValue.search;
    let attendanceFilter = this.isAdmin ? { attendance: searchValue.attendance } : {};

    this.creationFilter = searchValue.creation;
    this.jobTypeFilter = searchValue.job_type;
    this.nameFilter = clientName;
    this.statusFilter = status;
    this.eventFilter = searchValue.event;
    this.attendanceFilterStatus = attendanceFilter;

    return {
      creation: this.creationFilter,
      job_type: this.jobTypeFilter,
      final_date: searchValue.final_date,
      date_end: this.finDate,
      date_init: this.iniDate,
      name: this.nameFilter,
      status: this.statusFilter,
      event: this.eventFilter,
      jobs_amount: this.pageSize,
      ...this.attendanceFilterStatus
    }
  }

  updateFilterActive() {
    if (JSON.stringify(this.jobService.searchValue) === JSON.stringify(this.formCopy)) {
      this.hasFilterActive = false;
    } else {
      this.hasFilterActive = true;
    }
  }

  clearFilter() {
    this.jobService.searchValue = {};
    this.jobService.pageIndex = 0;
    this.pageIndex = 0;
    this.createForm();
    this.loadInitialData();
  }

  loadInitialData() {
    if (JSON.stringify(this.jobService.searchValue) === JSON.stringify(this.formCopy)) {
      this.params = this.getParams(this.jobService.searchValue);
      this.loadJobs({}, this.pageIndex + 1, true);
    } else {
      this.params = this.getParams(this.jobService.searchValue);
      this.loadJobs(this.params, this.pageIndex + 1, true);
    }

    this.updateFilterActive()
  }

  loadJobs(params, page: number, configureDates = false) {
    if(this.searching) return;
    
    this.searching = true;
    let snackBar = this.snackBar.open('Carregando jobs...');
    this.jobService.jobs(params, page).subscribe(dataInfo => {
      dataInfo.jobs ? this.jobs = dataInfo.jobs.data : this.jobs = [];
      
      if (configureDates) {
        this.setDataByParams();
      }
      
      console.log(dataInfo)
      console.log(this.jobs)
      
      this.pagination = dataInfo.jobs;
      this.reportData = (dataInfo as unknown as ReportData);
      this.searching = false;
      snackBar.dismiss();
    })
  }

  loadFilterData() {
    this.jobStatus.jobStatus().subscribe(status => this.status = status)

    this.jobTypeService.jobTypes().subscribe(job_types => this.job_types = job_types)

    this.employeeService.canInsertClients({
      deleted: true
    }).subscribe((attendances) => {
      this.attendances = attendances
    })

    this.employeeService.employees({
      paginate: false,
      deleted: true
    }).subscribe(dataInfo => {
      let employees = dataInfo.pagination.data
      this.creations = employees.filter(employee => {
        return employee.department.description === 'Criação'
      })
    })

    this.jobEventsService.jobeEventos().subscribe(events => this.events = events)
  }

  changePage($event) {
    this.pageSize = $event.pageSize;
    this.jobs = [];
    this.params = this.getParams(this.jobService.searchValue);
    this.loadJobs(this.params, ($event.pageIndex + 1));
  }

  /* loadFilterData() {
    this.jobStatus.jobStatus().subscribe(status => this.status = status)

    this.jobTypeService.jobTypes().subscribe(job_types => this.job_types = job_types)

    this.employeeService.canInsertClients({
      deleted: true
    }).subscribe((attendances) => {
      this.attendances = attendances
    })

    this.employeeService.employees({
      paginate: false,
      deleted: true
    }).subscribe(dataInfo => {
      let employees = dataInfo.pagination.data
      this.creations = employees.filter(employee => {
        return employee.department.description === 'Criação'
      })
    })
  } */

  addMonth(inc: number) {
    this.date.setDate(1);
    this.date.setMonth(this.date.getMonth() + inc);
    
    const nextMonthIndex = (this.date.getMonth() + 1) % 12;
    this.nextMonth = MONTHS.find(month => month.id == (nextMonthIndex + 1));
    this.nextYear = this.date.getFullYear() + (nextMonthIndex === 0 ? 1 : 0);
    
    this.month = MONTHS.find(month => month.id == (this.date.getMonth() + 1));
    this.year = this.date.getFullYear();

    this.changeMonth();
}

  changeMonth() {
    //this.calculateNextMonth();

    if(this.searching) return;
    let snackBar = this.snackBar.open('Carregando tarefas...');

    this.jobs = [];
    this.jobsDateFilter = [];

    this.iniDate = new Date(this.year + '-' + this.month.id + '-' + 1);
    this.finDate = new Date(this.nextYear + '-' + this.nextMonth.id + '-' + 1);
    //const daysInMonth = this.getDaysInMonth(this.year, this.month.id);

    this.iniDate.setDate(this.iniDate.getDate());
    this.finDate.setDate(this.finDate.getDate()/*  + daysInMonth */);

    this.params = this.getParams(this.jobService.searchValue);
    this.loadJobs(this.params, 1);
  }

  getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }

  updateMonth(month: Month) {
    this.month = month;
    this.changeMonth();
  }

  updateNextMonth(month: Month) {
    this.nextMonth = month;
    this.changeMonth();
  }

  updateYear(year: number) {
    this.year = year;
    this.changeMonth();
  }

  updateNextYear(year: number) {
    this.nextYear = year;
    this.changeMonth();
  }

  setYears() {
    let ini = 2018;
    let year = (new Date).getFullYear();

    while (ini <= (year + 1)) {
      this.years.push(ini);
      ini += 1;
    }
  }

  setDataByParams() {
    this.date = new Date();

    this.route.queryParams.subscribe(params => {
      if (params.date != undefined) {
        this.date = new Date(params.date + "T00:00:00");
        this.month = MONTHS.find(month => month.id == (this.date.getMonth() + 1));
        this.year = this.date.getFullYear();
      } else {

        this.date = new Date(this.datePipe.transform(this.jobs[0].created_at, 'yyyy-MM-dd') + "T00:00:00");

        const nextDate = new Date(this.date);
        nextDate.setMonth(nextDate.getMonth() + 1);
        
        this.month = MONTHS.find(month => month.id == (this.date.getMonth() + 1));
        this.nextMonth = MONTHS[nextDate.getMonth()];

        this.year = this.date.getFullYear();
        this.nextYear = nextDate.getFullYear();
      }

      this.changeMonth();
    })
  }

  calculateNextMonth() {
    const nextDate = new Date(this.date);
    nextDate.setMonth(nextDate.getMonth() + 1);
  
    this.nextMonthName = MONTHS[nextDate.getMonth()].name; // Usando a mesma estrutura MONTHS que você já tem
    this.nextYear = nextDate.getFullYear();
  }

  permissionVerify(module: string, job: Job): boolean {
    let access: boolean
    let employee = this.authService.currentUser().employee
    switch (module) {
      case 'new': {
        access = this.authService.hasAccess('job/save')
        break
      }
      case 'show': {
        access = job.attendance.id != employee.id ? this.authService.hasAccess('jobs/get/{id}') : true
        break
      }
      case 'edit': {
        access = job.attendance.id != employee.id ? this.authService.hasAccess('job/edit') : true
        break
      }
      case 'delete': {
        access = job.attendance.id != employee.id ? this.authService.hasAccess('job/remove/{id}') : true
        break
      }
      default: {
        access = false
        break
      }
    }
    return access
  }
  
    delete(job: Job) {
    this.jobService.delete(job.id).subscribe((data) => {
      this.snackBar.open(data.message, '', {
        duration: 5000
      })

      if (data.status) {
        this.jobs.splice(this.jobs.indexOf(job), 1)
        this.pagination.total = this.pagination.total - 1
      }
    })
  }
}