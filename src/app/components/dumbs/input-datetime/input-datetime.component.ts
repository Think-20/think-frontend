import { Component, Input } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: "cb-input-datetime",
  templateUrl: "./input-datetime.component.html",
  styleUrls: ["./input-datetime.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: InputDatetimeComponent,
      multi: true,
    },
  ],
})
export class InputDatetimeComponent implements ControlValueAccessor {
  @Input() mode: "date" | "datetime-local" = "date";

  @Input() hasError = false;

  @Input() placeholder = "";

  value = "";

  disabled = false;

  writeValue(value: string): void {
    if (!value) {
      this.value = "";
      return;
    }

    this.value = this.normalizeIncomingValue(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private onChange: (value: string) => void = function () {};

  private onTouched: () => void = function () {};

  change(event: Event): void {
    var input = event.target as HTMLInputElement;

    this.value = input.value;

    this.onChange(this.value);

    this.onTouched();
  }

  blur(): void {
    this.onTouched();
  }

  private normalizeIncomingValue(value: string): string {
    if (this.mode === "date") {
      var tIdx = value.indexOf("T");
      if (tIdx > 0) {
        return value.substring(0, tIdx);
      }

      var spaceIdx = value.indexOf(" ");
      if (spaceIdx > 0) {
        return value.substring(0, spaceIdx);
      }

      return value;
    }

    if (this.mode === "datetime-local") {
      if (value.length >= 16 && value.charAt(10) === "T") {
        return value.substring(0, 16);
      }

      var dateOnly = /^\d{4}-\d{2}-\d{2}$/;
      if (dateOnly.test(value)) {
        return value + "T00:00";
      }

      return value;
    }

    return value;
  }
}
