import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FeedbackModel } from 'app/shared/models/feedback.model';

@Component({
  selector: 'cb-feedback-form',
  templateUrl: './feedback-form.component.html',
  styleUrls: ['./feedback-form.component.scss']
})
export class FeedbackFormComponent {
  @Input() readonly = false;
  @Output() submit = new EventEmitter<FeedbackModel>();

  form = new FormGroup({
    recommendation_rating: new FormControl(null, [Validators.required]),
    overall_project_rating: new FormControl(null, [Validators.required]),
    sales_support_rating: new FormControl(null, [Validators.required]),
    project_feedback: new FormControl(null),
  });

  submitFn(): void {
    if (this.form.invalid || this.readonly) {
      return;
    }

    this.submit.emit(this.form.value);
  }

  setFeedback(feedback: FeedbackModel): void {
    this.form.patchValue({
      recommendation_rating: feedback.recommendation_rating,
      overall_project_rating: feedback.overall_project_rating,
      sales_support_rating: feedback.sales_support_rating,
      project_feedback: feedback.project_feedback,
    });
  }
}
