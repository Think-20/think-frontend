import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { JobsShellModule } from "./jobs-shell.module";
import { JobTabsModule } from "./job-tabs/job-tabs.module";
import { JobsRoutingModule } from "./jobs-routing.module";

@NgModule({
  imports: [CommonModule, JobsShellModule, JobTabsModule, JobsRoutingModule],
})
export class JobsModule {}
