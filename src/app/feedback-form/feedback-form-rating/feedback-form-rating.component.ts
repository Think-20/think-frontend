import { Component, forwardRef, Input } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

let nextUniqueId = 0;

@Component({
  selector: 'cb-feedback-form-rating',
  templateUrl: './feedback-form-rating.component.html',
  styleUrls: ['./feedback-form-rating.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FeedbackFormRatingComponent),
      multi: true
    }
  ]
})
export class FeedbackFormRatingComponent implements ControlValueAccessor {
  @Input() disabled = false;

  inputName = `rating-${nextUniqueId++}`;

  value: number | null = null;
  ratings = Array.from({ length: 10 }, (_, i) => i + 1);

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: number): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  selectRating(rating: number) {
    this.value = rating;
    this.onChange(rating);
    this.onTouched();
  }
}
