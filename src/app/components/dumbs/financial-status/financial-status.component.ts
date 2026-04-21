import { Component, ElementRef, HostListener } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import {
  ETransactionStatus,
  transactionStatuses,
} from "app/shared/enums/transaction-status.enum";

@Component({
  selector: "cb-financial-status",
  templateUrl: "./financial-status.component.html",
  styleUrls: ["./financial-status.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FinancialStatusComponent,
      multi: true,
    },
  ],
})
export class FinancialStatusComponent implements ControlValueAccessor {
  value: ETransactionStatus = ETransactionStatus.pending;
  isOpen = false;
  isDisabled = false;

  transactionStatuses = ETransactionStatus;

  statusOptions: Array<{ id: ETransactionStatus; label: string }> = Array.from(
    transactionStatuses.entries()
  ).map(function (entry) {
    return { id: entry[0], label: entry[1] };
  });

  private onChange: (value: ETransactionStatus) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  get triggerLabel(): string {
    const label = transactionStatuses.get(this.value);
    return label ? label : "";
  }

  writeValue(obj: ETransactionStatus | null): void {
    if (obj !== null && obj !== undefined) {
      this.value = obj;
    }
  }

  registerOnChange(fn: (value: ETransactionStatus) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  toggle(event: MouseEvent): void {
    event.stopPropagation();
    if (this.isDisabled) {
      return;
    }
    this.isOpen = !this.isOpen;
    this.onTouched();
  }

  selectStatus(status: ETransactionStatus, event: MouseEvent): void {
    event.stopPropagation();
    if (this.isDisabled) {
      return;
    }
    this.value = status;
    this.onChange(status);
    this.onTouched();
    this.isOpen = false;
  }

  close(): void {
    this.isOpen = false;
  }

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen) {
      return;
    }
    const target = event.target as Node | null;
    if (target && this.elementRef.nativeElement.contains(target)) {
      return;
    }
    this.close();
  }
}
