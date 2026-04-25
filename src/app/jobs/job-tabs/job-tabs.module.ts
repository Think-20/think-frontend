import { CommonModule } from "@angular/common";
import { NO_ERRORS_SCHEMA, NgModule } from "@angular/core";
import { MatTabsModule } from "@angular/material/tabs";
import { RouterModule } from "@angular/router";

import { BriefingModule } from "../../briefing/briefing.module";
import { BudgetModule } from "../../budgets/budget.module";
import { CheckInModule } from "../../check-in/check-in.module";
import { ContractNfModule } from "../../contract-nf/contract-nf.module";
import { ExtrasModule } from "../../extras/extras.module";
import { FeedbackModule } from "../../feedback/feedback.module";
import { FinancialTabsModule } from "../../financial/financial-tabs.module";
import { JobFormModule } from "../job-form/job-form.module";
import { JobTabModule } from "../job-tab/job-tab.module";
import { ProjectPhotosModule } from "../../project-photos/project-photos.module";
import { ProjectsModule } from "../../projects/projects.module";
import { ProposalsModule } from "../../proposals/proposals.module";
import { DevelopingModule } from "../../shared/components/developing/developing.module";
import { SpecificationModule } from "../../specification/specification.module";
import { JobTabsComponent } from "./job-tabs.component";

@NgModule({
  declarations: [JobTabsComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatTabsModule,
    JobTabModule,
    JobFormModule,
    BriefingModule,
    ProjectsModule,
    SpecificationModule,
    CheckInModule,
    ExtrasModule,
    BudgetModule,
    FinancialTabsModule,
    ProposalsModule,
    ContractNfModule,
    ProjectPhotosModule,
    FeedbackModule,
    DevelopingModule,
  ],
  exports: [JobTabsComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class JobTabsModule {}
