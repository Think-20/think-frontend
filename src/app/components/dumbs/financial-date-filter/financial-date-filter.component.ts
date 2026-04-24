import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { MatDatepickerInputEvent, MatDatepicker } from "@angular/material/datepicker";

@Component({
  selector: "cb-financial-date-filter",
  templateUrl: "./financial-date-filter.component.html",
  styleUrls: ["./financial-date-filter.component.scss"]
})
export class FinancialDateFilterComponent {
  @Input() placeholder = "Hoje";

  @Input() value = "";

  @Output() valueChange = new EventEmitter<string>();

  @ViewChild("datepicker", { static: false }) datepicker: MatDatepicker<Date>;

  selectedDate: Date | null = null;

  maxDate = new Date();

  openDatepicker(event: MouseEvent): void {
    event.stopPropagation();
    if (this.datepicker) {
      this.datepicker.open();
    }
  }

  onDateChange(event: MatDatepickerInputEvent<Date>): void {
    if (!event.value) {
      this.selectedDate = null;
      this.value = "";
      this.valueChange.emit("");
      return;
    }
    this.applyDate(event.value);
  }

  displayValue(): string {
    if (!this.selectedDate) {
      return this.placeholder;
    }
    if (this.isToday(this.selectedDate)) {
      return "Hoje";
    }
    if (this.isYesterday(this.selectedDate)) {
      return "Ontem";
    }
    return this.selectedDate.toLocaleDateString("pt-BR");
  }

  pastOrTodayDateFilter = (date: Date | null): boolean => {
    if (!date) {
      return false;
    }
    const candidate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const today = new Date();
    const max = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    return candidate <= max;
  };

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const monthPadded = month < 10 ? "0" + month : "" + month;
    const dayPadded = day < 10 ? "0" + day : "" + day;
    return year + "-" + monthPadded + "-" + dayPadded;
  }

  private applyDate(date: Date): void {
    this.selectedDate = date;
    this.value = this.toIsoDate(date);
    this.valueChange.emit(this.value);
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }

  private isYesterday(date: Date): boolean {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      date.getFullYear() === yesterday.getFullYear() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getDate() === yesterday.getDate()
    );
  }
}
