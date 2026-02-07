import { Component, Input } from "@angular/core";
import { Job } from "app/jobs/job.model";
import { EFinancialStep } from 'app/shared/enums/financial-step.enum';

@Component({
  selector: "cb-financial",
  templateUrl: "./financial.component.html",
  styleUrls: ["./financial.component.scss"],
})
export class FinancialComponent {
  @Input() job: Job;

  step = EFinancialStep.revenues;

  financialStep = EFinancialStep;

  stepChange(step: EFinancialStep): void {
    this.step = step;
  }
}
