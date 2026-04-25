import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { PerformanceReportLiteComponent } from "./performance-report-lite.component";

const routes: Routes = [
  {
    path: "",
    component: PerformanceReportLiteComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PerformanceReportLiteRoutingModule {}
