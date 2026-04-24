import { Component, EventEmitter, Input, Output } from "@angular/core";

interface FinancialPeriodOption {
  days: number;
  label: string;
}

@Component({
  selector: "cb-financial-period-filter",
  templateUrl: "./financial-period-filter.component.html",
  styleUrls: ["./financial-period-filter.component.scss"]
})
export class FinancialPeriodFilterComponent {
  @Input() value = 7;

  @Output() valueChange = new EventEmitter<number>();

  options: FinancialPeriodOption[] = [
    { days: 7, label: "Últimos 7 dias" },
    { days: 15, label: "Últimos 15 dias" },
    { days: 30, label: "Últimos 30 dias" }
  ];

  selectedLabel(): string {
    for (let i = 0; i < this.options.length; i++) {
      if (this.options[i].days === this.value) {
        return this.options[i].label;
      }
    }
    return this.options[0].label;
  }

  selectPeriod(days: number): void {
    this.value = days;
    this.valueChange.emit(days);
  }
}
