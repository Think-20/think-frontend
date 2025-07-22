import { Component } from "@angular/core";
import { IWorkflowColumn } from "app/workflow/models/workflow-column.model";
import { WorkflowCriacaoService } from "./workflow-criacao.service";
import { ECreationStatus } from "app/shared/enums/creation-status.enum";

@Component({
  selector: "cb-workflow-criacao",
  templateUrl: "./workflow-criacao.component.html",
  styleUrls: ["./workflow-criacao.component.scss"],
})
export class WorkflowCriacaoComponent {
  columns: IWorkflowColumn[] = [
    { id: ECreationStatus.backlog, title: "Backlog", disabled: () => false },
    { id: ECreationStatus.aFazer, title: "A fazer", disabled: () => false },
    {
      id: ECreationStatus.emAndamento,
      title: "Em andamento",
      disabled: () => false,
    },
    {
      id: ECreationStatus.impeditivo,
      title: "Impeditivo",
      disabled: () => false,
    },
    {
      id: ECreationStatus.finalizado,
      title: "Finalizado",
      disabled: () => false,
    },
  ];

  constructor(readonly service: WorkflowCriacaoService) {}

  trackByColumn(index: number, column: IWorkflowColumn) {
    return column.id;
  }
}
