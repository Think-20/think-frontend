import { Component } from "@angular/core";
import { WorkflowProducaoService } from "./workflow-producao.service";
import { EProductionStatus } from "app/shared/enums/production-status.enum";
import { IWorkflowColumn } from "app/workflow/models/workflow-column.model";
import { IWorkflowFilter } from 'app/workflow/models/workflow-filter.model';

@Component({
  selector: "cb-workflow-producao",
  templateUrl: "./workflow-producao.component.html",
  styleUrls: ["./workflow-producao.component.scss"],
})
export class WorkflowProducaoComponent {
  columns: IWorkflowColumn[] = [
    { id: EProductionStatus.backlog, title: "Backlog", disabled: () => false },
    { id: EProductionStatus.aFazer, title: "A fazer", disabled: () => false },
    {
      id: EProductionStatus.emAndamento,
      title: "Em andamento",
      disabled: () => false,
    },
    {
      id: EProductionStatus.impeditivo,
      title: "Impeditivo",
      disabled: () => false,
    },
    {
      id: EProductionStatus.finalizado,
      title: "Finalizado",
      disabled: () => false,
    },
  ];

  constructor(readonly service: WorkflowProducaoService) {}

  onFormChanged(form: IWorkflowFilter): void {
    this.service.form$.next(form);
  }

  trackByColumn(index: number, column: IWorkflowColumn) {
    return column.id;
  }
}
