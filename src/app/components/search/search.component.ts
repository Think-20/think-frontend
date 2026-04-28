import { AfterViewInit, Component, ElementRef, forwardRef, Input, OnChanges, SimpleChanges, ViewChild } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: "cb-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchComponent),
      multi: true,
    },
  ],
})
export class SearchComponent implements ControlValueAccessor, AfterViewInit, OnChanges {
  @ViewChild("inputText", { static: false }) inputText: ElementRef<HTMLInputElement>;

  @Input() placeholder = "";
  @Input() autoFocus = false;

  value: string = "";

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngAfterViewInit(): void {
    this.applyAutoFocus();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.autoFocus && !changes.autoFocus.firstChange) {
      this.applyAutoFocus();
    }
  }

  focus(): void {
    this.inputText.nativeElement.focus();

    this.onTouched();
  }

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  change(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.value = input.value;

    this.onChange(this.value);

    this.onTouched();
  }

  private applyAutoFocus(): void {
    if (!this.autoFocus || !this.inputText || !this.inputText.nativeElement) {
      return;
    }
    setTimeout(
      function () {
        if (this.inputText && this.inputText.nativeElement) {
          this.inputText.nativeElement.focus();
        }
      }.bind(this)
    );
  }
}
