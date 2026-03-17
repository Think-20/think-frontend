import {
  categoryColors,
  ECategoryColor,
} from "app/shared/enums/category-color.enum";
import { Component, OnInit } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: "cb-form-category-color",
  templateUrl: "./form-category-color.component.html",
  styleUrls: ["./form-category-color.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FormCategoryColorComponent,
      multi: true,
    },
  ],
})
export class FormCategoryColorComponent implements ControlValueAccessor {
  value: number;

  colors = categoryColors;

  writeValue(value: number): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  change(value: number) {
    this.value = value;

    this.onChange(value);

    this.onTouched();
  }
}
