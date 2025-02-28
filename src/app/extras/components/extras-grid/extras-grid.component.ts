import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material';
import { ExtraItemModel } from 'app/shared/models/extra-item.model';
import { ExtraService } from 'app/extras/extra.service';
import { ExtraFormComponent } from '../extra-form/extra-form.component';
import { CheckInModel } from 'app/check-in/check-in.model';
import { Job } from 'app/jobs/job.model';
import { Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { Employee } from 'app/employees/employee.model';
import { EmployeeService } from 'app/employees/employee.service';
import { AuthService } from 'app/login/auth.service';
import { ExtraModel } from 'app/shared/models/extra.model';
import { ExtraItemService } from 'app/extras/extra-item.service';

@Component({
  selector: 'cb-extras-grid',
  templateUrl: './extras-grid.component.html',
  styleUrls: ['./extras-grid.component.scss']
})
export class ExtrasGridComponent implements OnInit {
  @Input() job = new Job();
  @Input() first = false;
  @Input() last = false;
  @Input() index = 0;
  @Input() extra = new ExtraModel();
  @Input() checkInModel = new CheckInModel();
  @Input() employees: Employee[] = [];

  employeeId: number;

  acceptList = [
    { id: 0, label: 'Aguardando' },
    { id: 1, label: 'Aceito' },
    { id: 2, label: 'Recusado' },
  ];

  obs$ = new Subject<boolean>();
  
  get items(): ExtraItemModel[] {
    return this.extra
      && this.extra.items
      && this.extra.items.length
      ? this.extra.items
      : [];
  }

  get valorTotalExtras(): number {
    if (!this.items || !this.items.length) {
      return 0;
    }

    if (this.items.length == 1) {
      return this.items[0].value * (this.items[0].quantity || 1);
    }

    return this.items
      .map(x => x.value * (x.quantity || 1))
      .reduce((prv, current) => prv + current);
  }

  get valorTotalExtrasRecebido(): number {
    if (!this.items || !this.items.length) {
      return 0;
    }

    if (this.items.length == 1) {
      return this.items[0].value * (this.items[0].quantity || 1);
    }

    const items = this.items.filter(x => !!x.settlement_date);

    if (!items || items.length <= 0) {
      return 0;
    }

    return items
      .map(x => x.value * (x.quantity || 1))
      .reduce((prv, current) => prv + current);
  }

  constructor(
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar,
    readonly authService: AuthService,
    private extraService: ExtraService,
    private employeeService: EmployeeService,
    private extraItemService: ExtraItemService,
  ) {
    this.employeeId = authService.currentUser().employee.id;
  }

  ngOnInit() {
    this.loadEmployees();

    this.obs$
      .debounceTime(1000)
      .pipe(distinctUntilChanged())
      .subscribe(() => {
        this.saveObs();
      });
  }

  private loadEmployees(): void {
    this.employeeService.employees({paginate: false}).subscribe((response) => {
      this.employees = response.pagination.data;
    });
  }

  getClientName() {
    if (this.job && this.job.agency) {
      return this.job.agency.fantasy_name;
    }

    if (this.job && this.job.client) {
      return this.job.client.fantasy_name;
    }
    
    return '-';
  }

  getAcceptLabel(type: "client" | "approval", accept: number): void {
    const object = {
      'client': {
        0: 'Aguardando aceite do cliente',
        1: 'Aceito pelo cliente',
        2: 'Recusado pelo cliente',
      },
      'approval': {
        0: 'Aguardando aprovação do atendente',
        1: 'Aprovado pelo atendente',
        2: 'Recusado pelo atendente',
      },
    }

    return object[type][accept];
  }

  updateAlertDateApproval(): void {
    this.extra.approval_date = this.getCurrentDate();

    this.extraService.saveApproval(
      this.extra.id,
      this.extra.approval,
      this.extra.approval_date,
    ).subscribe();
  }

  updateAlertDateAcceptClient(): void {
    this.extra.accept_client_date = this.getCurrentDate();

    let snackBarStateCharging = this.snackBar.open('Salvando...');

    this.extraService.resetAcceptClient(
      this.extra.id,
      this.extra.accept_client,
      this.extra.accept_client_date,
    ).subscribe({
      next: () => snackBarStateCharging.dismiss(),
      error: () => snackBarStateCharging.dismiss(),
    });
  }

  private getCurrentDate(): string {
    return this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
  }

  getEmployeeName(id: number): string {
    if (!id) {
      return '';
    }

    const index = this.employees.findIndex(x => x.id == id);

    if (index >= 0) {
      return this.employees[index].name;
    }
    
    return '';
  }

  openModalExtra(item?: ExtraItemModel): void {
    const modal = this.dialog.open(ExtraFormComponent, {
      width: '500px',
    });

    modal.componentInstance.extraId = this.extra.id;
    modal.componentInstance.patchValue(item);

    modal.afterClosed().subscribe(result => {
      if (result) {
        this.resetAcceptClient();

        if (this.extra.items && this.extra.items.length) {
          const index = this.extra.items.findIndex(x => x.id === result.id);

          if (index >= 0) {
            this.extra.items[index] = result;
          } else {
            this.extra.items.push(result);
          }
        }
      }
    });
  }

  edit(extra: ExtraItemModel): void {
    this.openModalExtra(extra);
  }

  delete(extraItem: ExtraItemModel): void {
    this.extraItemService.delete(extraItem.id)
      .subscribe(() => {
        this.resetAcceptClient();

        if (this.extra.items && this.extra.items.length) {
          this.extra.items = this.extra.items.filter(x => x.id !== extraItem.id);
        }
      });
  }

  private resetAcceptClient(): void {
    this.extra.accept_client = 0;

    this.updateAlertDateAcceptClient();
  }

  sendEmail(): void {
    if (!this.checkInModel.client_email) {
      return;
    }

    let snackBarStateCharging = this.snackBar.open('Enviando e-mail...');

    this.extraService.sendEmail(this.extra.id).subscribe(() => {
      snackBarStateCharging.dismiss();

      snackBarStateCharging = this.snackBar.open('E-mail enviado!');
          
      setTimeout(() => snackBarStateCharging.dismiss(), 3000);
    });
  }

  changeObs(): void {
    this.obs$.next(true);
  }

  private saveObs(): void {
    this.extraService
      .saveObs(this.extra.id, this.extra.obs)
      .subscribe();
  }
}
