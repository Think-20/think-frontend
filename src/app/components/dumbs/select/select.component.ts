import { Component, Input, OnInit } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: "cb-select",
  templateUrl: "./select.component.html",
  styleUrls: ["./select.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SelectComponent,
      multi: true,
    },
  ],
})
export class SelectComponent<T> implements ControlValueAccessor {
  @Input() options: T[] = [];

  @Input() labelField: string = "name";
  @Input() placeholder: string = "Selecione";

  @Input() hasError = false;

  value: T | null = null;

  onChange = (value: T) => {};
  onTouched = () => {};

  writeValue(value: T | null): void {
    this.value = value;
  }

  registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  selectValue(value: T) {
    this.value = value;
    
    console.log(value);
    
    this.onChange(value);
    
    this.onTouched();
  }
}
