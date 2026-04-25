import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { JobsShellModule } from "../jobs/jobs-shell.module";
import { JobTabsModule } from "../jobs/job-tabs/job-tabs.module";
import { FinancialRoutingModule } from "./financial-routing.module";

@NgModule({
  imports: [CommonModule, JobsShellModule, JobTabsModule, FinancialRoutingModule],
})
export class FinancialModule {}
