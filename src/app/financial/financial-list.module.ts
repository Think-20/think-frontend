import { NgModule } from "@angular/core";

import { JobsListSharedModule } from "../job-list/jobs-list-shared.module";
import { FinancialListRoutingModule } from "./financial-list-routing.module";

@NgModule({
  imports: [JobsListSharedModule, FinancialListRoutingModule],
})
export class FinancialListModule {}
