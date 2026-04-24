import { Component, Inject, Optional } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ECategoryColor } from "app/shared/enums/category-color.enum";
import { EFinancialStep } from "app/shared/enums/financial-step.enum";

@Component({
  selector: "cb-financial-summary-modal",
  templateUrl: "./financial-summary-modal.component.html",
  styleUrls: ["./financial-summary-modal.component.scss"],
})
export class FinancialSummaryModalComponent {
  categories = [
    {
      name: "Venda",
      theme: ECategoryColor.cyan,
      budgeted: 1200000,
      realized_value: 1016763,
      deviation_value: -183237,
      percentage_deviation: -15.27,
    },
    {
      name: "Serviços",
      theme: ECategoryColor.darkBlue,
      budgeted: 500000,
      realized_value: 450000,
      deviation_value: -50000,
      percentage_deviation: -10,
    },
    {
      name: "Consultoria",
      theme: ECategoryColor.darkGreen,
      budgeted: 300000,
      realized_value: 320000,
      deviation_value: 20000,
      percentage_deviation: 6.67,
    },
  ];

  constructor(
    public dialog: MatDialogRef<FinancialSummaryModalComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private dialogData: { transactionType?: EFinancialStep }
  ) {}

  get summaryTitle(): string {
    if (this.dialogData && this.dialogData.transactionType === EFinancialStep.expenses) {
      return "Resumo por Categoria - Despesas";
    }
    return "Resumo por Categoria - Receitas";
  }

  close(): void {
    this.dialog.close();
  }
}
