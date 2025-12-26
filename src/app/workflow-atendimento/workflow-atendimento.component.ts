import { Component } from "@angular/core";
import { IWorkflowColumn } from "app/workflow/models/workflow-column.model";
import { WorkflowAtendimentoService } from "./workflow-atendimento.service";
import { EJobStatus } from "app/shared/enums/job-status.enum";
import { IWorkflowFilter } from 'app/workflow/models/workflow-filter.model';

@Component({
  selector: "cb-workflow-atendimento",
  templateUrl: "./workflow-atendimento.component.html",
  styleUrls: ["./workflow-atendimento.component.scss"],
})
export class WorkflowAtendimentoComponent {
  aguardandoCriativo = EJobStatus.aguardandoCriativo;
  aprovado = EJobStatus.aprovado;

  columns: IWorkflowColumn[] = [
    { id: EJobStatus.standBy, title: "Criação", disabled: () => false },
    {
      id: this.aguardandoCriativo,
      title: "Aguardando criativo",
      disabled: () => true,
    },
    {
      id: EJobStatus.negociacaoAvancada,
      title: "Negociação avançada",
      disabled: () => false,
    },
    { id: EJobStatus.aprovado, title: "Aprovado", disabled: () => false },
    { id: EJobStatus.declinado, title: "Declinado", disabled: () => false },
    { id: EJobStatus.reprovado, title: "Reprovado", disabled: () => false },
  ];

  constructor(readonly service: WorkflowAtendimentoService) {}

  onFormChanged(form: IWorkflowFilter): void {
    this.service.form$.next(form);
  }

  trackByColumn(index: number, column: IWorkflowColumn) {
    return column.id;
  }
}
