import { Component, OnInit, Injectable, Input, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators, AbstractControl } from '@angular/forms';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';

import { Employee } from '../employee.model';
import { EmployeeService } from '../employee.service';
import { AuthService } from '../../login/auth.service';

import { ErrorHandler } from '../../shared/error-handler.service';
import { Patterns } from '../../shared/patterns.model';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/do';
import { Location } from '@angular/common';
import { Department } from '../../department/department.model';
import { DepartmentService } from '../../department/department.service';
import { UploadFileService } from '../../shared/upload-file.service';
import { API } from '../../app.api';

@Component({
  selector: 'cb-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css'],
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
      ]))),
    ])
  ]
})
@Injectable()
export class EmployeeFormComponent implements OnInit {

  path: string = API + '/assets/images/'
  @Input('typeForm') typeForm: string
  @Input('withHeader') withHeader: boolean = true
  @Output('employeeEmitter') employeeEmitter: EventEmitter<Employee> = new EventEmitter()
  @Output('isAdminEmitter') isAdminEmitter: EventEmitter<boolean> = new EventEmitter()

  rowAppearedState = 'ready'
  employee: Employee
  departments: Department[]
  funds: any[] = []
  employeeForm: FormGroup
  contactsArray: FormArray
  progress: number
  isAdmin: boolean = false
  imagePath: string
  fundsLoaded: boolean = false
  lastFundsHadAll: boolean = false

  readonly ALL_FUNDS_OPTION = { id: 'all', name: 'Todos os fundos' }
  readonly ROLES = [
    { id: 1, name: 'Preenchimento' },
    { id: 2, name: 'Aprovador' },
    { id: 3, name: 'Administrador' }
  ]

