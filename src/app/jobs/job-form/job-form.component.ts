import { Component, OnInit, Injectable, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators, AbstractControl } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatDialog } from '@angular/material';

import { Job } from '../job.model';
import { JobService } from '../job.service';

import { EmployeeService } from '../../employees/employee.service';
import { ClientService } from '../../clients/client.service';
import { AuthService } from '../../login/auth.service';
import { UploadFileService } from '../../shared/upload-file.service';

import { Employee } from '../../employees/employee.model';
import { JobActivity } from '../../job-activities/job-activity.model';
import { JobType } from '../../job-types/job-type.model';
import { Client } from '../../clients/client.model';
import { JobCompetition } from '../../job-competitions/job-competition.model';

import { ErrorHandler } from '../../shared/error-handler.service';
import { Patterns } from '../../shared/patterns.model';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/do';
import { isUndefined, isObject } from 'util';

import { JobMainExpectation } from 'app/job-main-expectation/job-main-expectation.model';
import { JobLevel } from 'app/job-level/job-level.model';
import { JobHowCome } from 'app/job-how-come/job-how-come.model';
import { Router } from '@angular/router';
import { JobStatus } from 'app/job-status/job-status.model';

@Component({
  selector: 'cb-job-form',
  templateUrl: './job-form.component.html',
  styleUrls: ['./job-form.component.css']
})
@Injectable()
export class JobFormComponent implements OnInit {
  @Input('typeForm') typeForm: string
  @Output('jobEmitter') jobEmitter: EventEmitter<Job> = new EventEmitter()
  @Output('isAdminEmitter') isAdminEmitter: EventEmitter<boolean> = new EventEmitter()
  standItemState = 'hidden'
  job_activities: JobActivity[]
  job_types: JobType[]
  clients: Client[]
  job: Job
  main_expectations: JobMainExpectation[]
  agencies: Client[]
  levels: JobLevel[]
  how_comes: JobHowCome[]
  competitions: JobCompetition[]
  employees: Employee[]
  responsibles: Employee[]
  paramAttendance: Employee = null
  attendances: Employee[]
  status: JobStatus[]
  jobForm: FormGroup
  isAdmin: boolean = false

  constructor(
    private clientService: ClientService,
    private employeeService: EmployeeService,
    private jobService: JobService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private uploadFileService: UploadFileService
  ) { }

  ngOnInit() {
    let snackBarStateCharging

    this.paramAttendance = this.authService.currentUser().employee.department.description === 'Atendimento'
      ? this.authService.currentUser().employee : null

    this.isAdmin = this.authService.hasAccess('job/save')
    this.isAdminEmitter.emit(this.isAdmin)

    this.jobForm = this.formBuilder.group({
      id: this.formBuilder.control({ value: '', disabled: true }),
      job_activity: this.formBuilder.control('', [Validators.required]),
      main_expectation: this.formBuilder.control('', [Validators.required]),
      client: this.formBuilder.control(''),
      event: this.formBuilder.control('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(150)
      ]),
      last_provider: this.formBuilder.control('', [
        Validators.minLength(3),
        Validators.maxLength(100)
      ]),
      not_client: this.formBuilder.control(''),
      budget_value: this.formBuilder.control('', [
        Validators.required,
        Validators.maxLength(13)
      ]),
      deadline: this.formBuilder.control('', [Validators.required]),
      how_come: this.formBuilder.control('', [Validators.required]),
      job_type: this.formBuilder.control('', [Validators.required]),
      agency: this.formBuilder.control(''),
      attendance: this.formBuilder.control('', [Validators.required]),
      rate: this.formBuilder.control(''),
      stand: this.formBuilder.group({}),
      levels: this.formBuilder.control('', [Validators.required]),
      competition: this.formBuilder.control('', [Validators.required]),
      status: this.formBuilder.control('', [Validators.required]),
      files: this.formBuilder.array([]),
      approval_expectation_rate: this.formBuilder.control('', [Validators.required]),
      think_history: this.formBuilder.control('')
    })

    this.jobForm.get('client').valueChanges
      .do(clientName => {
        snackBarStateCharging = this.snackBar.open('Aguarde...')
      })
      .debounceTime(500)
      .subscribe(clientName => {
        if (clientName == '' || isObject(clientName)) {
          snackBarStateCharging.dismiss()
          return;
        }

        this.clientService.clients({ search: clientName, attendance: this.paramAttendance }).subscribe((dataInfo) => {
          this.clients = dataInfo.pagination.data.filter((client) => {
            return client.type.description !== 'Agência'
          })
        })
        Observable.timer(500).subscribe(timer => snackBarStateCharging.dismiss())
      })

