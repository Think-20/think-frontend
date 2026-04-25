import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { ServiceReportComponent } from "./report-list.component";

const routes: Routes = [
  {
    path: "",
    component: ServiceReportComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ServiceReportRoutingModule {}
