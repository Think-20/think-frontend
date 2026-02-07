import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Job } from "app/jobs/job.model";
import { EFinancialStep } from 'app/shared/enums/financial-step.enum';
import { CurrencyValueService } from 'app/shared/services/currency-value.service';

@Component({
  selector: "cb-financial-home",
  templateUrl: "./financial-home.component.html",
  styleUrls: ["./financial-home.component.scss"],
})
export class FinancialHomeComponent {
  @Input() job: Job;

  @Output() stepChange = new EventEmitter<EFinancialStep>();

  financialStep = EFinancialStep;

  revenues = [
    {
      date: "2026-06-19",
      description: "Serviço 1",
      category: "Venda",
      value: 1200,
    },
    {
      date: "2026-06-19",
      description: "Serviço 2",
      category: "Venda",
      value: 2578,
    },
    {
      date: "2026-06-19",
      description: "Serviço 3",
      category: "Venda",
      value: 1987,
    },
    {
      date: "2026-06-19",
      description: "Serviço 4",
      category: "Venda",
      value: 3284,
    },
    {
      date: "2026-06-19",
      description: "Serviço 5",
      category: "Venda",
      value: 894,
    },
  ];

  expenses = [
    {
      date: "2026-06-19",
      description: "Vidros",
      category: "Vidraçaria",
      value: -20,
    },
    {
      date: "2026-06-19",
      description: "Placas Madeira",
      category: "Marcenaria",
      value: -8,
    },
    {
      date: "2026-06-19",
      description: "Limpeza",
      category: "Assinaturas",
      value: -45,
    },
    {
      date: "2026-06-19",
      description: "IFood",
      category: "Serviços",
      value: -32,
    },
    {
      date: "2026-06-19",
      description: "Caderno",
      category: "Mercado",
      value: -20,
    },
  ];

  bankStatements = [
    {
      date: "2026-06-19",
      income: 0,
      expense: 0,
      result: 0,
      balance: 0,
    },
    {
      date: "2026-06-19",
      income: 0,
      expense: 0,
      result: 0,
      balance: 0,
    },
    {
      date: "2026-06-19",
      income: 0,
      expense: 0,
      result: 0,
      balance: 0,
    },
    {
      date: "2026-06-19",
      income: 0,
      expense: 0,
      result: 0,
      balance: 0,
    },
    {
      date: "2026-06-19",
      income: 0,
      expense: 0,
      result: 0,
      balance: 0,
    },
    {
      date: "2026-06-19",
      income: 0,
      expense: 0,
      result: 0,
      balance: 0,
    },
  ];

  constructor(private currencyValueService: CurrencyValueService) {}

  showCurrencyValue(event: PointerEvent): void {
    event.stopPropagation();
    
    this.currencyValueService.toggle();
  }

  stepChangeFn(step: EFinancialStep): void {
    this.stepChange.emit(step);
  }
}
