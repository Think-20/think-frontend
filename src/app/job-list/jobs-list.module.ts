import { NgModule } from "@angular/core";

import { JobsListSharedModule } from "./jobs-list-shared.module";
import { JobsListRoutingModule } from "./jobs-list-routing.module";

@NgModule({
  imports: [JobsListSharedModule, JobsListRoutingModule],
})
export class JobsListModule {}
