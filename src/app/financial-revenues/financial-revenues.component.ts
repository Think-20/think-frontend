import { Component, EventEmitter, Output } from "@angular/core";
import { MatDialog } from '@angular/material';
import { FinancialSummaryModalComponent } from 'app/financial-summary-modal/financial-summary-modal.component';
import { EFinancialStep } from "app/shared/enums/financial-step.enum";

@Component({
  selector: "cb-financial-revenues",
  templateUrl: "./financial-revenues.component.html",
  styleUrls: ["./financial-revenues.component.scss"],
})
export class FinancialRevenuesComponent {
  @Output() stepChange = new EventEmitter<EFinancialStep>();

  revenues = [
    {
      date: "2024-06-19",
      due_date: "2024-06-25",
      description: "Serviço 1",
      category: "Venda",
      payment_method: "Depósito",
      account: "Banco Inter",
      status: { id: 1, description: "Conciliado" },
      value: 1200,
    },
    {
      date: "2024-06-19",
      due_date: "2024-06-26",
      description: "Serviço 2",
      category: "Venda",
      payment_method: "Pix",
      account: "Banco Inter",
      status: { id: 2, description: "Confirmado" },
      value: 2578,
    },
    {
      date: "2024-06-19",
      due_date: "2024-06-30",
      description: "Serviço 3",
      category: "Venda",
      payment_method: "Catrão de Crédito",
      account: "Conta Inter",
      status: { id: 3, description: "Pendente" },
      value: 1987,
    },
    {
      date: "2024-06-19",
      due_date: "2024-06-27",
      description: "Serviço 4",
      category: "Venda",
      payment_method: "Depósito",
      account: "Banco Inter",
      status: { id: 1, description: "Conciliado" },
      value: 3284,
    },
    {
      date: "2024-06-19",
      due_date: "2024-06-28",
      description: "Serviço 5",
      category: "Venda",
      payment_method: "Pix",
      account: "Banco Inter",
      status: { id: 2, description: "Confirmado" },
      value: 894,
    },
    {
      date: "2024-06-18",
      due_date: "2024-06-25",
      description: "Serviço 6",
      category: "Venda",
      payment_method: "Depósito",
      account: "Banco Inter",
      status: { id: 1, description: "Conciliado" },
      value: 1540,
    },
    {
      date: "2024-06-18",
      due_date: "2024-06-29",
      description: "Serviço 7",
      category: "Venda",
      payment_method: "Pix",
      account: "Banco Inter",
      status: { id: 2, description: "Confirmado" },
      value: 2100,
    },
    {
      date: "2024-06-17",
      due_date: "2024-07-02",
      description: "Serviço 8",
      category: "Venda",
      payment_method: "Cartão de Crédito",
      account: "Conta Inter",
      status: { id: 3, description: "Pendente" },
      value: 980,
    },
    {
      date: "2024-06-17",
      due_date: "2024-06-24",
      description: "Serviço 9",
      category: "Venda",
      payment_method: "Depósito",
      account: "Banco Inter",
      status: { id: 1, description: "Conciliado" },
      value: 3500,
    },
    {
      date: "2024-06-16",
      due_date: "2024-06-26",
      description: "Serviço 10",
      category: "Venda",
      payment_method: "Pix",
      account: "Banco Inter",
      status: { id: 2, description: "Confirmado" },
      value: 1750,
    },
  ];

  constructor(private dialog: MatDialog) {}

  toHome(): void {
    this.stepChange.emit(EFinancialStep.home);
  }

  openSummaryModal(): void {
    this.dialog.open(FinancialSummaryModalComponent, {
      width: '1024px',
      maxHeight: '85vh',
      panelClass: 'custom-modal',
    });
  }
}
