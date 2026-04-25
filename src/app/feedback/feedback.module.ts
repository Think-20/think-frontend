import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSnackBarModule } from "@angular/material/snack-bar";

import { FeedbackFormModule } from "../feedback-form/feedback-form.module";
import { FormDirectivesModule } from "../shared/form-directives.module";
import { FeedbackComponent } from "./feedback.component";

@NgModule({
  declarations: [FeedbackComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    FormDirectivesModule,
    FeedbackFormModule,
  ],
  exports: [FeedbackComponent],
})
export class FeedbackModule {}
