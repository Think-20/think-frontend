import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Job } from "app/jobs/job.model";
import { FeedbackService } from "./feedback.service";
import { MatSnackBar } from '@angular/material';
import { FeedbackFormComponent } from 'app/feedback-form/feedback-form.component';

@Component({
  selector: "cb-feedback",
  templateUrl: "./feedback.component.html",
  styleUrls: ["./feedback.component.scss"],
})
export class FeedbackComponent implements OnChanges {
  @ViewChild("feedbackForm", { static: false }) feedbackForm: FeedbackFormComponent;
  
  @Input() job = new Job();

  public get jobFeedbackStatus(): number {
    return this.job && this.job.feedback_status ? this.job.feedback_status : 0;
  }

  form = new FormGroup({
    feedback_user_name: new FormControl(null, [Validators.required]),
    feedback_user_email: new FormControl(null, [Validators.required, Validators.email]),
    feedback_user_phone: new FormControl(null),
    feedback_status: new FormControl(null),
  });

  constructor(
    private snackBar: MatSnackBar,
    private feedbackService: FeedbackService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.job && changes.job.currentValue) {
      this.form.patchValue({
        feedback_user_name: this.job.feedback_user_name || null,
        feedback_user_email: this.job.feedback_user_email || null,
        feedback_user_phone: this.job.feedback_user_phone || null,
        feedback_status: this.getStatus(this.job.feedback_status),
      });

      this.feedbackForm.setFeedback({
        overall_project_rating: this.job.overall_project_rating || null,
        recommendation_rating: this.job.recommendation_rating || null,
        sales_support_rating: this.job.sales_support_rating || null,
        project_feedback: this.job.project_feedback || null,
      });
    }
  }

  private getStatus(status: number): string {
    const obj = {
      1: "Enviado",
      2: "Recebido",
    };

    return obj[status] || "Não enviado";
  }

  send(): void {
    if (this.form.invalid) {
      return;
    }
    
    const snackBarLoading = this.snackBar.open('Enviando...');
    
    this.feedbackService
      .send(
        this.job.id,
        this.form.get("feedback_user_name").value,
        this.form.get("feedback_user_email").value,
        this.form.get("feedback_user_phone").value
      )
      .subscribe({
        next: (response) => {
          if (response && response.error) {
            this.form.setErrors({ server: response.error });

            snackBarLoading.dismiss();

            return;
          }

          this.job.feedback_status = 1;

          this.form.patchValue({
            feedback_status: this.getStatus(this.job.feedback_status),
          });

          snackBarLoading.dismiss();

          this.snackBar.open("Solicitação de feedback enviada com sucesso.", "", {
            duration: 3000,
          });
        },
        error: () => {
          snackBarLoading.dismiss();

          this.snackBar.open("Falha ao enviar solicitação de feedbak.", "", {
            duration: 3000,
          });
        }
      });
  }
}
