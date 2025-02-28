import { OrganizationService } from 'app/shared/services/organization.service';
import { Job } from 'app/jobs/job.model';
import { AfterViewInit, Component, Input } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Task } from 'app/schedule/task.model';
import { TaskService } from 'app/schedule/task.service';
import { OrganizationFormComponent } from '../../../organization/components/check-in-organization-form/organization-form.component';
import { CheckInModel } from 'app/check-in/check-in.model';
import { OrganizationModel } from 'app/shared/models/organization.model';
import { EventService } from 'app/events/event.service';
import { Event } from 'app/events/event.model';
import { AuthService } from 'app/login/auth.service';
import { Place } from 'app/places/place.model';
import { DatePipe } from '@angular/common';
import { Employee } from 'app/employees/employee.model';
import { CheckInService } from 'app/check-in/check-in.service';

@Component({
  selector: 'cb-check-in-approval',
  templateUrl: './check-in-approval.component.html',
  styleUrls: ['./check-in-approval.component.scss']
})
export class CheckInApprovalComponent implements AfterViewInit {
  @Input() job: Job;
  @Input() checkInModel: CheckInModel = new CheckInModel();
  @Input() employees: Employee[] = [];

  employeeId: number;
  employeeDepartment: number;

  acceptList = [
    { id: 0, label: 'Aguardando' },
    { id: 1, label: 'Aceito' },
    { id: 2, label: 'Recusado' },
  ];

  projects: Task[] = [];
  get project(): Task {
    const index = this.projects.findIndex(x => x.id === this.checkInModel.project);

    if (index >= 0) {
      return this.projects[index];
    }

    return null;
  }

  memorials: Task[] = [];
  get memorial(): Task {
    const index = this.memorials.findIndex(x => x.id === this.checkInModel.memorial);

    if (index >= 0) {
      return this.memorials[index];
    }

    return null;
  }

  budgets: Task[] = [];
  get budget(): Task {
    const index = this.budgets.findIndex(x => x.id === this.checkInModel.budget);

    if (index >= 0) {
      return this.budgets[index];
    }

    return null;
  }

  events: Event[] = [];
  get eventsView(): Event[] {
    if (!this.organization) {
      return [];
    }

    const events = this.events.filter(x => !!x.organization_object);

    if (!events || events.length === 0) {
      return [];
    }

    return events.filter(x => x.organization_object.id === this.organization.id);
  }

  get selectedEvent(): Event {
    const index = this.events.findIndex(x => x.id === this.checkInModel.event_id);

    if (index >= 0) {
      return this.events[index];
    }

    return new Event();
  }

  get place(): Place {
    if (this.checkInModel.event_id) {
      return this.selectedEvent.place;
    }

    return new Place();
  }

  organizations: OrganizationModel[] = [];
  get organization(): OrganizationModel {
    const index = this.organizations.findIndex(x => x.id === this.checkInModel.organization_id);

    if (index >= 0) {
      return this.organizations[index];
    }

    return new OrganizationModel();
  }

  get projectChange(): string {
    return this.getApprovalLog(
      this.checkInModel.project_change_employee,
      this.checkInModel.project_change_date,
    );
  }

  get memorialChange(): string {
    return this.getApprovalLog(
      this.checkInModel.memorial_change_employee,
      this.checkInModel.memorial_change_date,
    );
  }

  get budgetChange(): string {
    return this.getApprovalLog(
      this.checkInModel.budget_change_employee,
      this.checkInModel.budget_change_date,
    );
  }
  
  constructor(
    private dialog: MatDialog,
    private datePipe: DatePipe, 
    private snackBar: MatSnackBar,
    public taskService: TaskService,
    private authService: AuthService,
    private eventService: EventService,
    private checkInService: CheckInService,
    private organizationService: OrganizationService,
  ) {
    this.employeeId = authService.currentUser().employee.id;
  }

  getAcceptLabel(
    type:
      | "client"
      | "approval"
      | "proposal"
      | "production"
      | "board"
      | "financial",
    accept: number,
  ): void {
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
      'proposal': {
        0: 'Aguardando aceite da proposta',
        1: 'Proposta aceita',
        2: 'Proposta recusada',
      },
      'production': {
        0: 'Aguardando aceite de produção',
        1: 'Produção aceita',
        2: 'Produção recusada',
      },
      'board': {
        0: 'Aguardando aceite da diretoria',
        1: 'Aceito pela diretoria',
        2: 'Recusado pela diretoria',
      },
      'financial': {
        0: 'Aguardando aceite do financeiro',
        1: 'Aceito pelo financeiro',
        2: 'Recusado pelo financeiro',
      }
    }