  constructor(
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private uploadFileService: UploadFileService,
    private authService: AuthService,
    private http: HttpClient,
    private location: Location,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    let snackBarStateCharging
    this.typeForm = this.route.snapshot.url[0].path
    this.imagePath = this.path + 'sem-foto.jpg'

    this.isAdmin = this.authService.hasAccess('employee/save')
    this.isAdminEmitter.emit(this.isAdmin)

    this.employeeForm = this.formBuilder.group({
      name: this.formBuilder.control('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]),
      image: this.formBuilder.control('sem-foto.jpg'),
      payment: this.formBuilder.control({ value: '0.00', disabled: !this.isAdmin }, [
        Validators.required
      ]),
      department: this.formBuilder.control({ value: '', disabled: !this.isAdmin }, [
        Validators.required
      ]),
      role: this.formBuilder.control({ value: '', disabled: !this.isAdmin }, [
        Validators.required
      ]),
      email: this.formBuilder.control('', [
        Validators.required,
        Validators.pattern(Patterns.email)
      ]),
      password: this.formBuilder.control('', [
        Validators.required,
        Validators.minLength(6)
      ]),
      funds: this.formBuilder.control({ value: [], disabled: !this.isAdmin }),
      schedule_active: this.formBuilder.control({ value: '1', disabled: !this.isAdmin }),
    })

    if (this.typeForm === 'edit' || this.typeForm === 'profile') {
      this.loadEmployee()
    }

    this.loadData()
    this.listenImage()
    this.listenFunds()
  }

  listenImage() {
    this.employeeForm.controls.image.valueChanges.subscribe((value) => {
      this.imagePath = this.path + value
    })
  }

  loadData() {
    this.departmentService.departments().subscribe((dataInfo) => {
      this.departments = <Department[]>dataInfo.pagination.data
    })
    this.loadFunds()
  }

  loadFunds() {
    this.http.post(`${API}/funds/all`, {}).subscribe((res: any) => {
      this.funds = res && res.pagination && Array.isArray(res.pagination.data) ? res.pagination.data : []
      this.fundsLoaded = true
      this.applyFundsSelection()
    }, () => {
      this.funds = []
      this.fundsLoaded = true
    })
  }

  listenFunds() {
    this.employeeForm.controls.funds.valueChanges.subscribe((value: any[]) => {
      if (!value) {
        return
      }

      let hasAll = value.some((fund) => fund && fund.id === 'all')

      if (hasAll && value.length > 1) {
        let newValue = this.lastFundsHadAll ? value.filter((fund) => fund.id !== 'all') : [this.ALL_FUNDS_OPTION]
        this.lastFundsHadAll = newValue.length === 1 && newValue[0].id === 'all'
        this.employeeForm.controls.funds.setValue(newValue, { emitEvent: false })
        return
      }

      this.lastFundsHadAll = hasAll
    })
  }

  applyFundsSelection() {
    if (!this.fundsLoaded || !this.employee) {
      return
    }

    if (this.employee.all_funds) {
      this.lastFundsHadAll = true
      this.employeeForm.controls.funds.setValue([this.ALL_FUNDS_OPTION])
    } else if (this.employee.fund_ids) {
      let selectedFunds = this.funds.filter((fund) => this.employee.fund_ids.indexOf(fund.id) !== -1)
      this.employeeForm.controls.funds.setValue(selectedFunds)
    }
  }

  loadEmployee() {
    let snackBarStateCharging = this.snackBar.open('Carregando funcionário...')
    let employeeId = this.typeForm == 'edit' ? parseInt(this.route.snapshot.url[1].path) : this.authService.currentUser().employee_id
    this.employeeService.employee(employeeId).subscribe(employee => {
      snackBarStateCharging.dismiss()
      this.employee = employee
      this.employeeEmitter.emit(employee)
      let payment = this.employee.payment != null ? this.employee.payment : 0.00

      this.employeeForm.controls.name.setValue(this.employee.name)
      this.employeeForm.controls.payment.setValue(payment)
      this.employeeForm.controls.department.setValue(this.employee.department)
      this.employeeForm.controls.role.setValue(this.ROLES.find((role) => role.id === this.employee.cedente_role_id) || '')
      this.employeeForm.controls.email.setValue(this.employee.email)
      this.employeeForm.controls.password.clearValidators()
      this.employeeForm.controls.password.updateValueAndValidity()
      this.employeeForm.controls.schedule_active.setValue(this.employee.schedule_active)
      this.employeeForm.controls.image.setValue(this.employee.image)
      this.applyFundsSelection()
    })
  }

  uploadFile(inputFile: HTMLInputElement) {
    let snackbar = this.snackBar.open('Aguarde enquanto carregamos os arquivos...')
    const path = API + '/assets/images/temp/'

    this.uploadFileService.uploadFile(inputFile, (percentDone) => {
      this.progress = percentDone
    }, (response) => {
      let filename = inputFile.files[0].name
      this.employeeForm.controls.image.setValue(filename)
      this.imagePath = this.path + 'temp/' + filename
      snackbar.dismiss()
    }).subscribe((data) => {})
  }

  compareDepartment(var1: Department, var2: Department) {
    return var1.id === var2.id
  }

  compareRole(var1: any, var2: any) {
    return var1 && var2 && var1.id === var2.id
  }

  compareFund(var1: any, var2: any) {
    return var1 && var2 && var1.id === var2.id
  }

  buildEmployeePayload(formValue: any): any {
    let selectedFunds = formValue.funds || []
    let isAllFunds = selectedFunds.some((fund) => fund && fund.id === 'all')

    let payload: any = {
      name: formValue.name,
      email: formValue.email,
      cedente_role_id: formValue.role ? formValue.role.id : null
    }

    if (formValue.password) {
      payload.password = formValue.password
    }

    if (isAllFunds) {
      payload.all_funds = true
    } else {
      payload.fund_ids = selectedFunds.map((fund) => fund.id)
    }

    return payload
  }

  saveCedenteEmployee(payload: any) {
    return this.http.post(`${API}/cedente/employee/save`, payload)
  }

  save() {
    if (ErrorHandler.formIsInvalid(this.employeeForm)) {
      this.snackBar.open('Por favor, preencha corretamente os campos.', '', {
        duration: 5000
      })
      return;
    }

    let payload = this.buildEmployeePayload(this.employeeForm.value)

    this.saveCedenteEmployee(payload).subscribe((data: any) => {
      let snackbar = this.snackBar.open(data.message, '', {
        duration: 5000
      })

      if (data.status) {
        snackbar.afterDismissed().subscribe(() => {
          this.location.back()
        })
      }
    })
  }

  edit(employeeId: number) {
    if (ErrorHandler.formIsInvalid(this.employeeForm)) {
      this.snackBar.open('Por favor, preencha corretamente os campos.', '', {
        duration: 5000
      })
      return;
    }

    let url = this.typeForm === 'profile' || this.authService.currentUser().employee_id == employeeId ? '/login' : '/employees'
    let payload = this.buildEmployeePayload(this.employeeForm.value)
    payload.id = employeeId

    this.saveCedenteEmployee(payload).subscribe((data: any) => {
      if (data.status) {
        this.router.navigateByUrl(url)
      } else {
        this.snackBar.open(data.message, '', {
          duration: data.status ? 1000 : 5000
        })
      }
    })
  }
}

