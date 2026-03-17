import {
  Component,
  EventEmitter,
  Output,
} from "@angular/core";
import { MatDialog } from "@angular/material";
import { BankAccountModalComponent } from "app/components/smart/bank-account-modal/bank-account-modal.component";
import { CategoryModalComponent } from "app/components/smart/category-modal/category-modal.component";
import { FinancialSummaryModalComponent } from "app/financial-summary-modal/financial-summary-modal.component";
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
      category: { name: "Venda", theme: 1 },
      payment_method: "Depósito",
      account: "Banco Inter",
      status: { id: 1, description: "Conciliado" },
      value: 1200,
    },
    {
      date: "2024-06-19",
      due_date: "2024-06-26",
      description: "Serviço 2",
      category: { name: "Venda", theme: 2 },
      payment_method: "Pix",
      account: "Banco Inter",
      status: { id: 2, description: "Confirmado" },
      value: 2578,
    },
    {
      date: "2024-06-19",
      due_date: "2024-06-30",
      description: "Serviço 3",
      category: { name: "Venda", theme: 3 },
      payment_method: "Catrão de Crédito",
      account: "Conta Inter",
      status: { id: 3, description: "Pendente" },
      value: 1987,
    },
    {
      date: "2024-06-19",
      due_date: "2024-06-27",
      description: "Serviço 4",
      category: { name: "Venda", theme: 4 },
      payment_method: "Depósito",
      account: "Banco Inter",
      status: { id: 1, description: "Conciliado" },
      value: 3284,
    },
    {
      date: "2024-06-19",
      due_date: "2024-06-28",
      description: "Serviço 5",
      category: { name: "Venda", theme: 5 },
      payment_method: "Pix",
      account: "Banco Inter",
      status: { id: 2, description: "Confirmado" },
      value: 894,
    },
    {
      date: "2024-06-18",
      due_date: "2024-06-25",
      description: "Serviço 6",
      category: { name: "Venda", theme: 6 },
      payment_method: "Depósito",
      account: "Banco Inter",
      status: { id: 1, description: "Conciliado" },
      value: 1540,
    },
    {
      date: "2024-06-18",
      due_date: "2024-06-29",
      description: "Serviço 7",
      category: { name: "Venda", theme: 7 },
      payment_method: "Pix",
      account: "Banco Inter",
      status: { id: 2, description: "Confirmado" },
      value: 2100,
    },
    {
      date: "2024-06-17",
      due_date: "2024-07-02",
      description: "Serviço 8",
      category: { name: "Venda", theme: 8 },
      payment_method: "Cartão de Crédito",
      account: "Conta Inter",
      status: { id: 3, description: "Pendente" },
      value: 980,
    },
    {
      date: "2024-06-17",
      due_date: "2024-06-24",
      description: "Serviço 9",
      category: { name: "Venda", theme: 9 },
      payment_method: "Depósito",
      account: "Banco Inter",
      status: { id: 1, description: "Conciliado" },
      value: 3500,
    },
    {
      date: "2024-06-16",
      due_date: "2024-06-26",
      description: "Serviço 10",
      category: { name: "Venda", theme: 10 },
      payment_method: "Pix",
      account: "Banco Inter",
      status: { id: 2, description: "Confirmado" },
      value: 1750,
    },
    {
      date: "2024-06-16",
      due_date: "2024-06-26",
      description: "Serviço 11",
      category: { name: "Venda", theme: 11 },
      payment_method: "Pix",
      account: "Banco Inter",
      status: { id: 2, description: "Confirmado" },
      value: 1750,
    },
    {
      date: "2024-06-16",
      due_date: "2024-06-26",
      description: "Serviço 12",
      category: { name: "Venda", theme: 12 },
      payment_method: "Pix",
      account: "Banco Inter",
      status: { id: 2, description: "Confirmado" },
      value: 1750,
    },
    {
      date: "2024-06-16",
      due_date: "2024-06-26",
      description: "Serviço 13",
      category: { name: "Venda", theme: 13 },
      payment_method: "Pix",
      account: "Banco Inter",
      status: { id: 2, description: "Confirmado" },
      value: 1750,
    },
    {
      date: "2024-06-16",
      due_date: "2024-06-26",
      description: "Serviço 14",
      category: { name: "Venda", theme: 14 },
      payment_method: "Pix",
      account: "Banco Inter",
      status: { id: 2, description: "Confirmado" },
      value: 1750,
    },
    {
      date: "2024-06-16",
      due_date: "2024-06-26",
      description: "Serviço 15",
      category: { name: "Venda", theme: 15 },
      payment_method: "Pix",
      account: "Banco Inter",
      status: { id: 2, description: "Confirmado" },
      value: 1750,
    },
    {
      date: "2024-06-16",
      due_date: "2024-06-26",
      description: "Serviço 16",
      category: { name: "Venda", theme: 16 },
      payment_method: "Pix",
      account: "Banco Inter",
      status: { id: 2, description: "Confirmado" },
      value: 1750,
    },
    {
      date: "2024-06-16",
      due_date: "2024-06-26",
      description: "Serviço 17",
      category: { name: "Venda", theme: 17 },
      payment_method: "Pix",
      account: "Banco Inter",
      status: { id: 2, description: "Confirmado" },
      value: 1750,
    },
    {
      date: "2024-06-16",
      due_date: "2024-06-26",
      description: "Serviço 18",
      category: { name: "Venda", theme: 18 },
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

  print() {
    window.print();
  }

  filter(): void {
    // this.dialog.open(CategoryModalComponent, {
    //   width: '400px',
    //   panelClass: 'beautiful-modal',
    // });

    this.dialog.open(BankAccountModalComponent, {
      width: "450px",
      panelClass: "beautiful-modal",
    });
  }

  openSummaryModal(): void {
    this.dialog.open(FinancialSummaryModalComponent, {
      width: "1024px",
      panelClass: "beautiful-modal",
    });
  }
}