    this.jobForm.get('agency').valueChanges
      .do(name => {
        snackBarStateCharging = this.snackBar.open('Aguarde...')
      })
      .debounceTime(500)
      .subscribe(name => {
        if (isObject(name)) {
          this.enableNotClient()
          snackBarStateCharging.dismiss()
          return;
        }

        if (name == '') {
          this.disableNotClient()
          snackBarStateCharging.dismiss()
          return;
        }

        this.clientService.clients({ search: name, attendance: this.paramAttendance }).subscribe((dataInfo) => {
          this.agencies = dataInfo.pagination.data.filter((client) => {
            return client.type.description === 'Agência'
          })
        })
        Observable.timer(500).subscribe(timer => snackBarStateCharging.dismiss())
      })

    snackBarStateCharging = this.snackBar.open('Aguarde...')
    this.jobService.loadFormData().subscribe(response => {
      let data = response.data
      this.job_activities = data.job_activities
      this.job_types = data.job_types
      this.status = data.status

      this.attendances = data.attendances
      this.employees = data.employees
      this.competitions = data.competitions
      this.main_expectations = data.main_expectations
      this.levels = data.levels
      this.how_comes = data.how_comes

      if (this.typeForm === 'edit') {
        this.loadJob()
      } else if (this.typeForm === 'show') {
        this.loadJob()
        this.jobForm.disable()
      } else {
        this.employeeService.canInsertClients().subscribe(employees => {
          this.attendances = employees
          this.jobForm.get('attendance').setValue(this.attendances.filter((employee) => {
            return employee.name == this.authService.currentUser().employee.name
          }).pop())
        })
        this.jobForm.controls.not_client.disable()
        this.jobForm.get('status').setValue(this.status.filter((status) => {
          return status.description == 'Stand-by'
        }).pop())
      }

      snackBarStateCharging.dismiss()
    })
  }

  getNextTab() {
    switch(this.jobForm.controls.job_activity.value.description) {
      case 'Projeto': {
        return 'briefing'
      }
      case 'Orçamento': {
        return 'budget'
      }
      default: {
        return ''
      }
    }
  }

  enableNotClient() {
    if (this.typeForm == 'show') {
      return
    }

    this.jobForm.controls.not_client.enable()
    this.jobForm.controls.not_client.setValidators([
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100)
    ])
    this.jobForm.controls.client.disable()
    this.jobForm.controls.client.clearValidators()
  }

  disableNotClient() {
    if (this.typeForm == 'show') {
      return
    }

    this.jobForm.controls.not_client.disable()
    this.jobForm.controls.not_client.clearValidators()
    this.jobForm.controls.client.enable()
    this.jobForm.controls.client.setValidators([
      Validators.required
    ])
  }

  loadJob() {
    let snackBarStateCharging = this.snackBar.open('Carregando job...')
    let jobId = parseInt(this.route.snapshot.url[1].path)
    let promise = this.jobService.job(jobId).subscribe(job => {
      this.job = job
      this.jobEmitter.emit(job)
      this.loadJobInForm(job)
      snackBarStateCharging.dismiss()
    })
  }

  loadJobInForm(job: Job, replaceAll = true) {
    this.jobForm.controls.id.setValue(job.id)
    this.jobForm.controls.job_type.disable()

    this.jobForm.controls.event.setValue(job.event)
    this.jobForm.controls.deadline.setValue(job.deadline)
    this.jobForm.controls.job_type.setValue(job.job_type)
    this.jobForm.controls.job_activity.setValue(job.job_activity)

    if (job.agency != null) {
      this.enableNotClient()
      this.jobForm.controls.agency.setValue(job.agency)
      this.jobForm.controls.not_client.setValue(job.not_client)
    } else {
      this.disableNotClient()
      this.jobForm.controls.client.setValue(job.client)
    }

    this.jobForm.controls.rate.setValue(job.rate)
    this.jobForm.controls.attendance.setValue(job.attendance)
    this.jobForm.controls.last_provider.setValue(job.last_provider)
    this.jobForm.controls.levels.setValue(job.levels)
    this.jobForm.controls.main_expectation.setValue(job.main_expectation)
    this.jobForm.controls.how_come.setValue(job.how_come)
    this.jobForm.controls.competition.setValue(job.competition)
    this.jobForm.controls.budget_value.setValue(job.budget_value)
    this.jobForm.controls.status.setValue(job.status)
    this.jobForm.controls.approval_expectation_rate.setValue(job.approval_expectation_rate)
    this.jobForm.controls.files = this.formBuilder.array([])

    for (var i = 0; i < job.files.length; i++) {
      this.addFile(job.files[i].filename)
    }
  }


  uploadFile(inputFile: HTMLInputElement) {
    let filenames: string[] = []
    this.uploadFileService.uploadFile(inputFile).subscribe((data) => {
      filenames = data.names

      filenames.forEach((filename) => {
        this.addFile(filename)
      })
    })
  }

  previewFile(job: Job, filename: string, type: string) {
    this.jobService.previewFile(job, type, filename)
  }

  download(job: Job, filename: string, type: String) {
    this.jobService.download(job, type, filename).subscribe((blob) => {
      let fileUrl = URL.createObjectURL(blob)
      //window.open(fileUrl, '_blank')
      let anchor = document.createElement("a");
      anchor.download = filename;
      anchor.href = fileUrl;
      anchor.target = '_blank'
      anchor.click();
    })
  }

  addFile(file?: string) {
    const files = <FormArray>this.jobForm.controls['files']

    files.push(this.formBuilder.group({
      name: this.formBuilder.control({ value: (file ? file : ''), disabled: (this.typeForm === 'show' ? true : false) }),
    }))
  }

  deleteFile(i) {
    const files = <FormArray>this.jobForm.controls['files']
    files.removeAt(i)
  }

  getFilesControls() {
    return (<FormArray>this.jobForm.get('files')).controls
  }

  compareJobActivity(job1: JobActivity, job2: JobActivity) {
    return job1.id === job2.id
  }

  compareEmployee(employee1: Employee, employee2: Employee) {
    return employee1.id === employee2.id
  }

  compareJobType(job1: JobType, job2: JobType) {
    return job1.id === job2.id
  }

  compareAttendance(var1: Employee, var2: Employee) {
    return var1.id === var2.id
  }

  compareCompetition(var1: JobCompetition, var2: JobCompetition) {
    return var1.id === var2.id
  }

  compareMainExpectation(var1: JobMainExpectation, var2: JobMainExpectation) {
    return var1.id === var2.id
  }

  compareLevel(var1: JobLevel, var2: JobLevel) {
    return var1.id === var2.id
  }

  compareHowCome(var1: JobHowCome, var2: JobHowCome) {
    return var1.id === var2.id
  }

  compareColumn(var1: any, var2: any) {
    return var1.id === var2.id
  }

  compareStatus(var1: JobStatus, var2: JobStatus) {
    return var1.id === var2.id
  }

  compareJob(var1: Job, var2: Job) {
    return var1.id === var2.id
  }

  displayClient(client: Client) {
    return client.fantasy_name
  }

  displayAgency(agency: Client) {
    return agency.fantasy_name
  }

  save() {
    this.jobForm.updateValueAndValidity()
    let job = this.jobForm.value

    if (ErrorHandler.formIsInvalid(this.jobForm)) {
      this.snackBar.open('Por favor, preencha corretamente os campos.', '', {
        duration: 5000
      })
      return;
    }

    this.jobService.save(job).subscribe(data => {
      if (data.status) {
        this.job = data.job as Job
        let snack = this.snackBar.open('Salvo com sucesso, redirecionando para a próxima etapa.', '', {
          duration: 3000
        })
        snack.afterDismissed().subscribe(() => {
          this.router.navigateByUrl('/jobs/edit/' + this.job.id + '?tab=' + this.getNextTab())
        })
      } else {
        this.snackBar.open(data.message, '', {
          duration: 5000
        })
      }

    })
  }

  edit() {
    this.jobForm.updateValueAndValidity()
    let job = this.jobForm.value
    job.id = this.job.id

    if (ErrorHandler.formIsInvalid(this.jobForm)) {
      this.snackBar.open('Por favor, preencha corretamente os campos.', '', {
        duration: 5000
      })
      return;
    }

    this.jobService.edit(job).subscribe(data => {
      this.snackBar.open(data.message, '', {
        duration: data.status ? 1000 : 5000
      }).afterDismissed().subscribe(observer => {
        if (data.status) {
          this.router.navigateByUrl('/schedule')
        }
      })
    })
  }
}