    return object[type][accept];
  }

  private getApprovalLog(employeeId: number, date: string): string {
    if (!date) {
      return '';
    }

    const employee = this.getEmployeeName(employeeId);

    const dateFormatted = this.datePipe.transform(date, 'dd/MM/yyyy HH:mm')

    return `${employee} - ${dateFormatted}`;
  }

  projectChanged(): void {
    this.checkInModel.project_change_employee = this.employeeId;
    this.checkInModel.project_change_date = this.getCurrentDate();
  }

  memorialChanged(): void {
    this.checkInModel.memorial_change_employee = this.employeeId;
    this.checkInModel.memorial_change_date = this.getCurrentDate();
  }

  budgetChanged(): void {
    this.checkInModel.budget_change_employee = this.employeeId;
    this.checkInModel.budget_change_date = this.getCurrentDate();
  }

  ngAfterViewInit(): void {
    this.employeeDepartment = this.authService.currentUser().employee.department_id;

    this.loadEvents();
    this.loadOrganizations();
    this.loadProjects();
    this.loadMemorials();
    this.loadBudgets();
  }

  loadOrganizations(): void {
    this.organizationService.organizations().subscribe({
      next: (response) => {
        this.organizations = response;
      }
    });
  }

  loadEvents(): void {
    this.eventService.events({paginate: false}).subscribe({
      next: (response) => {
        this.events = response.pagination.data as Event[];
      }
    });
  }

  loadProjects() : void {
    this.projects = this.job.tasks.filter((task) => {
      return task.job_activity.initial == 1
    });

    let adds = [];

    this.projects.filter((parentTask => {
      let temp = this.job.tasks.filter((task) => {
        return parentTask.job_activity.modification_id == task.job_activity_id
          || parentTask.job_activity.option_id == task.job_activity_id
      });

      adds = adds.concat(temp);
      adds = adds.sort((a, b) => a.reopened - b.reopened);
    }));

    this.projects = this.projects.concat(adds).reverse();
  }

  loadMemorials() : void {
    this.memorials = this.job.tasks.filter((task) => {
      return ['Memorial descritivo'].indexOf(task.job_activity.description) >= 0;
    });
  }

  loadBudgets() : void {
    this.budgets = this.job.tasks.filter((task) => {
      return task.job_activity.initial == 1;
    });

    let adds = [];

    this.budgets.filter((parentTask => {
      let temp = this.job.tasks.filter((task) => {
        return parentTask.job_activity.modification_id == task.job_activity_id
          || parentTask.job_activity.option_id == task.job_activity_id
      });

      adds = adds.concat(temp.reverse())
    }));

    this.budgets = this.budgets.concat(adds).reverse();
  }

  updateAlertDateAcceptClient(): void {
    if (this.job && this.job.checkin) {
      this.checkInModel.accept_client_date = this.getCurrentDate();
      
      let snackBarStateCharging = this.snackBar.open('Salvando...');

      this.checkInService.resetAcceptClient(
        this.checkInModel.id,
        this.checkInModel.accept_client_date,
        this.checkInModel.accept_client,
      ).subscribe({
        next: () => snackBarStateCharging.dismiss(),
        error: () => snackBarStateCharging.dismiss(),
      });
    }
  }

  updateAlertDateApproval(): void {
    this.checkInModel.approval_employee_id = this.employeeId;
    this.checkInModel.approval_date = this.getCurrentDate();
  }

  validateAlertDateAcceptClient(event: PointerEvent): void {
    event.preventDefault();
  }

  updateAlertDateAcceptProposal(): void {
    this.checkInModel.accept_proposal_employee_id = this.employeeId;
    this.checkInModel.accept_proposal_date = this.getCurrentDate();
  }

  updateAlertDateAcceptProduction(): void {
    this.checkInModel.accept_production_employee_id = this.employeeId;
    this.checkInModel.accept_production_date = this.getCurrentDate();
  }

  updateAlertDateBoardApproval(): void {
    this.checkInModel.board_approval_employee_id = this.employeeId;
    this.checkInModel.board_approval_date = this.getCurrentDate();
  }

  updateAlertDateFinancialAcceptance(): void {
    this.checkInModel.financial_acceptance_employee_id = this.employeeId;
    this.checkInModel.financial_acceptance_date = this.getCurrentDate();
  }

  updateOrganization(): void {
    this.checkInModel.organization_changed_by = this.employeeId;
    this.checkInModel.organization_changed_in = this.getCurrentDate();
  }

  updatePromoter(): void {
    this.checkInModel.promoter_changed_by = this.employeeId;
    this.checkInModel.promoter_changed_in = this.getCurrentDate();
  }

  updateEvent(): void {
    this.checkInModel.event_changed_by = this.employeeId;
    this.checkInModel.event_changed_in = this.getCurrentDate();
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

  getClientName() {
    if (this.job && this.job.agency) {
      return this.job.agency.fantasy_name;
    }

    if (this.job && this.job.client) {
      return this.job.client.fantasy_name;
    }
    
    return '-';
  }

  openModalOrganizationForm(): void {
    const modal = this.dialog.open(OrganizationFormComponent, {
      width: '500px',
    });

    modal.afterClosed().subscribe((result?: OrganizationModel) => {
      if (result) {
        this.checkInModel.organization_id = result.id;
        
        this.updateOrganization();

        this.loadOrganizations();
      }
    });
  }

  sendEmail(): void {
    if (!this.checkInModel.id) {
      return;
    }

    let snackBarStateCharging = this.snackBar.open('Enviando e-mail...');

    this.checkInService.sendEmail(this.checkInModel.id).subscribe(() => {
      snackBarStateCharging.dismiss();

      snackBarStateCharging = this.snackBar.open('E-mail enviado!');
          
      setTimeout(() => snackBarStateCharging.dismiss(), 3000);
    });
  }

  trackByEvent(index: number, event: Event): number {
    return event.id;
  }
}
