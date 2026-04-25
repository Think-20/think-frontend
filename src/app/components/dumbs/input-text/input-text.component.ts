import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: "cb-input-text",
  templateUrl: "./input-text.component.html",
  styleUrls: ["./input-text.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: InputTextComponent,
      multi: true,
    },
  ],
})
export class InputTextComponent implements ControlValueAccessor, AfterViewInit, OnChanges {
  @Input() hasError = false;

  @Input() placeholder = "";
  @Input() autoFocus = false;
  @Input() selectOnAutoFocus = true;

  @ViewChild("inputElement", { static: false }) inputElement: ElementRef<HTMLInputElement>;

  value = "";
  private focusTimer: any;

  ngAfterViewInit(): void {
    this.queueAutoFocus();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.autoFocus && changes.autoFocus.currentValue) {
      this.queueAutoFocus();
    }
  }

  writeValue(value: string): void {
    if (!value) {
      value = "";
    }
    
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  handleBlur(): void {
    this.onTouched();
  }

  change(event: Event) {
    const input = event.target as HTMLInputElement;

    this.value = input.value;

    this.onChange(this.value);

    this.onTouched();
  }

  private queueAutoFocus(): void {
    if (!this.autoFocus) {
      return;
    }
    if (this.focusTimer) {
      clearTimeout(this.focusTimer);
      this.focusTimer = null;
    }
    this.focusTimer = setTimeout(() => {
      this.applyAutoFocus();
    }, 120);
  }

  private applyAutoFocus(): void {
    if (!this.autoFocus || !this.inputElement || !this.inputElement.nativeElement) {
      return;
    }
    const input = this.inputElement.nativeElement;
    if (input.disabled) {
      return;
    }
    input.focus();
    if (this.selectOnAutoFocus && input.value) {
      input.select();
    }
  }
}
