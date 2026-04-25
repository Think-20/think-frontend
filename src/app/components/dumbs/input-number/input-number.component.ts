import { Component, Input } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: "cb-input-number",
  templateUrl: "./input-number.component.html",
  styleUrls: ["./input-number.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: InputNumberComponent,
      multi: true,
    },
  ],
})
export class InputNumberComponent implements ControlValueAccessor {
  @Input() hasError = false;

  @Input() placeholder = "";

  /** Limite inferior (atributo `min` no input nativo). */
  @Input() min: number | null = null;

  /** Limite superior (atributo `max` no input nativo). */
  @Input() max: number | null = null;

  /** Passo do input nativo; omitir quando não aplicável. */
  @Input() step: number | null = null;

  value = "";

  disabled = false;

  writeValue(value: any): void {
    if (value === null || value === undefined || value === "") {
      this.value = "";
      return;
    }
    this.value = String(value);
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

  change(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value;

    if (raw === "" || raw === null || raw === undefined) {
      this.value = "";
      this.onChange(null);
      this.onTouched();
      return;
    }

    const parsed = parseFloat(raw);
    if (isNaN(parsed)) {
      this.onChange(null);
      this.onTouched();
      return;
    }

    let out = parsed;
    if (this.min !== null && this.min !== undefined && !isNaN(this.min) && out < this.min) {
      out = this.min;
      input.value = String(out);
    }
    if (this.max !== null && this.max !== undefined && !isNaN(this.max) && out > this.max) {
      out = this.max;
      input.value = String(out);
    }

    this.value = String(out);
    this.onChange(out);
    this.onTouched();
  }

  private onChange: (value: any) => void = () => {};

  private onTouched: () => void = () => {};

  handleBlur(): void {
    this.onTouched();
  }
}
