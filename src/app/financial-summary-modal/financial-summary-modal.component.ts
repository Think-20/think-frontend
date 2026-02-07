import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";

@Component({
  selector: "cb-financial-summary-modal",
  templateUrl: "./financial-summary-modal.component.html",
  styleUrls: ["./financial-summary-modal.component.scss"],
})
export class FinancialSummaryModalComponent {
  categories = [
    {
      description: "Venda",
      type: 1,
      budgeted: 1200000,
      realized_value: 1016763,
      deviation_value: -183237,
      percentage_deviation: -15.27,
    },
    {
      description: "Serviços",
      type: 2,
      budgeted: 500000,
      realized_value: 450000,
      deviation_value: -50000,
      percentage_deviation: -10,
    },
    {
      description: "Consultoria",
      type: 3,
      budgeted: 300000,
      realized_value: 320000,
      deviation_value: 20000,
      percentage_deviation: 6.67,
    },
  ];

  constructor(public dialog: MatDialogRef<FinancialSummaryModalComponent>) {}

  close(): void {
    this.dialog.close();
  }
}
