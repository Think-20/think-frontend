import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";

import { FeedbackFormCardComponent } from "./feedback-form-card/feedback-form-card.component";
import { FeedbackFormRatingComponent } from "./feedback-form-rating/feedback-form-rating.component";
import { FeedbackFormComponent } from "./feedback-form.component";

@NgModule({
  declarations: [FeedbackFormComponent, FeedbackFormCardComponent, FeedbackFormRatingComponent],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [FeedbackFormComponent],
})
export class FeedbackFormModule {}
