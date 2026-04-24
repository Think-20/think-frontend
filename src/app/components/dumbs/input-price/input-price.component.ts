import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { Subscription } from "rxjs";

/**
 * Valor monetário com máscara (ng2-currency-mask), alinhado ao {@link InputTextComponent}.
 * Encapsula um FormControl interno para compor com `currencyMask`.
 */
@Component({
  selector: "cb-input-price",
  templateUrl: "./input-price.component.html",
  styleUrls: ["./input-price.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: InputPriceComponent,
      multi: true,
    },
  ],
})
export class InputPriceComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() hasError = false;

  @Input() placeholder = "";

  innerControl = new FormControl(null);

  private valueChangesSub: Subscription;

  private onChange: (value: any) => void = () => {};

  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.valueChangesSub = this.innerControl.valueChanges.subscribe((v) => {
      this.onChange(v);
    });
  }

  ngOnDestroy(): void {
    if (this.valueChangesSub) {
      this.valueChangesSub.unsubscribe();
    }
  }

  writeValue(value: any): void {
    if (value === undefined || value === null || value === "") {
      this.innerControl.setValue(null, { emitEvent: false });
      return;
    }
    this.innerControl.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.innerControl.disable({ emitEvent: false });
    } else {
      this.innerControl.enable({ emitEvent: false });
    }
  }

  blur(): void {
    this.onTouched();
  }
}
